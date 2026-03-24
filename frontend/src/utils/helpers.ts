/**
 * Utility for combining class names conditionally
 * Similar to `classnames` or `clsx` but lightweight
 */

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes
    .filter((c): c is string => typeof c === 'string' && c.length > 0)
    .join(' ');
}

/**
 * Format a date to readable string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Format score with color coding
 */
export function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-400';
  if (score >= 6) return 'text-blue-400';
  if (score >= 4) return 'text-yellow-400';
  return 'text-red-400';
}

/**
 * Get recommendation color
 */
export function getRecommendationColor(recommendation: string): string {
  if (recommendation.includes('STRONG')) return 'bg-green-400/10 border-green-400';
  if (recommendation.includes('HIRE')) return 'bg-blue-400/10 border-blue-400';
  if (recommendation.includes('MAYBE')) return 'bg-yellow-400/10 border-yellow-400';
  return 'bg-red-400/10 border-red-400';
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}
