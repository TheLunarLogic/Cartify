import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, X, Check } from 'lucide-react';

const AnomalyDetection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { productImage, productId, productName } = location.state || {};
  
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsLoading(true);
        setError(null);

        // Create preview URL
        setUploadedImage(URL.createObjectURL(file));

        // Fetch the original product image as a blob
        const originalImageResponse = await fetch(productImage);
        const originalImageBlob = await originalImageResponse.blob();

        // Create FormData
        const formData = new FormData();
        formData.append('image1', originalImageBlob, 'image1.jpg');
        formData.append('image2', file, 'image2.jpg');

        // Send to backend
        const response = await fetch('http://127.0.0.1:5000/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to process images');
        }

        const data = await response.json();
        console.log('API Response:', data);
        
        // Process similarity score
        const similarityScore = parseFloat(data.similarity_score);
        const isMatch = similarityScore >= 0.80;
        
        setResult({
          isMatch,
          score: similarityScore,
          message: isMatch 
            ? "Order Sent for Packaging"
            : "Different Product. Please Reupload the Image",
          details: `Similarity Score: ${(similarityScore * 100).toFixed(2)}%`
        });

        // If match is successful, save to localStorage and redirect after 2 seconds
        if (isMatch) {
          // Get existing verified products
          const savedVerifiedProducts = localStorage.getItem('verifiedProducts');
          const verifiedProducts = savedVerifiedProducts ? JSON.parse(savedVerifiedProducts) : [];
          
          // Add new product ID if not already present
          if (!verifiedProducts.includes(productId)) {
            verifiedProducts.push(productId);
            localStorage.setItem('verifiedProducts', JSON.stringify(verifiedProducts));
          }
          
          setTimeout(() => {
            navigate('/seller');
          }, 2000);
        }

      } catch (err) {
        console.error('Anomaly detection error:', err);
        setError(err.message || 'Failed to process images');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-24 overflow-y-auto h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Image Verification</h1>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium mb-4">
            Verify Image for: {productName}
          </h2>

          {/* Image Comparison Section */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            {/* Original Product Image */}
            <div>
              <h3 className="text-sm font-medium mb-2">Image 1 (Original)</h3>
              <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={productImage}
                  alt="Original product"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Upload Section */}
            <div>
              <h3 className="text-sm font-medium mb-2">Image 2 (Upload)</h3>
              <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
                {uploadedImage ? (
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-2 right-2 p-1 bg-black rounded-full text-white hover:bg-gray-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">
                      Click to upload image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Updated Results Section */}
          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Processing images...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.isMatch ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              {/* Success/Warning Icon */}
              <div className="flex items-center justify-center mb-4">
                <div className={`rounded-full p-2 ${
                  result.isMatch ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {result.isMatch ? (
                    <Check className="w-6 h-6 text-green-600" />
                  ) : (
                    <X className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>

              {/* Result Message */}
              <div className="text-center">
                <h3 className={`text-lg font-medium ${
                  result.isMatch ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.message}
                </h3>

                {/* Action Button */}
                {result.isMatch ? (
                  <button
                    onClick={() => navigate('/seller')}
                    className="mt-4 bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Return to Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="mt-4 bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Upload New Image
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnomalyDetection;