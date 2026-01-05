"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const ImageZoom = ({ src, alt, width = 500, height = 500 }) => {
  const [backgroundPosition, setBackgroundPosition] = useState("0% 0%");
  const [showZoom, setShowZoom] = useState(false);
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;

    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;

    setBackgroundPosition(`${x}% ${y}%`);
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current || !showZoom) return;

    const touch = e.touches[0];
    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();

    let x = ((touch.pageX - left - window.scrollX) / width) * 100;
    let y = ((touch.pageY - top - window.scrollY) / height) * 100;

    // Constrain to 0-100 to avoid "panning" out of image bounds too much
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    setBackgroundPosition(`${x}% ${y}%`);
  };

  const toggleZoom = () => {
    setShowZoom(!showZoom);
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden cursor-zoom-in rounded-lg bg-white w-full h-full flex items-center justify-center p-4"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setShowZoom(true)}
      onMouseLeave={() => setShowZoom(false)}
      onClick={toggleZoom}
      onTouchMove={handleTouchMove}
    >
      <div
        className={`relative w-full h-full transition-opacity duration-300 ${
          showZoom ? "opacity-0" : "opacity-100"
        }`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {showZoom && (
        <div
          className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-300"
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: backgroundPosition,
            backgroundSize: "200%", // Zoom level
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
    </div>
  );
};

export default ImageZoom;
