"use client";

import React, { useState, useRef, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends ImageProps {
  fallback?: string;
  wrapperClassName?: string;
  enableBlur?: boolean;
  lazy?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className,
  wrapperClassName,
  fallback = "/images/placeholder.jpg",
  enableBlur = true,
  lazy = true,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setCurrentSrc(src);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px", // Start loading 50px before the image comes into view
      }
    );

    const img = imgRef.current;
    if (img) {
      observer.observe(img);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazy, priority, src]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Don't render the actual image if lazy loading and not yet in view
  if (lazy && !priority && currentSrc !== src) {
    return (
      <div
        ref={imgRef}
        className={cn("bg-muted animate-shimmer", wrapperClassName, className)}
        style={{
          aspectRatio:
            props.width && props.height
              ? `${props.width}/${props.height}`
              : undefined,
        }}
      />
    );
  }

  return (
    <div className={cn("relative overflow-hidden", wrapperClassName)}>
      {isLoading && enableBlur && (
        <div
          className={cn("absolute inset-0 bg-muted animate-shimmer", className)}
        />
      )}

      {!hasError ? (
        <Image
          src={currentSrc}
          alt={alt}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          placeholder={enableBlur ? "blur" : undefined}
          blurDataURL={
            enableBlur
              ? "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"
              : undefined
          }
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          {...props}
        />
      ) : (
        <Image
          src={fallback}
          alt={alt || "Image not available"}
          className={cn("opacity-50", className)}
          {...props}
        />
      )}
    </div>
  );
}

// Avatar component with lazy loading
export function Avatar({
  src,
  alt,
  size = 40,
  className,
  fallbackText,
}: {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
  fallbackText?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const [showFallback, setShowFallback] = useState(!src);

  const handleError = () => {
    setHasError(true);
    setShowFallback(true);
  };

  if (showFallback || hasError) {
    return (
      <div
        className={cn(
          "relative inline-flex items-center justify-center bg-muted text-muted-foreground font-medium rounded-full",
          className
        )}
        style={{ width: size, height: size }}
      >
        {fallbackText ? (
          <span style={{ fontSize: size * 0.4 }}>
            {fallbackText
              .split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </span>
        ) : (
          <svg className="h-1/2 w-1/2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-full", className)}>
      <OptimizedImage
        src={src!}
        alt={alt || "Avatar"}
        width={size}
        height={size}
        className="object-cover"
        onError={handleError}
      />
    </div>
  );
}

// Picture component for responsive images with multiple sources
export function Picture({
  sources,
  src,
  alt,
  className,
  ...props
}: {
  sources: Array<{
    srcSet: string;
    type?: string;
    media?: string;
    sizes?: string;
  }>;
  src: string;
  alt: string;
  className?: string;
} & ImageProps) {
  return (
    <picture className={cn("block", className)}>
      {sources.map((source, index) => (
        <source
          key={index}
          type={source.type}
          media={source.media}
          srcSet={source.srcSet}
          sizes={source.sizes}
        />
      ))}
      <OptimizedImage src={src} alt={alt} className={className} {...props} />
    </picture>
  );
}

// Icon component for optimized SVG icons
export function Icon({
  name,
  size = 24,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Dynamically import SVG icons
    import(`/icons/${name}.svg`)
      .then(() => {
        setIsLoaded(true);
      })
      .catch(() => {
        setHasError(true);
      });
  }, [name]);

  if (hasError) {
    return (
      <div
        className={cn("bg-muted rounded", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <img
      src={`/icons/${name}.svg`}
      alt={name}
      width={size}
      height={size}
      className={cn(
        "transition-opacity duration-200",
        isLoaded ? "opacity-100" : "opacity-0",
        className
      )}
      loading="lazy"
    />
  );
}
