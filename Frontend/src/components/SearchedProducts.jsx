import React from 'react';
import { useLocation } from 'react-router-dom';

const SearchedProducts = ({ addToCart }) => {
  const location = useLocation();
  const { products = [], query = '' } = location.state || {};

  // Sample product data (replace with actual data)
  const sampleProducts = [
    {
      articleType: "Tshirts",
      baseColour: "Grey",
      gender: "Men",
      id: 550,
      link: "http://assets.myntassets.com/v1/images/style/properties/Puma-Men-Grey-T-shirt_32668f8a61454d0cc028a808cf21b383_images.jpg",
      masterCategory: "Apparel",
      productDisplayName: "Puma Men Grey T-shirt",
      season: "Summer",
      subCategory: "Topwear",
      usage: "Casual",
      year: 2012.0
    }
    // Add more sample products as needed
  ];

  // Use products prop if provided, otherwise use sample data
  const displayProducts = products || sampleProducts;

  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      quantity: 1,
      price: product.id // Using id as price for demo
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-24 overflow-y-auto h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Results Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Search Results for "{query}"
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {displayProducts.length} products found
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {displayProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              {/* Product Image */}
              <div className="relative aspect-w-3 aspect-h-4">
                <img
                  src={product.link}
                  alt={product.productDisplayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x400?text=Image+Not+Found';
                  }}
                />
                {/* Season Tag */}
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black text-white">
                    {product.season}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {product.productDisplayName}
                </h3>
                
                <div className="mt-1 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {product.gender}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {product.baseColour}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {product.articleType} • {product.usage}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {"₹" + product.id}
                  </span>
                </div>

                {/* View Details Button */}
                <button 
                  onClick={() => handleAddToCart(product)}
                  className="mt-3 w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors duration-200 text-sm font-medium cursor-pointer"
                >
                  Add To Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {displayProducts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchedProducts; 