import { useState, useRef, useEffect } from 'react'

export interface Option {
  value: string
  label: string
  count?: number
}

interface CheckboxFilterProps {
  id: string
  label: string
  options: Option[]
  selected: string[]
  onChange: (values: string[]) => void
}

function CheckboxFilter({
  id,
  label,
  options,
  selected,
  onChange,
}: CheckboxFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectAllRef = useRef<HTMLInputElement>(null)

  const allValues = options.map((opt) => opt.value)
  const isAllSelected = selected.length === allValues.length
  const isNoneSelected = selected.length === 0
  const isIndeterminate = !isAllSelected && !isNoneSelected

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate
    }
  }, [isIndeterminate])

  const toggleOption = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]
    onChange(next)
  }

  const toggleAll = () => {
    onChange(isAllSelected ? [] : allValues)
  }

  return (
    <div className="relative w-full">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`${id}-dropdown`}
        className="w-full flex items-center justify-between px-4 py-2 bg-stone-900 text-sm font-medium text-stone-200 border border-gray-300 rounded-md shadow-sm"
      >
        <span>{label}</span>
        <span
          className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`}
        >
          ▶
        </span>
      </button>

      {/* Dropdown panel */}
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
          {/* Select All Option */}
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

          {/* Individual Options */}
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
