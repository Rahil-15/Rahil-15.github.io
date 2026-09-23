"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Project } from "@/data/projects";
import { Brain, BarChart3, ShieldCheck, Eye, Activity, CheckCircle2, Plus, Edit3, Trash2, X, Check } from "lucide-react";
import { GithubIcon } from "@/components/SocialIcons";
import { usePortfolio } from "@/lib/portfolio-context";
import { useState } from "react";

export default function Projects() {
  const { projects, addProject, updateProject, deleteProject, isAdmin } = usePortfolio();

  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const emptyProject: Project = {
    title: "",
    subtitle: "",
    description: "",
    highlights: [""],
    tech: [],
    category: "AI & GenAI",
    link: "https://github.com/Rahil-15",
    github: "https://github.com/Rahil-15",
  };

  const [form, setForm] = useState<Project>(emptyProject);
  const [techInput, setTechInput] = useState("");
  const [highlightInput, setHighlightInput] = useState("");

  const handleOpenAdd = () => {
    setForm(emptyProject);
    setTechInput("");
    setHighlightInput("");
    setModalMode("add");
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setForm({ ...projects[index] });
    setTechInput(projects[index].tech.join(", "));
    setHighlightInput(projects[index].highlights.join("\n"));
    setModalMode("edit");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const techArray = techInput.split(",").map((t) => t.trim()).filter(Boolean);
    const highlightArray = highlightInput.split("\n").map((h) => h.trim()).filter(Boolean);

    const updatedProj: Project = {
      ...form,
      tech: techArray,
      highlights: highlightArray.length > 0 ? highlightArray : [form.description],
    };

    if (modalMode === "add") {
      addProject(updatedProj);
    } else if (modalMode === "edit" && editingIndex !== null) {
      updateProject(editingIndex, updatedProj);
    }

    setModalMode(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "AI & GenAI": return <Brain className="w-4 h-4 text-cyan-400" />;
      case "Data Analytics": return <BarChart3 className="w-4 h-4 text-emerald-400" />;
      case "Computer Vision": return <Eye className="w-4 h-4 text-indigo-400" />;
      case "ML & Data Systems": return <Activity className="w-4 h-4 text-emerald-400" />;
      default: return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <section id="projects" className="py-24 md:py-32 border-t border-white/5 relative">
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
                Featured Work
              </span>
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-white tracking-tight">
                Projects
              </h2>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold font-mono text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" /> Add New Project
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.title + index}
                variants={fadeInUp}
                className="group flex flex-col justify-between p-7 rounded-2xl border border-white/10 bg-slate-900/60 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all duration-300 shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                      {getCategoryIcon(project.category)}
                      {project.category}
                    </span>

                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(index)}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                            title="Edit Project"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete project "${project.title}"?`)) {
                                deleteProject(index);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neutral-400 hover:text-emerald-400 transition-colors ml-1"
                          title="View GitHub Repository"
                        >
                          <GithubIcon className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors mb-1">
                    {project.title}
                  </h3>

                  {project.subtitle && (
                    <p className="text-xs font-mono text-emerald-400/90 mb-4">
                      {project.subtitle}
                    </p>
                  )}

                  <p className="text-neutral-300 text-sm mb-6 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Highlights Bullet Points */}
                  <div className="space-y-2 mb-6">
                    {project.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-neutral-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2 mt-auto">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 text-[11px] font-mono rounded-md bg-white/5 text-emerald-300/90 border border-emerald-500/20"
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

      {/* Add / Edit Project Modal */}
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
              {modalMode === "add" ? "Add New Project" : "Edit Project"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-neutral-300 block mb-1">Project Title:</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Sales Forecast AI"
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Subtitle / Short Tagline:</label>
                <input
                  type="text"
                  value={form.subtitle || ""}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="e.g. Predictive Sales Model"
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Category Domain:</label>
                <select
                  value={form.category}
                  onChange={(e: any) => setForm({ ...form, category: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-white/15 text-white"
                >
                  <option value="AI & GenAI">AI & GenAI</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="Computer Vision">Computer Vision</option>
                  <option value="ML & Data Systems">ML & Data Systems</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Full Description:</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed overview of the project..."
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Key Highlights (1 per line):</label>
                <textarea
                  rows={3}
                  value={highlightInput}
                  onChange={(e) => setHighlightInput(e.target.value)}
                  placeholder="Built custom pipeline...&#10;Integrated REST API..."
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Technologies Used (comma separated):</label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="Python, Pandas, Power BI, SQL"
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">GitHub Repo URL:</label>
                <input
                  type="text"
                  value={form.github || ""}
                  onChange={(e) => setForm({ ...form, github: e.target.value })}
                  placeholder="https://github.com/Rahil-15"
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2.5 text-xs font-mono rounded-xl border border-white/10 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-mono font-bold rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                >
                  {modalMode === "add" ? "Add Project" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}



