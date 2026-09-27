// Cloud Storage Service for Real-Time Live Portfolio Sync
// Supports Supabase and JSONBin Cloud Storage Providers

import {
  fetchSupabasePortfolioData,
  saveSupabasePortfolioData,
  subscribeSupabaseRealtime,
  testSupabaseConnection,
  normalizeSupabaseUrl,
} from "./supabase";

const CLOUD_STORAGE_KEY = "rahil_portfolio_cloud_config";

export interface CloudConfig {
  provider: "supabase" | "jsonbin";
  apiUrl: string;
  apiKey?: string;
  tableName?: string;
}

// Get saved Cloud Config from LocalStorage or environment variables
export function getCloudConfig(): CloudConfig | null {
  if (typeof window === "undefined") return null;

  // 1. Check LocalStorage configuration first
  try {
    const saved = localStorage.getItem(CLOUD_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.provider === "supabase" && parsed.apiUrl) {
        parsed.apiUrl = normalizeSupabaseUrl(parsed.apiUrl);
      }
      if (parsed.apiUrl || parsed.provider === "supabase") return parsed;
    }
  } catch (e) {
    console.error("Failed to load cloud config from storage", e);
  }

  // 2. Fallback to Environment Variables (NEXT_PUBLIC_SUPABASE_URL)
  const envSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (envSupabaseUrl && envSupabaseKey) {
    return {
      provider: "supabase",
      apiUrl: normalizeSupabaseUrl(envSupabaseUrl),
      apiKey: envSupabaseKey,
      tableName: "portfolio_data",
    };
  }

  return null;
}

export function saveCloudConfig(config: CloudConfig) {
  if (typeof window === "undefined") return;
  const cleanedConfig = { ...config };
  if (cleanedConfig.provider === "supabase" && cleanedConfig.apiUrl) {
    cleanedConfig.apiUrl = normalizeSupabaseUrl(cleanedConfig.apiUrl);
  }
  localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(cleanedConfig));
}

// Fetch live master portfolio data from Cloud Database
export async function fetchCloudPortfolioData(customConfig?: CloudConfig): Promise<any | null> {
  const config = customConfig || getCloudConfig();
  if (!config) return null;

  if (config.provider === "supabase") {
    return await fetchSupabasePortfolioData({
      url: config.apiUrl,
      anonKey: config.apiKey,
      tableName: config.tableName || "portfolio_data",
    });
  }

  // JSONBin implementation
  if (!config.apiUrl) return null;
  try {
    const headers: Record<string, string> = {};
    if (config.apiKey) {
      headers["X-Master-Key"] = config.apiKey;
    }

    const res = await fetch(config.apiUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.record) return data.record; // JSONBin format
    return data;
  } catch (e) {
    console.warn("JSONBin fetch failed or offline", e);
    return null;
  }
}

// Push live portfolio updates to Cloud Database in real-time
export async function saveCloudPortfolioData(
  data: any,
  customConfig?: CloudConfig
): Promise<{ success: boolean; message: string }> {
  const config = customConfig || getCloudConfig();
  if (!config) return { success: false, message: "No Cloud Database configured." };

  if (config.provider === "supabase") {
    return await saveSupabasePortfolioData(data, {
      url: config.apiUrl,
      anonKey: config.apiKey,
      tableName: config.tableName || "portfolio_data",
    });
  }

  // JSONBin implementation
  if (!config.apiUrl) return { success: false, message: "Missing JSONBin API URL." };
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (config.apiKey) {
      headers["X-Master-Key"] = config.apiKey;
    }

    const res = await fetch(config.apiUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    if (res.ok) {
      return { success: true, message: "✓ Connected & Saved to JSONBin.io successfully!" };
    }
    return { success: false, message: `JSONBin Save Error (${res.status}): ${res.statusText}` };
  } catch (e: any) {
    console.error("JSONBin save failed", e);
    return { success: false, message: `JSONBin Save Error: ${e.message || e}` };
  }
}

// Test Cloud Connection & Provider Setup
export async function testCloudConnection(
  config: CloudConfig
): Promise<{ success: boolean; message: string }> {
  if (config.provider === "supabase") {
    return await testSupabaseConnection({
      url: config.apiUrl,
      anonKey: config.apiKey || "",
      tableName: config.tableName || "portfolio_data",
    });
  }

  // JSONBin Test Connection
  if (!config.apiUrl || !config.apiUrl.startsWith("https://")) {
    return { success: false, message: "Invalid JSONBin API URL. Must start with https://" };
  }

  try {
    const headers: Record<string, string> = {};
    if (config.apiKey) {
      headers["X-Master-Key"] = config.apiKey;
    }

    const res = await fetch(config.apiUrl, { method: "GET", headers });
    if (!res.ok) {
      return { success: false, message: `JSONBin HTTP Error ${res.status}: ${res.statusText}` };
    }
    return { success: true, message: "✓ Connected to JSONBin.io successfully!" };
  } catch (e: any) {
    return { success: false, message: `JSONBin Connection Error: ${e.message || e}` };
  }
}

// Subscribe to Realtime Updates (Supabase Realtime)
export function subscribeToRealtimeCloudUpdates(
  onUpdate: (newPayload: any) => void
): (() => void) | null {
  const config = getCloudConfig();
  if (!config || config.provider !== "supabase") return null;

  return subscribeSupabaseRealtime(
    {
      url: config.apiUrl,
      anonKey: config.apiKey,
      tableName: config.tableName || "portfolio_data",
    },
    onUpdate
  );
}
