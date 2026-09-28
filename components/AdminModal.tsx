"use client";

import React, { useState, useEffect, useRef } from "react";
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
  FileText,
  Award,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  UploadCloud,
  FileUp,
  Image as ImageIcon,
} from "lucide-react";
import {
  getCloudConfig,
  saveCloudConfig,
  saveCloudPortfolioData,
  fetchCloudPortfolioData,
  testCloudConnection,
  CloudConfig,
} from "@/lib/cloud-storage";
import { normalizeSupabaseUrl } from "@/lib/supabase";

export default function AdminModal() {
  const {
    isAdmin,
    loginAdmin,
    changeAdminPassword,
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
    resumeData,
    updateResumeData,
    certificates,
    addCertificate,
    updateCertificate,
    deleteCertificate,
  } = usePortfolio();

  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");

  const [currentPassInput, setCurrentPassInput] = useState("");
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

  // Resume Management Modal State
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeStatusMsg, setResumeStatusMsg] = useState<string | null>(null);
  const resumeFileInputRef = useRef<HTMLInputElement>(null);

  // Certificates Management Modal State
  const [showCertModal, setShowCertModal] = useState(false);
  const [selectedCertFile, setSelectedCertFile] = useState<File | null>(null);
  const [certImagePreview, setCertImagePreview] = useState<string | null>(null);
  const [isUploadingCert, setIsUploadingCert] = useState(false);
  const [certForm, setCertForm] = useState({
    id: "",
    title: "",
    organization: "",
    date: "",
    credentialUrl: "",
    imageUrl: "",
    imagePath: "",
    order: 1,
  });
  const [isEditingCert, setIsEditingCert] = useState(false);
  const certFileInputRef = useRef<HTMLInputElement>(null);

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

  const getActiveAdminPassword = (): string => {
    if (typeof window !== "undefined") {
      const activeSessionPassword = sessionStorage.getItem("rahil_portfolio_admin_password_temp") || "";
      if (activeSessionPassword) return activeSessionPassword;
    }
    return "";
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) return;

    const success = await loginAdmin(passwordInput);
    if (success) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("rahil_portfolio_admin_password_temp", passwordInput);
      }
      setError(false);
      setPasswordInput("");
      closeLoginModal();
    } else {
      setError(true);
      setErrorMessage("Incorrect Admin Password.");
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassInput) {
      alert("Please enter your current admin password.");
      return;
    }
    if (newPassInput.length < 4) {
      alert("New password must be at least 4 characters long.");
      return;
    }
    if (newPassInput !== confirmNewPass) {
      alert("New passwords do not match.");
      return;
    }

    const res = await changeAdminPassword(currentPassInput, newPassInput);
    if (res.success) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("rahil_portfolio_admin_password_temp", newPassInput);
      }
      alert(res.message);
      setShowChangePasswordModal(false);
      setCurrentPassInput("");
      setNewPassInput("");
      setConfirmNewPass("");
    } else {
      alert(res.message || "Failed to change admin password.");
    }
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
            apiUrl: normalizeSupabaseUrl(supabaseUrl),
            apiKey: supabaseKey.trim(),
            tableName: supabaseTable.trim() || "portfolio_data",
          }
        : {
            provider: "jsonbin",
            apiUrl: jsonbinUrl.trim(),
            apiKey: jsonbinKey.trim(),
          };

    setCloudStatusMsg({ type: "info", text: "Connecting & testing table access..." });

    const testResult = await testCloudConnection(config);

    if (!testResult.success) {
      setCloudStatusMsg({ type: "error", text: testResult.message });
      return;
    }

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
      resumeData,
      certificatesList: certificates,
    };

    const saveResult = await saveCloudPortfolioData(payload, config);

    if (saveResult.success) {
      saveCloudConfig(config);
      setIsCloudActive(true);
      setCloudStatusMsg({ type: "success", text: `✓ ${cloudProvider === "supabase" ? "Supabase" : "JSONBin"} Connected & Live Sync Active!` });
      alert(
        `✓ ${cloudProvider === "supabase" ? "Supabase Database" : "JSONBin.io"} Connected Successfully!`
      );
      setShowCloudModal(false);
    } else {
      setCloudStatusMsg({ type: "error", text: saveResult.message || "Initial data push failed." });
    }
  };

  // RESUME UPLOAD HANDLER
  const handleResumeFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        alert("Invalid file type. Please select a PDF file (.pdf).");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        alert("File size exceeds 15MB. Please select a smaller PDF file.");
        return;
      }
      setSelectedResumeFile(file);
      setResumeStatusMsg(null);
    }
  };

  const handleUploadResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeFile) return;

    const passwordToUse = getActiveAdminPassword();
    if (!passwordToUse) {
      const promptPass = prompt("Enter Admin Password to confirm upload:");
      if (!promptPass) return;
      sessionStorage.setItem("rahil_portfolio_admin_password_temp", promptPass);
    }

    setIsUploadingResume(true);
    setResumeStatusMsg("Uploading resume PDF to Supabase Storage...");

    try {
      const activePass = getActiveAdminPassword();
      const formData = new FormData();
      formData.append("file", selectedResumeFile);
      formData.append("password", activePass);
      formData.append("type", "resume");

      const res = await fetch("/api/portfolio-upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        const oldFilePath = resumeData?.filePath;
        updateResumeData({
          url: json.publicUrl,
          fileName: json.fileName || selectedResumeFile.name,
          filePath: json.filePath,
          updatedAt: new Date().toISOString().slice(0, 7),
        });

        // Safely delete old resume file if present
        if (oldFilePath && oldFilePath !== json.filePath) {
          try {
            await fetch("/api/portfolio-upload", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ password: activePass, filePath: oldFilePath }),
            });
          } catch (e) {
            console.warn("Could not cleanup old resume file:", e);
          }
        }

        setSelectedResumeFile(null);
        setResumeStatusMsg("✓ Resume uploaded and updated successfully!");
        alert("✓ Resume PDF uploaded and linked to Cloud Storage!");
      } else {
        alert(`Upload Failed: ${json.message || "Server Error"}`);
        setResumeStatusMsg(`Upload Failed: ${json.message || "Server Error"}`);
      }
    } catch (e: any) {
      alert(`Upload Error: ${e.message || e}`);
      setResumeStatusMsg(`Upload Error: ${e.message || e}`);
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!confirm("Are you sure you want to delete the current resume?")) return;

    const activePass = getActiveAdminPassword();
    const oldFilePath = resumeData?.filePath;

    updateResumeData({ url: "", fileName: "", filePath: "", updatedAt: "" });

    if (oldFilePath) {
      try {
        await fetch("/api/portfolio-upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: activePass, filePath: oldFilePath }),
        });
      } catch (e) {
        console.warn("Could not delete resume file from storage:", e);
      }
    }

    alert("✓ Resume removed successfully.");
  };

  // CERTIFICATE IMAGE FILE SELECTION HANDLER
  const handleCertFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validExts = [".jpg", ".jpeg", ".png", ".webp"];
      const lower = file.name.toLowerCase();
      if (!validExts.some((ext) => lower.endsWith(ext))) {
        alert("Invalid image file format. Please select a JPG, JPEG, PNG, or WEBP image.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("Image file exceeds 10MB. Please select a smaller photo.");
        return;
      }
      setSelectedCertFile(file);
      setCertImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.title || !certForm.organization) {
      alert("Certificate Title and Issuing Organization are required.");
      return;
    }

    const activePass = getActiveAdminPassword();
    if (!activePass) {
      const promptPass = prompt("Enter Admin Password to confirm save:");
      if (!promptPass) return;
      sessionStorage.setItem("rahil_portfolio_admin_password_temp", promptPass);
    }

    let finalImageUrl = certForm.imageUrl;
    let finalImagePath = certForm.imagePath;

    // Upload image file if user selected a new file from device
    if (selectedCertFile) {
      setIsUploadingCert(true);
      try {
        const formData = new FormData();
        formData.append("file", selectedCertFile);
        formData.append("password", getActiveAdminPassword());
        formData.append("type", "certificate");
        formData.append("certId", certForm.id || "cert-" + Date.now());

        const res = await fetch("/api/portfolio-upload", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();
        if (res.ok && json.success) {
          finalImageUrl = json.publicUrl;
          finalImagePath = json.filePath;
        } else {
          alert(`Image Upload Failed: ${json.message || "Server Error"}`);
          setIsUploadingCert(false);
          return;
        }
      } catch (e: any) {
        alert(`Image Upload Error: ${e.message || e}`);
        setIsUploadingCert(false);
        return;
      }
      setIsUploadingCert(false);
    }

    const certIdToUse = certForm.id || "cert-" + Date.now();
    const newCertItem = {
      ...certForm,
      id: certIdToUse,
      imageUrl: finalImageUrl,
      imagePath: finalImagePath,
    };

    const oldImagePath = isEditingCert ? certForm.imagePath : null;

    if (isEditingCert && certForm.id) {
      updateCertificate(certForm.id, newCertItem);
      // If old image path was replaced, delete old file from storage
      if (oldImagePath && finalImagePath && oldImagePath !== finalImagePath) {
        try {
          await fetch("/api/portfolio-upload", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: getActiveAdminPassword(), filePath: oldImagePath }),
          });
        } catch (e) {
          console.warn("Could not delete replaced certificate image:", e);
        }
      }
    } else {
      addCertificate(newCertItem);
    }

    // Reset Form
    setCertForm({
      id: "",
      title: "",
      organization: "",
      date: "",
      credentialUrl: "",
      imageUrl: "",
      imagePath: "",
      order: certificates.length + 1,
    });
    setSelectedCertFile(null);
    setCertImagePreview(null);
    setIsEditingCert(false);
  };

  const handleEditCertClick = (cert: any) => {
    setCertForm(cert);
    setCertImagePreview(cert.imageUrl || null);
    setSelectedCertFile(null);
    setIsEditingCert(true);
  };

  const handleDeleteCertClick = async (cert: any) => {
    if (!confirm(`Delete certificate "${cert.title}"?`)) return;

    deleteCertificate(cert.id);

    if (cert.imagePath) {
      try {
        await fetch("/api/portfolio-upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: getActiveAdminPassword(), filePath: cert.imagePath }),
        });
      } catch (e) {
        console.warn("Could not delete certificate image from storage:", e);
      }
    }
  };

  return (
    <>
      {/* Hidden File Inputs for Device Picking */}
      <input
        type="file"
        ref={resumeFileInputRef}
        accept=".pdf,application/pdf"
        onChange={handleResumeFileSelected}
        className="hidden"
      />
      <input
        type="file"
        ref={certFileInputRef}
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleCertFileSelected}
        className="hidden"
      />

      {/* Admin Top Status Bar when Logged In */}
      {isAdmin && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-emerald-950/95 border-b border-emerald-500/40 text-emerald-300 text-xs font-mono py-2.5 px-4 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wider">ADMIN EDIT MODE ACTIVE</span>
            <span className="text-neutral-400 hidden lg:inline">| Live editing controls enabled</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Resume Admin Button */}
            <button
              onClick={() => setShowResumeModal(true)}
              className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 flex items-center gap-1 transition-all"
              title="Manage Resume PDF Uploads"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" /> Resume PDF
            </button>

            {/* Certifications Admin Button */}
            <button
              onClick={() => setShowCertModal(true)}
              className="px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 flex items-center gap-1 transition-all"
              title="Manage Certifications Gallery"
            >
              <Award className="w-3.5 h-3.5 text-cyan-400" /> Certificates
            </button>

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

      {/* Admin Login Modal */}
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
                <h3 className="text-xl font-bold text-white">Portfolio Admin Login</h3>
                <p className="text-xs text-neutral-400 font-mono">
                  Enter your global admin password to unlock edit mode
                </p>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-300 mb-1.5">Enter Admin Password:</label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

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
                  Unlock Admin Mode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESUME MANAGEMENT MODAL */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full p-6 rounded-3xl border border-emerald-500/40 bg-slate-900 shadow-2xl relative">
            <button
              onClick={() => setShowResumeModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Resume Management</h3>
                <p className="text-xs text-neutral-400 font-mono">
                  Upload & replace your Resume PDF directly from your device
                </p>
              </div>
            </div>

            {/* Current Resume Info Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 mb-6 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 uppercase tracking-wider text-[10px] font-bold">Current Resume:</span>
                {resumeData?.updatedAt && (
                  <span className="text-[10px] text-emerald-400">Updated: {resumeData.updatedAt}</span>
                )}
              </div>

              {resumeData?.url ? (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-emerald-500/30">
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-white font-bold truncate">
                      {resumeData.fileName || "Mohammadrahil_Nasardi_Resume.pdf"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={resumeData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-[11px] flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View
                    </a>
                    <a
                      href={resumeData.url}
                      download={resumeData.fileName || "Mohammadrahil_Nasardi_Resume.pdf"}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 text-[11px] flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                    <button
                      type="button"
                      onClick={handleDeleteResume}
                      className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-neutral-400 italic text-center py-2">No active resume file currently linked.</p>
              )}
            </div>

            {/* File Picker & Upload Form */}
            <form onSubmit={handleUploadResumeSubmit} className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                <label className="block text-emerald-300 font-bold">Select New Resume PDF from Device:</label>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => resumeFileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center gap-2 text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <FileUp className="w-4 h-4" /> [ Choose Resume PDF ]
                  </button>

                  <span className="text-neutral-400 text-[11px]">Accepts .pdf files only</span>
                </div>

                {selectedResumeFile && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-white font-bold truncate">{selectedResumeFile.name}</span>
                    </div>
                    <span className="text-emerald-400 font-bold flex-shrink-0 ml-2">
                      {(selectedResumeFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </div>

              {resumeStatusMsg && (
                <p className="text-cyan-300 text-xs text-center font-bold animate-pulse">{resumeStatusMsg}</p>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowResumeModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-neutral-300"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={!selectedResumeFile || isUploadingResume}
                  className="px-5 py-2.5 font-bold rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" /> Upload & Save Resume
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CERTIFICATIONS MANAGEMENT MODAL */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-3xl w-full p-6 rounded-3xl border border-cyan-500/40 bg-slate-900 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setShowCertModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Certifications Gallery CMS</h3>
                <p className="text-xs text-neutral-400 font-mono">
                  Upload & manage verified credential cards with persistent image storage
                </p>
              </div>
            </div>

            {/* Existing Certificates Grid */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Current Certificates ({certificates.length}):
              </h4>

              {certificates.length === 0 ? (
                <p className="text-xs font-mono text-neutral-400 italic">No certificates currently added.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-3 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {cert.imageUrl ? (
                          <img src={cert.imageUrl} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0 border border-white/10" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 text-cyan-400">
                            <Award className="w-5 h-5" />
                          </div>
                        )}
                        <div className="truncate">
                          <span className="text-white font-bold block truncate">{cert.title}</span>
                          <span className="text-neutral-400 text-[11px] truncate">{cert.organization}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditCertClick(cert)}
                          className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                          title="Edit Certificate"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCertClick(cert)}
                          className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                          title="Delete Certificate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add / Edit Form */}
            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-4 text-xs font-mono">
              <h4 className="text-cyan-300 font-bold flex items-center gap-2">
                <Plus className="w-4 h-4" /> {isEditingCert ? "Edit Certificate" : "Add New Certificate"}
              </h4>

              <form onSubmit={handleCertSubmit} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-300 mb-1 font-bold">Certificate Title:</label>
                    <input
                      type="text"
                      required
                      value={certForm.title}
                      onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                      placeholder="e.g. AI Assisted Coding for Beginners"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/15 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 mb-1 font-bold">Issuing Organization:</label>
                    <input
                      type="text"
                      required
                      value={certForm.organization}
                      onChange={(e) => setCertForm({ ...certForm, organization: e.target.value })}
                      placeholder="e.g. AZ Career Link / Coursera"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/15 text-white"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-300 mb-1">Year / Date Issued:</label>
                    <input
                      type="text"
                      value={certForm.date}
                      onChange={(e) => setCertForm({ ...certForm, date: e.target.value })}
                      placeholder="e.g. 2025"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/15 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 mb-1">Verification Link (optional):</label>
                    <input
                      type="text"
                      value={certForm.credentialUrl}
                      onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })}
                      placeholder="https://verify.example.com/..."
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/15 text-white"
                    />
                  </div>
                </div>

                {/* Device Image Picker */}
                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-3">
                  <label className="block text-cyan-300 font-bold">Certificate Image File (Device Picker):</label>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => certFileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold flex items-center gap-2 text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
                    >
                      <ImageIcon className="w-4 h-4" /> [ Choose Certificate Image ]
                    </button>

                    <span className="text-neutral-400 text-[11px]">JPG, JPEG, PNG, WEBP (Max 10MB)</span>
                  </div>

                  {/* Image Live Preview */}
                  {certImagePreview && (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-cyan-500/30">
                      <img src={certImagePreview} alt="Preview" className="w-16 h-12 object-cover rounded-lg border border-white/10" />
                      <div>
                        <span className="text-white font-bold text-xs block">Selected Image Preview</span>
                        <span className="text-neutral-400 text-[10px]">
                          {selectedCertFile ? selectedCertFile.name : "Current Image URL"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  {isEditingCert && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingCert(false);
                        setCertForm({ id: "", title: "", organization: "", date: "", credentialUrl: "", imageUrl: "", imagePath: "", order: 1 });
                        setSelectedCertFile(null);
                        setCertImagePreview(null);
                      }}
                      className="px-3 py-2 rounded-xl bg-white/10 text-neutral-300"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isUploadingCert}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" /> {isEditingCert ? "Save Changes" : "Save Certificate"}
                  </button>
                </div>
              </form>
            </div>
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
-- using SUPABASE_SERVICE_ROLE_KEY which bypasses RLS safely.`}
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
                <label className="block text-neutral-300 mb-1.5">Current Admin Password:</label>
                <input
                  type="password"
                  required
                  value={currentPassInput}
                  onChange={(e) => setCurrentPassInput(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>

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
                  Update Global Password
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
