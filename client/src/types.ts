export interface BarberShop {
  id: string;
  name: string;
  salon_name?: string;
  address: string;
  city: string;
  rating: number;
  image: string;
  cover_image?: string;
  isPopular: boolean;
  bio?: string;
  phone?: string;
  website?: string;
  total_reviews?: number;
  barber_name?: string;
  created_at?: string;
  is_favourited?: boolean;
}

export interface BarberDetail extends BarberShop {
  services: Service[];
  products: Product[];
  opening_hours: OpeningHour[];
}

export interface OpeningHour {
  day_of_week: string;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
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
  category?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  details?: string;
  duration_minutes?: number;
  time_taken?: string;
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