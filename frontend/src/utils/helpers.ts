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
 * Format score with color coding (light theme — 4.5:1+ on white)
 */
export function getScoreColor(score: number): string {
  if (score >= 8) return 'text-emerald-600';
  if (score >= 6) return 'text-blue-600';
  if (score >= 4) return 'text-amber-500';
  return 'text-rose-500';
}

/**
 * Score bar gradient classes
 */
export function getScoreBarColor(score: number): string {
  if (score >= 8) return 'from-emerald-400 to-teal-400';
  if (score >= 6) return 'from-blue-400 to-cyan-400';
  if (score >= 4) return 'from-amber-400 to-orange-400';
  return 'from-rose-400 to-red-400';
}

/**
 * Get recommendation color
 */
export function getRecommendationColor(recommendation: string): string {
  if (recommendation.includes('STRONG')) return 'bg-emerald-50 border-emerald-300';
  if (recommendation.includes('HIRE')) return 'bg-blue-50 border-blue-300';
  if (recommendation.includes('MAYBE')) return 'bg-amber-50 border-amber-300';
  return 'bg-rose-50 border-rose-300';
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}