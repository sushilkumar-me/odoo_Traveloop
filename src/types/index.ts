// Global type exports

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Trip {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  coverImage: string | null;
  isPublic: boolean;
  shareId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface City {
  id: string;
  name: string;
  country: string;
  startDate: Date;
  endDate: Date;
  order: number;
  tripId: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  date: Date;
  startTime: string | null;
  endTime: string | null;
  cost: number | null;
  currency: string;
  category: string | null;
  notes: string | null;
  order: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tripId: string;
}

export interface PackingItem {
  id: string;
  name: string;
  quantity: number;
  category: string | null;
  isPacked: boolean;
  tripId: string;
}

export interface Budget {
  id: string;
  name: string;
  totalAmount: number;
  currency: string;
  tripId: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string | null;
  date: Date;
  budgetId: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Action response types
export interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}