import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Focus from "@/components/Focus";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import Journey from "@/components/Journey";
import Achievements from "@/components/Achievements";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Hero />
      <About />
      <Projects />
      <Focus />
      <Experience />
      <Skills />
      <Journey />
      <Achievements />
      <Contact />
    </main>
  );
}
