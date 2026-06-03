import confetti from "canvas-confetti";

/** Official "Basic Cannon" preset from the canvas-confetti demo. */
export function fireBasicCannon() {
  return confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    disableForReducedMotion: true,
  });
}
