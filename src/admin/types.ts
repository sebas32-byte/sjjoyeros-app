export type AdminUser = {
  id: string;
  email?: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  created_at?: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  category?: string | null;
  category_id?: string | null;
  description?: string | null;
  short_description?: string | null;
  price?: number | null;
  stock?: number | null;
  available?: boolean | null;
  featured?: boolean | null;
  image?: string | null;
  images?: string[] | null;
  material?: string | null;
  weight?: string | null;
  family?: string | null;
  subcategory?: string | null;
  reference?: string | null;
  sales_count?: number | null;
  created_at?: string;
};

export type OrderStatus = 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export type Order = {
  id: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  items?: Array<{ name?: string; quantity?: number; price?: number }> | null;
  total?: number | null;
  status?: OrderStatus | null;
  created_at?: string;
  notes?: string | null;
};
