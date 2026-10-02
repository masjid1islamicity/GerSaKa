import confetti from "canvas-confetti";

/**
 * Fires a targeted celebratory confetti burst for newly unlocked badges
 */
export const fireBadgeCelebrationConfetti = (originX = 0.5, originY = 0.5) => {
  // Primary colorful burst
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { x: originX, y: originY },
    colors: ["#f59e0b", "#ec4899", "#10b981", "#3b82f6", "#8b5cf6", "#fbbf24"],
    ticks: 200,
    gravity: 1.1,
    scalar: 1.1,
    shapes: ["circle", "square"]
  });

  // Secondary golden star burst after short delay
  setTimeout(() => {
    confetti({
      particleCount: 45,
      angle: 60,
      spread: 60,
      origin: { x: Math.max(0.1, originX - 0.2), y: originY },
      colors: ["#ffd700", "#ffae19", "#ffffff", "#f59e0b"],
      ticks: 250,
      scalar: 1.2
    });
    confetti({
      particleCount: 45,
      angle: 120,
      spread: 60,
      origin: { x: Math.min(0.9, originX + 0.2), y: originY },
      colors: ["#ffd700", "#ffae19", "#ffffff", "#f59e0b"],
      ticks: 250,
      scalar: 1.2
    });
  }, 120);
};

/**
 * Fires grand celebration cannons (e.g. when celebrating family streak milestone)
 */
export const fireGrandCelebration = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: ["#f59e0b", "#10b981", "#06b6d4", "#ec4899", "#8b5cf6", "#ffd700"]
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55
  });
  fire(0.2, {
    spread: 60
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 1.2
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.4
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45
  });
};
