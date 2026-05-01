const palette = ['#4F46E5', '#0891B2', '#059669', '#DC2626', '#F59E0B', '#8B5CF6', '#10B981', '#EC4899'];

export function stableColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % palette.length;
  return palette[index];
}
