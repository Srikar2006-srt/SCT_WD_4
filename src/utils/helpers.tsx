import React from 'react';

// Quotes database for Feature #38
export const MOTIVATIONAL_QUOTES = [
  "Focus on being productive instead of busy.",
  "Your mind is for having ideas, not holding them.",
  "Done is better than perfect.",
  "The secret of getting ahead is getting started.",
  "Simplicity is the ultimate sophistication.",
  "Great things are done by a series of small things brought together.",
  "Action is the foundational key to all success.",
  "Do it now. Sometimes 'later' becomes 'never'.",
  "There is no traffic jam along the extra mile.",
  "Determine your priorities and focus on them."
];

export function getMotivationalQuote(): string {
  const day = new Date().getDate();
  return MOTIVATIONAL_QUOTES[day % MOTIVATIONAL_QUOTES.length];
}

// Search result text highlighting (Feature #51)
export function highlightText(text: string, search: string): React.ReactNode {
  if (!search.trim()) return text;
  
  const regex = new RegExp(`(${escapeRegExp(search)})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-500/30 text-yellow-300 px-0.5 rounded font-medium border-b border-yellow-500/50">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Date checks for Filtering (Features #26, #28)
export function isToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  const today = new Date();
  const date = new Date(dateStr);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function isThisWeek(dateStr?: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  
  // Reset time to start of day
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() - now.getDay() + 6); // Saturday
  
  return d >= startOfWeek && d <= endOfWeek;
}

export function isOverdue(dateStr?: string, completed: boolean = false): boolean {
  if (!dateStr || completed) return false;
  const d = new Date(dateStr + 'T23:59:59'); // end of due day
  const now = new Date();
  return d < now;
}

// Pure Canvas Confetti System (Feature #16, #60, Animation #16)
interface ConfettiParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export function launchConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
  canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

  const particles: ConfettiParticle[] = [];
  const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height + 20, // Shoot from the bottom center or scatter around
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * 15,
      speedY: -Math.random() * 12 - 10,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    });
  }

  let animationFrameId: number;

  function updateAndDraw() {
    ctx!.clearRect(0, 0, canvas.width, canvas.height);

    let active = false;

    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.speedY += 0.25; // gravity
      p.speedX *= 0.98; // friction
      p.rotation += p.rotationSpeed;
      
      if (p.y > canvas.height - 100 && p.speedY > 0) {
        p.opacity -= 0.02;
      }

      if (p.opacity > 0 && p.y < canvas.height + 50 && p.x > -50 && p.x < canvas.width + 50) {
        active = true;
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate((p.rotation * Math.PI) / 180);
        ctx!.globalAlpha = p.opacity;
        ctx!.fillStyle = p.color;
        
        // Draw square or triangle
        if (Math.random() > 0.5) {
          ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          ctx!.beginPath();
          ctx!.moveTo(0, -p.size / 2);
          ctx!.lineTo(p.size / 2, p.size / 2);
          ctx!.lineTo(-p.size / 2, p.size / 2);
          ctx!.closePath();
          ctx!.fill();
        }
        
        ctx!.restore();
      }
    });

    if (active) {
      animationFrameId = requestAnimationFrame(updateAndDraw);
    } else {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  updateAndDraw();
}
