export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId: number;
  stockQuantity: number;
  imageUrl: string;
  bestseller?: boolean;
  sellerId?: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface ProductFilter {
  category?: string;
  price_gte?: number;
  price_lte?: number;
  _sort?: string;
  _order?: 'asc' | 'desc';
  q?: string;
  bestseller?: boolean;
}
