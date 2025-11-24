import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import Navbar from './components/Navbar.jsx';
import BottomNav from './components/BottomNav.jsx';
import CustomerHome from './components/CustomerHome.jsx';
import SellerHome from './components/SellerHome.jsx';
import Search from './components/Search.jsx';
import SearchedProducts from './components/SearchedProducts.jsx';
import Cart from './components/Cart';
import Chatbot from './components/Chatbot.jsx';
import AnomalyDetection from './components/AnomalyDetection.jsx';

const App = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const handleSearchOpen = () => {
    setIsSearchOpen(true);
  }

  const handleSearchClose = () => {
    setIsSearchOpen(false);
  }

  const addToCart = (product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, quantity) => {
    setCartItems(prev =>
      quantity === 0
        ? prev.filter(item => item.id !== id)
        : prev.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
    );
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleChatToggle = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col min-h-screen">
          <Navbar 
            cartItemsCount={cartItems.length} 
            onChatToggle={handleChatToggle} 
          />
          <main className="flex-grow pt-16 pb-24 md:pb-16">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/seller" element={<SellerHome />} />
              <Route path="/women" element={<CustomerHome />} />
              <Route path="/men" element={<CustomerHome />} />
              <Route path="/kids" element={<CustomerHome />} />
              <Route path="/baby" element={<CustomerHome />} />
              <Route path="/cart" element={<Cart cartItems={cartItems} updateQuantity={updateQuantity} removeFromCart={removeFromCart} />} />
              <Route path="/search-results" element={<SearchedProducts addToCart={addToCart} />} />
              <Route path="/anomaly-detection" element={<AnomalyDetection />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
          <Search isOpen={isSearchOpen} onClose={handleSearchClose} />
          <BottomNav onSearchOpen={handleSearchOpen} />
          <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;