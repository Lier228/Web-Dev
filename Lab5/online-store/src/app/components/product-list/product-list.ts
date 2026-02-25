import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductItemComponent } from '../product-card/product-card';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductItemComponent],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductListComponent {
  @Input() categoryName = '';

  private _products: Product[] = [];

  @Input() set products(value: Product[] | null) {
    this._products = value ? [...value] : [];
  }

  get products(): Product[] {
    return this._products;
  }

  handleProductDelete(productId: number): void {
    this._products = this._products.filter((p) => p.id !== productId);
  }
}