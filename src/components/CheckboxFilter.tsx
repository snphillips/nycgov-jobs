import { useState, useRef, useEffect } from 'react'

// Represents a single checkbox option
export interface Option {
  value: string
  label: string
  count?: number // Optional display count
}

// Props expected by the CheckboxFilter component
interface CheckboxFilterProps {
  id: string // Unique ID for accessibility
  label: string // Label shown on the toggle button
  options: Option[] // All filter options
  selected: string[] // Currently selected option values
  onChange: (values: string[]) => void // Callback to update selected values
}

function CheckboxFilter({
  id,
  label,
  options,
  selected,
  onChange,
}: CheckboxFilterProps) {
  // Controls whether dropdown is open
  const [isOpen, setIsOpen] = useState(false)

  // Ref to the "Select All" checkbox, used for setting indeterminate state
  const selectAllRef = useRef<HTMLInputElement>(null)

  // List of all option values
  const allValues = options.map((option) => option.value)

  // Boolean flags for "Select All" state
  const isAllSelected = selected.length === allValues.length
  const isNoneSelected = selected.length === 0
  const isIndeterminate = !isAllSelected && !isNoneSelected

  // Set indeterminate state on "Select All" checkbox when appropriate
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate
    }
  }, [isIndeterminate])

  // Toggle individual option on/off
  const toggleOption = (value: string) => {
    const nextState = selected.includes(value)
      ? selected.filter((val) => val !== value) // if selected, remove it
      : [...selected, value] // if not selected, add it

    onChange(nextState)
  }

  // Toggle all options: select all or deselect all
  const toggleAll = () => {
    onChange(isAllSelected ? [] : allValues)
  }

  return (
    <div className="relative w-full">
      {/* Dropdown toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`${id}-dropdown`}
        className="w-full flex items-center justify-between px-4 py-2 bg-stone-900 text-sm font-medium text-stone-200 border border-gray-300 rounded-md shadow-sm"
      >
        <span>{label}</span>
        {/* ▶ icon rotates when open */}
        <span
          className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`}
        >
          ▶
        </span>
      </button>

      {/* Dropdown panel with checkbox options */}
      <div
        id={`${id}-dropdown`}
        className={`absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden transition-all duration-200 ${
          isOpen
            ? 'max-h-60 opacity-100'
            : 'max-h-0 opacity-0 pointer-events-none'
        }`}
        style={{ transitionProperty: 'max-height, opacity' }}
      >
        <div className="px-4 py-2 max-h-60 overflow-y-auto">
          {/* "Select All" checkbox at the top */}
          <label className="flex items-center gap-2 text-sm font-medium text-gray-800 py-1 border-b border-gray-200 mb-2 pb-2">
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={isAllSelected}
              onChange={toggleAll}
              className="rounded border-gray-300 focus:ring-blue-500"
            />
            Select All
          </label>

          {/* Individual checkbox options */}
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm text-gray-700 py-1"
            >
              <input
                type="checkbox"
                value={option.value}
                checked={selected.includes(option.value)}
                onChange={() => toggleOption(option.value)}
                className="rounded border-gray-300 focus:ring-blue-500"
              />
              {/* Show label and optional count */}
              {option.label}{' '}
              {option.count !== undefined ? `(${option.count})` : ''}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CheckboxFilter
