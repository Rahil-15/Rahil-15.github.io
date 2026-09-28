"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { usePortfolio } from "@/lib/portfolio-context";
import { Menu, X, FileText, Download, ExternalLink, ShieldCheck } from "lucide-react";

const navItems = [
  { name: "About", href: "#about" },
  { name: "Academics", href: "#academics" },
  { name: "Projects", href: "#projects" },
  { name: "Skills", href: "#skills" },
  { name: "Experience", href: "#experience" },
  { name: "Certifications", href: "#certifications" },
  { name: "Achievements", href: "#achievements" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const { resumeData, isAdmin } = usePortfolio();
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled
          ? "bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/10 py-3.5 shadow-lg shadow-black/30"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo - MN. */}
        <a href="#" className="font-heading font-extrabold text-xl tracking-tight text-white flex items-center gap-1 group">
          MN<span className="text-emerald-400 group-hover:text-cyan-400 transition-colors">.</span>
          <span className="hidden sm:inline text-xs font-mono font-normal text-neutral-400 ml-2 border-l border-white/15 pl-2">
            Data Science & AI
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-5">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setActive(item.name)}
              className={cn(
                "text-xs font-mono transition-colors cursor-pointer tracking-wide",
                active === item.name ? "text-emerald-400 font-semibold" : "text-neutral-300 hover:text-emerald-400"
              )}
            >
              {item.name}
            </a>
          ))}

          {/* Quick Resume Link */}
          {resumeData?.url && (
            <a
              href={resumeData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 border border-white/15 hover:border-emerald-500/40 text-neutral-200 hover:text-emerald-400 transition-all flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" /> Resume
            </a>
          )}

          <a
            href="mailto:rahiljc15@gmail.com"
            className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all font-semibold"
          >
            Hire Me
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-neutral-300 hover:text-white bg-white/5 border border-white/10"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900/95 border-b border-white/10 backdrop-blur-2xl px-6 py-6 space-y-3 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => {
                  setActive(item.name);
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 rounded-xl text-xs font-mono bg-white/5 text-neutral-200 hover:text-emerald-400 hover:bg-white/10 flex items-center justify-between"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {resumeData?.url && (
              <a
                href={resumeData.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-white/10 border border-white/15 text-white font-mono text-xs flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-emerald-400" /> View Resume (PDF)
              </a>
            )}
            <a
              href="mailto:rahiljc15@gmail.com"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-2"
            >
              Contact Mohammadrahil
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
