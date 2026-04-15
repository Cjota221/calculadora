import type { ReactNode } from 'react'

type Variant = 'pink' | 'gold' | 'green' | 'blue'

interface ResultBoxProps {
  variant: Variant
  children: ReactNode
  className?: string
}

export function ResultBox({ variant, children, className = '' }: ResultBoxProps) {
  return (
    <div className={`result res-${variant} ${className}`}>
      {children}
    </div>
  )
}
