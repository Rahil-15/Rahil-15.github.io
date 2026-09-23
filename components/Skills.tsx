"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { usePortfolio } from "@/lib/portfolio-context";
import { SkillCategory } from "@/data/skills";
import { Brain, BarChart3, Database, Cpu, Code2, Wrench, Plus, Edit3, Trash2, X, Check } from "lucide-react";
import { useState } from "react";

export default function Skills() {
  const { skills, addSkillCategory, updateSkillCategory, deleteSkillCategory, isAdmin } = usePortfolio();

  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const emptyCategory: SkillCategory = {
    category: "",
    iconName: "brain",
    items: [],
  };

  const [form, setForm] = useState<SkillCategory>(emptyCategory);
  const [itemsInput, setItemsInput] = useState("");

  const handleOpenAdd = () => {
    setForm(emptyCategory);
    setItemsInput("");
    setModalMode("add");
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setForm({ ...skills[index] });
    setItemsInput(skills[index].items.join(", "));
    setModalMode("edit");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemsArray = itemsInput.split(",").map((i) => i.trim()).filter(Boolean);
    const updatedCategory: SkillCategory = {
      ...form,
      items: itemsArray,
    };

    if (modalMode === "add") {
      addSkillCategory(updatedCategory);
    } else if (modalMode === "edit" && editingIndex !== null) {
      updateSkillCategory(editingIndex, updatedCategory);
    }

    setModalMode(null);
  };

  const getIcon = (name: string) => {
    switch (name) {
      case "brain": return <Brain className="w-5 h-5 text-cyan-400" />;
      case "chart": return <BarChart3 className="w-5 h-5 text-emerald-400" />;
      case "database": return <Database className="w-5 h-5 text-indigo-400" />;
      case "cpu": return <Cpu className="w-5 h-5 text-emerald-400" />;
      case "code": return <Code2 className="w-5 h-5 text-cyan-400" />;
      case "wrench": return <Wrench className="w-5 h-5 text-indigo-400" />;
      default: return <Brain className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <section id="skills" className="py-24 md:py-32 border-t border-white/5 relative">
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
                Skills & Stack
              </span>
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-white tracking-tight">
                Technical Arsenal
              </h2>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold font-mono text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" /> Add Skill Domain
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skillGroup, index) => (
              <motion.div
                key={skillGroup.category + index}
                variants={fadeInUp}
                className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                        {getIcon(skillGroup.iconName)}
                      </div>
                      <h3 className="text-base font-bold text-white">{skillGroup.category}</h3>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(index)}
                          className="p-1 rounded-lg bg-white/5 text-amber-400 hover:bg-amber-500/20 transition-colors"
                          title="Edit Category"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete category "${skillGroup.category}"?`)) {
                              deleteSkillCategory(index);
                            }
                          }}
                          className="p-1 rounded-lg bg-white/5 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {skillGroup.items.map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg border border-white/10 bg-white/[0.03] text-neutral-200 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Add / Edit Skill Category Modal */}
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
              {modalMode === "add" ? "Add Skill Category" : "Edit Skill Category"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-neutral-300 block mb-1">Category Name:</label>
                <input
                  type="text"
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Cloud & Infrastructure"
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Icon Style:</label>
                <select
                  value={form.iconName}
                  onChange={(e: any) => setForm({ ...form, iconName: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-white/15 text-white"
                >
                  <option value="brain">Brain (AI & ML)</option>
                  <option value="chart">Chart (Data Science)</option>
                  <option value="database">Database (BI & SQL)</option>
                  <option value="cpu">CPU (Frameworks)</option>
                  <option value="code">Code (Programming)</option>
                  <option value="wrench">Wrench (Tools)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Skills List (comma separated):</label>
                <textarea
                  rows={4}
                  required
                  value={itemsInput}
                  onChange={(e) => setItemsInput(e.target.value)}
                  placeholder="Python, SQL, Pandas, NumPy, Power BI"
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
                  {modalMode === "add" ? "Add Category" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}


