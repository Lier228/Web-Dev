import { Category } from '../models/category.model';
import { Product } from '../models/product.model';

export const CATEGORIES: Category[] = [
  { id: 1, name: 'Smartphones' },
  { id: 2, name: 'Laptops' },
  { id: 3, name: 'Smartwatches' },
  { id: 4, name: 'Tablets' }
];

export const PRODUCTS: Product[] = [
  // ================= СМАРТФОНЫ (Категория 1: 5 штук) =================
  {
    id: 1,
    categoryId: 1,
    name: 'Смартфон Apple iPhone 15 128Gb черный',
    description: 'Флагманский смартфон с титановым корпусом и мощным процессором A17 Pro.',
    price: 407144,
    rating: 4.7,
    likes: 0,
    image: 'https://images.weserv.nl/?url=resources.cdn-kaspi.kz/img/m/p/h1d/hfc/86303745998878.jpg',
    images: [
      'https://images.weserv.nl/?url=resources.cdn-kaspi.kz/img/m/p/h1d/hfc/86303745998878.jpg',
      'https://images.weserv.nl/?url=resources.cdn-kaspi.kz/img/m/p/h65/h81/86275143532574.jpg',
      'https://images.weserv.nl/?url=resources.cdn-kaspi.kz/img/m/p/h6d/h89/86275143565342.jpg'
    ],
    link: 'https://kaspi.kz/shop/p/apple-iphone-15-128gb-chernyi-113137790/'
  },
  {
    id: 2,
    categoryId: 1,
    name: 'Смартфон Apple iPhone 14 Pro 128Gb черный',
    description: 'Оснащен керамическим экраном и бионическим чипом А16. Влаго- и пылезащита уровня IP68 и потрясающий дисплей Super Retina XDR.',
    price: 551000,
    rating: 4.9,
    likes: 0,
    image: 'https://resources.cdn-kaspi.kz/img/m/p/h5e/h13/64437812232222.jpg?format=gallery-medium',
    images: [
      'https://resources.cdn-kaspi.kz/img/m/p/h5e/h13/64437812232222.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/h3f/h67/64437818130462.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/hda/hcc/64437821112350.jpg?format=gallery-medium'
    ],
    link: 'https://kaspi.kz/shop/p/apple-iphone-14-pro-128gb-nanosim-esim-chernyi-106363245/?c=750000000'
  },
  {
    id: 3,
    categoryId: 1,
    name: 'Смартфон Apple iPhone 14 Pro Max 128Gb черный',
    description: 'Имеет обновленную камеру с 48-мегапиксельной матрицей и увеличенный 6.7-дюймовый дисплей.',
    price: 615000,
    rating: 5.0,
    likes: 0,
    image: 'https://resources.cdn-kaspi.kz/img/m/p/hb7/haf/64503528718366.jpg?format=gallery-medium',
    images: [
      'https://resources.cdn-kaspi.kz/img/m/p/hb7/haf/64503528718366.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/h2c/h37/64503531143198.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/hfb/ha1/64503535927326.jpg?format=gallery-medium'
    ],
    link: 'https://kaspi.kz/shop/p/apple-iphone-14-pro-max-128gb-nanosim-esim-chernyi-106363270/?c=750000000'
  },
  {
    id: 4,
    categoryId: 1,
    name: 'Смартфон Apple iPhone 14 Pro 128Gb серебристый',
    description: 'Стильный серебристый цвет. Чип А16, дисплей 6.1” с технологией адаптивной частоты обновления до 120 Гц.',
    price: 567000,
    rating: 4.8,
    likes: 0,
    image: 'https://resources.cdn-kaspi.kz/img/m/p/h48/hd6/64503551131678.jpg?format=gallery-medium',
    images: [
      'https://resources.cdn-kaspi.kz/img/m/p/h48/hd6/64503551131678.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/h00/hc1/64503553949726.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/hfa/h50/64503557652510.jpg?format=gallery-medium'
    ],
    link: 'https://kaspi.kz/shop/p/apple-iphone-14-pro-128gb-nanosim-esim-serebristyi-106363274/?c=750000000'
  },
  {
    id: 5,
    categoryId: 1,
    name: 'Смартфон Apple iPhone 13 Pro 128Gb серый',
    description: 'Дисплей 6.1 дюйма Super Retina XDR с технологией ProMotion. Система камер Pro 12 Мп и чип A15 Bionic.',
    price: 485000,
    rating: 4.7,
    likes: 0,
    image: 'https://resources.cdn-kaspi.kz/img/m/p/h64/h7c/64006394249246.jpg?format=gallery-medium',
    images: [
      'https://resources.cdn-kaspi.kz/img/m/p/h64/h7c/64006394249246.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/h91/h9c/64006396084254.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/hd3/hf9/64006401884190.jpg?format=gallery-medium'
    ],
    link: 'https://kaspi.kz/shop/p/apple-iphone-13-pro-128gb-nanosim-esim-seryi-102298759/?c=750000000'
  },

  // ================= НОУТБУКИ (Категория 2: 5 штук) =================
  {
    id: 6,
    categoryId: 2,
    name: 'Ноутбук Apple MacBook Air 13 2020 8 Гб / 256 Гб SSD',
    description: 'Легкий и мощный ноутбук на чипе Apple M1 с отличной автономностью.',
    price: 439940,
    rating: 4.9,
    likes: 0,
    image: 'https://images.weserv.nl/?url=resources.cdn-kaspi.kz/img/m/p/h06/h08/64213171568670.jpg',
    images: [
      'https://images.weserv.nl/?url=resources.cdn-kaspi.kz/img/m/p/h06/h08/64213171568670.jpg',
      'https://images.weserv.nl/?url=resources.cdn-kaspi.kz/img/m/p/h3a/h0d/64213216755742.jpg'
    ],
    link: 'https://kaspi.kz/shop/p/apple-macbook-air-13-2020-13-3-8-gb-ssd-256-gb-macos-mgn63ru-a-101182724/'
  },
  {
    id: 7,
    categoryId: 2,
    name: 'Игровой ноутбук Thunderobot 911S Core D 15.6" 16 Гб / 512 Гб',
    description: 'Игровой ноутбук с экраном 144 Гц и видеокартой для современных игр.',
    price: 496984,
    rating: 4.7,
    likes: 0,
    image: 'https://images.weserv.nl/?url=resources.cdn-kaspi.kz/img/m/p/h76/h6c/85301691547678.jpg',
    images: [
      'https://images.weserv.nl/?url=resources.cdn-kaspi.kz/img/m/p/h76/h6c/85301691547678.jpg'
    ],
    link: 'https://kaspi.kz/shop/p/thunderobot-911s-core-d-15-6-16-gb-ssd-512-gb-bez-os-jt009k00f-117046774/'
  },
  {
    id: 8,
    categoryId: 2,
    name: 'Ноутбук Acer Aspire 3 15.6" 8 Гб / SSD 256 Гб / Win 11 Pro',
    description: 'Отличное решение для работы и учебы (модель 2025 года). Оснащен 8 ГБ оперативной памяти, быстрым NVME SSD и предустановленной Windows 11 Pro.',
    price: 139990,
    rating: 4.8,
    likes: 0,
    image: 'https://resources.cdn-kaspi.kz/img/m/p/p24/pae/30100209.jpeg?format=gallery-medium',
    images: [
      'https://resources.cdn-kaspi.kz/img/m/p/p24/pae/30100209.jpeg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/p62/p4f/30100210.png?format=gallery-medium'
    ],
    link: 'https://kaspi.kz/shop/p/acer-aspire-3-15-6-8-gb-ssd-256-gb-win-11-pro-a325-45-zn-n01si-03k--136300221/?c=750000000'
  },
  {
    id: 9,
    categoryId: 2,
    name: 'Ноутбук Apple MacBook Pro 16 2021 16.2" / 32 Гб / 512 Гб SSD',
    description: 'Мощный профессиональный ноутбук с потрясающим дисплеем Liquid Retina XDR и 32 ГБ объединенной памяти для самых ресурсоемких задач.',
    price: 1350000,
    rating: 5.0,
    likes: 0,
    image: 'https://resources.cdn-kaspi.kz/img/m/p/pc1/p7c/36863341.jpg?format=gallery-medium',
    images: [
      'https://resources.cdn-kaspi.kz/img/m/p/pc1/p7c/36863341.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/pf9/p7c/36863343.jpg?format=gallery-medium'
    ],
    link: 'https://kaspi.kz/shop/p/apple-macbook-pro-16-2021-16-2-32-gb-ssd-512-gb-macos-z14v0008d-138158355/?c=750000000'
  },
  {
    id: 10,
    categoryId: 2,
    name: 'Ноутбук Apple MacBook Air 13 2025 13.6" / 16 Гб / 256 Гб SSD',
    description: 'Свежий и сверхтонкий MacBook Air. Теперь в базовой комплектации идет 16 ГБ оперативной памяти для идеальной многозадачности.',
    price: 549990,
    rating: 4.9,
    likes: 0,
    image: 'https://resources.cdn-kaspi.kz/img/m/p/pab/pc3/35723922.jpg?format=gallery-medium',
    images: [
      'https://resources.cdn-kaspi.kz/img/m/p/pab/pc3/35723922.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/p3a/pc3/35723926.jpg?format=gallery-medium'
    ],
    link: 'https://kaspi.kz/shop/p/apple-macbook-air-13-2025-16-gb-ssd-256-gb-macos-mw123-137582956/?c=750000000'
  },

  // ================= СМАРТ-ЧАСЫ (Категория 3: 5 штук) =================
  {
    id: 11,
    categoryId: 3,
    name: 'Смарт-часы Apple Watch Series 11 M/L 46 мм черный',
    description: 'Стильные и функциональные умные часы Apple для активного образа жизни.',
    price: 217550,
    rating: 5.0,
    likes: 0,
    image: 'https://images.weserv.nl/?url=resources.cdn-kaspi.kz/img/m/p/p89/pba/64468961.png',
    images: [
      'https://images.weserv.nl/?url=resources.cdn-kaspi.kz/img/m/p/p89/pba/64468961.png'
    ],
    link: 'https://kaspi.kz/shop/p/apple-watch-series-11-m-l-46-mm-chernyi-145555823/'
  },
  {
    id: 12,
    categoryId: 3,
    name: 'Смарт-часы Samsung Galaxy Watch Ultra 2025 47 мм синий',
    description: 'Флагманские умные часы Samsung с расширенными спортивными режимами.',
    price: 188990,
    rating: 4.8,
    likes: 0,
    image: 'https://images.weserv.nl/?url=resources.cdn-kaspi.kz/img/m/p/pf5/pcc/54616772.png',
    images: [
      'https://images.weserv.nl/?url=resources.cdn-kaspi.kz/img/m/p/pf5/pcc/54616772.png'
    ],
    link: 'https://kaspi.kz/shop/p/samsung-galaxy-watch-ultra-2025-47-mm-sinii-sinii-142950203/'
  },
  {
    id: 13,
    categoryId: 3,
    name: 'Смарт-часы Apple Watch SE 2nd Gen 44 мм черный',
    description: 'Доступные умные часы Apple с основными функциями отслеживания активности.',
    price: 129990,
    rating: 4.8,
    likes: 0,
    image: 'https://resources.cdn-kaspi.kz/img/m/p/p00/p18/7079036.png?format=gallery-medium',
    images: [
      'https://resources.cdn-kaspi.kz/img/m/p/p00/p18/7079036.png?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/p1c/p18/7079037.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/p55/p18/7079039.png?format=gallery-medium'
    ],
    link: 'https://kaspi.kz/shop/p/apple-watch-se-gps-gen-2-2024-s-m-40-mm-chernyi-chernyi-129672957/?c=750000000'
  },
  {
    id: 14,
    categoryId: 3,
    name: 'Смарт-часы Samsung Galaxy Watch6 44 мм графит',
    description: 'Умные часы с тонким безелем и расширенным мониторингом здоровья и сна.',
    price: 119990,
    rating: 4.7,
    likes: 0,
    image: 'https://resources.cdn-kaspi.kz/img/m/p/h76/h31/82569351266334.jpg?format=gallery-medium',
    images: [
      'https://resources.cdn-kaspi.kz/img/m/p/h76/h31/82569351266334.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/hb6/hc3/82569351299102.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/hd6/haf/82569351331870.jpg?format=gallery-medium'
    ],
    link: 'https://kaspi.kz/shop/p/samsung-galaxy-watch6-44-mm-grafitovyi-chernyi-112368202/'
  },
  {
    id: 15,
    categoryId: 3,
    name: 'Смарт-часы Xiaomi Redmi Watch 4 серебристый',
    description: 'Легкие и стильные смарт-часы с ярким экраном и длительной автономной работой.',
    price: 15990,
    rating: 4.6,
    likes: 0,
    image: 'https://resources.cdn-kaspi.kz/img/m/p/h9a/hd1/87197782016030.jpg?format=gallery-medium',
    images: [
      'https://resources.cdn-kaspi.kz/img/m/p/h9a/hd1/87197782016030.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/h71/hfa/87197782081566.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/hae/h9c/87197782147102.jpg?format=gallery-medium'
    ],
    link: 'https://kaspi.kz/shop/p/xiaomi-redmi-watch-5-active-51-mm-serebristyi-seryi-123879450/'
  },

  // ================= ПЛАНШЕТЫ (Категория 4: 5 штук) =================
  {
    id: 16,
    categoryId: 4,
    name: 'Планшет Apple iPad A16 11 2025 Wi-Fi 6 Гб / 128 Гб серебристый',
    description: 'Новейший iPad 2025 года с чипом A16, потрясающим 11-дюймовым экраном и мощной батареей.',
    price: 349990,
    rating: 5.0,
    likes: 0,
    image: 'https://resources.cdn-kaspi.kz/img/m/p/pef/pe8/37011887.png?format=gallery-medium',
    images: [
      'https://resources.cdn-kaspi.kz/img/m/p/pef/pe8/37011887.png?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/p85/pe5/37011897.png?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/p69/pe5/37011898.png?format=gallery-medium'
    ],
    link: 'https://kaspi.kz/shop/p/apple-ipad-a16-11-2025-wi-fi-11-djuim-6-gb-128-gb-serebristyi-138199634/?c=750000000'
  },
  {
    id: 17,
    categoryId: 4,
    name: 'Планшет Apple iPad A16 11 2025 Wi-Fi 6 Гб / 128 Гб синий',
    description: 'Свежая модель iPad 2025 года в стильном синем цвете. Идеально для учебы, работы и творчества.',
    price: 349990,
    rating: 5.0,
    likes: 0,
    image: 'https://resources.cdn-kaspi.kz/img/m/p/p23/p2d/37019409.png?format=gallery-medium',
    images: [
      'https://resources.cdn-kaspi.kz/img/m/p/p23/p2d/37019409.png?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/pb7/p12/37019481.png?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/p7e/p12/37019483.png?format=gallery-medium'
    ],
    link: 'https://kaspi.kz/shop/p/apple-ipad-a16-11-2025-wi-fi-11-djuim-6-gb-128-gb-sinii-138202165/?c=750000000'
  },
  {
    id: 18,
    categoryId: 4,
    name: 'Планшет Apple iPad A16 11 2025 Wi-Fi 6 Гб / 128 Гб розовый',
    description: 'Классический iPad 11 дюймов 2025 года с процессором A16 Bionic в нежном розовом цвете.',
    price: 349990,
    rating: 5.0,
    likes: 0,
    image: 'https://resources.cdn-kaspi.kz/img/m/p/pce/p96/37011919.png?format=gallery-medium',
    images: [
      'https://resources.cdn-kaspi.kz/img/m/p/pce/p96/37011919.png?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/pad/p8c/37011948.png?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/p91/p8c/37011949.png?format=gallery-medium'
    ],
    link: 'https://kaspi.kz/shop/p/apple-ipad-a16-11-2025-wi-fi-11-djuim-6-gb-128-gb-rozovyi-138199640/?c=750000000'
  },
  {
    id: 19,
    categoryId: 4,
    name: 'Планшет Xiaomi Redmi Pad 2 4G 11" 8 Гб / 256 Гб серый',
    description: 'Отличный мультимедийный планшет с поддержкой 4G, 8 ГБ оперативки и большим экраном для видео и игр.',
    price: 119990,
    rating: 4.8,
    likes: 0,
    image: 'https://resources.cdn-kaspi.kz/img/m/p/p34/pcd/81439931.jpg?format=gallery-medium',
    images: [
      'https://resources.cdn-kaspi.kz/img/m/p/p34/pcd/81439931.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/pbd/p9b/46318883.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/pa0/p9b/46318884.jpg?format=gallery-medium'
    ],
    link: 'https://kaspi.kz/shop/p/xiaomi-redmi-pad-2-4g-11-djuim-8-gb-256-gb-seryi-140640417/?c=750000000'
  },
  {
    id: 20,
    categoryId: 4,
    name: 'Планшет Samsung Galaxy Tab S9 FE Wi-Fi 10.9" 6 Гб / 128 Гб серый',
    description: 'Качественный Android-планшет от Samsung с поддержкой стилуса S Pen и защитой от воды IP68.',
    price: 219990,
    rating: 4.9,
    likes: 0,
    image: 'https://resources.cdn-kaspi.kz/img/m/p/h02/h6e/82770436030494.jpg?format=gallery-medium',
    images: [
      'https://resources.cdn-kaspi.kz/img/m/p/h02/h6e/82770436030494.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/hb3/h78/82770436423710.jpg?format=gallery-medium',
      'https://resources.cdn-kaspi.kz/img/m/p/hde/h76/82770436784158.jpg?format=gallery-medium'
    ],
    link: 'https://kaspi.kz/shop/p/samsung-galaxy-tab-s9-sm-x716bzaas-11-djuim-8-gb-128-gb-grafit-112488621/?c=750000000'
  }
];