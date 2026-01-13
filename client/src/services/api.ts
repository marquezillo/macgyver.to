import axios from 'axios';
import { Section } from '@/store/editorStore';

const API_URL = 'http://localhost:8001'; // URL de la API backend

export interface ProjectData {
  id: string;
  name: string;
  sections: Section[];
  config: Record<string, any>;
}

export const api = {
  saveProject: async (projectId: string, data: Partial<ProjectData>) => {
    try {
      // En un entorno real, esto conectaría con el backend
      // Por ahora simulamos guardado en localStorage para desarrollo
      const savedProjects = JSON.parse(localStorage.getItem('projects') || '{}');
      savedProjects[projectId] = { ...savedProjects[projectId], ...data, updatedAt: new Date().toISOString() };
      localStorage.setItem('projects', JSON.stringify(savedProjects));
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  },

  loadProject: async (projectId: string): Promise<ProjectData | null> => {
    try {
      const savedProjects = JSON.parse(localStorage.getItem('projects') || '{}');
      const project = savedProjects[projectId];
      
      if (!project) return null;
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      return project;
    } catch (error) {
      console.error('Error loading project:', error);
      throw error;
    }
  },

  publishProject: async (projectId: string) => {
    try {
      // Aquí iría la lógica de deploy real
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, url: `https://${projectId}.manus.site` };
    } catch (error) {
      console.error('Error publishing project:', error);
      throw error;
    }
  }
};
