import { forwardRef, type ButtonHTMLAttributes } from 'react'
import './Button.css'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ children, className = '', type = 'button', ...props }, ref) {
    const classes = ['ui-button', className].filter(Boolean).join(' ')

    return (
      <button ref={ref} type={type} className={classes} {...props}>
        {children}
      </button>
    )
  },
)
