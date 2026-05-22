import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const Search = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleImageSearch = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Convert the image URL to a File object
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

      // Create FormData and append the file
      const formData = new FormData();
      formData.append('image', file);

      // Send POST request
      console.log('[Search] POST /recommend payload ready');
      const data = await api.recommend(formData);
      console.log('Image search response:', data);

      // Transform the response data into the format expected by SearchedProducts
      const ids = data.recommended_numbers || [];
      const links = data.recommended_links || [];
      const products = ids.map((id, index) => ({
        id: id,
        link: links[index],
        productDisplayName: `Similar Product ${index + 1}`,
        articleType: "Similar Item",
        baseColour: "N/A",
        gender: "Unisex",
        masterCategory: "Apparel",
        season: "All Seasons",
        subCategory: "Similar",
        usage: "Casual",
        year: 2024
      }));

      // Navigate to search results with the transformed data
      navigate('/search-results', { 
        state: { 
          products: products,
          query: 'Similar Products Based on Image'
        } 
      });
      onClose();
    } catch (error) {
      console.error('Image search error:', error);
      setError(error.message || 'Image search failed. Please check backend and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsLoading(true);
      try {
        const payload = {
          articleType: searchQuery.trim().toLowerCase()
        };
        console.log('[Search] POST /get_data', payload);
        const data = await api.getData(payload);
        console.log('Search response data:', data); // Debug log

        // Navigate to search results with the response data
        navigate('/search-results', { 
          state: { 
            products: data,
            query: searchQuery 
          } 
        });
        onClose();
      } catch (error) {
        console.error('Search error:', error);
        setError(error.message || 'Search failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Update the datalist with common article types
  const commonArticleTypes = [
    "watch", "dresses", "jackets", "sweaters", "pants", "skirts", "bags"
  ];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
      {/* Backdrop */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${isOpen ? 'opacity-50' : 'opacity-0'}`} onClick={onClose}></div>
      
      {/* Search Box */}
      <div className="relative w-3/5 h-3/5 max-w-none px-7 py-10 bg-white rounded-lg shadow-lg z-10 overflow-y-auto">
        <button className="absolute top-4 right-4 text-4xl cursor-pointer text-black hover:text-red-500" onClick={onClose}>
          ×
        </button>

        {/* Search Bar with Icon */}
        <form onSubmit={handleSearch}>
          <div className="flex items-center border-b-2 border-black relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              autoFocus
              className="w-full p-4 text-2xl bg-transparent outline-none pr-12"
              list="article-types"
            />
            {/* Datalist for article type suggestions */}
            <datalist id="article-types">
              {commonArticleTypes.map((type, index) => (
                <option key={index} value={type} />
              ))}
            </datalist>
            <button 
              type="submit" 
              className="absolute right-4 top-1/2 transform -translate-y-1/2"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="text-gray-500 cursor-pointer hover:text-gray-950"
                >
                  <path
                    d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="my-8 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Image Search Section */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer block"
            >
              {selectedImage ? (
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Selected product"
                    className="max-h-64 mx-auto rounded-lg object-contain"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 p-1 bg-black rounded-full text-white hover:bg-gray-800"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path
                        d="M18 6L6 18M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="text-gray-600">
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <button
            onClick={handleImageSearch}
            disabled={!selectedImage || isLoading}
            className={`w-full py-3 px-6 rounded-lg text-white font-medium ${
              isLoading || !selectedImage
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-black hover:bg-gray-800'
            } transition-colors duration-200`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </span>
            ) : (
              'Find Similar Products'
            )}
          </button>
        </div>

        {/* Quick Search Section */}
        <div className="flex items-center justify-center gap-4 font-normal mt-8">
          <p>Quick Search:</p>
          <ul className="flex list-none p-0 m-0">
            <li className="mr-4 cursor-pointer hover:underline">Jackets</li>
            <li className="mr-4 cursor-pointer hover:underline">Shirts</li>
            <li className="mr-4 cursor-pointer hover:underline">Tops</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Search;