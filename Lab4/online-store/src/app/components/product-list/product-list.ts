import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../product-card/product-card';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})


export class ProductListComponent {
  products: Product[] = [
  {
    id: 1,
    name: 'Смартфон Apple iPhone 15 128Gb черный',
    description: 'Флагманский смартфон с титановым корпусом и мощным процессором A17 Pro.',
    price: 407144,
    rating: 4.7,
    image: 'https://resources.cdn-kaspi.kz/img/m/p/h1d/hfc/86303745998878.jpg?format=gallery-medium',
    images: [
      'https://resources.cdn-kaspi.kz/img/m/p/h1d/hfc/86303745998878.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/h65/h81/86275143532574.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/h6d/h89/86275143565342.jpg?format=gallery-medium  '
    ],
    link: 'https://kaspi.kz/shop/p/apple-iphone-15-128gb-chernyi-113137790/'
  },

  {
    id: 2,
    name: 'Ноутбук Apple MacBook Air 13 2020 13.3" / 8 Гб / SSD 256 Гб / macOS / MGN63RU/A',
    description: 'Технология True Tone. Глаз отдыхает и радуется. MacBook Air автоматически подстраивает баланс белого под окружающее освещение, чтобы изображение на экране выглядело более естественно.',
    price: 439940,
    rating: 4.9,
    image: 'https://resources.cdn-kaspi.kz/img/m/p/h06/h08/64213171568670.jpg?format=gallery-medium',
    images: [
      'https://resources.cdn-kaspi.kz/img/m/p/h06/h08/64213171568670.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/h2d/h82/83648592183326.png?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/h3a/h0d/64213216755742.jpg?format=gallery-medium'
    ],
    link: 'https://kaspi.kz/shop/p/apple-macbook-air-13-2020-13-3-8-gb-ssd-256-gb-macos-mgn63ru-a-101182724/'
  },

  {
    id: 3,
    name: 'Смарт-часы Apple Watch Series 11 M/L 46 мм черный',
    description: 'Apple Watch Series 11 — стильные и функциональные умные часы для активной жизни, сочетающие передовые технологии и элегантный дизайн.',
    price: 217550,
    rating: 5.0,
    image: 'https://resources.cdn-kaspi.kz/img/m/p/p89/pba/64468961.png?format=gallery-medium',
    images: [
      'https://resources.cdn-kaspi.kz/img/m/p/p89/pba/64468961.png?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/p6d/pba/64468962.png?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/p50/pba/64468963.png?format=gallery-medium'
    ],
    link: 'https://kaspi.kz/shop/p/apple-watch-series-11-m-l-46-mm-chernyi-145555823/'
  },

  {
    id: 4,
    name: 'Ноутбук Apple MacBook Air 13 2020 13.3" / 8 Гб / SSD 256 Гб / macOS / MGN63RU/A',
    description: 'Игровой ноутбук Thunderobot 911S Core D JT009K00F — 15.6-дюймовая модель с IPS-матрицей и разрешением 1920х1080 пикселей. Отличается высокой частотой обновления — достигает 144 Гц. Матовое покрытие экрана уменьшает количество бликов, обеспечивая комфортные условия для глаз.',
    price: 496984,
    rating: 4.75,
    image: 'https://resources.cdn-kaspi.kz/img/m/p/h76/h6c/85301691547678.jpg?format=gallery-medium',
    images: [
      'https://resources.cdn-kaspi.kz/img/m/p/h76/h6c/85301691547678.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/ha4/hf8/85301691613214.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/h98/hae/85301691744286.jpg?format=gallery-medium'
    ],
    link: 'https://kaspi.kz/shop/p/thunderobot-911s-core-d-15-6-16-gb-ssd-512-gb-bez-os-jt009k00f-117046774/'
  },
  {
    id: 5,
    name: 'Смарт-часы Samsung Galaxy Watch Ultra 2025 47 мм синий-синий',
    description: 'Samsung Galaxy Watch Ultra 2025 47 мм — флагманские умные часы с широким функционалом и премиальным дизайном.',
    price: 188990,
    rating: 4.81,
    image: 'https://resources.cdn-kaspi.kz/img/m/p/pf5/pcc/54616772.png?format=gallery-medium',
    images: [
      'https://resources.cdn-kaspi.kz/img/m/p/pf5/pcc/54616772.png?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/p11/pcd/54616773.png?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/p82/pcd/54616777.png?format=gallery-medium'
    ],
    link: 'https://kaspi.kz/shop/p/samsung-galaxy-watch-ultra-2025-47-mm-sinii-sinii-142950203/?c=750000000'
  }
];
}