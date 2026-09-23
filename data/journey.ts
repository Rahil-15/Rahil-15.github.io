export interface JourneyItem {
  year: string;
  title: string;
  institution: string;
  description: string;
  badge?: string;
}

export const journey: JourneyItem[] = [
  {
    year: "2023 – 2027",
    title: "Bachelor of Engineering (B.E.) in CSE (AI & ML)",
    institution: "Jain College of Engineering and Research, VTU",
    description: "Deep academic specialization in Data Science, Machine Learning algorithms, Computer Vision, Neural Networks, and Software Engineering. Current CGPA: 7.8 / 10 (Expected Graduation: May 2027).",
    badge: "CGPA: 7.8/10"
  },
  {
    year: "Sept 2025",
    title: "Data Analysis Internship",
    institution: "Cognifyz Technologies",
    description: "Performed exploratory analytics, market pricing trends analysis, and city-wise performance benchmarking using Python data stack.",
    badge: "Internship"
  },
  {
    year: "2025",
    title: "Event Coordinator – Savishkar 2025",
    institution: "Seconds Ka Tashan Flagship Event",
    description: "Led event operations coordinating 50+ competing teams, 100+ active participants, and 15–20 volunteers over 4 competitive rounds.",
    badge: "Leadership"
  },
  {
    year: "2025 – 2026",
    title: "AgroSentinel AI & MediBot Major Projects",
    institution: "Team Lead & Lead Developer",
    description: "Spearheaded team development of AgroSentinel AI (Multi-Agent Federated ML for Crop Disease Surveillance) and MediBot (RAG-based AI Medical Assistant).",
    badge: "AI Innovation"
  }
];

