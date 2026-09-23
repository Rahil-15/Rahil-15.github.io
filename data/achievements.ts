export interface AchievementItem {
  title: string;
  category: "Leadership" | "Certification" | "Community" | "Academic";
  detail: string;
}

export const achievements: AchievementItem[] = [
  {
    title: "Event Coordinator – Savishkar 2025",
    category: "Leadership",
    detail: "Directed the flagship 'Seconds Ka Tashan' event, managing 50+ teams, 100+ participants, and 15–20 volunteers across 4 competitive elimination rounds."
  },
  {
    title: "ASCAI Student Member",
    category: "Community",
    detail: "Active organizer for the Association of Students of Computer Science & AIML, facilitating hackathons and departmental technical events."
  },
  {
    title: "AI Assisted Coding for Beginners Certification",
    category: "Certification",
    detail: "Issued by AZ Career Link (Participation Certification), validating AI-powered software engineering and code synthesis capabilities."
  },
  {
    title: "Multilingual Communication Skills",
    category: "Academic",
    detail: "Fluent in English, Hindi, Kannada (Read, Write, Speak), Urdu (Speak), and Marathi (Read) for effective global & cross-functional collaboration."
  }
];

