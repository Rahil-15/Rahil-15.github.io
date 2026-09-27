import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  tableName?: string;
}

const DEFAULT_TABLE_NAME = "portfolio_data";

// Helper to normalize Supabase URL to base origin (https://<project-ref>.supabase.co)
export function normalizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  let url = rawUrl.trim();

  // Ensure scheme
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  } else if (url.startsWith("http://")) {
    url = url.replace("http://", "https://");
  }

  try {
    const parsed = new URL(url);
    // Retain origin only (e.g., https://xyz.supabase.co), stripping /rest/v1/, etc.
    return parsed.origin;
  } catch (e) {
    let cleaned = url.split("?")[0].split("#")[0];
    cleaned = cleaned.replace(/\/(rest|auth|storage)(\/v\d+)?(\/.*)?$/i, "");
    cleaned = cleaned.replace(/\/+$/, "");
    return cleaned;
  }
}

// Helper to get environment or stored Supabase config
export function getSupabaseConfig(customConfig?: Partial<SupabaseConfig>): SupabaseConfig | null {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

  const rawUrl = customConfig?.url || envUrl;
  const url = normalizeSupabaseUrl(rawUrl);
  const anonKey = customConfig?.anonKey || envKey;
  const tableName = customConfig?.tableName || DEFAULT_TABLE_NAME;

  if (!url || !anonKey) return null;
  return { url, anonKey, tableName };
}

// Create a client-side Supabase client instance
export function getSupabaseClient(config: SupabaseConfig): SupabaseClient | null {
  try {
    const cleanUrl = normalizeSupabaseUrl(config.url);
    if (!cleanUrl || !config.anonKey) return null;
    return createClient(cleanUrl, config.anonKey);
  } catch (e) {
    console.error("Failed to initialize Supabase client", e);
    return null;
  }
}

// Test Supabase connection & table presence
export async function testSupabaseConnection(config: SupabaseConfig): Promise<{ success: boolean; message: string }> {
  try {
    const cleanUrl = normalizeSupabaseUrl(config.url);
    if (!cleanUrl || !cleanUrl.startsWith("https://")) {
      return { success: false, message: "Invalid Supabase Project URL. Must start with https://" };
    }
    if (!config.anonKey) {
      return { success: false, message: "Supabase Publishable/Anon Key is required." };
    }

    // 1. Test client-side SELECT query (verifying table exists & public SELECT policy works)
    const client = getSupabaseClient(config);
    if (!client) {
      return { success: false, message: "Failed to initialize Supabase client." };
    }

    const tableName = config.tableName || DEFAULT_TABLE_NAME;
    const { data, error } = await client.from(tableName).select("id, payload").limit(1);

    if (error) {
      if (error.code === "PGRST204" || error.message.includes("does not exist")) {
        return {
          success: false,
          message: `Table '${tableName}' does not exist in your Supabase database. Please create it using the SQL editor.`,
        };
      }
      return { success: false, message: `Supabase Table Error: ${error.message}` };
    }

    // 2. Test server API route (/api/portfolio-sync) service role write access
    try {
      const savedPassword =
        typeof window !== "undefined"
          ? localStorage.getItem("rahil_portfolio_custom_password") || ""
          : "";

      const res = await fetch("/api/portfolio-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          password: savedPassword,
          customSupabaseUrl: config.url,
          customSupabaseKey: config.anonKey,
          customTableName: config.tableName || DEFAULT_TABLE_NAME,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        return {
          success: false,
          message: json.message || `Server API Error (${res.status}): Service role write check failed.`,
        };
      }
    } catch (e: any) {
      console.warn("Server API test warning:", e);
    }

    return { success: true, message: `✓ Connected to Supabase table '${tableName}' & verified Server API access!` };
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
): Promise<{ success: boolean; message: string }> {
  const config = getSupabaseConfig(customConfig);
  if (!config) {
    return { success: false, message: "Missing Supabase configuration (URL or Publishable Key)." };
  }

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

    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, message: result.message || "✓ Portfolio updated securely!" };
    }

    return {
      success: false,
      message: result.message || `Server API Error (${res.status}): Write request failed.`,
    };
  } catch (e: any) {
    console.error("Server API write request failed:", e);
    return {
      success: false,
      message: `Network/API Error: Could not reach /api/portfolio-sync (${e.message || e})`,
    };
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
