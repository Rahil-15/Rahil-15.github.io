// Cloud Storage Service for Real-Time Live Portfolio Sync
// Supports Supabase, Firebase Realtime DB, and JSONBin Cloud Storage APIs

const CLOUD_STORAGE_KEY = "rahil_portfolio_cloud_config";

export interface CloudConfig {
  provider: "supabase" | "firebase" | "jsonbin" | "custom";
  apiUrl: string;
  apiKey?: string;
}

// Default fallback Cloud Config (Stored in LocalStorage if customized)
export function getCloudConfig(): CloudConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(CLOUD_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load cloud config", e);
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
  if (!config || !config.apiUrl) return null;

  try {
    const headers: Record<string, string> = {};
    if (config.apiKey) {
      if (config.provider === "supabase") {
        headers["apikey"] = config.apiKey;
        headers["Authorization"] = `Bearer ${config.apiKey}`;
      } else if (config.provider === "jsonbin") {
        headers["X-Master-Key"] = config.apiKey;
      }
    }

    const res = await fetch(config.apiUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();

    // Handle Supabase array wrapper vs raw JSON
    if (Array.isArray(data) && data.length > 0 && data[0].payload) {
      return data[0].payload;
    }
    if (data.record) return data.record; // JSONBin format
    return data;
  } catch (e) {
    console.warn("Cloud Database fetch failed or offline, falling back to local storage", e);
    return null;
  }
}

// Push live portfolio updates to Cloud Database in real-time
export async function saveCloudPortfolioData(data: any, customConfig?: CloudConfig): Promise<boolean> {
  const config = customConfig || getCloudConfig();
  if (!config || !config.apiUrl) return false;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    let body = JSON.stringify(data);

    if (config.provider === "supabase") {
      headers["apikey"] = config.apiKey || "";
      headers["Authorization"] = `Bearer ${config.apiKey || ""}`;
      headers["Prefer"] = "resolution=merge-duplicates";
      body = JSON.stringify({ id: 1, payload: data });
    } else if (config.provider === "jsonbin") {
      headers["X-Master-Key"] = config.apiKey || "";
    }

    const method = config.provider === "firebase" ? "PUT" : config.provider === "supabase" ? "POST" : "PUT";

    const res = await fetch(config.apiUrl, {
      method,
      headers,
      body,
    });

    return res.ok;
  } catch (e) {
    console.error("Cloud Database save failed", e);
    return false;
  }
}
