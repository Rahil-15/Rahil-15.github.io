"use client";

import React, { useState, useEffect } from "react";
import { usePortfolio } from "@/lib/portfolio-context";
import {
  LogOut,
  RotateCcw,
  Download,
  Upload,
  Shield,
  X,
  Key,
  LockKeyhole,
  Cloud,
  Check,
  Globe,
  Database,
  Sparkles,
  AlertCircle,
  Copy,
} from "lucide-react";
import {
  getCloudConfig,
  saveCloudConfig,
  saveCloudPortfolioData,
  fetchCloudPortfolioData,
  testCloudConnection,
  CloudConfig,
} from "@/lib/cloud-storage";

export default function AdminModal() {
  const {
    isAdmin,
    hasCustomPassword,
    loginAdmin,
    setAdminPassword,
    logoutAdmin,
    resetToDefaults,
    exportDataJSON,
    importDataJSON,
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
    heroData,
    aboutData,
    focusData,
    projects,
    skills,
    experience,
    journey,
    achievements,
    languages,
  } = usePortfolio();

  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");

  const [newPassInput, setNewPassInput] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");

  // Cloud Storage Setup Modal State
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [cloudProvider, setCloudProvider] = useState<"supabase" | "jsonbin">("supabase");

  // Supabase Fields
  const [supabaseUrl, setSupabaseUrl] = useState(process.env.NEXT_PUBLIC_SUPABASE_URL || "");
  const [supabaseKey, setSupabaseKey] = useState(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "");
  const [supabaseTable, setSupabaseTable] = useState("portfolio_data");

  // JSONBin Fields
  const [jsonbinUrl, setJsonbinUrl] = useState("");
  const [jsonbinKey, setJsonbinKey] = useState("");

  const [isCloudActive, setIsCloudActive] = useState(false);
  const [cloudStatusMsg, setCloudStatusMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Shortcut Ctrl + Shift + A or Ctrl + Alt + E
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.shiftKey && (e.key.toUpperCase() === "A" || e.code === "KeyA")) ||
        (e.ctrlKey && e.altKey && (e.key.toUpperCase() === "E" || e.code === "KeyE"))
      ) {
        e.preventDefault();
        if (isLoginModalOpen) {
          closeLoginModal();
        } else {
          openLoginModal();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoginModalOpen, openLoginModal, closeLoginModal]);

  // Load existing Cloud config on mount
  useEffect(() => {
    const conf = getCloudConfig();
    if (conf) {
      setCloudProvider(conf.provider === "jsonbin" ? "jsonbin" : "supabase");
      if (conf.provider === "supabase") {
        setSupabaseUrl(conf.apiUrl || "");
        setSupabaseKey(conf.apiKey || "");
        setSupabaseTable(conf.tableName || "portfolio_data");
      } else {
        setJsonbinUrl(conf.apiUrl || "");
        setJsonbinKey(conf.apiKey || "");
      }
      setIsCloudActive(!!conf.apiUrl);
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) return;

    if (!hasCustomPassword) {
      if (passwordInput.length < 4) {
        setError(true);
        setErrorMessage("Password must be at least 4 characters long.");
        return;
      }
      if (passwordInput !== confirmPassword) {
        setError(true);
        setErrorMessage("Passwords do not match.");
        return;
      }
      const success = await loginAdmin(passwordInput);
      if (success) {
        setError(false);
        setPasswordInput("");
        setConfirmPassword("");
        closeLoginModal();
        alert("Admin Password saved & logged in successfully!");
      } else {
        setError(true);
        setErrorMessage("Incorrect Admin Password or server validation failed.");
      }
    } else {
      const success = await loginAdmin(passwordInput);
      if (success) {
        setError(false);
        setPasswordInput("");
        closeLoginModal();
      } else {
        setError(true);
        setErrorMessage("Incorrect Admin Password.");
      }
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassInput.length < 4) {
      alert("Password must be at least 4 characters long.");
      return;
    }
    if (newPassInput !== confirmNewPass) {
      alert("Passwords do not match.");
      return;
    }
    setAdminPassword(newPassInput);
    setShowChangePasswordModal(false);
    setNewPassInput("");
    setConfirmNewPass("");
    alert("Admin password updated successfully!");
  };

  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio-default.json";
    a.click();
    URL.revokeObjectURL(url);
    alert(
      "Downloaded portfolio-default.json!\n\nTo make your photo and edits permanent for EVERY public visitor on https://rahil-portfolio15.netlify.app/:\n1. Replace 'data/portfolio-default.json' in your project with this downloaded file.\n2. Commit & push/re-deploy to Netlify!\n\nEvery visitor worldwide will now see your photo & custom portfolio automatically!"
    );
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (importDataJSON(importJsonText)) {
      alert("Portfolio data imported successfully!");
      setShowImportModal(false);
      setImportJsonText("");
    } else {
      alert("Invalid JSON format. Please check your data.");
    }
  };

  const handleSaveCloudSetup = async (e: React.FormEvent) => {
    e.preventDefault();

    const config: CloudConfig =
      cloudProvider === "supabase"
        ? {
            provider: "supabase",
            apiUrl: supabaseUrl.trim(),
            apiKey: supabaseKey.trim(),
            tableName: supabaseTable.trim() || "portfolio_data",
          }
        : {
            provider: "jsonbin",
            apiUrl: jsonbinUrl.trim(),
            apiKey: jsonbinKey.trim(),
          };

    setCloudStatusMsg({ type: "info", text: "Connecting & testing table access..." });

    // Step 1: Test Connection & Table
    const testResult = await testCloudConnection(config);

    if (!testResult.success) {
      setCloudStatusMsg({ type: "error", text: testResult.message });
      return;
    }

    // Step 2: Push current master payload to Cloud
    setCloudStatusMsg({ type: "info", text: "Syncing portfolio data to cloud..." });

    const payload = {
      heroData,
      aboutData,
      focusData,
      projectsList: projects,
      skillsList: skills,
      experienceList: experience,
      journeyList: journey,
      achievementsList: achievements,
      languagesList: languages,
    };

    const saveSuccess = await saveCloudPortfolioData(payload, config);

    if (saveSuccess) {
      saveCloudConfig(config);
      setIsCloudActive(true);
      setCloudStatusMsg({ type: "success", text: `✓ ${cloudProvider === "supabase" ? "Supabase" : "JSONBin"} Connected & Live Sync Active!` });
      alert(
        `✓ ${cloudProvider === "supabase" ? "Supabase Database" : "JSONBin.io"} Connected Successfully!\n\nEvery edit you make in Admin Mode on any device will now instantly sync live for ALL visitors on https://rahil-portfolio15.netlify.app/ in real time!`
      );
      setShowCloudModal(false);
    } else {
      setCloudStatusMsg({ type: "error", text: "Connection test passed, but initial data push failed. Check table permissions/RLS policy." });
    }
  };

  return (
    <>
      {/* Admin Top Status Bar when Logged In */}
      {isAdmin && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-emerald-950/95 border-b border-emerald-500/40 text-emerald-300 text-xs font-mono py-2.5 px-4 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wider">ADMIN EDIT MODE ACTIVE</span>
            <span className="text-neutral-400 hidden lg:inline">| Live editing controls enabled</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Cloud Database Sync Button */}
            <button
              onClick={() => setShowCloudModal(true)}
              className={`px-3 py-1 rounded font-bold flex items-center gap-1.5 transition-all ${
                isCloudActive
                  ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/20"
                  : "bg-amber-500/20 border border-amber-500/50 text-amber-300"
              }`}
              title="Connect Supabase or JSONBin Cloud Database for instant live edits everywhere"
            >
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              {isCloudActive ? "Live Cloud Sync Active" : "Connect Cloud DB"}
            </button>

            <button
              onClick={() => setShowChangePasswordModal(true)}
              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 transition-all"
              title="Change your secret Admin Password"
            >
              <Key className="w-3.5 h-3.5 text-cyan-400" /> Change Password
            </button>
            <button
              onClick={handleExport}
              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 transition-all"
              title="Download portfolio-default.json for Netlify deployment"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" /> Export Backup
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 transition-all"
              title="Upload JSON backup file"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" /> Import Backup
            </button>
            <button
              onClick={() => {
                if (confirm("Reset all portfolio sections back to default resume data?")) {
                  resetToDefaults();
                }
              }}
              className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 flex items-center gap-1 transition-all"
              title="Reset all content to original default resume"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
            </button>
            <button
              onClick={logoutAdmin}
              className="px-3 py-1 rounded bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 flex items-center gap-1 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Exit Edit Mode
            </button>
          </div>
        </div>
      )}

      {/* Admin Login / Setup Password Modal */}
      {isLoginModalOpen && !isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl border border-emerald-500/30 bg-slate-900 shadow-2xl relative">
            <button
              onClick={closeLoginModal}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {hasCustomPassword ? "Portfolio Admin Login" : "Create Secret Admin Password"}
                </h3>
                <p className="text-xs text-neutral-400 font-mono">
                  {hasCustomPassword
                    ? "Enter your custom secure password"
                    : "Create a private security password for your portfolio"}
                </p>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-300 mb-1.5">
                  {hasCustomPassword ? "Enter Admin Password:" : "Create Secret Password:"}
                </label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder={hasCustomPassword ? "Enter password" : "Min 4 characters"}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              {!hasCustomPassword && (
                <div>
                  <label className="block text-neutral-300 mb-1.5">Confirm Secret Password:</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {error && <p className="text-rose-400 text-xs">{errorMessage}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeLoginModal}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-neutral-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                >
                  {hasCustomPassword ? "Unlock Admin Mode" : "Save Password & Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cloud Database Setup Modal */}
      {showCloudModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full p-6 rounded-3xl border border-cyan-500/40 bg-slate-900 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setShowCloudModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Cloud Database Real-Time Sync
                </h3>
                <p className="text-xs text-neutral-400 font-mono">
                  Connect Supabase or JSONBin so your live edits appear for ALL visitors worldwide in real-time!
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCloudSetup} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-300 mb-1 font-bold">Select Cloud Provider:</label>
                <select
                  value={cloudProvider}
                  onChange={(e) => setCloudProvider(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/15 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="supabase">Supabase (Free PostgreSQL & Realtime DB)</option>
                  <option value="jsonbin">JSONBin.io (Free 1-Click Storage)</option>
                </select>
              </div>

              {/* SUPABASE FIELDS */}
              {cloudProvider === "supabase" && (
                <div className="space-y-3 p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
                  <div>
                    <label className="block text-cyan-300 mb-1 font-bold">Supabase Project URL:</label>
                    <input
                      type="text"
                      required
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://xxxxxxxxxxxx.supabase.co"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-cyan-300 mb-1 font-bold">
                      Supabase Publishable / Anon Key (public):
                    </label>
                    <input
                      type="password"
                      required
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Use only public publishable/anon key. Never expose service_role key.
                    </p>
                  </div>

                  <div>
                    <label className="block text-cyan-300 mb-1 font-bold">Table Name:</label>
                    <input
                      type="text"
                      required
                      value={supabaseTable}
                      onChange={(e) => setSupabaseTable(e.target.value)}
                      placeholder="portfolio_data"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 text-[11px] text-neutral-300 space-y-1.5">
                    <p className="font-bold text-cyan-400 flex items-center gap-1">
                      <Database className="w-3.5 h-3.5" /> Supabase Database SQL Setup:
                    </p>
                    <p className="text-neutral-400">Run this SQL query in your Supabase SQL Editor:</p>
                    <pre className="p-2 rounded bg-black/60 text-[10px] font-mono text-emerald-300 overflow-x-auto select-all">
{`CREATE TABLE portfolio_data (
  id INT PRIMARY KEY DEFAULT 1,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE portfolio_data ENABLE ROW LEVEL SECURITY;

-- 1. Allow public read access for visitors worldwide
CREATE POLICY "Public Read Portfolio" ON portfolio_data FOR SELECT USING (true);

-- 2. Secure Writes: Handled exclusively by Server API (/api/portfolio-sync)
-- using SUPABASE_SERVICE_ROLE_KEY which bypasses RLS safely.
-- NO public anon INSERT or UPDATE policy is enabled!`}
                    </pre>
                  </div>
                </div>
              )}

              {/* JSONBIN FIELDS */}
              {cloudProvider === "jsonbin" && (
                <div className="space-y-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <div>
                    <label className="block text-emerald-300 mb-1 font-bold">JSONBin Bin API URL:</label>
                    <input
                      type="text"
                      required
                      value={jsonbinUrl}
                      onChange={(e) => setJsonbinUrl(e.target.value)}
                      placeholder="https://api.jsonbin.io/v3/b/YOUR_BIN_ID"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-300 mb-1 font-bold">API Key / Master Key:</label>
                    <input
                      type="password"
                      value={jsonbinKey}
                      onChange={(e) => setJsonbinKey(e.target.value)}
                      placeholder="Paste $2a$10$... Master Key"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {cloudStatusMsg && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    cloudStatusMsg.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : cloudStatusMsg.type === "error"
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                      : "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                  }`}
                >
                  {cloudStatusMsg.type === "error" ? (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{cloudStatusMsg.text}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloudModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Connect & Test Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl border border-cyan-500/30 bg-slate-900 shadow-2xl relative">
            <button
              onClick={() => setShowChangePasswordModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <LockKeyhole className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Change Admin Password</h3>
                <p className="text-xs text-neutral-400 font-mono">Set a new private security password</p>
              </div>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-300 mb-1.5">New Admin Password:</label>
                <input
                  type="password"
                  required
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  placeholder="Min 4 characters"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1.5">Confirm New Password:</label>
                <input
                  type="password"
                  required
                  value={confirmNewPass}
                  onChange={(e) => setConfirmNewPass(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JSON Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full p-6 rounded-3xl border border-emerald-500/30 bg-slate-900 shadow-2xl relative">
            <button
              onClick={() => setShowImportModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2">Import Portfolio Backup JSON</h3>
            <p className="text-xs text-neutral-400 mb-4 font-mono">
              Paste valid JSON backup string below to restore content state:
            </p>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{"heroData": {...}, "projectsList": [...]}'
                rows={8}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-xs font-mono rounded-xl border border-white/10 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-mono font-bold rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                >
                  Import Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
