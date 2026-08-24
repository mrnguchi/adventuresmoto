"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { heroSlides } from "@/data/hero-slides";
import { HeroSlideImage } from "./hero-slide-image";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

const AUTOPLAY_DELAY = 3000;

export function HeroSlider() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [playing, setPlaying] = useState(true);
  const touchStart = useRef<number | null>(null);

  const goToSlide = useCallback((index: number) => {
    setActiveSlide((index + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    if (!playing) return;

    const timer = window.setTimeout(() => {
      goToSlide(activeSlide + 1);
    }, AUTOPLAY_DELAY);

    return () => window.clearTimeout(timer);
  }, [activeSlide, goToSlide, playing]);

  function finishSwipe(clientX: number) {
    if (touchStart.current === null) return;

    const distance = clientX - touchStart.current;
    touchStart.current = null;

    if (Math.abs(distance) < 50) return;
    goToSlide(distance > 0 ? activeSlide - 1 : activeSlide + 1);
  }

  return (
    <section className="hero-section" aria-label="Featured promotions">
      <div className="site-container">
        <div
          className="hero-slider"
          role="region"
          aria-label="Adventures Moto promotion slider"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") goToSlide(activeSlide - 1);
            if (event.key === "ArrowRight") goToSlide(activeSlide + 1);
          }}
          onTouchStart={(event) => {
            touchStart.current = event.touches[0].clientX;
          }}
          onTouchEnd={(event) => finishSwipe(event.changedTouches[0].clientX)}
        >
          <div className="slider-viewport">
            <div
              className="slider-track"
              style={{ transform: `translate3d(-${activeSlide * 100}%, 0, 0)` }}
              aria-live={playing ? "off" : "polite"}
            >
              {heroSlides.map((slide, index) => (
                <Link
                  className="slider-slide"
                  href={slide.href}
                  key={slide.id}
                  aria-label={slide.linkLabel}
                  aria-hidden={index !== activeSlide}
                  tabIndex={index === activeSlide ? 0 : -1}
                >
                  <HeroSlideImage slide={slide} priority={index === 0} />
                </Link>
              ))}
            </div>
          </div>

          <button
            className="slider-arrow slider-prev"
            type="button"
            onClick={() => goToSlide(activeSlide - 1)}
            aria-label="Previous promotion"
          >
            <ChevronLeftIcon />
          </button>
          <button
            className="slider-arrow slider-next"
            type="button"
            onClick={() => goToSlide(activeSlide + 1)}
            aria-label="Next promotion"
          >
            <ChevronRightIcon />
          </button>

          <div className="slider-controls">
            <button
              className="slider-toggle"
              type="button"
              onClick={() => setPlaying((current) => !current)}
              aria-label={playing ? "Pause slider" : "Play slider"}
            >
              <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
            </button>
            <div className="slider-dots" aria-label="Choose promotion">
              {heroSlides.map((slide, index) => (
                <button
                  className={index === activeSlide ? "is-active" : ""}
                  type="button"
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  aria-label={`Show promotion ${index + 1}`}
                  aria-current={index === activeSlide ? "true" : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
