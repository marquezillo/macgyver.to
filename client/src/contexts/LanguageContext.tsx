import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "es" | "en" | "pt";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("language") as Language | null;
    if (saved && ["es", "en", "pt"].includes(saved)) {
      setLanguageState(saved);
    }
    setIsLoaded(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    // Update document language attribute for accessibility
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === "string" ? value : key;
  };

  if (!isLoaded) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

const translations = {
  es: {
    // Common
    common: {
      save: "Guardar",
      cancel: "Cancelar",
      delete: "Eliminar",
      edit: "Editar",
      back: "Atrás",
      next: "Siguiente",
      close: "Cerrar",
      loading: "Cargando...",
      error: "Error",
      success: "Éxito",
      confirm: "Confirmar",
    },
    // Sidebar
    sidebar: {
      newChat: "Nuevo Chat",
      chats: "Conversaciones",
      myLandings: "Mis Landings",
      projects: "Proyectos",
      settings: "Configuración",
      account: "Mi Cuenta",
      admin: "Panel Admin",
      logout: "Cerrar Sesión",
      searchChats: "Buscar conversaciones...",
    },
    // Chat
    chat: {
      placeholder: "Escribe tu pregunta o solicitud...",
      send: "Enviar",
      generating: "Generando...",
      typeMessage: "Escribe un mensaje...",
      suggestions: "Sugerencias",
      generateLanding: "Generar Landing",
      analyzeImage: "Analizar Imagen",
      deepResearch: "Investigación Profunda",
      generateImage: "Generar Imagen",
    },
    // Settings
    settings: {
      title: "Configuración",
      subtitle: "Personaliza tu experiencia",
      appearance: "Apariencia",
      theme: "Tema",
      light: "Claro",
      dark: "Oscuro",
      language: "Idioma",
      interfaceLanguage: "Idioma de la interfaz",
      selectLanguage: "Selecciona tu idioma preferido",
      notifications: "Notificaciones",
      pushNotifications: "Notificaciones push",
      receiveNotifications: "Recibe notificaciones cuando se completen tareas",
      privacy: "Privacidad",
      saveHistory: "Guardar historial de conversaciones",
      keepRecord: "Mantén un registro de tus conversaciones con la IA",
      longTermMemory: "Memoria de largo plazo",
      allowMemory: "Permite que la IA recuerde información entre sesiones",
      manageMemory: "Gestionar Memoria",
      configureMemory: "Configura qué recuerda la IA",
      myAccount: "Mi Cuenta",
      profilePassword: "Perfil, contraseña y más",
    },
    // Account
    account: {
      title: "Mi Cuenta",
      profile: "Perfil",
      email: "Correo Electrónico",
      password: "Contraseña",
      changePassword: "Cambiar Contraseña",
      currentPassword: "Contraseña Actual",
      newPassword: "Nueva Contraseña",
      confirmPassword: "Confirmar Contraseña",
      deleteAccount: "Eliminar Cuenta",
      deleteWarning: "Esta acción no se puede deshacer",
    },
    // Landing
    landing: {
      publish: "Publicar",
      preview: "Vista Previa",
      edit: "Editar",
      delete: "Eliminar",
      myLandings: "Mis Landings",
      createNew: "Crear Nueva Landing",
      views: "Vistas",
      published: "Publicada",
      draft: "Borrador",
      slug: "URL Personalizada",
      subdomain: "Subdominio",
    },
    // Admin
    admin: {
      dashboard: "Dashboard",
      users: "Usuarios",
      chats: "Conversaciones",
      landings: "Landings",
      statistics: "Estadísticas",
      totalUsers: "Usuarios Totales",
      totalChats: "Conversaciones Totales",
      totalLandings: "Landings Totales",
      totalVisits: "Visitas Totales",
    },
  },
  en: {
    // Common
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      back: "Back",
      next: "Next",
      close: "Close",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      confirm: "Confirm",
    },
    // Sidebar
    sidebar: {
      newChat: "New Chat",
      chats: "Conversations",
      myLandings: "My Landings",
      projects: "Projects",
      settings: "Settings",
      account: "My Account",
      admin: "Admin Panel",
      logout: "Logout",
      searchChats: "Search conversations...",
    },
    // Chat
    chat: {
      placeholder: "Ask a question or make a request...",
      send: "Send",
      generating: "Generating...",
      typeMessage: "Type a message...",
      suggestions: "Suggestions",
      generateLanding: "Generate Landing",
      analyzeImage: "Analyze Image",
      deepResearch: "Deep Research",
      generateImage: "Generate Image",
    },
    // Settings
    settings: {
      title: "Settings",
      subtitle: "Customize your experience",
      appearance: "Appearance",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      language: "Language",
      interfaceLanguage: "Interface Language",
      selectLanguage: "Select your preferred language",
      notifications: "Notifications",
      pushNotifications: "Push Notifications",
      receiveNotifications: "Receive notifications when tasks complete",
      privacy: "Privacy",
      saveHistory: "Save conversation history",
      keepRecord: "Keep a record of your conversations with the AI",
      longTermMemory: "Long-term Memory",
      allowMemory: "Allow the AI to remember information between sessions",
      manageMemory: "Manage Memory",
      configureMemory: "Configure what the AI remembers",
      myAccount: "My Account",
      profilePassword: "Profile, password and more",
    },
    // Account
    account: {
      title: "My Account",
      profile: "Profile",
      email: "Email",
      password: "Password",
      changePassword: "Change Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      deleteAccount: "Delete Account",
      deleteWarning: "This action cannot be undone",
    },
    // Landing
    landing: {
      publish: "Publish",
      preview: "Preview",
      edit: "Edit",
      delete: "Delete",
      myLandings: "My Landings",
      createNew: "Create New Landing",
      views: "Views",
      published: "Published",
      draft: "Draft",
      slug: "Custom URL",
      subdomain: "Subdomain",
    },
    // Admin
    admin: {
      dashboard: "Dashboard",
      users: "Users",
      chats: "Conversations",
      landings: "Landings",
      statistics: "Statistics",
      totalUsers: "Total Users",
      totalChats: "Total Conversations",
      totalLandings: "Total Landings",
      totalVisits: "Total Visits",
    },
  },
  pt: {
    // Common
    common: {
      save: "Salvar",
      cancel: "Cancelar",
      delete: "Deletar",
      edit: "Editar",
      back: "Voltar",
      next: "Próximo",
      close: "Fechar",
      loading: "Carregando...",
      error: "Erro",
      success: "Sucesso",
      confirm: "Confirmar",
    },
    // Sidebar
    sidebar: {
      newChat: "Novo Chat",
      chats: "Conversas",
      myLandings: "Minhas Landings",
      projects: "Projetos",
      settings: "Configurações",
      account: "Minha Conta",
      admin: "Painel Admin",
      logout: "Sair",
      searchChats: "Pesquisar conversas...",
    },
    // Chat
    chat: {
      placeholder: "Faça uma pergunta ou solicite algo...",
      send: "Enviar",
      generating: "Gerando...",
      typeMessage: "Digite uma mensagem...",
      suggestions: "Sugestões",
      generateLanding: "Gerar Landing",
      analyzeImage: "Analisar Imagem",
      deepResearch: "Pesquisa Profunda",
      generateImage: "Gerar Imagem",
    },
    // Settings
    settings: {
      title: "Configurações",
      subtitle: "Personalize sua experiência",
      appearance: "Aparência",
      theme: "Tema",
      light: "Claro",
      dark: "Escuro",
      language: "Idioma",
      interfaceLanguage: "Idioma da Interface",
      selectLanguage: "Selecione seu idioma preferido",
      notifications: "Notificações",
      pushNotifications: "Notificações Push",
      receiveNotifications: "Receba notificações quando as tarefas forem concluídas",
      privacy: "Privacidade",
      saveHistory: "Salvar histórico de conversas",
      keepRecord: "Mantenha um registro de suas conversas com a IA",
      longTermMemory: "Memória de Longo Prazo",
      allowMemory: "Permita que a IA lembre informações entre sessões",
      manageMemory: "Gerenciar Memória",
      configureMemory: "Configure o que a IA lembra",
      myAccount: "Minha Conta",
      profilePassword: "Perfil, senha e mais",
    },
    // Account
    account: {
      title: "Minha Conta",
      profile: "Perfil",
      email: "Email",
      password: "Senha",
      changePassword: "Alterar Senha",
      currentPassword: "Senha Atual",
      newPassword: "Nova Senha",
      confirmPassword: "Confirmar Senha",
      deleteAccount: "Deletar Conta",
      deleteWarning: "Esta ação não pode ser desfeita",
    },
    // Landing
    landing: {
      publish: "Publicar",
      preview: "Visualizar",
      edit: "Editar",
      delete: "Deletar",
      myLandings: "Minhas Landings",
      createNew: "Criar Nova Landing",
      views: "Visualizações",
      published: "Publicada",
      draft: "Rascunho",
      slug: "URL Personalizada",
      subdomain: "Subdomínio",
    },
    // Admin
    admin: {
      dashboard: "Painel",
      users: "Usuários",
      chats: "Conversas",
      landings: "Landings",
      statistics: "Estatísticas",
      totalUsers: "Usuários Totais",
      totalChats: "Conversas Totais",
      totalLandings: "Landings Totais",
      totalVisits: "Visitas Totais",
    },
  },
};
