export interface BarberShop {
  id: string;
  name: string;
  address: string;
  city: string;
  rating: number;
  image: string;
  isPopular: boolean;
}

export interface TabItem {
  id: string;
  label: string;
}

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  image: string;
  details?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  details?: string;
}

export interface Booking {
  id: string;
  barberName: string;
  address: string;
  city: string;
  date: string;
  time?: string;
  price?: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  image: string;
}