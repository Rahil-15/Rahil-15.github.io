export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  location?: string;
  description: string;
  highlights: string[];
  tech: string[];
}

export const experience: ExperienceItem[] = [
  {
    role: "Data Analysis Intern",
    company: "Cognifyz Technologies",
    period: "Sept 2025 – Nov 2025",
    location: "Remote / Hybrid",
    description: "Conducted end-to-end Exploratory Data Analysis (EDA) and city-wise performance benchmarking on extensive restaurant datasets.",
    highlights: [
      "Uncovered data-driven trends in cuisine distribution, customer ratings, pricing metrics, and online delivery patterns.",
      "Cleaned, transformed, and engineered structured datasets using Python, Pandas, and NumPy.",
      "Generated analytical reports and key visualizations to empower business decision-makers with actionable insights."
    ],
    tech: ["Python", "Pandas", "NumPy", "Matplotlib", "Jupyter Notebook", "EDA"]
  }
];

