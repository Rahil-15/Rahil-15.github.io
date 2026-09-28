"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { usePortfolio, CertificateItem } from "@/lib/portfolio-context";
import { Award, ExternalLink, ChevronLeft, ChevronRight, X, Eye, Edit3, Trash2, Plus } from "lucide-react";

export default function Certifications() {
  const { certificates, deleteCertificate, isAdmin } = usePortfolio();

  // Lightbox State
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedCert = selectedIndex !== null ? certificates[selectedIndex] : null;

  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + certificates.length) % certificates.length);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % certificates.length);
  };

  // Keyboard navigation for Lightbox modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, certificates.length]);

  return (
    <section id="certifications" className="py-24 md:py-32 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4">
            <div>
              <span className="inline-block px-3 py-1 mb-3 text-xs font-mono font-medium text-cyan-400 border border-cyan-500/20 bg-cyan-500/10 rounded-full">
                Verified Credentials
              </span>
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-white tracking-tight">
                Certifications & Badges
              </h2>
            </div>
          </div>

          {certificates.length === 0 ? (
            <div className="p-8 rounded-2xl border border-white/10 bg-slate-900/40 text-center text-neutral-400 font-mono text-sm">
              <Award className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
              No certifications added yet. Log in to Admin Mode to add your credentials.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert, index) => (
                <motion.div
                  key={cert.id || index}
                  variants={fadeInUp}
                  className="group rounded-2xl border border-white/10 bg-slate-900/60 hover:border-cyan-500/40 hover:bg-slate-900/90 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg"
                >
                  <div>
                    {/* Certificate Thumbnail / Banner */}
                    <div
                      onClick={() => setSelectedIndex(index)}
                      className="relative aspect-[16/10] bg-slate-950 cursor-pointer overflow-hidden border-b border-white/10 flex items-center justify-center group-hover:opacity-95 transition-opacity"
                    >
                      {cert.imageUrl ? (
                        <img
                          src={cert.imageUrl}
                          alt={cert.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-center">
                          <Award className="w-12 h-12 text-cyan-400/80 mb-2 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-mono text-cyan-300 font-bold max-w-[80%] truncate">
                            {cert.organization}
                          </span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                        <div className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow-lg">
                          <Eye className="w-4 h-4" /> View Credential
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-mono text-cyan-400 font-semibold px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                          {cert.organization}
                        </span>
                        {cert.date && (
                          <span className="text-[11px] font-mono text-neutral-400">
                            {cert.date}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                        {cert.title}
                      </h3>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 pt-0 flex items-center justify-between border-t border-white/5 mt-2">
                    <button
                      onClick={() => setSelectedIndex(index)}
                      className="text-xs font-mono text-neutral-300 hover:text-cyan-400 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Full View
                    </button>

                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        Verify <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Fullscreen Interactive Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedIndex(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedCert.title}</h3>
                    <p className="text-xs font-mono text-neutral-400">
                      {selectedCert.organization} {selectedCert.date ? `• ${selectedCert.date}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedCert.credentialUrl && (
                    <a
                      href={selectedCert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs hover:bg-cyan-500/20 flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Verify Link
                    </a>
                  )}
                  <button
                    onClick={() => setSelectedIndex(null)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Lightbox Main Image Preview */}
              <div className="relative flex-1 min-h-[300px] max-h-[60vh] bg-slate-950 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center p-2">
                {selectedCert.imageUrl ? (
                  <img
                    src={selectedCert.imageUrl}
                    alt={selectedCert.title}
                    className="w-full h-full object-contain max-h-[58vh] rounded-xl"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                    <Award className="w-20 h-20 text-cyan-400/60 animate-pulse" />
                    <span className="text-lg font-heading font-bold text-white">{selectedCert.title}</span>
                    <span className="text-xs font-mono text-cyan-400">{selectedCert.organization}</span>
                  </div>
                )}

                {/* Left/Right Controls */}
                {certificates.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-3 p-3 rounded-full bg-slate-900/80 border border-white/20 text-white hover:bg-cyan-500 hover:text-slate-950 transition-all shadow-xl"
                      title="Previous Certificate (Left Arrow)"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-3 p-3 rounded-full bg-slate-900/80 border border-white/20 text-white hover:bg-cyan-500 hover:text-slate-950 transition-all shadow-xl"
                      title="Next Certificate (Right Arrow)"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Footer indicator */}
              <div className="pt-4 mt-2 flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>
                  Certificate {selectedIndex + 1} of {certificates.length}
                </span>
                <span className="hidden sm:inline">Use Left/Right arrows or Escape key</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
