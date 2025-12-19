'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image'; // 1. Import komponen Image

const HeroBackgroundSlider = () => {
  const originalImages = [
    '/images/herobg/pura.avif',
    '/images/herobg/candi.avif',
    '/images/herobg/gunung.avif',
    '/images/herobg/komodo.avif'
  ];

  const images = [...originalImages, originalImages[0]];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const timeoutRef = useRef(null);

  const ANIMATION_DURATION = 1000; 
  const SLIDE_INTERVAL = 5000;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
      setIsTransitioning(true);
    }, SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentIndex === images.length - 1) {
      timeoutRef.current = setTimeout(() => {
        setIsTransitioning(false); 
        setCurrentIndex(0);        
      }, ANIMATION_DURATION);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, images.length]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-900">
      <div 
        className="flex w-full h-full"
        style={{ 
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning ? `transform ${ANIMATION_DURATION}ms ease-in-out` : 'none'
        }}
      >
        {images.map((img, idx) => (
          // Penting: Parent harus relative agar props 'fill' bekerja
          <div 
            key={idx} 
            className="w-full h-full shrink-0 relative"
          >
            <Image 
              src={img} 
              alt={`Slide ${idx === images.length - 1 ? 1 : idx + 1}`} 
              fill // Menggantikan width/height manual, otomatis mengisi parent
              className="object-cover" // CSS class agar gambar ter-crop rapi
              sizes="100vw" // Memberi hint ke browser bahwa ini gambar full-width
              priority={idx === 0} // Optimasi loading untuk gambar pertama saja
            />
            {/* Overlay tetap menggunakan absolute inset-0 */}
            <div className="absolute inset-0 bg-black/35 z-10" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroBackgroundSlider;