/**
 * LandingPageViewer - Visualiza páginas internas de una landing
 * Ruta: /p/:projectSlug/:pageSlug
 */

import React, { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { PageRenderer } from '@/components/pages/PageRenderer';
import { Loader2 } from 'lucide-react';
import type { PageConfig, ThemeConfig, LandingMetadata } from '@shared/landingTypes';

export default function LandingPageViewer() {
  const [, params] = useRoute('/p/:projectSlug/:pageSlug');
  const [, setLocation] = useLocation();
  
  const projectSlug = params?.projectSlug;
  const pageSlug = params?.pageSlug;
  
  // Obtener datos del proyecto
  const { data: project, isLoading, error } = trpc.landing.getBySlug.useQuery(
    { slug: projectSlug || '' },
    { enabled: !!projectSlug }
  );
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-gray-500">Cargando página...</p>
        </div>
      </div>
    );
  }
  
  // El endpoint aún no está implementado, mostrar mensaje temporal
  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Página en construcción</h1>
          <p className="text-gray-500 mb-4">El sistema de páginas internas está siendo implementado.</p>
          <button 
            onClick={() => setLocation('/')}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }
  
  // Type assertion para evitar errores de TypeScript mientras se implementa el backend
  const projectData = project as any;
  
  // Buscar la página por slug
  const page = projectData.pages?.find((p: PageConfig) => 
    p.slug === `/${pageSlug}` || p.slug === pageSlug
  );
  
  if (!page || !page.enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Página no encontrada</h1>
          <p className="text-gray-500 mb-4">Esta página no existe en el proyecto.</p>
          <button 
            onClick={() => setLocation(`/p/${projectSlug}`)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Volver al inicio del proyecto
          </button>
        </div>
      </div>
    );
  }
  
  // Construir theme y metadata desde el proyecto
  const theme: ThemeConfig = {
    colors: projectData.theme?.colors || {
      primary: '#3b82f6',
      secondary: '#6366f1',
      accent: '#8b5cf6',
      background: '#ffffff',
      foreground: '#111827',
      muted: '#6b7280',
      border: '#e5e7eb',
    },
    fonts: projectData.theme?.fonts || {
      heading: 'Inter',
      body: 'Inter',
    },
    borderRadius: '0.5rem',
    darkMode: projectData.theme?.darkMode || false,
  };
  
  const metadata: LandingMetadata = {
    businessName: projectData.metadata?.businessName || projectData.name || 'Mi Empresa',
    businessType: projectData.metadata?.businessType,
    contactEmail: projectData.metadata?.contactEmail,
    phone: projectData.metadata?.phone,
    address: projectData.metadata?.address,
    websiteUrl: projectData.metadata?.websiteUrl,
    socialLinks: projectData.metadata?.socialLinks,
  };
  
  return (
    <PageRenderer
      page={page}
      theme={theme}
      metadata={metadata}
    />
  );
}
