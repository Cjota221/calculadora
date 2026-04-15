import type { ReactNode, ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost' | 'green' | 'blue' | 'wpp' | 'add-row' | 'logout'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const cls = variant === 'add-row' ? `btn-add-row ${className}` : `btn btn-${variant} ${className}`
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  )
}
