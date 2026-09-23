"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "About", href: "#about" },
  { name: "Academics", href: "#academics" },
  { name: "Projects", href: "#projects" },
  { name: "Skills", href: "#skills" },
  { name: "Experience", href: "#experience" },
  { name: "Achievements", href: "#achievements" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);

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
          ? "bg-[#0B0F19]/85 backdrop-blur-xl border-b border-white/10 py-3.5 shadow-lg shadow-black/20"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <a href="#" className="font-heading font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
          MN<span className="text-emerald-400">.</span>
          <span className="hidden sm:inline text-xs font-mono font-normal text-neutral-400 ml-2 border-l border-white/15 pl-2">
            Data Science & AI
          </span>
        </a>
        <div className="hidden md:flex items-center gap-5">
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
          <a
            href="mailto:rahiljc15@gmail.com"
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
          >
            Hire Me
          </a>
        </div>
      </div>
    </nav>
  );
}

