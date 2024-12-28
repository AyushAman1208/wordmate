import React, { useState, useEffect } from 'react';

const SequentialWordsDisplay = ({ words, interval = 1000, triggerEvent = true }: { words: string[], interval?: number, triggerEvent?: boolean }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showWords, setShowWords] = useState(false);

  useEffect(() => {
    if (!triggerEvent || !words || words.length === 0) return;

    setCurrentWordIndex(0); // Reset to the first word on each trigger
    setShowWords(true);

    const timer = setInterval(() => {
      setCurrentWordIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex < words.length) {
          return nextIndex;
        } else {
          clearInterval(timer);
          return prevIndex;
        }
      });
    }, interval);

    const hideTimer = setTimeout(() => {
      setShowWords(false);
    }, interval * words.length);

    return () => {
      clearInterval(timer);
      clearTimeout(hideTimer);
    };
  }, [triggerEvent, words, interval]);

  return (
    <div className='text-center text-2xl fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-700 text-bold'>
      {showWords && currentWordIndex < words.length && (
        <div>
          <div className="flex justify-center items-center h-[10%] bg-white">
      <h1 className="text-6xl font-extrabold text-center bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 text-transparent bg-clip-text p-2">
        {words[currentWordIndex]}
      </h1>
    </div>
        </div>
        
      )}
    </div>
  );
};

export default SequentialWordsDisplay;
