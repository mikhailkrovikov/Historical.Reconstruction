import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import chevronDown from './chevron-down.svg'
import './Dropdown.css'

export interface DropdownOption {
  value: string
  label: string
  disabled?: boolean
}

export interface DropdownProps {
  options: DropdownOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string, option: DropdownOption) => void
  placeholder?: string
  name?: string
  id?: string
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

export function Dropdown({
  options,
  value,
  defaultValue = '',
  onChange,
  placeholder = 'Название',
  name,
  id,
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
}: DropdownProps) {
  const generatedId = useId()
  const dropdownId = id ?? `dropdown-${generatedId.replace(/:/g, '')}`
  const listboxId = `${dropdownId}-listbox`
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const selectedValue = value ?? uncontrolledValue
  const selectedOption = options.find((option) => option.value === selectedValue)

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  function getNextEnabledIndex(start: number, step: 1 | -1) {
    if (options.length === 0) return -1

    for (let offset = 1; offset <= options.length; offset += 1) {
      const index = (start + step * offset + options.length) % options.length
      if (!options[index].disabled) return index
    }

    return -1
  }

  function openMenu(direction: 1 | -1 = 1) {
    if (disabled) return

    const selectedIndex = options.findIndex(
      (option) => option.value === selectedValue && !option.disabled,
    )
    const fallbackStart = direction === 1 ? -1 : 0

    setHighlightedIndex(
      selectedIndex >= 0
        ? selectedIndex
        : getNextEnabledIndex(fallbackStart, direction),
    )
    setIsOpen(true)
  }

  function selectOption(option: DropdownOption) {
    if (option.disabled) return
    if (value === undefined) setUncontrolledValue(option.value)
    onChange?.(option.value, option)
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1

      if (!isOpen) {
        openMenu(direction)
      } else {
        setHighlightedIndex((current) =>
          getNextEnabledIndex(current, direction),
        )
      }
      return
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      if (!isOpen) openMenu(event.key === 'Home' ? 1 : -1)
      setHighlightedIndex(
        getNextEnabledIndex(event.key === 'Home' ? -1 : 0, event.key === 'Home' ? 1 : -1),
      )
      return
    }

    if ((event.key === 'Enter' || event.key === ' ') && isOpen) {
      event.preventDefault()
      const option = options[highlightedIndex]
      if (option) selectOption(option)
      return
    }

    if (event.key === 'Escape' && isOpen) {
      event.preventDefault()
      setIsOpen(false)
      return
    }

    if (event.key === 'Tab') setIsOpen(false)
  }

  const classes = ['ui-dropdown', isOpen && 'ui-dropdown--open', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={rootRef} className={classes}>
      {name && <input type="hidden" name={name} value={selectedValue} />}
      <button
        ref={triggerRef}
        id={dropdownId}
        className="ui-dropdown__trigger"
        type="button"
        disabled={disabled}
        role="combobox"
        aria-label={ariaLabel ?? placeholder}
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-activedescendant={
          isOpen && highlightedIndex >= 0
            ? `${listboxId}-option-${highlightedIndex}`
            : undefined
        }
        onClick={() => {
          if (isOpen) {
            setIsOpen(false)
          } else {
            setHighlightedIndex(-1)
            setIsOpen(true)
          }
        }}
        onKeyDown={handleKeyDown}
      >
        <span className="ui-dropdown__value">
          {selectedOption?.label ?? placeholder}
        </span>
        <img src={chevronDown} alt="" aria-hidden="true" />
      </button>

      {isOpen && (
        <ul id={listboxId} className="ui-dropdown__menu" role="listbox">
          {options.map((option, index) => (
            <li
              id={`${listboxId}-option-${index}`}
              className="ui-dropdown__option"
              key={option.value}
              role="option"
              aria-disabled={option.disabled || undefined}
              aria-selected={option.value === selectedValue}
              data-highlighted={index === highlightedIndex || undefined}
              onClick={() => selectOption(option)}
              onMouseEnter={() => {
                if (!option.disabled) setHighlightedIndex(index)
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
