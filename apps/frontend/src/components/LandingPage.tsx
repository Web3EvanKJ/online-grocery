// components/LandingPage.tsx
import { SearchHeader } from "@/components/find/SearchHeader";
import { ProductCard } from "@/components/ProductCard"; // Adjust import path as needed

// Mock API function - replace with your actual API call
async function getFeaturedProducts() {
  // This would be your actual API call
  // const res = await fetch('https://your-api.com/products/featured');
  // return res.json();
  
  // Mock data for demonstration
  return [
    {
      id: "1",
      slug: "organic-bananas",
      name: "Organic Bananas",
      price: 4.99,
      originalPrice: 6.99,
      image: "/api/placeholder/300/200",
      category: "Fresh Produce",
      discount: 29,
      discountInputType: "percentage",
      isb1g1: false,
      stock: 50
    },
    {
      id: "2", 
      slug: "fresh-milk",
      name: "Fresh Whole Milk",
      price: 3.49,
      originalPrice: null,
      image: "/api/placeholder/300/200",
      category: "Dairy & Eggs",
      discount: null,
      discountInputType: null,
      isb1g1: true,
      stock: 30
    },
    // Add more products as needed...
  ];
}

export async function LandingPage() {
  // Fetch products from API
  const products = await getFeaturedProducts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 flex flex-col lg:flex-row items-center justify-between min-h-[80vh]">
        <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Fresh Groceries
            <span className="text-green-600 block">Delivered to You</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            Get the freshest produce, dairy, and pantry essentials delivered straight to your doorstep. 
            Quality you can trust, convenience you'll love.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl">
              <a href="/find">Start Shopping Now</a>
            </button>

          </div>
        </div>
        
        <div className="lg:w-1/2 flex justify-center">
          <div className="relative w-full max-w-lg">
            <div className="absolute -top-4 -left-4 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-8 -right-4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <img 
                src="/api/placeholder/400/300" 
                alt="Fresh Groceries"
                className="rounded-lg w-full h-64 object-cover"
              />
              <div className="mt-6 text-center">
                <h3 className="text-2xl font-bold text-gray-900">Farm Fresh Quality</h3>
                <p className="text-gray-600 mt-2">Direct from local farms to your kitchen</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose Grocify?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🚚",
                title: "Fast Delivery",
                description: "Get your groceries delivered in under 2 hours"
              },
              {
                icon: "🌟",
                title: "Quality Guaranteed",
                description: "Fresh produce with 100% satisfaction guarantee"
              },
              {
                icon: "💰",
                title: "Best Prices",
                description: "Competitive prices with regular discounts and offers"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our popular and fresh items
            </p>
          </div>
          
          {/* Search Header */}
          <div className="max-w-4xl mx-auto mb-16">
            <SearchHeader />
          </div>

          {/* Product Cards */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-6">
              {products.map((product) => (
                <ProductCard 
                  key={product.id}
                  slug={product.slug}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice || undefined}
                  image={product.image}
                  category={product.category}
                  discount={product.discount || undefined}
                  discountInputType={product.discountInputType || undefined}
                  isb1g1={product.isb1g1}
                  stock={product.stock}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No Product.</p>
          )}

          {/* View All Button */}
          <div className="text-center mt-12">
            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl">
              <a href="/find">View All Products</a>
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-green-100 text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us for their daily grocery needs.
          </p>
          <button className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
            <a href="/auth">Create Your Account</a>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Grocify</h3>
          <p className="text-gray-400 mb-8">Fresh groceries, delivered fresh.</p>
          <div className="flex justify-center space-x-6 text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">About</a>
          </div>
        </div>
      </footer>
    </div>
  );
}