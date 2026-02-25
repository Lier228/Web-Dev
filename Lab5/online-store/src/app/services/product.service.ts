import { Injectable } from '@angular/core';
import { Category } from '../models/category.model';
import { Product } from '../models/product.model';
import { CATEGORIES, PRODUCTS } from '../data/product.data';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly categories: Category[] = CATEGORIES;
  private readonly products: Product[] = PRODUCTS;

  getCategories(): Category[] {
    return this.categories.map((c) => ({ ...c }));
  }

  getProductsByCategory(categoryId: number): Product[] {
    return this.products
      .filter((p) => p.categoryId === categoryId)
      .map((p) => ({ ...p }));
  }
}


