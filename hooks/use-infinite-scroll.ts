import { useState, useEffect, useCallback } from 'react';

export const useInfiniteScroll = (callback: () => void) => {
  const [isFetching, setIsFetching] = useState(false);

  const handleScroll = useCallback(() => {
    // Check if user is near the edge of the page
    const nearLeft = window.scrollX < 100;
    const nearRight = window.scrollX + window.innerWidth > document.documentElement.scrollWidth - 100;
    
    if ((nearLeft || nearRight) && !isFetching) {
      setIsFetching(true);
      callback();
    }
  }, [callback, isFetching]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (isFetching) {
      // Simulate API call
      setTimeout(() => {
        setIsFetching(false);
      }, 1000);
    }
  }, [isFetching]);

  return [isFetching, setIsFetching] as const;
};