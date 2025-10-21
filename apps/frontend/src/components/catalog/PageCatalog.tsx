import { ProductGrid } from './ProductGrid';

type Product = {
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  discount?: number; // optional
  stock?: boolean; // optional
  distance?: number; // optional
};

const mockProducts: Product[] = [
  {
    name: 'Kratingdaeng Minuman Energi Botol 150 ml',
    price: 6700,
    originalPrice: 7500,
    image: '/images/kratingdaeng.png',
    category: 'Minuman Energi',
    discount: 11,
  },
  {
    name: 'Minute Maid Pulpy Orange 350 ml',
    price: 6300,
    image: '/images/minutemaid.png',
    category: 'Minuman Ringan',
  },
  {
    name: 'ABC Minuman Kopi Susu 200 ml',
    price: 3800,
    originalPrice: 4700,
    image: '/images/abckopi.png',
    category: 'Kopi',
    discount: 19,
  },
  {
    name: 'Indomie Mi Instan Ayam Bawang 69 g',
    price: 3200,
    image: '/images/indomie-ayam.png',
    category: 'Mi Instan',
  },
  {
    name: 'Coca-Cola Original 1.5 L',
    price: 16100,
    image: '/images/cocacola.png',
    category: 'Minuman Karbonasi',
    stock: false,
  },
];

export default function PageCatalog() {
  return (
    <main className="min-h-screen py-10">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-6 text-center text-3xl font-bold text-blue-700">
          Daftar Produk
        </h1>
        <ProductGrid data={mockProducts} />
      </div>
    </main>
  );
}
