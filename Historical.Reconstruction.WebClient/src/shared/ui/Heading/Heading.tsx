import type { HTMLAttributes, ReactNode } from 'react'
import { Button, type ButtonProps } from '../Button'
import './Heading.css'

export interface HeadingProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  leftContent?: ReactNode
  showLeftContent?: boolean
  showButton?: boolean
  buttonLabel?: ReactNode
  buttonProps?: Omit<ButtonProps, 'children'>
}

export function Heading({
  leftContent = 'Каталог',
  showLeftContent = true,
  showButton = true,
  buttonLabel = 'Добавить находку',
  buttonProps,
  className = '',
  ...props
}: HeadingProps) {
  const classes = ['ui-heading', className].filter(Boolean).join(' ')
  const buttonClasses = ['ui-heading__button', buttonProps?.className]
    .filter(Boolean)
    .join(' ')
  const isPlainTitle =
    typeof leftContent === 'string' || typeof leftContent === 'number'

  return (
    <header className={classes} {...props}>
      {showLeftContent && (
        <div className="ui-heading__left">
          {isPlainTitle ? <h2>{leftContent}</h2> : leftContent}
        </div>
      )}

      {showButton && (
        <Button {...buttonProps} className={buttonClasses}>
          {buttonLabel}
        </Button>
      )}
    </header>
  )
}
