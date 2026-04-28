// components/RippleButton.tsx
// A button that creates a water-drop ripple effect on click.
// Usage: <RippleButton onClick={...} className="btn-primary">Click me</RippleButton>

'use client'
// 'use client' is required for any component that uses browser APIs
// or React hooks like useState, useEffect, onClick handlers.
// Without it, Next.js tries to render it on the server — no browser = no click events.

import { useRef } from 'react'

interface RippleButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export default function RippleButton({
  children,
  onClick,
  className = '',
  type = 'button',
  disabled = false
}: RippleButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)
  // useRef gives us a direct reference to the DOM element
  // so we can read its position for the ripple calculation

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    const btn = btnRef.current
    if (!btn) return

    // Calculate where the click happened relative to the button
    const rect = btn.getBoundingClientRect()
    // getBoundingClientRect() gives the button's position on screen

    const size = Math.max(rect.width, rect.height)
    // The ripple circle needs to be big enough to cover the whole button

    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top  - size / 2
    // These calculations center the ripple circle on where you clicked

    // Create the ripple element
    const ripple = document.createElement('span')
    ripple.className = 'ripple-effect'
    ripple.style.width  = `${size}px`
    ripple.style.height = `${size}px`
    ripple.style.left   = `${x}px`
    ripple.style.top    = `${y}px`

    btn.appendChild(ripple)
    // After the animation finishes (600ms), remove the element
    setTimeout(() => ripple.remove(), 600)

    onClick?.()
    // onClick?.() = call onClick only if it was provided (the ? is safe call)
  }

  return (
    <button
      ref={btnRef}
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`relative overflow-hidden ${className} 
                  disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}