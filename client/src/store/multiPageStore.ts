/**
 * MultiPage Store - Gestiona landings con múltiples páginas
 */

import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Section } from './editorStore';

export type PageType = 'home' | 'terms' | 'privacy' | 'about' | 'contact' | 'custom';

export interface Page {
  id: string;
  type: PageType;
  slug: string;
  title: string;
  enabled: boolean;
  data: Record<string, unknown>;
}

export interface LandingProject {
  id: string;
  name: string;
  slug: string;
  
  // Página principal
  homeSections: Section[];
  
  // Páginas adicionales
  pages: Page[];
  
  // Tema global
  theme: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      foreground: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    darkMode: boolean;
  };
  
  // Metadatos del negocio
  metadata: {
    businessName: string;
    businessType?: string;
    contactEmail?: string;
    phone?: string;
    address?: string;
    websiteUrl?: string;
    socialLinks?: Record<string, string>;
  };
  
  // Navegación
  navigation: {
    logo?: { text?: string; imageUrl?: string };
    links: { label: string; href: string; isPage?: boolean }[];
    cta?: { text: string; href: string };
  };
}

interface MultiPageState {
  // Proyecto actual
  currentProject: LandingProject | null;
  
  // Página activa (para el editor)
  activePage: 'home' | string; // 'home' o el id de una página
  
  // Acciones
  setProject: (project: LandingProject) => void;
  setActivePage: (pageId: 'home' | string) => void;
  
  // Gestión de páginas
  addPage: (type: PageType, customData?: Record<string, unknown>) => void;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  removePage: (pageId: string) => void;
  togglePage: (pageId: string) => void;
  
  // Gestión de navegación
  updateNavigation: (nav: Partial<LandingProject['navigation']>) => void;
  
  // Gestión de metadata
  updateMetadata: (metadata: Partial<LandingProject['metadata']>) => void;
  
  // Gestión de tema
  updateTheme: (theme: Partial<LandingProject['theme']>) => void;
  
  // Reset
  resetProject: () => void;
}

const DEFAULT_PAGES: Omit<Page, 'id'>[] = [
  { type: 'terms', slug: '/terminos', title: 'Términos y Condiciones', enabled: false, data: {} },
  { type: 'privacy', slug: '/privacidad', title: 'Política de Privacidad', enabled: false, data: {} },
  { type: 'about', slug: '/nosotros', title: 'Sobre Nosotros', enabled: false, data: {} },
  { type: 'contact', slug: '/contacto', title: 'Contacto', enabled: false, data: {} },
];

const createDefaultProject = (): LandingProject => ({
  id: nanoid(),
  name: 'Nueva Landing',
  slug: nanoid(8).toLowerCase(),
  homeSections: [],
  pages: DEFAULT_PAGES.map(p => ({ ...p, id: nanoid() })),
  theme: {
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      accent: '#8b5cf6',
      background: '#ffffff',
      foreground: '#111827',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    darkMode: false,
  },
  metadata: {
    businessName: 'Mi Empresa',
  },
  navigation: {
    logo: { text: 'Mi Empresa' },
    links: [
      { label: 'Inicio', href: '/' },
      { label: 'Características', href: '#features' },
      { label: 'Precios', href: '#pricing' },
    ],
  },
});

export const useMultiPageStore = create<MultiPageState>((set, get) => ({
  currentProject: null,
  activePage: 'home',

  setProject: (project) => set({ currentProject: project, activePage: 'home' }),
  
  setActivePage: (pageId) => set({ activePage: pageId }),

  addPage: (type, customData = {}) => set((state) => {
    if (!state.currentProject) return state;
    
    const defaultPage = DEFAULT_PAGES.find(p => p.type === type);
    const newPage: Page = {
      id: nanoid(),
      type,
      slug: defaultPage?.slug || `/${type}`,
      title: defaultPage?.title || type,
      enabled: true,
      data: {
        ...state.currentProject.metadata,
        ...customData,
      },
    };
    
    // Añadir a navegación si no existe
    const navLink = {
      label: newPage.title,
      href: newPage.slug,
      isPage: true,
    };
    
    const existingLink = state.currentProject.navigation.links.find(
      l => l.href === newPage.slug
    );
    
    return {
      currentProject: {
        ...state.currentProject,
        pages: [...state.currentProject.pages.map(p => 
          p.type === type ? { ...p, enabled: true, data: { ...p.data, ...customData } } : p
        )],
        navigation: existingLink ? state.currentProject.navigation : {
          ...state.currentProject.navigation,
          links: [...state.currentProject.navigation.links, navLink],
        },
      },
    };
  }),

  updatePage: (pageId, updates) => set((state) => {
    if (!state.currentProject) return state;
    
    return {
      currentProject: {
        ...state.currentProject,
        pages: state.currentProject.pages.map(p =>
          p.id === pageId ? { ...p, ...updates } : p
        ),
      },
    };
  }),

  removePage: (pageId) => set((state) => {
    if (!state.currentProject) return state;
    
    const page = state.currentProject.pages.find(p => p.id === pageId);
    
    return {
      currentProject: {
        ...state.currentProject,
        pages: state.currentProject.pages.filter(p => p.id !== pageId),
        navigation: {
          ...state.currentProject.navigation,
          links: state.currentProject.navigation.links.filter(
            l => l.href !== page?.slug
          ),
        },
      },
      activePage: state.activePage === pageId ? 'home' : state.activePage,
    };
  }),

  togglePage: (pageId) => set((state) => {
    if (!state.currentProject) return state;
    
    const page = state.currentProject.pages.find(p => p.id === pageId);
    if (!page) return state;
    
    const newEnabled = !page.enabled;
    
    // Actualizar navegación
    let newLinks = state.currentProject.navigation.links;
    if (newEnabled) {
      // Añadir a navegación si no existe
      if (!newLinks.find(l => l.href === page.slug)) {
        newLinks = [...newLinks, { label: page.title, href: page.slug, isPage: true }];
      }
    } else {
      // Remover de navegación
      newLinks = newLinks.filter(l => l.href !== page.slug);
    }
    
    return {
      currentProject: {
        ...state.currentProject,
        pages: state.currentProject.pages.map(p =>
          p.id === pageId ? { ...p, enabled: newEnabled } : p
        ),
        navigation: {
          ...state.currentProject.navigation,
          links: newLinks,
        },
      },
    };
  }),

  updateNavigation: (nav) => set((state) => {
    if (!state.currentProject) return state;
    
    return {
      currentProject: {
        ...state.currentProject,
        navigation: { ...state.currentProject.navigation, ...nav },
      },
    };
  }),

  updateMetadata: (metadata) => set((state) => {
    if (!state.currentProject) return state;
    
    return {
      currentProject: {
        ...state.currentProject,
        metadata: { ...state.currentProject.metadata, ...metadata },
      },
    };
  }),

  updateTheme: (theme) => set((state) => {
    if (!state.currentProject) return state;
    
    return {
      currentProject: {
        ...state.currentProject,
        theme: { ...state.currentProject.theme, ...theme },
      },
    };
  }),

  resetProject: () => set({ currentProject: createDefaultProject(), activePage: 'home' }),
}));

// Helper para crear un proyecto desde una configuración de landing existente
export function createProjectFromLanding(
  sections: Section[],
  metadata: LandingProject['metadata'],
  theme?: Partial<LandingProject['theme']>,
  requestedPages?: PageType[]
): LandingProject {
  const project = createDefaultProject();
  
  project.homeSections = sections;
  project.metadata = { ...project.metadata, ...metadata };
  
  if (theme) {
    project.theme = { ...project.theme, ...theme };
  }
  
  // Habilitar páginas solicitadas
  if (requestedPages && requestedPages.length > 0) {
    project.pages = project.pages.map(p => ({
      ...p,
      enabled: requestedPages.includes(p.type),
      data: { ...metadata },
    }));
    
    // Actualizar navegación con páginas habilitadas
    const pageLinks = project.pages
      .filter(p => p.enabled)
      .map(p => ({ label: p.title, href: p.slug, isPage: true }));
    
    project.navigation.links = [
      ...project.navigation.links,
      ...pageLinks,
    ];
  }
  
  // Actualizar logo con nombre del negocio
  project.navigation.logo = { text: metadata.businessName };
  project.name = metadata.businessName;
  
  return project;
}
