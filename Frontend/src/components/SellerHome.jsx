import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Check } from 'lucide-react';
import { getOrders, clearOrders } from '../data/OrderDetails';

const SellerHome = () => {
  const navigate = useNavigate();
  const [showPackagingPopup, setShowPackagingPopup] = useState(false);
  const [orders, setOrders] = useState([]);
  const [verifiedProducts, setVerifiedProducts] = useState(new Set());

  useEffect(() => {
    // Fetch orders when component mounts
    const fetchOrders = () => {
      const allOrders = getOrders();
      setOrders(allOrders);
    };
    fetchOrders();

    // Load verified products from localStorage
    const savedVerifiedProducts = localStorage.getItem('verifiedProducts');
    if (savedVerifiedProducts) {
      setVerifiedProducts(new Set(JSON.parse(savedVerifiedProducts)));
    }
  }, []);

  const handleSendForPackaging = () => {
    // Show success popup
    setShowPackagingPopup(true);
    
    // Clear all orders and verified products
    clearOrders();
    setOrders([]);
    setVerifiedProducts(new Set());
    localStorage.removeItem('verifiedProducts');
    
    // Hide popup and redirect to login after 2 seconds
    setTimeout(() => {
      setShowPackagingPopup(false);
      navigate('/login');
    }, 2000);
  };

  const handleImageUploadClick = (item) => {
    navigate('/anomaly-detection', { 
      state: { 
        productImage: item.link,
        productId: item.id,
        productName: item.productDisplayName
      } 
    });
  };

  // Flatten all order items into a single array
  const allOrderItems = orders.reduce((acc, order) => {
    return [...acc, ...order.items];
  }, []);

  // Check if all products are verified
  const allProductsVerified = allOrderItems.length > 0 && 
    allOrderItems.every(item => verifiedProducts.has(item.id));

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-24 overflow-y-auto h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-8">Seller Dashboard</h1>

        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-15">
          <h2 className="text-lg font-medium mb-4">Recent Orders</h2>

          {allOrderItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No orders to display</p>
          ) : (
            <>
              {/* Order Items List */}
              <div className="space-y-4 mb-6">
                {allOrderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    {/* Product Image */}
                    <div className="w-20 h-20">
                      <img
                        src={item.link}
                        alt={item.productDisplayName}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.productDisplayName}</h3>
                      <div className="mt-1 text-sm text-gray-500">
                        Quantity: {item.quantity} • Color: {item.baseColour}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {item.articleType} • {item.usage}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        Order Total: ₹{item.price * item.quantity}
                      </div>
                    </div>

                    {/* Modified Upload Image Button */}
                    <div className="flex flex-col items-center gap-2">
                      {verifiedProducts.has(item.id) ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-600">Verified</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleImageUploadClick(item)}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <Upload className="w-5 h-5" />
                          <span className="text-sm">Upload Image</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Send for Packaging Button */}
              <button
                onClick={handleSendForPackaging}
                disabled={!allProductsVerified}
                className={`w-full py-3 px-4 rounded-md transition-colors duration-200 ${
                  allProductsVerified 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Send Product for Packaging
              </button>
            </>
          )}
        </div>
      </div>

      {/* Packaging Success Popup */}
      {showPackagingPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"></div>

          {/* Popup Content */}
          <div className="relative bg-white rounded-lg p-8 max-w-sm w-full mx-4 transform transition-all">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Success Message */}
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Order Sent for Packaging!
              </h3>
              <p className="text-sm text-gray-500">
                The order has been successfully sent to the packaging department.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerHome;