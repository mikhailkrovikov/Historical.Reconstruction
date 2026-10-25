import {
  forwardRef,
  useRef,
  useState,
  type ChangeEvent,
  type ChangeEventHandler,
  type InputHTMLAttributes,
} from 'react'
import searchDefault from '../../../assets/search.svg'
import clearIcon from './clear.svg'
import searchActive from './search-active.svg'
import './Search.css'

export interface SearchProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'value' | 'defaultValue' | 'onChange'
  > {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onChange?: ChangeEventHandler<HTMLInputElement>
  onClear?: () => void
  className?: string
}

export const Search = forwardRef<HTMLInputElement, SearchProps>(
  function Search(
    {
      value,
      defaultValue = '',
      onValueChange,
      onChange,
      onClear,
      className = '',
      placeholder = 'Поиск',
      disabled,
      ...props
    },
    forwardedRef,
  ) {
    const innerRef = useRef<HTMLInputElement | null>(null)
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
    const currentValue = value ?? uncontrolledValue
    const classes = [
      'ui-search',
      currentValue && 'ui-search--filled',
      disabled && 'ui-search--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    function setRefs(node: HTMLInputElement | null) {
      innerRef.current = node

      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    }

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
      if (value === undefined) setUncontrolledValue(event.target.value)
      onValueChange?.(event.target.value)
      onChange?.(event)
    }

    function handleClear() {
      if (value === undefined) setUncontrolledValue('')
      onValueChange?.('')
      onClear?.()
      innerRef.current?.focus()
    }

    return (
      <div className={classes}>
        <span className="ui-search__icon" aria-hidden="true">
          <img className="ui-search__icon-default" src={searchDefault} alt="" />
          <img className="ui-search__icon-active" src={searchActive} alt="" />
        </span>
        <input
          {...props}
          ref={setRefs}
          type="search"
          value={currentValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleChange}
        />
        {currentValue && !disabled && (
          <button
            className="ui-search__clear"
            type="button"
            aria-label="Очистить поиск"
            onClick={handleClear}
          >
            <img src={clearIcon} alt="" aria-hidden="true" />
          </button>
        )}
      </div>
    )
  },
)
