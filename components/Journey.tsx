"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { usePortfolio } from "@/lib/portfolio-context";
import { JourneyItem } from "@/data/journey";
import { Plus, Edit3, Trash2, X } from "lucide-react";
import { useState } from "react";

export default function Journey() {
  const { journey, addJourney, updateJourney, deleteJourney, isAdmin } = usePortfolio();

  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const emptyJourney: JourneyItem = {
    year: "",
    title: "",
    institution: "",
    description: "",
    badge: "",
  };

  const [form, setForm] = useState<JourneyItem>(emptyJourney);

  const handleOpenAdd = () => {
    setForm(emptyJourney);
    setModalMode("add");
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setForm({ ...journey[index] });
    setModalMode("edit");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "add") {
      addJourney(form);
    } else if (modalMode === "edit" && editingIndex !== null) {
      updateJourney(editingIndex, form);
    }
    setModalMode(null);
  };

  return (
    <section id="academics" className="py-24 md:py-32 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4">
            <div>
              <span className="inline-block px-3 py-1 mb-3 text-xs font-mono font-medium text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 rounded-full">
                Academics & Qualifications
              </span>
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-white tracking-tight">
                Academics & Education Details
              </h2>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold font-mono text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" /> Add Academic Entry
              </button>
            )}
          </div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:left-8 md:before:left-32 before:w-0.5 before:bg-white/10">
            {journey.map((item, index) => (
              <motion.div key={item.title + index} variants={fadeInUp} className="flex flex-col md:flex-row gap-6 items-start group">
                <div className="md:w-32 flex-shrink-0 pt-1 font-mono text-xs text-emerald-400 font-bold">
                  {item.year}
                </div>

                <div className="hidden md:flex flex-shrink-0 pt-1 z-10">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-slate-900 group-hover:scale-125 transition-transform" />
                </div>

                <div className="flex-1 p-6 rounded-2xl border border-white/10 bg-slate-900/60 hover:border-emerald-500/30 hover:bg-slate-900/90 transition-all duration-300">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {item.badge}
                        </span>
                      )}
                      {isAdmin && (
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => handleOpenEdit(index)}
                            className="p-1 rounded-lg bg-white/5 text-amber-400 hover:bg-amber-500/20 transition-colors"
                            title="Edit Milestone"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete milestone "${item.title}"?`)) {
                                deleteJourney(index);
                              }
                            }}
                            className="p-1 rounded-lg bg-white/5 text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title="Delete Milestone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <h4 className="text-sm font-mono text-cyan-400 mb-3">{item.institution}</h4>
                  <p className="text-neutral-300 text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Add / Edit Journey Milestone Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl border border-emerald-500/30 bg-slate-900 shadow-2xl relative">
            <button
              onClick={() => setModalMode(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-4">
              {modalMode === "add" ? "Add Milestone" : "Edit Milestone"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 block mb-1">Year / Period:</label>
                  <input
                    type="text"
                    required
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    placeholder="2023 – 2027"
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white"
                  />
                </div>
                <div>
                  <label className="text-neutral-300 block mb-1">Badge Tagline:</label>
                  <input
                    type="text"
                    value={form.badge || ""}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="CGPA: 7.8/10"
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Title:</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="B.E. in CSE (AI & ML)"
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Institution / Org:</label>
                <input
                  type="text"
                  required
                  value={form.institution}
                  onChange={(e) => setForm({ ...form, institution: e.target.value })}
                  placeholder="Jain College of Engineering & Research, VTU"
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Description:</label>
                <textarea
                  rows={4}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Deep academic focus in Data Science..."
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                >
                  {modalMode === "add" ? "Add Milestone" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}


