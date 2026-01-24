/**
 * Responsive Design Utilities
 * Sistema centralizado de clases responsive para garantizar consistencia
 */

// Breakpoints de Tailwind
// sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px

/**
 * Clases de contenedor responsive
 */
export const containerClasses = {
  // Padding horizontal responsive
  paddingX: 'px-4 sm:px-6 lg:px-8',
  // Padding vertical responsive
  paddingY: 'py-12 md:py-16 lg:py-20',
  paddingYLarge: 'py-16 md:py-24 lg:py-32',
  paddingYSmall: 'py-8 md:py-12 lg:py-16',
  // Max width con centrado
  maxWidth: 'max-w-7xl mx-auto',
  maxWidthNarrow: 'max-w-3xl mx-auto',
  maxWidthWide: 'max-w-screen-2xl mx-auto',
};

/**
 * Clases de tipografía responsive
 */
export const typographyClasses = {
  // Títulos principales (Hero)
  h1: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight',
  // Títulos de sección
  h2: 'text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight',
  // Subtítulos de sección
  h3: 'text-xl sm:text-2xl md:text-3xl font-semibold',
  // Títulos de cards
  h4: 'text-lg sm:text-xl font-semibold',
  // Subtítulos/descripciones grandes
  subtitle: 'text-base sm:text-lg md:text-xl',
  // Texto de párrafo
  body: 'text-sm sm:text-base',
  // Texto pequeño
  small: 'text-xs sm:text-sm',
  // Badges
  badge: 'text-xs sm:text-sm font-medium',
};

/**
 * Clases de grid responsive
 */
export const gridClasses = {
  // 2 columnas
  cols2: 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6',
  // 3 columnas
  cols3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8',
  // 4 columnas
  cols4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6',
  // 2 columnas para split layouts
  splitLayout: 'grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center',
  // Footer columns
  footerCols: 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8',
};

/**
 * Clases de botones responsive
 */
export const buttonClasses = {
  // Botón primario grande
  primary: 'w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg',
  // Botón secundario
  secondary: 'w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base',
  // Grupo de botones
  group: 'flex flex-col sm:flex-row gap-3 sm:gap-4',
  // Botón de icono
  icon: 'p-2 sm:p-3',
};

/**
 * Clases de cards responsive
 */
export const cardClasses = {
  // Padding de card
  padding: 'p-4 sm:p-6 lg:p-8',
  paddingSmall: 'p-3 sm:p-4 lg:p-6',
  // Bordes redondeados
  rounded: 'rounded-xl sm:rounded-2xl',
  // Sombras
  shadow: 'shadow-md hover:shadow-lg transition-shadow',
};

/**
 * Clases de imágenes responsive
 */
export const imageClasses = {
  // Imagen de hero
  hero: 'w-full h-auto object-cover rounded-lg sm:rounded-xl lg:rounded-2xl',
  // Avatar
  avatar: 'w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover',
  avatarLarge: 'w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover',
  // Icono de feature
  featureIcon: 'w-10 h-10 sm:w-12 sm:h-12',
  // Aspect ratios
  aspectVideo: 'aspect-video',
  aspectSquare: 'aspect-square',
  aspect4x3: 'aspect-[4/3]',
};

/**
 * Clases de espaciado responsive
 */
export const spacingClasses = {
  // Gaps
  gapSmall: 'gap-2 sm:gap-3 md:gap-4',
  gapMedium: 'gap-4 sm:gap-6 md:gap-8',
  gapLarge: 'gap-6 sm:gap-8 md:gap-12',
  // Margins
  marginTop: 'mt-4 sm:mt-6 md:mt-8',
  marginBottom: 'mb-4 sm:mb-6 md:mb-8',
  // Section spacing
  sectionGap: 'space-y-8 sm:space-y-12 md:space-y-16',
};

/**
 * Clases de visibilidad responsive
 */
export const visibilityClasses = {
  // Solo móvil
  mobileOnly: 'block sm:hidden',
  // Solo tablet y superior
  tabletUp: 'hidden sm:block',
  // Solo desktop
  desktopOnly: 'hidden lg:block',
  // Móvil y tablet
  mobileTablet: 'block lg:hidden',
};

/**
 * Clases de texto responsive para stats
 */
export const statsClasses = {
  value: 'text-2xl sm:text-3xl md:text-4xl font-bold',
  label: 'text-xs sm:text-sm mt-1',
  container: 'grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8',
};

/**
 * Función helper para combinar clases responsive
 */
export function responsiveClasses(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Función para obtener clases de grid dinámicas basadas en número de items
 */
export function getGridCols(itemCount: number): string {
  if (itemCount <= 2) {
    return 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6';
  }
  if (itemCount === 3) {
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8';
  }
  if (itemCount === 4) {
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6';
  }
  // 5 o más items
  return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6';
}

/**
 * Función para obtener clases de tipografía de título basadas en nivel
 */
export function getHeadingClasses(level: 1 | 2 | 3 | 4 = 2): string {
  const headings = {
    1: typographyClasses.h1,
    2: typographyClasses.h2,
    3: typographyClasses.h3,
    4: typographyClasses.h4,
  };
  return headings[level];
}
