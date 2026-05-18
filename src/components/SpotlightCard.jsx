import { useRef } from 'react';
import './spotlight-card.css';

const SpotlightCard = ({ children, className = '', spotlightColor = 'rgba(232, 101, 43, 0.25)', ...props }) => {
  const divRef = useRef(null);

  const handleMouseMove = e => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);
    divRef.current.style.setProperty('--spotlight-color', spotlightColor);
  };

  return (
    <div ref={divRef} onMouseMove={handleMouseMove} className={`card-spotlight ${className}`} {...props}>
      {children}
    </div>
  );
};

export default SpotlightCard;
