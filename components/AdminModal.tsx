"use client";

import React, { useState, useEffect } from "react";
import { usePortfolio } from "@/lib/portfolio-context";
import { LogOut, RotateCcw, Download, Upload, Shield, X, Key, LockKeyhole } from "lucide-react";

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

  const handleLoginSubmit = (e: React.FormEvent) => {
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
      setAdminPassword(passwordInput);
      loginAdmin(passwordInput);
      setError(false);
      setPasswordInput("");
      setConfirmPassword("");
      closeLoginModal();
      alert("Custom Admin Password created successfully!");
    } else {
      if (loginAdmin(passwordInput)) {
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

  return (
    <>
      {/* Admin Top Status Bar when Logged In */}
      {isAdmin && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-emerald-950/95 border-b border-emerald-500/40 text-emerald-300 text-xs font-mono py-2.5 px-4 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wider">ADMIN EDIT MODE ACTIVE</span>
            <span className="text-neutral-400 hidden lg:inline">| Edit controls enabled across all portfolio sections</span>
          </div>

          <div className="flex items-center gap-2">
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
              title="Download backup JSON file of your portfolio data"
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
