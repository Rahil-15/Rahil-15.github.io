"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { GraduationCap, MapPin, Edit2, X, Check } from "lucide-react";
import { usePortfolio } from "@/lib/portfolio-context";
import { useState } from "react";

export default function About() {
  const { aboutData, updateAboutData, isAdmin } = usePortfolio();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(aboutData);

  const handleSave = () => {
    updateAboutData(form);
    setIsEditing(false);
  };

  return (
    <section id="about" className="py-24 md:py-32 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid lg:grid-cols-12 gap-12 items-start"
        >
          <motion.div variants={fadeInUp} className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block px-3 py-1 text-xs font-mono font-medium text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 rounded-full">
                About & Career Objective
              </span>
              {isAdmin && (
                <button
                  onClick={() => {
                    setForm(aboutData);
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
                <h4 className="text-amber-400 font-bold text-sm">Edit About Section</h4>
                <div>
                  <label className="text-neutral-400 block mb-1">Heading:</label>
                  <input
                    type="text"
                    value={form.heading}
                    onChange={(e) => setForm({ ...form, heading: e.target.value })}
                    className="w-full p-2 rounded bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Paragraph 1:</label>
                  <textarea
                    rows={2}
                    value={form.paragraph1}
                    onChange={(e) => setForm({ ...form, paragraph1: e.target.value })}
                    className="w-full p-2 rounded bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Paragraph 2:</label>
                  <textarea
                    rows={3}
                    value={form.paragraph2}
                    onChange={(e) => setForm({ ...form, paragraph2: e.target.value })}
                    className="w-full p-2 rounded bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Paragraph 3:</label>
                  <textarea
                    rows={2}
                    value={form.paragraph3}
                    onChange={(e) => setForm({ ...form, paragraph3: e.target.value })}
                    className="w-full p-2 rounded bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-neutral-400 block mb-1">Location:</label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="w-full p-2 rounded bg-white/5 border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Grad Date:</label>
                    <input
                      type="text"
                      value={form.gradDate}
                      onChange={(e) => setForm({ ...form, gradDate: e.target.value })}
                      className="w-full p-2 rounded bg-white/5 border border-white/10 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div>
                    <label className="text-neutral-400 block mb-1">CGPA:</label>
                    <input
                      type="text"
                      value={form.cgpa}
                      onChange={(e) => setForm({ ...form, cgpa: e.target.value })}
                      className="w-full p-2 rounded bg-white/5 border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Projects Count:</label>
                    <input
                      type="text"
                      value={form.projectsCount}
                      onChange={(e) => setForm({ ...form, projectsCount: e.target.value })}
                      className="w-full p-2 rounded bg-white/5 border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Internship Count:</label>
                    <input
                      type="text"
                      value={form.internshipCount}
                      onChange={(e) => setForm({ ...form, internshipCount: e.target.value })}
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
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6 leading-tight">
                  {aboutData.heading}
                </h2>
                <div className="space-y-4 text-neutral-300 leading-relaxed text-base">
                  <p>{aboutData.paragraph1}</p>
                  <p>{aboutData.paragraph2}</p>
                  <p>{aboutData.paragraph3}</p>
                </div>

                <div className="mt-8 flex flex-wrap gap-4 text-sm text-neutral-400 font-mono">
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <MapPin className="w-4 h-4 text-emerald-400" /> {aboutData.location}
                  </span>
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <GraduationCap className="w-4 h-4 text-cyan-400" /> VTU Grad: {aboutData.gradDate}
                  </span>
                </div>
              </>
            )}
          </motion.div>

          <motion.div variants={fadeInUp} className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-emerald-500/40 hover:bg-white/[0.04] transition-all duration-300">
              <h3 className="text-4xl font-mono font-bold text-emerald-400 mb-2">{aboutData.cgpa}</h3>
              <p className="text-xs text-neutral-400 uppercase tracking-wider font-mono">B.E. CGPA (VTU)</p>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-cyan-500/40 hover:bg-white/[0.04] transition-all duration-300">
              <h3 className="text-4xl font-mono font-bold text-cyan-400 mb-2">{aboutData.projectsCount}</h3>
              <p className="text-xs text-neutral-400 uppercase tracking-wider font-mono">Major Data & AI Projects</p>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all duration-300">
              <h3 className="text-4xl font-mono font-bold text-indigo-400 mb-2">{aboutData.internshipCount}</h3>
              <p className="text-xs text-neutral-400 uppercase tracking-wider font-mono">Data Analysis Internship</p>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-emerald-500/40 hover:bg-white/[0.04] transition-all duration-300">
              <h3 className="text-4xl font-mono font-bold text-emerald-400 mb-2">{aboutData.participantsCount}</h3>
              <p className="text-xs text-neutral-400 uppercase tracking-wider font-mono">Event Participants Led</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}


