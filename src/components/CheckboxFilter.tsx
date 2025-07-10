import type { ChangeEvent } from 'react';

export interface Option {
  value: string;
  label: string;
}

export interface CheckboxFilterProps {
  id: string;
  label: string;
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export function CheckboxFilter({
  id,
  label,
  options,
  selected,
  onChange,
}:CheckboxFilterProps ){
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log('event.target.value', event.target.value)
    const value = event.target.value;
    const next = new Set(selected);
    if (next.has(value)) {
      next.delete(value)
    }  else {
      next.add(value);
    }
    onChange(Array.from(next));
  };

  return (
    <fieldset id={id} className="flex flex-col gap-1 w-full max-w-xs">
      <legend className="text-sm font-medium text-gray-700 mb-1">{label}</legend>
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            value={opt.value}
            checked={selected.includes(opt.value)}
            onChange={handleChange}
            className="accent-blue-600"
          />
          {opt.label}
        </label>
      ))}
    </fieldset>
  );
};

export default CheckboxFilter;
