/**
 * Centralized icon utility functions for landing page components.
 */

import { LucideIcon } from 'lucide-react';
import {
  CheckCircle2, Zap, Shield, Rocket, Star, Heart, Globe, Clock, Award, Sparkles,
  Target, TrendingUp, Users, BarChart3, Lock, Cpu, Cloud, ArrowRight,
  UtensilsCrossed, ChefHat, Coffee, Wine, Pizza, Salad, Soup, IceCream, Cake, Cookie,
  Plane, MapPin, Compass, Mountain, Palmtree, Anchor, Ship, Car, Train, Hotel,
  Activity, Dumbbell, Apple, Leaf, Flower2, Sun, Moon, Droplets, Wind, Waves,
  Laptop, Smartphone, Monitor, Server, Database, Code, Terminal, Wifi, Settings, Wrench,
  Briefcase, Building, Building2, CreditCard, DollarSign, Receipt, FileText, Mail, Phone, Calendar,
  GraduationCap, BookOpen, Library, Lightbulb, PenTool, Pencil,
  Camera, Image, Video, Music, Palette, Brush,
  Home, Key, Gift, Package, Truck, ShoppingCart, ShoppingBag, Crown, Diamond, Gem,
} from 'lucide-react';

/**
 * Comprehensive icon mapping organized by category
 */
export const iconMap: Record<string, LucideIcon> = {
  // Basic
  check: CheckCircle2,
  zap: Zap,
  shield: Shield,
  rocket: Rocket,
  star: Star,
  heart: Heart,
  globe: Globe,
  clock: Clock,
  award: Award,
  sparkles: Sparkles,
  target: Target,
  trending: TrendingUp,
  users: Users,
  chart: BarChart3,
  lock: Lock,
  cpu: Cpu,
  cloud: Cloud,
  arrowRight: ArrowRight,

  // Food & Restaurant
  utensils: UtensilsCrossed,
  food: UtensilsCrossed,
  restaurant: UtensilsCrossed,
  chef: ChefHat,
  coffee: Coffee,
  wine: Wine,
  pizza: Pizza,
  salad: Salad,
  soup: Soup,
  icecream: IceCream,
  cake: Cake,
  cookie: Cookie,

  // Travel
  plane: Plane,
  flight: Plane,
  map: MapPin,
  location: MapPin,
  compass: Compass,
  mountain: Mountain,
  palm: Palmtree,
  beach: Palmtree,
  anchor: Anchor,
  ship: Ship,
  car: Car,
  train: Train,
  hotel: Hotel,

  // Health
  activity: Activity,
  fitness: Dumbbell,
  gym: Dumbbell,
  apple: Apple,
  leaf: Leaf,
  flower: Flower2,
  sun: Sun,
  moon: Moon,
  water: Droplets,
  wind: Wind,
  waves: Waves,

  // Technology
  laptop: Laptop,
  computer: Monitor,
  smartphone: Smartphone,
  phone: Phone,
  mobile: Smartphone,
  monitor: Monitor,
  server: Server,
  database: Database,
  code: Code,
  terminal: Terminal,
  wifi: Wifi,
  settings: Settings,
  wrench: Wrench,

  // Business
  briefcase: Briefcase,
  business: Briefcase,
  building: Building,
  office: Building2,
  card: CreditCard,
  creditcard: CreditCard,
  payment: CreditCard,
  dollar: DollarSign,
  money: DollarSign,
  receipt: Receipt,
  document: FileText,
  file: FileText,
  mail: Mail,
  email: Mail,
  calendar: Calendar,

  // Education
  graduation: GraduationCap,
  education: GraduationCap,
  book: BookOpen,
  library: Library,
  idea: Lightbulb,
  lightbulb: Lightbulb,
  pen: PenTool,
  pencil: Pencil,

  // Creativity
  camera: Camera,
  photo: Camera,
  image: Image,
  video: Video,
  music: Music,
  palette: Palette,
  art: Palette,
  brush: Brush,
  design: Brush,

  // Shopping
  cart: ShoppingCart,
  shop: ShoppingBag,
  shopping: ShoppingBag,
  gift: Gift,
  package: Package,
  delivery: Truck,
  truck: Truck,

  // Premium
  crown: Crown,
  premium: Crown,
  diamond: Diamond,
  gem: Gem,
  luxury: Diamond,

  // Home
  home: Home,
  house: Home,
  key: Key,
  security: Key,
};

/**
 * Get icon component by name
 */
export function getIcon(name: string | undefined): LucideIcon {
  if (!name) return CheckCircle2;

  const normalizedName = name.toLowerCase().replace(/[-_\s]/g, '');
  return iconMap[normalizedName] || iconMap[name] || CheckCircle2;
}

/**
 * Check if an icon name exists in the map
 */
export function hasIcon(name: string): boolean {
  const normalizedName = name.toLowerCase().replace(/[-_\s]/g, '');
  return normalizedName in iconMap || name in iconMap;
}

/**
 * Get all available icon names
 */
export function getIconNames(): string[] {
  return Object.keys(iconMap);
}

/**
 * Suggest icons based on business type
 */
export function suggestIconsForBusiness(businessType: string): string[] {
  const typeMap: Record<string, string[]> = {
    restaurant: ['utensils', 'chef', 'coffee', 'wine', 'pizza'],
    cafe: ['coffee', 'cake', 'cookie', 'heart', 'star'],
    hotel: ['hotel', 'key', 'star', 'heart', 'map'],
    travel: ['plane', 'map', 'compass', 'palm', 'camera'],
    fitness: ['dumbbell', 'activity', 'heart', 'apple', 'target'],
    spa: ['flower', 'leaf', 'water', 'sun', 'heart'],
    tech: ['laptop', 'code', 'cloud', 'cpu', 'rocket'],
    education: ['graduation', 'book', 'lightbulb', 'pencil', 'star'],
    finance: ['dollar', 'chart', 'shield', 'lock', 'briefcase'],
    ecommerce: ['cart', 'package', 'truck', 'star', 'heart'],
    realestate: ['home', 'key', 'building', 'map', 'star'],
    default: ['star', 'check', 'zap', 'rocket', 'sparkles'],
  };

  const normalizedType = businessType.toLowerCase();
  
  for (const [key, icons] of Object.entries(typeMap)) {
    if (normalizedType.includes(key) || key.includes(normalizedType)) {
      return icons;
    }
  }

  return typeMap.default;
}
