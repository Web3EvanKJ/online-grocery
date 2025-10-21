import { ProductCard } from '../ProductCard';

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

export function ProductGrid({ data }: { data: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5">
      {data.map((product, index) => (
        <ProductCard key={index} {...product} />
      ))}
    </div>
  );
}
