import { Component } from '@angular/core';
import { ProductListComponent } from './components/product-list/product-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ProductListComponent],
  template: '<app-product-list></app-product-list>'
})

export class RootComponent {} // Переименовали AppComponent -> RootComponent