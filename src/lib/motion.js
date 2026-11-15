import { animate } from 'animejs'
import { gsap } from 'gsap'

/**
 * Checks whether the user has requested reduced motion in their system preferences.
 */
export function isReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Quick tactile bounce micro-interaction for chips, pills, and checkboxes.
 * Uses anime.js v4 (1 -> 0.96 -> 1, ~150ms).
 */
export function triggerBounce(element) {
  if (!element || isReducedMotion()) return
  try {
    animate(element, {
      scale: [1, 0.96, 1],
      duration: 150,
      ease: 'inOutQuad',
    })
  } catch (err) {
    // Fallback if element is not animatable
    console.debug('triggerBounce animation skipped:', err)
  }
}

/**
 * Staggered entrance animation using GSAP (0.06s stagger, 0.4s duration, power2.out).
 */
export function animateStaggerEntrance(elements, options = {}) {
  if (!elements || (Array.isArray(elements) && elements.length === 0) || isReducedMotion()) {
    if (elements) {
      gsap.set(elements, { opacity: 1, y: 0 })
    }
    return
  }

  return gsap.fromTo(
    elements,
    { opacity: 0, y: options.y ?? 12 },
    {
      opacity: 1,
      y: 0,
      duration: options.duration ?? 0.4,
      stagger: options.stagger ?? 0.06,
      ease: options.ease ?? 'power2.out',
      delay: options.delay ?? 0,
    }
  )
}
