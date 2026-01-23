import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import { nanoid } from 'nanoid';

export type SectionType = 'hero' | 'features' | 'testimonials' | 'pricing' | 'cta' | 'stats' | 'faq' | 'form' | 'footer' | 'process' | 'about' | 'gallery' | 'logocloud' | 'logos' | 'partners' | 'clients' | 'header' | 'navbar' | 'nav';

export interface Section {
  id: string;
  type: SectionType;
  variant?: string;
  content: Record<string, any>;
  styles?: Record<string, any>;
}

interface EditorState {
  sections: Section[];
  selectedSectionId: string | null;
  addSection: (type: SectionType) => void;
  updateSection: (id: string, content: Record<string, any>) => void;
  updateSectionStyles: (id: string, styles: Record<string, any>) => void;
  removeSection: (id: string) => void;
  reorderSections: (activeId: string, overId: string) => void;
  selectSection: (id: string | null) => void;
  setSections: (sections: Section[]) => void;
}

const defaultContent: Record<SectionType, Record<string, any>> = {
  hero: {
    title: "Welcome to Your New Landing Page",
    subtitle: "This is a perfect place to introduce your product or service. Make a strong first impression.",
    ctaText: "Get Started",
    ctaLink: "#",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80"
  },
  features: {
    title: "Amazing Features",
    subtitle: "Discover what makes our product unique and powerful.",
    items: [
      { title: "Feature 1", description: "Description for feature 1" },
      { title: "Feature 2", description: "Description for feature 2" },
      { title: "Feature 3", description: "Description for feature 3" }
    ]
  },
  testimonials: {
    title: "What Our Clients Say",
    items: [
      { name: "John Doe", role: "CEO, TechCorp", quote: "This product changed my life. Highly recommended!", avatar: "https://i.pravatar.cc/150?u=1" },
      { name: "Jane Smith", role: "Designer", quote: "Beautiful design and easy to use. I love it.", avatar: "https://i.pravatar.cc/150?u=2" }
    ]
  },
  pricing: {
    title: "Simple Pricing",
    subtitle: "Choose the plan that fits your needs.",
    plans: [
      { name: "Basic", price: "$9", features: ["Feature A", "Feature B"] },
      { name: "Pro", price: "$29", features: ["Feature A", "Feature B", "Feature C"] }
    ]
  },
  cta: {
    title: "Ready to Get Started?",
    subtitle: "Join thousands of satisfied customers today.",
    buttonText: "Sign Up Now"
  },
  stats: {
    items: [
      { value: "10k+", label: "Users" },
      { value: "99%", label: "Satisfaction" },
      { value: "24/7", label: "Support" }
    ]
  },
  faq: {
    title: "Frequently Asked Questions",
    items: [
      { question: "How does it work?", answer: "It works like magic." },
      { question: "Is it free?", answer: "Yes, there is a free tier." }
    ]
  },
  form: {
    title: "Contact Us",
    subtitle: "Fill out the form below and we'll get back to you.",
    fields: [
      { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name', required: true },
      { id: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com', required: true },
      { id: 'message', label: 'Message', type: 'textarea', placeholder: 'Your message...' }
    ],
    submitText: "Send Message"
  },
  footer: {
    companyName: "My Company",
    description: "Building amazing products for our customers.",
    copyright: `© ${new Date().getFullYear()} All rights reserved.`
  },
  process: {
    title: "How It Works",
    subtitle: "Simple steps to get started",
    steps: [
      { number: 1, title: "Step 1", description: "Description of the first step" },
      { number: 2, title: "Step 2", description: "Description of the second step" },
      { number: 3, title: "Step 3", description: "Description of the third step" }
    ]
  },
  about: {
    title: "About Our Company",
    description: "We are a team of passionate individuals dedicated to creating exceptional experiences.",
    team: []
  },
  gallery: {
    title: "Our Gallery",
    subtitle: "Explore our work",
    images: []
  },
  logocloud: {
    title: "Trusted By",
    logos: []
  },
  logos: {
    title: "Our Partners",
    logos: []
  },
  partners: {
    title: "Our Partners",
    logos: []
  },
  clients: {
    title: "Our Clients",
    logos: []
  },
  header: {
    logoText: "Brand",
    navItems: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "About", href: "#about" }
    ],
    ctaText: "Get Started"
  },
  navbar: {
    logoText: "Brand",
    navItems: [],
    ctaText: "Get Started"
  },
  nav: {
    logoText: "Brand",
    navItems: [],
    ctaText: "Get Started"
  }
};

export const useEditorStore = create<EditorState>((set) => ({
  sections: [
    { 
      id: '1', 
      type: 'hero', 
      content: {
        title: 'Build Beautiful Landings',
        subtitle: 'The fastest way to create high-converting landing pages without writing code.',
        ctaText: 'Get Started',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80'
      }, 
      styles: {
        backgroundColor: 'bg-white',
        textColor: 'text-gray-900'
      } 
    },
    { 
      id: '2', 
      type: 'features', 
      content: {
        title: 'Why Choose Us',
        subtitle: 'Everything you need to launch your next project.',
        items: [
          { title: 'Drag & Drop', description: 'Easily reorder sections with our intuitive editor.' },
          { title: 'Responsive', description: 'Looks great on all devices automatically.' },
          { title: 'Fast', description: 'Optimized for speed and performance.' }
        ]
      }, 
      styles: {
        backgroundColor: 'bg-gray-50',
        textColor: 'text-gray-900'
      } 
    }
  ],
  selectedSectionId: null,

  addSection: (type) => set((state) => ({
    sections: [...state.sections, {
      id: nanoid(),
      type,
      content: defaultContent[type],
      styles: {
        backgroundColor: 'bg-white',
        textColor: 'text-gray-900'
      }
    }]
  })),

  updateSection: (id, content) => set((state) => ({
    sections: state.sections.map((s) =>
      s.id === id ? { ...s, content: { ...s.content, ...content } } : s
    )
  })),

  updateSectionStyles: (id, styles) => set((state) => ({
    sections: state.sections.map((s) =>
      s.id === id ? { ...s, styles: { ...s.styles, ...styles } } : s
    )
  })),

  removeSection: (id) => set((state) => ({
    sections: state.sections.filter((s) => s.id !== id),
    selectedSectionId: state.selectedSectionId === id ? null : state.selectedSectionId
  })),

  reorderSections: (activeId, overId) => set((state) => {
    const oldIndex = state.sections.findIndex((s) => s.id === activeId);
    const newIndex = state.sections.findIndex((s) => s.id === overId);
    return {
      sections: arrayMove(state.sections, oldIndex, newIndex)
    };
  }),

  selectSection: (id) => set({ selectedSectionId: id }),
  setSections: (sections) => set({ sections })
}));
