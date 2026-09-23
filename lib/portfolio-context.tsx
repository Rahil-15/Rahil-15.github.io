"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { projects as defaultProjects, Project } from "@/data/projects";
import { skills as defaultSkills, SkillCategory } from "@/data/skills";
import { experience as defaultExperience, ExperienceItem } from "@/data/experience";
import { journey as defaultJourney, JourneyItem } from "@/data/journey";
import { achievements as defaultAchievements, AchievementItem } from "@/data/achievements";
import { savePortfolioData, loadPortfolioData } from "@/lib/storage";
import {
  fetchCloudPortfolioData,
  saveCloudPortfolioData,
  saveCloudConfig,
  getCloudConfig,
  CloudConfig,
} from "@/lib/cloud-storage";

export interface HeroData {
  name: string;
  role: string;
  tagline: string;
  institution: string;
  cgpa: string;
  expectedGrad: string;
  email: string;
  github: string;
  linkedin: string;
  location: string;
  photoUrl?: string;
  badge1Text?: string;
  badge2Text?: string;
}

export interface AboutData {
  heading: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  cgpa: string;
  projectsCount: string;
  internshipCount: string;
  participantsCount: string;
  location: string;
  gradDate: string;
}

export interface FocusData {
  badge: string;
  title: string;
  description: string;
  teamsCount: string;
  participantsCount: string;
  volunteersCount: string;
  roundsCount: string;
}

import portfolioDefaultJson from "@/data/portfolio-default.json";

const defaultHeroData: HeroData = portfolioDefaultJson.heroData as HeroData;
const defaultAboutData: AboutData = portfolioDefaultJson.aboutData as AboutData;
const defaultFocusData: FocusData = portfolioDefaultJson.focusData as FocusData;
const defaultProjectsList = portfolioDefaultJson.projectsList as Project[];
const defaultSkillsList = portfolioDefaultJson.skillsList as SkillCategory[];
const defaultExperienceList = portfolioDefaultJson.experienceList as ExperienceItem[];
const defaultJourneyList = portfolioDefaultJson.journeyList as JourneyItem[];
const defaultAchievementsList = portfolioDefaultJson.achievementsList as AchievementItem[];
const defaultLanguagesList = portfolioDefaultJson.languagesList as string[];

interface PortfolioContextType {
  isAdmin: boolean;
  hasCustomPassword: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  loginAdmin: (password: string) => boolean;
  setAdminPassword: (newPassword: string) => void;
  logoutAdmin: () => void;
  
  heroData: HeroData;
  updateHeroData: (data: Partial<HeroData>) => void;
  
  aboutData: AboutData;
  updateAboutData: (data: Partial<AboutData>) => void;

  focusData: FocusData;
  updateFocusData: (data: Partial<FocusData>) => void;

  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (index: number, project: Project) => void;
  deleteProject: (index: number) => void;

  skills: SkillCategory[];
  addSkillCategory: (cat: SkillCategory) => void;
  updateSkillCategory: (index: number, cat: SkillCategory) => void;
  deleteSkillCategory: (index: number) => void;

  experience: ExperienceItem[];
  addExperience: (exp: ExperienceItem) => void;
  updateExperience: (index: number, exp: ExperienceItem) => void;
  deleteExperience: (index: number) => void;

  journey: JourneyItem[];
  addJourney: (j: JourneyItem) => void;
  updateJourney: (index: number, j: JourneyItem) => void;
  deleteJourney: (index: number) => void;

  achievements: AchievementItem[];
  addAchievement: (ach: AchievementItem) => void;
  updateAchievement: (index: number, ach: AchievementItem) => void;
  deleteAchievement: (index: number) => void;

  languages: string[];
  updateLanguages: (langs: string[]) => void;

  resetToDefaults: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "rahil_portfolio_data_v2";
const PASSWORD_STORAGE_KEY = "rahil_portfolio_custom_password";

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [customPassword, setCustomPasswordState] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const [heroData, setHeroData] = useState<HeroData>(defaultHeroData);
  const [aboutData, setAboutData] = useState<AboutData>(defaultAboutData);
  const [focusData, setFocusData] = useState<FocusData>(defaultFocusData);
  const [projectsList, setProjectsList] = useState<Project[]>(defaultProjectsList);
  const [skillsList, setSkillsList] = useState<SkillCategory[]>(defaultSkillsList);
  const [experienceList, setExperienceList] = useState<ExperienceItem[]>(defaultExperienceList);
  const [journeyList, setJourneyList] = useState<JourneyItem[]>(defaultJourneyList);
  const [achievementsList, setAchievementsList] = useState<AchievementItem[]>(defaultAchievementsList);
  const [languagesList, setLanguagesList] = useState<string[]>(defaultLanguagesList);

  const applyPayload = (payload: any) => {
    if (!payload) return;
    if (payload.heroData) setHeroData(payload.heroData);
    if (payload.aboutData) setAboutData(payload.aboutData);
    if (payload.focusData) setFocusData(payload.focusData);
    if (payload.projectsList) setProjectsList(payload.projectsList);
    if (payload.skillsList) setSkillsList(payload.skillsList);
    if (payload.experienceList) setExperienceList(payload.experienceList);
    if (payload.journeyList) setJourneyList(payload.journeyList);
    if (payload.achievementsList) setAchievementsList(payload.achievementsList);
    if (payload.languagesList) setLanguagesList(payload.languagesList);
  };

  // Load from Storage (IndexedDB + Cloud Database) on mount
  useEffect(() => {
    const initStorage = async () => {
      try {
        const savedPassword = localStorage.getItem(PASSWORD_STORAGE_KEY);
        if (savedPassword) setCustomPasswordState(savedPassword);

        // 1. Fast local IndexedDB load
        const loadedData = await loadPortfolioData();
        if (loadedData) {
          applyPayload(loadedData);
        }

        // 2. Fetch latest master data from Cloud Database
        const cloudData = await fetchCloudPortfolioData();
        if (cloudData) {
          applyPayload(cloudData);
          savePortfolioData(cloudData);
        }
      } catch (e) {
        console.error("Failed to load portfolio data from storage", e);
      }
    };
    initStorage();
  }, []);

  const saveData = (data: any) => {
    savePortfolioData(data);
    saveCloudPortfolioData(data);
  };

  const currentPayload = () => ({
    heroData,
    aboutData,
    focusData,
    projectsList,
    skillsList,
    experienceList,
    journeyList,
    achievementsList,
    languagesList,
  });

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const setAdminPassword = (newPassword: string) => {
    localStorage.setItem(PASSWORD_STORAGE_KEY, newPassword);
    setCustomPasswordState(newPassword);
  };

  const loginAdmin = (passwordInput: string) => {
    if (!customPassword) {
      // First time setup - store password directly!
      setAdminPassword(passwordInput);
      setIsAdmin(true);
      return true;
    }
    if (passwordInput === customPassword) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
  };

  const updateHeroData = (data: Partial<HeroData>) => {
    const updated = { ...heroData, ...data };
    setHeroData(updated);
    saveData({ ...currentPayload(), heroData: updated });
  };

  const updateAboutData = (data: Partial<AboutData>) => {
    const updated = { ...aboutData, ...data };
    setAboutData(updated);
    saveData({ ...currentPayload(), aboutData: updated });
  };

  const updateFocusData = (data: Partial<FocusData>) => {
    const updated = { ...focusData, ...data };
    setFocusData(updated);
    saveData({ ...currentPayload(), focusData: updated });
  };

  const addProject = (project: Project) => {
    const updated = [project, ...projectsList];
    setProjectsList(updated);
    saveData({ ...currentPayload(), projectsList: updated });
  };

  const updateProject = (index: number, project: Project) => {
    const updated = [...projectsList];
    updated[index] = project;
    setProjectsList(updated);
    saveData({ ...currentPayload(), projectsList: updated });
  };

  const deleteProject = (index: number) => {
    const updated = projectsList.filter((_, i) => i !== index);
    setProjectsList(updated);
    saveData({ ...currentPayload(), projectsList: updated });
  };

  const addSkillCategory = (cat: SkillCategory) => {
    const updated = [...skillsList, cat];
    setSkillsList(updated);
    saveData({ ...currentPayload(), skillsList: updated });
  };

  const updateSkillCategory = (index: number, cat: SkillCategory) => {
    const updated = [...skillsList];
    updated[index] = cat;
    setSkillsList(updated);
    saveData({ ...currentPayload(), skillsList: updated });
  };

  const deleteSkillCategory = (index: number) => {
    const updated = skillsList.filter((_, i) => i !== index);
    setSkillsList(updated);
    saveData({ ...currentPayload(), skillsList: updated });
  };

  const addExperience = (exp: ExperienceItem) => {
    const updated = [exp, ...experienceList];
    setExperienceList(updated);
    saveData({ ...currentPayload(), experienceList: updated });
  };

  const updateExperience = (index: number, exp: ExperienceItem) => {
    const updated = [...experienceList];
    updated[index] = exp;
    setExperienceList(updated);
    saveData({ ...currentPayload(), experienceList: updated });
  };

  const deleteExperience = (index: number) => {
    const updated = experienceList.filter((_, i) => i !== index);
    setExperienceList(updated);
    saveData({ ...currentPayload(), experienceList: updated });
  };

  const addJourney = (j: JourneyItem) => {
    const updated = [j, ...journeyList];
    setJourneyList(updated);
    saveData({ ...currentPayload(), journeyList: updated });
  };

  const updateJourney = (index: number, j: JourneyItem) => {
    const updated = [...journeyList];
    updated[index] = j;
    setJourneyList(updated);
    saveData({ ...currentPayload(), journeyList: updated });
  };

  const deleteJourney = (index: number) => {
    const updated = journeyList.filter((_, i) => i !== index);
    setJourneyList(updated);
    saveData({ ...currentPayload(), journeyList: updated });
  };

  const addAchievement = (ach: AchievementItem) => {
    const updated = [ach, ...achievementsList];
    setAchievementsList(updated);
    saveData({ ...currentPayload(), achievementsList: updated });
  };

  const updateAchievement = (index: number, ach: AchievementItem) => {
    const updated = [...achievementsList];
    updated[index] = ach;
    setAchievementsList(updated);
    saveData({ ...currentPayload(), achievementsList: updated });
  };

  const deleteAchievement = (index: number) => {
    const updated = achievementsList.filter((_, i) => i !== index);
    setAchievementsList(updated);
    saveData({ ...currentPayload(), achievementsList: updated });
  };

  const updateLanguages = (langs: string[]) => {
    setLanguagesList(langs);
    saveData({ ...currentPayload(), languagesList: langs });
  };

  const resetToDefaults = () => {
    setHeroData(defaultHeroData);
    setAboutData(defaultAboutData);
    setFocusData(defaultFocusData);
    setProjectsList(defaultProjectsList);
    setSkillsList(defaultSkillsList);
    setExperienceList(defaultExperienceList);
    setJourneyList(defaultJourneyList);
    setAchievementsList(defaultAchievementsList);
    setLanguagesList(defaultLanguagesList);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const exportDataJSON = () => {
    return JSON.stringify(currentPayload(), null, 2);
  };

  const importDataJSON = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.heroData) setHeroData(parsed.heroData);
      if (parsed.aboutData) setAboutData(parsed.aboutData);
      if (parsed.focusData) setFocusData(parsed.focusData);
      if (parsed.projectsList) setProjectsList(parsed.projectsList);
      if (parsed.skillsList) setSkillsList(parsed.skillsList);
      if (parsed.experienceList) setExperienceList(parsed.experienceList);
      if (parsed.journeyList) setJourneyList(parsed.journeyList);
      if (parsed.achievementsList) setAchievementsList(parsed.achievementsList);
      if (parsed.languagesList) setLanguagesList(parsed.languagesList);
      saveData(parsed);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        isAdmin,
        hasCustomPassword: !!customPassword,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        loginAdmin,
        setAdminPassword,
        logoutAdmin,
        heroData,
        updateHeroData,
        aboutData,
        updateAboutData,
        focusData,
        updateFocusData,
        projects: projectsList,
        addProject,
        updateProject,
        deleteProject,
        skills: skillsList,
        addSkillCategory,
        updateSkillCategory,
        deleteSkillCategory,
        experience: experienceList,
        addExperience,
        updateExperience,
        deleteExperience,
        journey: journeyList,
        addJourney,
        updateJourney,
        deleteJourney,
        achievements: achievementsList,
        addAchievement,
        updateAchievement,
        deleteAchievement,
        languages: languagesList,
        updateLanguages,
        resetToDefaults,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
};
