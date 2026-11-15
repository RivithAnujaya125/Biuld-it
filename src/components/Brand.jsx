/**
 * Brand wordmark — transparent text-only logo matching the login page
 * `.logo` style (Sora light, wide tracking). No icon box, no background.
 */
export default function Brand({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  }
  return (
    <span
      className={`brand-wordmark ${sizes[size] ?? sizes.md} ${className}`}
      aria-label="Biuld-it home"
    >
      Biuld-it
    </span>
  )
}
