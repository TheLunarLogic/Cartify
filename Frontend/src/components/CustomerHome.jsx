import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import BottomNav from '../components/BottomNav.jsx';
import Chatbot from '../components/Chatbot.jsx';
import { contentData } from '../products.js';

const CustomerHome = () => {
  const location = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(2);
  const [visibleThumbnails, setVisibleThumbnails] = useState([0, 1, 2]);
  const [slides, setSlides] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Determine the section based on the route
  const isWomenSection = location.pathname === '/women';
  const isMenSection = location.pathname === '/men';
  const isKidsSection = location.pathname === '/kids';
  const isBabySection = location.pathname === '/baby';

  // Fetch slides dynamically from products.js
  useEffect(() => {
    const fetchSlides = async () => {
      const data = await contentData();
      const sectionSlides = isWomenSection
        ? data.women
        : isMenSection
        ? data.men
        : isKidsSection
        ? data.kids
        : isBabySection
        ? data.baby
        : [];
      setSlides(sectionSlides);
      setCurrentSlide(0); // Reset slide on section change
      setPrevSlide(2);
      setVisibleThumbnails([0, 1, 2]);
    };

    fetchSlides();
  }, [location.pathname]);

  const handleSlideChange = (index) => {
    setPrevSlide(currentSlide);
    setCurrentSlide(index);

    const newVisibleThumbnails =
      index === 0
        ? [0, 1, 2]
        : index === slides.length - 1
        ? [slides.length - 3, slides.length - 2, slides.length - 1]
        : [index - 1, index, index + 1];

    setVisibleThumbnails(newVisibleThumbnails.filter((idx) => idx >= 0 && idx < slides.length));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentSlide + 1) % slides.length;
      handleSlideChange(nextIndex);
    }, 2000);

    return () => clearInterval(timer);
  }, [currentSlide, slides.length]);

  return (
    <div className="h-screen overflow-hidden relative">
      <Navbar cartItemsCount={0} onChatToggle={() => setIsChatOpen(!isChatOpen)} />

      <div className="relative w-full h-screen overflow-hidden">
        {/* Main Hero Background */}
        <div className="absolute inset-0 w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-all duration-1000 ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
            >
              <img 
                src={slide.image} 
                alt={slide.title} 
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center' }}
              />
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="w-120 absolute left-20 top-1/3 transform -translate-y-1/2 z-10 text-white max-w-xl">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute transition-all duration-500 ${
                currentSlide === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <h1 className="text-4xl font-bold mb-4">{slide.title}</h1>
              <p className="text-lg mb-6">{slide.description}</p>
              <button
                onClick={() => navigate('#')}
                className="px-6 py-2 rounded-lg font-semibold cursor-pointer"
                style={{ backgroundColor: slide.btnColor }}
              >
                Explore Now
              </button>
            </div>
          ))}
        </div>

        {/* Preview Thumbnails */}
        <div className="absolute left-[75%] bottom-50 transform -translate-x-1/2 flex gap-8 z-10">
          {slides
            .filter((_, index) => visibleThumbnails.includes(index))
            .map((slide, index) => (
              <div
                key={visibleThumbnails[index]}
                className={`w-[170px] h-[220px] cursor-pointer rounded-lg overflow-hidden transition-transform ${
                  visibleThumbnails[index] === currentSlide ? 'scale-120 shadow-lg border-5 border-white' : 'scale-100 opacity-60'
                }`}
                onClick={() => handleSlideChange(visibleThumbnails[index])}
              >
                <img
                  src={slide.image}
                  alt={`Preview ${visibleThumbnails[index] + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
        </div>

        {/* Navigation Dots */}
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2 flex flex-col space-y-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSlideChange(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-150' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <BottomNav />
      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default CustomerHome;