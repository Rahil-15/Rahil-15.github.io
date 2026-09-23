"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Flag, Edit2, X, Check } from "lucide-react";
import { usePortfolio } from "@/lib/portfolio-context";
import { useState } from "react";

export default function Focus() {
  const { focusData, updateFocusData, isAdmin } = usePortfolio();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(focusData);

  const handleSave = () => {
    updateFocusData(form);
    setIsEditing(false);
  };

  return (
    <section id="focus" className="py-24 md:py-32 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="p-8 md:p-12 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.03] via-slate-900/60 to-cyan-500/[0.03] relative overflow-hidden shadow-xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

          <motion.div variants={fadeInUp} className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 rounded-full">
                <Flag className="w-3.5 h-3.5 text-emerald-400" /> {focusData.badge}
              </span>
              {isAdmin && (
                <button
                  onClick={() => {
                    setForm(focusData);
                    setIsEditing(!isEditing);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-colors"
                >
                  <Edit2 className="w-3 h-3" /> Edit Section
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="p-6 rounded-2xl border border-amber-500/40 bg-slate-900/95 space-y-4 mb-6 text-xs font-mono">
                <h4 className="text-amber-400 font-bold text-sm">Edit Leadership Focus</h4>
                <div>
                  <label className="text-neutral-400 block mb-1">Badge Tagline:</label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className="w-full p-2 rounded bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Title:</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full p-2 rounded bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Description:</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full p-2 rounded bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div>
                    <label className="text-neutral-400 block mb-1">Teams Count:</label>
                    <input
                      type="text"
                      value={form.teamsCount}
                      onChange={(e) => setForm({ ...form, teamsCount: e.target.value })}
                      className="w-full p-2 rounded bg-white/5 border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Participants Count:</label>
                    <input
                      type="text"
                      value={form.participantsCount}
                      onChange={(e) => setForm({ ...form, participantsCount: e.target.value })}
                      className="w-full p-2 rounded bg-white/5 border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Volunteers Count:</label>
                    <input
                      type="text"
                      value={form.volunteersCount}
                      onChange={(e) => setForm({ ...form, volunteersCount: e.target.value })}
                      className="w-full p-2 rounded bg-white/5 border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Rounds Count:</label>
                    <input
                      type="text"
                      value={form.roundsCount}
                      onChange={(e) => setForm({ ...form, roundsCount: e.target.value })}
                      className="w-full p-2 rounded bg-white/5 border border-white/10 text-white"
                    />
                  </div>
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
                <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">
                  {focusData.title}
                </h2>

                <p className="text-lg text-neutral-300 mb-8 max-w-2xl leading-relaxed">
                  {focusData.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-white/10">
                  <div className="space-y-1">
                    <h4 className="text-3xl font-mono font-bold text-emerald-400">{focusData.teamsCount}</h4>
                    <p className="text-xs text-neutral-400 font-mono">Teams Coordinated</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-3xl font-mono font-bold text-cyan-400">{focusData.participantsCount}</h4>
                    <p className="text-xs text-neutral-400 font-mono">Participants Led</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-3xl font-mono font-bold text-indigo-400">{focusData.volunteersCount}</h4>
                    <p className="text-xs text-neutral-400 font-mono">Volunteers Managed</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-3xl font-mono font-bold text-emerald-400">{focusData.roundsCount}</h4>
                    <p className="text-xs text-neutral-400 font-mono">Competitive Rounds</p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}


