import type { CSSProperties, HTMLAttributes } from 'react'
import arrowUpRight from './arrow-up-right.svg'
import bow from './bow.svg'
import image from './image.svg'
import mapPinned from './map-pinned.svg'
import './Icon.css'

export type IconName = 'bow' | 'arrow-up-right' | 'image' | 'map-pinned'

export interface IconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  name: IconName
  title?: string
}

const iconSources: Record<IconName, string> = {
  bow,
  'arrow-up-right': arrowUpRight,
  image,
  'map-pinned': mapPinned,
}

export function Icon({ name, title, className = '', style, ...props }: IconProps) {
  const source = iconSources[name]
  const classes = ['ui-icon', className].filter(Boolean).join(' ')
  const iconStyle: CSSProperties = {
    ...style,
    maskImage: `url("${source}")`,
    WebkitMaskImage: `url("${source}")`,
  }

  return (
    <span
      {...props}
      className={classes}
      style={iconStyle}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    />
  )
}
