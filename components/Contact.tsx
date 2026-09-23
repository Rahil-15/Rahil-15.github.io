"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/SocialIcons";
import { usePortfolio } from "@/lib/portfolio-context";

export default function Contact() {
  const { heroData } = usePortfolio();
  return (
    <section id="contact" className="py-24 md:py-32 border-t border-white/5 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.span variants={fadeInUp} className="inline-block px-3 py-1 mb-4 text-xs font-mono font-medium text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 rounded-full">
            Get In Touch
          </motion.span>

          <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
            Let's build intelligent <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">data solutions.</span>
          </motion.h2>

          <motion.p variants={fadeInUp} className="text-base md:text-lg text-neutral-300 mb-12 max-w-2xl mx-auto text-balance">
            Currently seeking entry-level Data Science & Analytics opportunities. Feel free to reach out for project inquiries, technical collaboration, or data engineering discussions.
          </motion.p>

          <motion.div variants={fadeInUp} className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-12">
            <a
              href={`mailto:${heroData.email}`}
              className="p-5 rounded-2xl border border-white/10 bg-slate-900/60 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all flex flex-col items-center group"
            >
              <Mail className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-mono text-neutral-400 mb-1">Email</span>
              <span className="text-xs font-medium text-white truncate max-w-full">{heroData.email}</span>
            </a>

            <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/60 flex flex-col items-center">
              <MapPin className="w-6 h-6 text-indigo-400 mb-2" />
              <span className="text-xs font-mono text-neutral-400 mb-1">Location</span>
              <span className="text-xs font-medium text-white text-center">{heroData.location}</span>
            </div>
          </motion.div>

          {/* Social Badges */}
          <motion.div variants={fadeInUp} className="flex justify-center gap-4 mb-20">
            {heroData.linkedin && (
              <a
                href={heroData.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors"
              >
                <LinkedinIcon className="w-4 h-4 text-cyan-400" /> LinkedIn <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500" />
              </a>
            )}
            {heroData.github && (
              <a
                href={heroData.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors"
              >
                <GithubIcon className="w-4 h-4 text-emerald-400" /> GitHub <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500" />
              </a>
            )}
          </motion.div>

          <motion.div variants={fadeInUp} className="pt-8 border-t border-white/5 text-xs text-neutral-500 font-mono flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>© {new Date().getFullYear()} {heroData.name}. All rights reserved.</span>
            <span>Built with Next.js, Tailwind CSS & Framer Motion</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

