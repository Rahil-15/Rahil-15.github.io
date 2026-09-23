export interface Project {
  title: string;
  subtitle?: string;
  description: string;
  highlights: string[];
  tech: string[];
  category: "AI & GenAI" | "Data Analytics" | "Computer Vision" | "ML & Data Systems";
  link: string;
  github?: string;
}

export const projects: Project[] = [
  {
    title: "AgroSentinel AI",
    subtitle: "Multi-Agent Federated Learning System for Crop Disease Surveillance",
    description: "Led a 4-member team to build a privacy-preserving federated learning system for predictive crop disease detection across distributed nodes.",
    highlights: [
      "Designed & deployed FedAvg pipeline with Flower framework preventing centralized raw image exposure",
      "Integrated TensorFlow/Keras CNN models with FastAPI backend & real-time Streamlit dashboard",
      "Managed GitHub workstreams, code reviews, and feature branch releases"
    ],
    tech: ["Python", "TensorFlow", "Keras", "FastAPI", "Streamlit", "Flower (flwr)"],
    category: "AI & GenAI",
    link: "https://github.com/Rahil-15",
    github: "https://github.com/Rahil-15"
  },
  {
    title: "MediBot",
    subtitle: "AI Medical Assistant using Retrieval-Augmented Generation (RAG)",
    description: "Led the 6th-semester mini project team in building an intelligent medical assistant capable of querying medical corpora with high accuracy.",
    highlights: [
      "Built FastAPI backend APIs for vector document retrieval & context-aware generation",
      "Applied advanced prompt engineering & semantic search to eliminate model hallucinations",
      "Optimized response generation speeds and response precision"
    ],
    tech: ["Python", "FastAPI", "RAG", "REST APIs", "Prompt Engineering"],
    category: "AI & GenAI",
    link: "https://github.com/Rahil-15",
    github: "https://github.com/Rahil-15"
  },
  {
    title: "Amazon Sales Analysis",
    subtitle: "Exploratory Data Analysis & Business Intelligence Dashboard",
    description: "Executed comprehensive EDA on vast Amazon sales datasets to uncover regional revenue trends, KPI highlights, and consumer purchasing behavior.",
    highlights: [
      "Cleaned & modeled multidimensional sales records using Pandas & SQL query pipelines",
      "Designed interactive Power BI dashboards visualizing KPIs, category performance & regional trends",
      "Provided actionable analytical reports to drive data-informed business strategies"
    ],
    tech: ["Python", "SQL", "Pandas", "NumPy", "Matplotlib", "Power BI"],
    category: "Data Analytics",
    link: "https://github.com/Rahil-15",
    github: "https://github.com/Rahil-15"
  },
  {
    title: "AQI Alert System & Dashboard",
    subtitle: "Machine Learning Air Quality Prediction & Pollution Alerts",
    description: "Developed a predictive ML model analyzing ambient air quality index data with an interactive real-time dashboard and automated pollution risk alerts.",
    highlights: [
      "Engineered environmental feature vectors and trained predictive regression models",
      "Created dynamic visual dashboards displaying real-time AQI tracking and automated alerts"
    ],
    tech: ["Python", "Scikit-Learn", "Pandas", "Streamlit", "Matplotlib"],
    category: "ML & Data Systems",
    link: "https://github.com/Rahil-15",
    github: "https://github.com/Rahil-15"
  },
  {
    title: "Face Mask Detection System",
    subtitle: "Real-Time Computer Vision Model using CNNs",
    description: "Constructed a deep learning convolutional neural network (CNN) model for instant face mask classification from video streams.",
    highlights: [
      "Trained custom CNN architecture on binary mask image datasets using TensorFlow & Keras",
      "Integrated OpenCV pipeline for live camera stream frame processing and bounding box detection"
    ],
    tech: ["Python", "TensorFlow", "Keras", "OpenCV", "Deep Learning"],
    category: "Computer Vision",
    link: "https://github.com/Rahil-15",
    github: "https://github.com/Rahil-15"
  }
];

