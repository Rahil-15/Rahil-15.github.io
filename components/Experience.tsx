"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { usePortfolio } from "@/lib/portfolio-context";
import { ExperienceItem } from "@/data/experience";
import { Briefcase, Calendar, CheckCircle2, MapPin, Plus, Edit3, Trash2, X, Check } from "lucide-react";
import { useState } from "react";

export default function Experience() {
  const { experience, addExperience, updateExperience, deleteExperience, isAdmin } = usePortfolio();

  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const emptyExp: ExperienceItem = {
    role: "",
    company: "",
    period: "",
    location: "",
    description: "",
    highlights: [],
    tech: [],
  };

  const [form, setForm] = useState<ExperienceItem>(emptyExp);
  const [highlightsInput, setHighlightsInput] = useState("");
  const [techInput, setTechInput] = useState("");

  const handleOpenAdd = () => {
    setForm(emptyExp);
    setHighlightsInput("");
    setTechInput("");
    setModalMode("add");
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setForm({ ...experience[index] });
    setHighlightsInput(experience[index].highlights.join("\n"));
    setTechInput(experience[index].tech.join(", "));
    setModalMode("edit");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const highlightsArr = highlightsInput.split("\n").map((h) => h.trim()).filter(Boolean);
    const techArr = techInput.split(",").map((t) => t.trim()).filter(Boolean);

    const updatedExp: ExperienceItem = {
      ...form,
      highlights: highlightsArr,
      tech: techArr,
    };

    if (modalMode === "add") {
      addExperience(updatedExp);
    } else if (modalMode === "edit" && editingIndex !== null) {
      updateExperience(editingIndex, updatedExp);
    }

    setModalMode(null);
  };

  return (
    <section id="experience" className="py-24 md:py-32 border-t border-white/5 relative">
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
                Industry Experience
              </span>
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-white tracking-tight">
                Internship & Professional Work
              </h2>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold font-mono text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" /> Add Experience
              </button>
            )}
          </div>

          <div className="space-y-8">
            {experience.map((exp, index) => (
              <motion.div
                key={exp.company + index}
                variants={fadeInUp}
                className="p-8 rounded-3xl border border-white/10 bg-slate-900/70 hover:border-emerald-500/40 transition-all duration-300 shadow-xl relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Briefcase className="w-5 h-5" />
                      </span>
                      <h3 className="text-2xl font-bold text-white">{exp.role}</h3>
                    </div>
                    <p className="text-lg text-emerald-400 font-semibold font-mono">
                      {exp.company}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-400">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      {exp.period}
                    </span>
                    {exp.location && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        {exp.location}
                      </span>
                    )}

                    {isAdmin && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleOpenEdit(index)}
                          className="p-1.5 rounded-lg bg-white/5 text-amber-400 hover:bg-amber-500/20 transition-colors"
                          title="Edit Experience"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete experience at "${exp.company}"?`)) {
                              deleteExperience(index);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-white/5 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Delete Experience"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-neutral-300 text-base mb-6 leading-relaxed">
                  {exp.description}
                </p>

                <div className="space-y-2 mb-6">
                  {exp.highlights.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                  {exp.tech.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 text-xs font-mono rounded-md bg-white/5 text-emerald-300 border border-emerald-500/20"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Add / Edit Experience Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-6 rounded-3xl border border-emerald-500/30 bg-slate-900 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalMode(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-4">
              {modalMode === "add" ? "Add Experience" : "Edit Experience"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-neutral-300 block mb-1">Job Role Title:</label>
                <input
                  type="text"
                  required
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. Data Analysis Intern"
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Company / Organization:</label>
                <input
                  type="text"
                  required
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g. Cognifyz Technologies"
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 block mb-1">Time Period:</label>
                  <input
                    type="text"
                    required
                    value={form.period}
                    onChange={(e) => setForm({ ...form, period: e.target.value })}
                    placeholder="Sept 2025 – Nov 2025"
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white"
                  />
                </div>
                <div>
                  <label className="text-neutral-300 block mb-1">Location:</label>
                  <input
                    type="text"
                    value={form.location || ""}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Remote / Belagavi"
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Summary Description:</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief overview of responsibilities..."
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Bullet Highlights (1 per line):</label>
                <textarea
                  rows={3}
                  value={highlightsInput}
                  onChange={(e) => setHighlightsInput(e.target.value)}
                  placeholder="Cleaned dataset using Pandas...&#10;Generated analytical reports..."
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Technologies Used (comma separated):</label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="Python, Pandas, NumPy, SQL"
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
                  {modalMode === "add" ? "Add Experience" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}


