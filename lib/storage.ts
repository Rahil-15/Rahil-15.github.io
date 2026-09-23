// Utility for robust IndexedDB storage + LocalStorage fallback
const DB_NAME = "RahilPortfolioDB";
const STORE_NAME = "portfolio_store";
const DB_VERSION = 1;
const DATA_KEY = "current_portfolio_payload";
const LOCAL_STORAGE_KEY = "rahil_portfolio_data_v2";

// Initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject("IndexedDB not supported");
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

// Save portfolio data asynchronously to IndexedDB & LocalStorage fallback
export async function savePortfolioData(data: any): Promise<boolean> {
  try {
    // 1. Try LocalStorage (with safety catch)
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("LocalStorage quota exceeded, relying on IndexedDB", e);
    }

    // 2. Save to IndexedDB (unlimited storage capacity)
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, DATA_KEY);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error("Failed to save portfolio data", e);
    return false;
  }
}

// Load portfolio data asynchronously from IndexedDB or LocalStorage
export async function loadPortfolioData(): Promise<any | null> {
  try {
    // 1. Try loading from IndexedDB first
    try {
      const db = await openDB();
      const data = await new Promise<any>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(DATA_KEY);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      if (data) return data;
    } catch (e) {
      console.warn("IndexedDB load failed, falling back to LocalStorage", e);
    }

    // 2. Fallback to LocalStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    }
  } catch (e) {
    console.error("Failed to load portfolio data", e);
  }
  return null;
}
