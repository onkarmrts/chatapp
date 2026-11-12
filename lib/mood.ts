// Every room gets its own colour mood, derived from the room id.
export function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function moodColors(seed: string) {
  const h = hash(seed);
  const hue = h % 360;
  const hue2 = (hue + 40 + ((h >>> 9) % 60)) % 360;
  return {
    from: `hsl(${hue2} 75% 11%)`,
    to: `hsl(${hue} 70% 24%)`,
    tint: `hsl(${hue} 85% 72%)`,
  };
}

export function moodGradient(seed: string): string {
  const { from, to } = moodColors(seed);
  const angle = (hash(seed) >>> 3) % 360;
  return `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`;
}
