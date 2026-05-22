const tints = [
  "hsl(350 60% 92% / 0.78)", // pale rose
  "hsl(20 50% 92% / 0.7)",   // peach
  "hsl(var(--pearl) / 0.78)",
  "hsl(120 18% 88% / 0.55)", // soft moss
];

const petals = Array.from({ length: 32 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  delay: `${(index * 0.73) % 11}s`,
  speed: `${10 + (index % 7)}s`,
  drift: `${index % 2 === 0 ? 1 : -1}${24 + (index % 5) * 18}px`,
  size: `${7 + (index % 5) * 3}px`,
  tint: tints[index % tints.length],
}));

export const Petals = () => (
  <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden="true">
    {petals.map((petal) => (
      <span
        key={petal.id}
        className="absolute -top-8 block rounded-[70%_20%_70%_20%] animate-petal"
        style={{
          left: petal.left,
          width: petal.size,
          height: `calc(${petal.size} * 1.45)`,
          animationDelay: petal.delay,
          background: petal.tint,
          boxShadow: `0 0 14px ${petal.tint}`,
          ['--fall-speed' as string]: petal.speed,
          ['--drift' as string]: petal.drift,
        }}
      />
    ))}
  </div>
);