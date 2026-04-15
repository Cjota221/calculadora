import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  prefix?: string
  suffix?: string
}

export function Input({ label, hint, prefix, suffix, className = '', ...props }: InputProps) {
  const hasPfx = !!prefix
  const hasSfx = !!suffix

  return (
    <div className="field">
      {label && <label>{label}</label>}
      <div className="input-wrap">
        {prefix && <span className="pfx">{prefix}</span>}
        <input
          className={`${hasPfx ? 'has-pfx' : ''} ${hasSfx ? 'has-sfx' : ''} ${className}`}
          {...props}
        />
        {suffix && <span className="sfx">{suffix}</span>}
      </div>
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  )
}
