'use client';
import React from 'react';
import { SearchHeader } from './find/SearchHeader';

export default function LandingPage() {
  const handleShopNow = () => {
    // Add navigation logic here
    console.log('Navigate to shop');
  };

  const handleLearnMore = () => {
    // Add learn more logic here
    console.log('Learn more clicked');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-green-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Groceries Delivered
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Fresh groceries delivered to your door in hours
          </p>
          <button 
            onClick={handleShopNow}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition"
            aria-label="Start shopping"
          >
            Start Shopping
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Why Shop With Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-2xl mb-2" aria-hidden="true">🚚</div>
              <h3 className="font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">Delivery in 2 hours or less</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl mb-2" aria-hidden="true">💰</div>
              <h3 className="font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600 text-sm">Price match guarantee</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl mb-2" aria-hidden="true">✅</div>
              <h3 className="font-semibold mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600 text-sm">Freshness guaranteed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Find Your Favorite Products
          </h2>
          {/* Use the SearchHeader component */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <SearchHeader/>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="mb-6">
            Join thousands of happy customers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleShopNow}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
              aria-label="Shop now"
            >
              Shop Now
            </button>
            <button 
              onClick={handleLearnMore}
              className="border border-white text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition"
              aria-label="Learn more about our service"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}