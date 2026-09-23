"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { usePortfolio } from "@/lib/portfolio-context";
import { AchievementItem } from "@/data/achievements";
import { Trophy, Award, Globe, ShieldCheck, Plus, Edit3, Trash2, X, Check } from "lucide-react";
import { useState } from "react";

export default function Achievements() {
  const {
    achievements,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    languages,
    updateLanguages,
    isAdmin,
  } = usePortfolio();

  // Achievement Modal State
  const [achModalMode, setAchModalMode] = useState<"add" | "edit" | null>(null);
  const [editingAchIndex, setEditingAchIndex] = useState<number | null>(null);
  
  const emptyAch: AchievementItem = {
    title: "",
    category: "Leadership",
    detail: "",
  };

  const [achForm, setAchForm] = useState<AchievementItem>(emptyAch);

  // Languages Modal State
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [langInput, setLangInput] = useState("");

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Leadership": return <Trophy className="w-5 h-5 text-emerald-400" />;
      case "Certification": return <Award className="w-5 h-5 text-cyan-400" />;
      case "Community": return <ShieldCheck className="w-5 h-5 text-indigo-400" />;
      case "Academic": return <Globe className="w-5 h-5 text-emerald-400" />;
      default: return <Trophy className="w-5 h-5 text-emerald-400" />;
    }
  };

  // Achievement Handlers
  const handleOpenAddAch = () => {
    setAchForm(emptyAch);
    setAchModalMode("add");
  };

  const handleOpenEditAch = (index: number) => {
    setEditingAchIndex(index);
    setAchForm({ ...achievements[index] });
    setAchModalMode("edit");
  };

  const handleAchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (achModalMode === "add") {
      addAchievement(achForm);
    } else if (achModalMode === "edit" && editingAchIndex !== null) {
      updateAchievement(editingAchIndex, achForm);
    }
    setAchModalMode(null);
  };

  // Languages Handlers
  const handleOpenLangEdit = () => {
    setLangInput(languages.join(", "));
    setIsLangModalOpen(true);
  };

  const handleLangSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = langInput.split(",").map((l) => l.trim()).filter(Boolean);
    updateLanguages(updated);
    setIsLangModalOpen(false);
  };

  return (
    <section id="achievements" className="py-24 md:py-32 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4 max-w-4xl mx-auto">
            <div className="text-center sm:text-left">
              <span className="inline-block px-3 py-1 mb-3 text-xs font-mono font-medium text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 rounded-full">
                Leadership & Certifications
              </span>
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-white tracking-tight">
                Key Achievements & Credentials
              </h2>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenAddAch}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold font-mono text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 self-center sm:self-auto"
              >
                <Plus className="w-4 h-4" /> Add Achievement
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {achievements.map((item, idx) => (
              <motion.div
                key={item.title + idx}
                variants={fadeInUp}
                className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all duration-300 flex items-start gap-4 relative group"
              >
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex-shrink-0 mt-0.5">
                  {getCategoryIcon(item.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                      {item.category}
                    </span>

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditAch(idx)}
                          className="p-1 rounded-lg text-neutral-400 hover:text-emerald-400 hover:bg-white/10 transition-colors"
                          title="Edit Achievement"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteAchievement(idx)}
                          className="p-1 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                          title="Delete Achievement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-neutral-300 leading-relaxed">{item.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Languages Banner */}
          <motion.div
            variants={fadeInUp}
            className="mt-12 p-6 rounded-2xl border border-white/10 bg-white/[0.02] max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 relative"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-semibold text-white">Languages Known:</span>
            </div>

            <div className="flex flex-wrap gap-2 justify-center flex-1 sm:justify-end">
              {languages.map((lang, i) => (
                <span
                  key={lang + i}
                  className={`px-3 py-1 text-xs font-mono rounded-lg border ${
                    i % 2 === 0
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      : "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                  }`}
                >
                  {lang}
                </span>
              ))}
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenLangEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-mono text-xs font-semibold transition-all"
                title="Edit Languages"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* ACHIEVEMENT MODAL */}
      {achModalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <h3 className="text-xl font-bold font-heading text-white">
                {achModalMode === "add" ? "Add Achievement / Credential" : "Edit Achievement"}
              </h3>
              <button
                onClick={() => setAchModalMode(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={achForm.title}
                  onChange={(e) => setAchForm({ ...achForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-sans text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="Event Coordinator – Savishkar 2025"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Category</label>
                <select
                  value={achForm.category}
                  onChange={(e) => setAchForm({ ...achForm, category: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white font-sans text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="Leadership">Leadership</option>
                  <option value="Certification">Certification</option>
                  <option value="Community">Community</option>
                  <option value="Academic">Academic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Details & Impact</label>
                <textarea
                  rows={3}
                  required
                  value={achForm.detail}
                  onChange={(e) => setAchForm({ ...achForm, detail: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-sans text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="Directed the flagship event managing 50+ teams..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAchModalMode(null)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white font-mono text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold font-mono text-xs hover:bg-emerald-400 transition-all"
                >
                  <Check className="w-4 h-4" /> Save Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LANGUAGES MODAL */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <h3 className="text-xl font-bold font-heading text-white">Edit Languages Known</h3>
              <button
                onClick={() => setIsLangModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLangSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">
                  Languages (Comma Separated)
                </label>
                <textarea
                  rows={4}
                  required
                  value={langInput}
                  onChange={(e) => setLangInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-sans text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="English, Hindi, Kannada (Read/Write/Speak), Urdu (Speak), Marathi (Read)"
                />
                <p className="text-[11px] text-neutral-400 mt-1 font-mono">
                  Separate each language proficiency badge with a comma.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsLangModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white font-mono text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold font-mono text-xs hover:bg-emerald-400 transition-all"
                >
                  <Check className="w-4 h-4" /> Save Languages
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
