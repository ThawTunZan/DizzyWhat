let x = 100, y = 100; // Initial position
let vx = 0, vy = 0;   // Velocity

const mainText = document.getElementById('mainText');

// Set up boundaries (adjust as needed)
const minX = 0, minY = 0;
const maxX = window.innerWidth - 200; // 200 is approx. text width
const maxY = window.innerHeight - 100; // 100 is approx. text height

window.electronAPI.onMotionData((event, msg) => {
  console.log('Raw message:', msg);
  try {
    const { ax, ay } = JSON.parse(msg);
    console.log('Received motion:', ax, ay);

    // Simple physics: acceleration affects velocity, velocity affects position
    // You may need to invert ax/ay depending on your phone orientation
    vx += ax * 0.5; // Tweak multiplier for sensitivity
    vy += -ay * 0.5; // Negative because device y is usually inverted

    // Apply friction to slow down over time
    vx *= 0.98;
    vy *= 0.98;

    x += vx;
    y += vy;

    // Clamp to window bounds
    x = Math.max(minX, Math.min(maxX, x));
    y = Math.max(minY, Math.min(maxY, y));

    mainText.style.position = 'absolute';
    mainText.style.left = `${x}px`;
    mainText.style.top = `${y}px`;
  } catch (e) {
    console.error('JSON parse error:', e, msg);
  }
});
