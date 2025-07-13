import React, { useState, useRef, useEffect } from 'react';

const HORIZON_KEY = 'horizonBarVisible';

const HorizonBar: React.FC = () => {
  const [visible, setVisible] = useState(() => {
    const stored = localStorage.getItem(HORIZON_KEY);
    return stored === null ? true : stored === 'true';
  });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Ctrl+H to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        setVisible(v => {
          localStorage.setItem(HORIZON_KEY, String(!v));
          return !v;
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Persist state
  useEffect(() => {
    localStorage.setItem(HORIZON_KEY, String(visible));
  }, [visible]);

  // Drag logic
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      setOffset(e.clientY);
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  if (!visible) return (
    <button
      className="fixed top-2 left-2 z-50 bg-gray-800 text-white px-2 py-1 rounded opacity-80"
      onClick={() => setVisible(true)}
    >
      Show Horizon
    </button>
  );

  return (
    <div>
      <div
        ref={barRef}
        className="fixed left-0 z-50 w-full cursor-move select-none"
        style={{
          top: offset,
          height: '20px',
          background: 'linear-gradient(to bottom, #00bfff 60%, transparent 100%)',
          opacity: 0.85,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: dragging ? 'none' : 'top 0.2s',
        }}
        onMouseDown={() => setDragging(true)}
        title="Drag to adjust horizon"
      />
      <button
        className="fixed top-2 right-2 z-50 bg-gray-800 text-white px-2 py-1 rounded opacity-80"
        onClick={() => setVisible(false)}
      >
        Hide Horizon
      </button>
    </div>
  );
};

export default HorizonBar;