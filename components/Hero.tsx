"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import AvailabilityBadge from "./AvailabilityBadge";
import { Mail, ArrowRight, Sparkles, Edit2, Check, X, Camera, Upload, Trash2 } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/SocialIcons";
import { usePortfolio } from "@/lib/portfolio-context";
import { useState, useRef } from "react";
import PhotoCropModal from "./PhotoCropModal";

export default function Hero() {
  const { heroData, updateHeroData, isAdmin, openLoginModal } = usePortfolio();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(heroData);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Photo Cropper Studio State
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);

  // Secret 6-click photo trigger state (completely silent)
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handlePhotoClick = () => {
    // If admin mode is active, clicking photo triggers file picker
    if (isAdmin) {
      fileInputRef.current?.click();
      return;
    }

    // If public visitor, track silent 6-click trigger for admin login
    const now = Date.now();
    if (now - lastClickTime > 2500) {
      setClickCount(1);
    } else {
      const nextCount = clickCount + 1;
      if (nextCount >= 6) {
        setClickCount(0);
        openLoginModal();
      } else {
        setClickCount(nextCount);
      }
    }
    setLastClickTime(now);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Image file is larger than 10MB. Please select a smaller photo.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const rawUrl = reader.result as string;
        // Open Crop & Adjust Modal studio
        setRawImageForCrop(rawUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCroppedPhotoSave = (croppedDataUrl: string) => {
    if (isEditing) {
      setForm((prev) => ({ ...prev, photoUrl: croppedDataUrl }));
    } else {
      updateHeroData({ photoUrl: croppedDataUrl });
    }
    setRawImageForCrop(null);
  };

  const handleSave = () => {
    updateHeroData(form);
    setIsEditing(false);
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden">
      {/* Hidden File Input for Device Photo Browsing */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Interactive Photo Crop & Adjust Studio Modal */}
      {rawImageForCrop && (
        <PhotoCropModal
          imageSrc={rawImageForCrop}
          onClose={() => setRawImageForCrop(null)}
          onSave={handleCroppedPhotoSave}
        />
      )}

      {/* Dynamic Data Science Grid & Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#10B98115_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 w-full relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Bio & Intro Text */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.12 },
              },
            }}
            className="lg:col-span-7"
          >
            <motion.div variants={fadeInUp} className="mb-6 flex flex-wrap items-center gap-3">
              <AvailabilityBadge />
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" /> Data Science & AIML
              </span>
              {isAdmin && (
                <button
                  onClick={() => {
                    setForm(heroData);
                    setIsEditing(!isEditing);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-colors"
                >
                  <Edit2 className="w-3 h-3" /> Edit Hero Info
                </button>
              )}
            </motion.div>

            {isEditing ? (
              <div className="p-6 rounded-2xl border border-amber-500/40 bg-slate-900/95 space-y-4 mb-6 text-xs font-mono">
                <h4 className="text-amber-400 font-bold text-sm">Edit Hero Details & Photo Overlay Badges</h4>
                
                {/* Profile Photo Uploader in Modal */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <label className="text-neutral-300 font-bold block">Profile Photo:</label>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-slate-800 border border-emerald-500/40 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {form.photoUrl ? (
                        <img src={form.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-emerald-400 font-mono font-bold text-lg">MN</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold flex items-center gap-1.5 text-xs hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
                      >
                        <Upload className="w-3.5 h-3.5" /> Browse & Crop Photo
                      </button>
                      
                      {form.photoUrl && (
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, photoUrl: "" })}
                          className="px-3 py-2 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 text-xs hover:bg-rose-500/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Photo
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1 text-[11px]">Or Paste Image Web URL:</label>
                    <input
                      type="text"
                      value={form.photoUrl || ""}
                      onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                      placeholder="https://example.com/my-photo.jpg"
                      className="w-full p-2 rounded bg-slate-800 border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>

                {/* Floating Photo Overlay Badges Controls */}
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                  <h5 className="text-emerald-400 font-bold text-xs">Floating Photo Card Overlay Badges:</h5>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-neutral-300 block mb-1 text-[11px]">Badge 1 (Role / Status):</label>
                      <input
                        type="text"
                        value={form.badge1Text || ""}
                        onChange={(e) => setForm({ ...form, badge1Text: e.target.value })}
                        placeholder="Data Science & AIML Student"
                        className="w-full p-2 rounded bg-slate-800 border border-white/10 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-300 block mb-1 text-[11px]">Badge 2 (Institute / Company):</label>
                      <input
                        type="text"
                        value={form.badge2Text || ""}
                        onChange={(e) => setForm({ ...form, badge2Text: e.target.value })}
                        placeholder="Jain College of Engg, VTU"
                        className="w-full p-2 rounded bg-slate-800 border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Full Name:</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-2 rounded bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Role Subtitle:</label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full p-2 rounded bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Tagline Paragraph:</label>
                  <textarea
                    rows={3}
                    value={form.tagline}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                    className="w-full p-2 rounded bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded bg-white/10 text-neutral-300 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-1.5 rounded bg-emerald-500 text-slate-950 font-bold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <>
                <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold text-white tracking-tight leading-[1.15] mb-6">
                  Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400">{heroData.name}</span>
                </motion.h1>

                <motion.p variants={fadeInUp} className="text-lg md:text-xl text-neutral-300 font-medium mb-4">
                  {heroData.role}
                </motion.p>

                <motion.p variants={fadeInUp} className="text-base text-neutral-400 mb-8 max-w-xl leading-relaxed">
                  {heroData.tagline}
                </motion.p>

                <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 items-center mb-6">
                  <a
                    href="#projects"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
                  >
                    View Projects
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/15 bg-white/[0.03] text-white font-medium rounded-xl hover:bg-white/[0.08] hover:border-white/30 transition-all"
                  >
                    Get In Touch
                  </a>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Right Column: Large High-Impact Hero Portrait Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative p-6 sm:p-7 rounded-3xl border border-emerald-500/20 bg-slate-900/80 backdrop-blur-xl shadow-2xl space-y-6">
              
              {/* Large Portrait Showcase Container */}
              <div
                onClick={handlePhotoClick}
                className="relative group cursor-pointer select-none rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-square border-2 border-emerald-500/30 bg-slate-950 shadow-2xl shadow-emerald-500/10 transition-all duration-500 hover:border-emerald-400 hover:shadow-emerald-500/20"
                title={isAdmin ? "Click to change photo / crop" : heroData.name}
              >
                {heroData.photoUrl ? (
                  <img
                    src={heroData.photoUrl}
                    alt={heroData.name}
                    className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 p-6 text-center">
                    <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold font-mono text-3xl mb-3 shadow-inner">
                      MN
                    </div>
                    <span className="text-sm font-heading font-bold text-white mb-1">{heroData.name}</span>
                    <span className="text-xs font-mono text-emerald-400">Data Science & AIML Student</span>
                  </div>
                )}

                {/* Ambient Radial Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none" />

                {/* Customizable Floating Overlay Badges */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur border border-emerald-500/30 text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-lg max-w-[58%] truncate">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{heroData.badge1Text || "Data Science & AIML Student"}</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-xl bg-slate-900/85 backdrop-blur border border-cyan-500/30 text-cyan-400 font-mono text-[11px] font-bold shadow-lg max-w-[40%] truncate">
                    <span className="truncate">{heroData.badge2Text || "Jain College of Engg, VTU"}</span>
                  </div>
                </div>

                {/* Admin Mode Overlay Button */}
                {isAdmin && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white">
                    <div className="p-3 rounded-full bg-emerald-500 text-slate-950 font-bold shadow-xl">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold bg-slate-900/90 px-3 py-1 rounded-full border border-emerald-500/40 text-emerald-300">
                      Upload & Crop Photo
                    </span>
                  </div>
                )}
              </div>

              {/* Connect Bar underneath portrait */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Connect & Links:</span>
                
                <div className="flex items-center gap-2">
                  {heroData.linkedin && (
                    <a
                      href={heroData.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/10 text-neutral-200 hover:text-cyan-300 transition-all flex items-center gap-1.5 text-xs font-mono"
                    >
                      <LinkedinIcon className="w-3.5 h-3.5 text-cyan-400" /> LinkedIn
                    </a>
                  )}
                  {heroData.github && (
                    <a
                      href={heroData.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/10 text-neutral-200 hover:text-emerald-300 transition-all flex items-center gap-1.5 text-xs font-mono"
                    >
                      <GithubIcon className="w-3.5 h-3.5 text-emerald-400" /> GitHub
                    </a>
                  )}
                  {heroData.email && (
                    <a
                      href={`mailto:${heroData.email}`}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/10 text-neutral-200 hover:text-indigo-300 transition-all flex items-center gap-1.5 text-xs font-mono"
                    >
                      <Mail className="w-3.5 h-3.5 text-indigo-400" /> {heroData.email}
                    </a>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
