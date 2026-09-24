import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  tableName?: string;
}

const DEFAULT_TABLE_NAME = "portfolio_data";

// Helper to get environment or stored Supabase config
export function getSupabaseConfig(customConfig?: Partial<SupabaseConfig>): SupabaseConfig | null {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

  const url = customConfig?.url || envUrl;
  const anonKey = customConfig?.anonKey || envKey;
  const tableName = customConfig?.tableName || DEFAULT_TABLE_NAME;

  if (!url || !anonKey) return null;
  return { url, anonKey, tableName };
}

// Create a client-side Supabase client instance
export function getSupabaseClient(config: SupabaseConfig): SupabaseClient | null {
  try {
    if (!config.url || !config.anonKey) return null;
    return createClient(config.url, config.anonKey);
  } catch (e) {
    console.error("Failed to initialize Supabase client", e);
    return null;
  }
}

// Test Supabase connection & table presence
export async function testSupabaseConnection(config: SupabaseConfig): Promise<{ success: boolean; message: string }> {
  try {
    if (!config.url || !config.url.startsWith("https://")) {
      return { success: false, message: "Invalid Supabase Project URL. Must start with https://" };
    }
    if (!config.anonKey) {
      return { success: false, message: "Supabase Publishable/Anon Key is required." };
    }

    const client = getSupabaseClient(config);
    if (!client) {
      return { success: false, message: "Failed to initialize Supabase client." };
    }

    const tableName = config.tableName || DEFAULT_TABLE_NAME;

    // Test query table
    const { data, error } = await client.from(tableName).select("id, payload").limit(1);

    if (error) {
      if (error.code === "PGRST204" || error.message.includes("does not exist")) {
        return {
          success: false,
          message: `Table '${tableName}' does not exist in your Supabase database. Please create it using the SQL editor.`,
        };
      }
      return { success: false, message: `Supabase Error: ${error.message}` };
    }

    return { success: true, message: `✓ Connected to Supabase table '${tableName}' successfully!` };
  } catch (e: any) {
    return { success: false, message: `Connection Error: ${e.message || e}` };
  }
}

// Fetch live master portfolio data from Supabase
export async function fetchSupabasePortfolioData(customConfig?: Partial<SupabaseConfig>): Promise<any | null> {
  const config = getSupabaseConfig(customConfig);
  if (!config) return null;

  const client = getSupabaseClient(config);
  if (!client) return null;

  try {
    const tableName = config.tableName || DEFAULT_TABLE_NAME;
    const { data, error } = await client
      .from(tableName)
      .select("payload, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) return null;
    return data[0].payload;
  } catch (e) {
    console.warn("Supabase fetch error", e);
    return null;
  }
}

// Push live portfolio updates to Supabase (via secure Server API)
export async function saveSupabasePortfolioData(
  payload: any,
  customConfig?: Partial<SupabaseConfig>
): Promise<boolean> {
  const config = getSupabaseConfig(customConfig);
  if (!config) return false;

  // 1. First, attempt secure server-side write via /api/portfolio-sync
  try {
    const savedPassword =
      typeof window !== "undefined"
        ? localStorage.getItem("rahil_portfolio_custom_password") || ""
        : "";

    const res = await fetch("/api/portfolio-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload,
        password: savedPassword,
        customSupabaseUrl: config.url,
        customSupabaseKey: config.anonKey,
        customTableName: config.tableName || DEFAULT_TABLE_NAME,
      }),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success) return true;
    }
  } catch (e) {
    console.warn("Server API write failed, attempting fallback...", e);
  }

  // 2. Fallback to direct client-side upsert
  const client = getSupabaseClient(config);
  if (!client) return false;

  try {
    const tableName = config.tableName || DEFAULT_TABLE_NAME;
    const { error } = await client.from(tableName).upsert(
      {
        id: 1,
        payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("Supabase upsert error:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Supabase save failed:", e);
    return false;
  }
}

// Subscribe to Realtime Postgres changes from Supabase
export function subscribeSupabaseRealtime(
  customConfig: Partial<SupabaseConfig> | undefined,
  onUpdate: (newPayload: any) => void
): (() => void) | null {
  const config = getSupabaseConfig(customConfig);
  if (!config) return null;

  const client = getSupabaseClient(config);
  if (!client) return null;

  const tableName = config.tableName || DEFAULT_TABLE_NAME;

  try {
    const channel = client
      .channel("portfolio_realtime_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tableName,
        },
        (payload: any) => {
          if (payload.new && payload.new.payload) {
            onUpdate(payload.new.payload);
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (e) {
    console.error("Failed to subscribe to Supabase Realtime", e);
    return null;
  }
}
