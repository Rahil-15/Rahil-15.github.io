export interface SkillCategory {
  category: string;
  iconName: "brain" | "chart" | "database" | "cpu" | "code" | "wrench";
  items: string[];
}

export const skills: SkillCategory[] = [
  {
    category: "Data Science & Analytics",
    iconName: "chart",
    items: [
      "Exploratory Data Analysis (EDA)",
      "Data Cleaning & Preprocessing",
      "Data Visualization",
      "Statistical Analysis",
      "Machine Learning",
      "Feature Engineering",
      "Feature Scaling",
      "Model Evaluation"
    ]
  },
  {
    category: "AI & Generative AI",
    iconName: "brain",
    items: [
      "Retrieval-Augmented Generation (RAG)",
      "Federated Learning",
      "Flower (flwr)",
      "FastAPI",
      "REST APIs",
      "Prompt Engineering"
    ]
  },
  {
    category: "Libraries & ML Frameworks",
    iconName: "cpu",
    items: [
      "Pandas",
      "NumPy",
      "Scikit-learn",
      "Matplotlib",
      "TensorFlow",
      "Keras",
      "OpenCV"
    ]
  },
  {
    category: "Visualization & BI",
    iconName: "database",
    items: [
      "Power BI",
      "Streamlit",
      "Interactive Dashboards",
      "KPI Reporting"
    ]
  },
  {
    category: "Programming Languages",
    iconName: "code",
    items: [
      "Python",
      "SQL",
      "Java",
      "HTML5",
      "CSS3",
      "JavaScript"
    ]
  },
  {
    category: "Developer Tools & Platforms",
    iconName: "wrench",
    items: [
      "Git",
      "GitHub",
      "Jupyter Notebook",
      "VS Code",
      "PyCharm"
    ]
  }
];

