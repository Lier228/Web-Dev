import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductItemComponent {
  @Input() product!: Product;
  @Output() delete = new EventEmitter<number>();

  selectedImageIndex: number = 0;

  setMainImage(index: number): void {
    this.selectedImageIndex = index;
  }

  onLike(): void {
    this.product.likes += 1;
  }

  onDelete(): void {
    const confirmed = confirm('Удалить этот товар из списка?');
    if (confirmed) {
      this.delete.emit(this.product.id);
    }
  }

  shareOnWhatsApp() {
    const message = encodeURIComponent(`Посмотри, что я нашел на Kaspi: ${this.product.name} - ${this.product.link}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  }

  shareOnTelegram() {
    const url = encodeURIComponent(this.product.link);
    const text = encodeURIComponent(this.product.name);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  }
}