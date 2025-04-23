import React, { useState, useEffect } from "react";
import TiltedCard from "./TiltedCard";

interface CarouselItem {
    imageSrc: string;
    altText: string;
    captionText: string;
    url: string;
}

interface DaisyCarouselProps {
    items: CarouselItem[];
    autoPlay?: boolean;
    autoPlayInterval?: number;
}

const DaisyCarouselEnhanced: React.FC<DaisyCarouselProps> = ({
    items,
    autoPlay = true,
    autoPlayInterval = 5000
}) => {
    const [currentSlide, setCurrentSlide] = useState(1);

    // Auto-play functionality
    useEffect(() => {
        if (!autoPlay) return;

        const interval = setInterval(() => {
            const nextSlide = currentSlide === items.length ? 1 : currentSlide + 1;
            setCurrentSlide(nextSlide);
            // Programmatically scroll to the next slide
            const element = document.getElementById(`slide${nextSlide}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [currentSlide, autoPlay, autoPlayInterval, items.length]);

    // Update currentSlide when user clicks navigation buttons
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash.startsWith('#slide')) {
                const slideNumber = parseInt(hash.replace('#slide', ''));
                if (!isNaN(slideNumber) && slideNumber >= 1 && slideNumber <= items.length) {
                    setCurrentSlide(slideNumber);
                }
            }
        };

        // Initial check
        handleHashChange();

        // Add event listener
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [items.length]);

    return (
        <div className="flex flex-col items-center justify-center w-full">
            {/* Wrapper pour centrer le carousel */}
            <div className="w-full max-w-4xl mx-auto">
                <div className="carousel w-full">
                    {items.map((item, index) => (
                        <div
                            id={`slide${index + 1}`}
                            key={index}
                            className="carousel-item relative w-full"
                        >
                            <div className="w-full flex justify-center items-center py-4">
                                <div className="max-w-md mx-auto">
                                    <TiltedCard
                                        imageSrc={item.imageSrc}
                                        altText={item.altText}
                                        captionText={item.captionText}
                                        url={item.url}
                                    />
                                </div>
                            </div>
                            <div className="absolute left-3 right-3 top-1/2 flex -translate-y-1/2 transform justify-between">
                                <a
                                    href={`#slide${index === 0 ? items.length : index}`}
                                    className="btn btn-circle bg-red-500 text-yellow-300 shadow-md hover:bg-yellow-300 hover:text-red-500 border-none"
                                >
                                    ❮
                                </a>
                                <a
                                    href={`#slide${index === items.length - 1 ? 1 : index + 2}`}
                                    className="btn btn-circle bg-yellow-300 text-red-500 shadow-md hover:bg-red-500 hover:text-yellow-300 border-none"
                                >
                                    ❯
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Indicateurs de position (dots) */}
            <div className="flex justify-center w-full py-2 gap-2 mt-2">
                {items.map((_, index) => (
                    <a
                        key={index}
                        href={`#slide${index + 1}`}
                        className={`btn btn-md rounded-full ${currentSlide === index + 1 ? 'bg-yellow-300 text-red-500' : 'bg-red-500 text-yellow-300'} shadow-md hover:bg-yellow-300 hover:text-red-500 border-none`}
                    >
                        {index + 1}
                    </a>
                ))}
            </div>
        </div>
    );
};

export default DaisyCarouselEnhanced;