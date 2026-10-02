import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type { Project } from '@/types';
import { projectService } from '@/services/api';

interface ProjectContextValue {
  projects: Project[];
  loading: boolean;
  error: string | null;

  getProject: (id: string) => Project | undefined;

  addProject: (project: Project) => Promise<Project>;
  updateProject: (
    id: string,
    updates: Partial<Project>,
  ) => Promise<Project>;

  deleteProject: (id: string) => Promise<void>;
  submitProject: (id: string) => Promise<Project>;

  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProjects = async () => {
    try {
      setError(null);

      const data = await projectService.getAll();

      setProjects(data as Project[]);
    } catch (err) {
      console.error('Erro ao carregar projetos:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os projetos.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const getProject = (id: string) => {
    return projects.find((p) => p.id === id);
  };

  const addProject = async (project: Project): Promise<Project> => {
    try {
      setError(null);

      const created = await projectService.create(project);

      const createdProject = created as Project;

      setProjects((prev) => [createdProject, ...prev]);

      return createdProject;
    } catch (err) {
      console.error('Erro ao criar projeto:', err);

      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível criar o projeto.';

      setError(message);
      throw err;
    }
  };

  const updateProject = async (
    id: string,
    updates: Partial<Project>,
  ): Promise<Project> => {
    try {
      setError(null);

      const currentProject = projects.find((p) => p.id === id);

      if (!currentProject) {
        throw new Error('Projeto não encontrado.');
      }

      const updated = await projectService.update(id, {
        ...currentProject,
        ...updates,
      });

      const updatedProject = updated as Project;

      setProjects((prev) =>
        prev.map((p) => (p.id === id ? updatedProject : p)),
      );

      return updatedProject;
    } catch (err) {
      console.error('Erro ao atualizar projeto:', err);

      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível atualizar o projeto.';

      setError(message);
      throw err;
    }
  };

  const deleteProject = async (id: string): Promise<void> => {
    try {
      setError(null);

      await projectService.delete(id);

      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Erro ao excluir projeto:', err);

      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível excluir o projeto.';

      setError(message);
      throw err;
    }
  };

  const submitProject = async (id: string): Promise<Project> => {
    try {
      setError(null);

      const submitted = await projectService.submit(id);

      const submittedProject = submitted as Project;

      setProjects((prev) =>
        prev.map((p) => (p.id === id ? submittedProject : p)),
      );

      return submittedProject;
    } catch (err) {
      console.error('Erro ao enviar projeto para análise:', err);

      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível enviar o projeto para análise.';

      setError(message);
      throw err;
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        error,
        getProject,
        addProject,
        updateProject,
        deleteProject,
        submitProject,
        refreshProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects(): ProjectContextValue {
  const ctx = useContext(ProjectContext);

  if (!ctx) {
    throw new Error('useProjects must be used within ProjectProvider');
  }

  return ctx;
}