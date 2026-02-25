export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  likes: number;
  categoryId: number;
  image: string;
  images: string[];
  link: string;
}