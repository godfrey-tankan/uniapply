
import React, { useEffect, useRef, useState } from 'react';

const ScrollReveal = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  threshold = 0.1,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const currentRef = ref.current;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (currentRef) observer.unobserve(currentRef);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0';
    if (direction === 'none') return 'animate-fade-in';
    if (direction === 'up') return 'animate-fade-in';
    if (direction === 'left') return 'animate-fade-in-left';
    if (direction === 'right') return 'animate-fade-in-right';
    return 'animate-fade-in';
  };

  const getTransformClass = () => {
    if (isVisible) return '';
    if (direction === 'none') return '';
    if (direction === 'up') return 'translate-y-10';
    if (direction === 'down') return '-translate-y-10';
    if (direction === 'left') return 'translate-x-10';
    if (direction === 'right') return '-translate-x-10';
    return '';
  };

  const combinedClasses = `transition-all duration-700 ${getAnimationClass()} ${getTransformClass()} ${className}`;

  return (
    <div
      ref={ref}
      className={combinedClasses}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
