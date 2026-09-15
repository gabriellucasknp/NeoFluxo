import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Project } from '@/types';
import { mockProjects } from '@/data/mockData';

interface ProjectContextValue {
  projects: Project[];
  getProject: (id: string) => Project | undefined;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addProject: (project: Project) => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  const getProject = (id: string) => projects.find((p) => p.id === id);

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
  };

  const addProject = (project: Project) => {
    setProjects((prev) => [project, ...prev]);
  };

  return (
    <ProjectContext.Provider
      value={{ projects, getProject, updateProject, addProject }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
}
