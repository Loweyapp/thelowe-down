import {
  LayoutDashboard, List, Tag, Plus, Upload,
  UtensilsCrossed, Car, ShoppingBag, Film, Heart, Zap, Smartphone, Package,
  Coffee, Bus, ShoppingCart, Music, Activity, Home, CreditCard,
  Plane, Dumbbell, GraduationCap, Gift, Gamepad2, Book, Leaf, Wine,
  Banknote, PiggyBank, TrendingUp,
} from 'lucide-react';

export const VERSION = 'v1.2.0';

export const C = {
  primary:    '#0ABFA3',
  sidebar:    '#1C2333',
  bg:         '#F4F7F9',
  card:       '#FFFFFF',
  border:     '#E8ECF0',
  text:       '#1C2333',
  muted:      '#6B7280',
  income:     '#22C55E',
  expense:    '#EF4444',
  investment: '#8B5CF6',
  saving:     '#3B82F6',
};

export const TYPE_COLOR = {
  income:     C.income,
  expense:    C.expense,
  saving:     C.saving,
  investment: C.investment,
};

export const NAV = [
  { id: 'dashboard',  label: 'Dashboard',  Icon: LayoutDashboard },
  { id: 'summary',    label: 'Summary',    Icon: List },
  { id: 'categories', label: 'Categories', Icon: Tag },
  { id: 'add',        label: 'Add',        Icon: Plus },
  { id: 'import',     label: 'Import',     Icon: Upload },
];

// Icons available in the category picker
export const ICON_OPTS = [
  'UtensilsCrossed', 'Coffee', 'Car', 'Bus', 'ShoppingBag', 'ShoppingCart',
  'Film', 'Gamepad2', 'Music', 'Heart', 'Activity', 'Dumbbell',
  'Home', 'Zap', 'Smartphone', 'CreditCard', 'Plane', 'GraduationCap',
  'Gift', 'Book', 'Leaf', 'Wine', 'Package', 'Tag',
];

// Full icon map including system icons used in transaction rows
export const ICON_MAP = {
  UtensilsCrossed, Coffee, Car, Bus, ShoppingBag, ShoppingCart,
  Film, Gamepad2, Music, Heart, Activity, Dumbbell,
  Home, Zap, Smartphone, CreditCard, Plane, GraduationCap,
  Gift, Book, Leaf, Wine, Package, Tag,
  Banknote, PiggyBank, TrendingUp,
};

export const ACCOUNTS = ['Alex', 'Kelly'];

export const DEFAULT_CATS = [
  { name: 'Groceries',         icon: 'ShoppingCart',    color: '#F97316', budget: 400 },
  { name: 'Dining Out',        icon: 'UtensilsCrossed', color: '#FB923C', budget: 200 },
  { name: 'Transport',         icon: 'Bus',             color: '#3B82F6', budget: 150 },
  { name: 'Car',               icon: 'Car',             color: '#1D4ED8', budget: 100 },
  { name: 'Shopping',          icon: 'ShoppingBag',     color: '#EC4899', budget: 200 },
  { name: 'Entertainment',     icon: 'Film',            color: '#8B5CF6', budget: 100 },
  { name: 'Health & Medical',  icon: 'Heart',           color: '#22C55E', budget:  80 },
  { name: 'Holiday & Travel',  icon: 'Plane',           color: '#06B6D4', budget: 200 },
  { name: 'Home & Garden',     icon: 'Leaf',            color: '#84CC16', budget: 100 },
  { name: 'Bills & Utilities', icon: 'Zap',             color: '#EF4444', budget: 400 },
  { name: 'Subscriptions',     icon: 'Smartphone',      color: '#0ABFA3', budget:  80 },
  { name: 'Other',             icon: 'Package',         color: '#6B7280', budget: 100 },
];

export const COLOR_OPTS = [
  '#F97316', '#3B82F6', '#EC4899', '#8B5CF6', '#22C55E',
  '#EF4444', '#0ABFA3', '#6B7280', '#F59E0B', '#06B6D4', '#84CC16', '#F43F5E',
];

export const TX_TYPES = [
  { id: 'expense',    label: 'Expense',    color: C.expense    },
  { id: 'income',     label: 'Income',     color: C.income     },
  { id: 'saving',     label: 'Saving',     color: C.saving     },
  { id: 'investment', label: 'Investment', color: C.investment },
];

export const RANGES = [
  { label: '30D', days: 30    },
  { label: '3M',  days: 90   },
  { label: '6M',  days: 180  },
  { label: '1Y',  days: 365  },
  { label: 'All', days: Infinity },
];

export const gbp      = n => `£${Math.abs(n).toFixed(2)}`;
export const mkKey    = d => d.slice(0, 7);
export const todayStr = () => new Date().toISOString().slice(0, 10);
export const mkLabel  = k => {
  const [y, m] = k.split('-');
  return new Date(+y, +m - 1, 1).toLocaleString('en-GB', { month: 'short', year: 'numeric' });
};
