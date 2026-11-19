export type Category =
  | "Hambúrguer"
  | "Pizza"
  | "Japonesa"
  | "Saudável"
  | "Brasileira"
  | "Italiana"
  | "Doces"
  | "Mexicana";
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  section: string;
}
export interface Restaurant {
  id: string;
  name: string;
  category: Category;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  deliveryMin: number;
  deliveryMax: number;
  deliveryFee: number;
  averagePrice: number;
  minimumOrder: number;
  distanceKm: number;
  tags: string[];
  dietaryOptions: string[];
  featured: boolean;
  products: Product[];
}
