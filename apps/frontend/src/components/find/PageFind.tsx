import { ProductCard } from '../ProductCard';

type Product = {
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  discount?: number;
  distance?: number;
};

const mockProducts: Product[] = [
  {
    name: 'Aqua Air Mineral Botol 330 ml',
    price: 3060,
    originalPrice: 3400,
    discount: 10,
    image: '/images/aqua330.png',
    category: 'Air Mineral',
    distance: 0.8,
  },
  {
    name: 'Aqua Air Mineral Botol 600 ml',
    price: 3600,
    originalPrice: 4000,
    discount: 10,
    image: '/images/aqua600.png',
    category: 'Air Mineral',
    distance: 1.2,
  },
  {
    name: 'Aqua Air Mineral Botol 1.5 L',
    price: 6900,
    image: '/images/aqua1500.png',
    category: 'Air Mineral',
    distance: 1.8,
  },
  {
    name: 'Aqua Galon Air Mineral (Kosong) 19 L',
    price: 33000,
    image: '/images/aquagalon.png',
    category: 'Galon',
    distance: 2.3,
  },
  {
    name: 'Aqua Air Mineral Cube 220 ml Karton',
    price: 33600,
    image: '/images/aquacube.png',
    category: 'Air Mineral',
    distance: 0.9,
  },
];

export default function PageFind() {
  return (
    <main className="min-h-screen bg-blue-50 px-5 py-10 md:px-15">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-1 text-xl font-semibold text-gray-700">
          Hasil Pencarian untuk <span className="text-blue-700">"aqua"</span>
        </h2>
        <p className="mb-6 text-gray-500">
          Menampilkan {mockProducts.length} produk
        </p>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5">
          {mockProducts.map((p, i) => (
            <ProductCard key={i} {...p} />
          ))}
        </div>
      </div>
    </main>
  );
}
