// Cloud Storage Service for Real-Time Live Portfolio Sync
// Supports Supabase and JSONBin Cloud Storage Providers

import {
  fetchSupabasePortfolioData,
  saveSupabasePortfolioData,
  subscribeSupabaseRealtime,
  testSupabaseConnection,
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
      apiUrl: envSupabaseUrl,
      apiKey: envSupabaseKey,
      tableName: "portfolio_data",
    };
  }

  return null;
}

export function saveCloudConfig(config: CloudConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(config));
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
export async function saveCloudPortfolioData(data: any, customConfig?: CloudConfig): Promise<boolean> {
  const config = customConfig || getCloudConfig();
  if (!config) return false;

  if (config.provider === "supabase") {
    return await saveSupabasePortfolioData(data, {
      url: config.apiUrl,
      anonKey: config.apiKey,
      tableName: config.tableName || "portfolio_data",
    });
  }

  // JSONBin implementation
  if (!config.apiUrl) return false;
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

    return res.ok;
  } catch (e) {
    console.error("JSONBin save failed", e);
    return false;
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
