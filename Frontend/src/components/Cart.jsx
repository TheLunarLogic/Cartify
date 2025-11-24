import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { addOrder } from '../data/OrderDetails';

const Cart = ({ cartItems, updateQuantity, removeFromCart }) => {
  const navigate = useNavigate();
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = () => {
    // Store order details in OrderDetails.js
    const orderDetails = {
      items: cartItems.map(item => ({
        id: item.id,
        productDisplayName: item.productDisplayName,
        link: item.link,
        price: item.price,
        quantity: item.quantity,
        baseColour: item.baseColour,
        articleType: item.articleType,
        usage: item.usage,
        gender: item.gender,
        season: item.season
      })),
      totalAmount: calculateSubtotal()
    };
    
    // Add order to OrderDetails
    const order = addOrder(orderDetails);
    console.log('Order placed:', order);

    // Show success popup
    setShowSuccessPopup(true);
    
    // Hide popup and navigate after 2 seconds
    setTimeout(() => {
      setShowSuccessPopup(false);
      navigate('/women'); // Redirect to CustomerHome
      cartItems.length = 0; // Clear cart items
      updateQuantity(0); // Reset quantity
    }, 2000);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-20 pb-24 overflow-y-auto h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center gap-6">
                      {/* Product Image */}
                      <div className="w-24 h-24">
                        <img
                          src={item.link}
                          alt={item.productDisplayName}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.productDisplayName}</h3>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span>Color: {item.baseColour}</span>
                          <span className="mx-2">•</span>
                          <span>Size: {item.size || 'Standard'}</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {item.articleType} • {item.usage}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-medium">₹{item.price}</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="mt-1 text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-medium mb-4">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>₹{calculateSubtotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  className="mt-6 w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                >
                  Place Order
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"></div>

          {/* Popup Content */}
          <div className="relative bg-white rounded-lg p-8 max-w-sm w-full mx-4 transform transition-all">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                Order Placed Successfully!
              </h3>
              <p className="text-sm text-gray-500">
                Thank you for your order. Your items will be delivered soon.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart; 