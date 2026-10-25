import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'
import { Icon } from '../Icon'
import './Button.css'

export type ButtonVariant = 'primary' | 'secondary'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  showLeftIcon?: boolean
  showRightIcon?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      className = '',
      type = 'button',
      variant = 'primary',
      leftIcon,
      rightIcon,
      showLeftIcon = true,
      showRightIcon = true,
      ...props
    },
    ref,
  ) {
    const classes = ['ui-button', `ui-button--${variant}`, className]
      .filter(Boolean)
      .join(' ')

    return (
      <button ref={ref} type={type} className={classes} {...props}>
        {showLeftIcon && (
          <ButtonIcon side="left" customIcon={leftIcon} />
        )}
        <span className="ui-button__label">{children}</span>
        {showRightIcon && (
          <ButtonIcon side="right" customIcon={rightIcon} />
        )}
      </button>
    )
  },
)

export const PrimaryButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'variant'>
>(function PrimaryButton(props, ref) {
  return <Button {...props} ref={ref} variant="primary" />
})

export const SecondaryButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'variant'>
>(function SecondaryButton(props, ref) {
  return <Button {...props} ref={ref} variant="secondary" />
})

interface ButtonIconProps {
  customIcon?: ReactNode
  side: 'left' | 'right'
}

function ButtonIcon({ customIcon, side }: ButtonIconProps) {
  if (customIcon) {
    return (
      <span className={`ui-button__icon ui-button__icon--${side}`} aria-hidden="true">
        {customIcon}
      </span>
    )
  }

  return (
    <span className={`ui-button__icon ui-button__icon--${side}`} aria-hidden="true">
      <Icon name="bow" />
    </span>
  )
}
