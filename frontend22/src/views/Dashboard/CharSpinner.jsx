import React, { useEffect, useState } from 'react';

const CharSpinner = () => {
  const spinnerChars = ['\\', '|', '/', '-'];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % spinnerChars.length);
    }, 150); // adjust speed here

    return () => clearInterval(interval);
  }, []);

  return (
    <span style={{ fontFamily: "'Fira Code', 'monospace'", width: '1ch'}}>
      {spinnerChars[index]}
    </span>
  );
};

export default CharSpinner;