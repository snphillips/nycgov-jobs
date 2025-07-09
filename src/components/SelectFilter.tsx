import type { FC, ChangeEvent } from 'react';

/* ────────────────────────────────────────────────────────────────
   SelectFilter – a small, reusable dropdown filter.
   Tailwind classes are baked in, swap for shadcn/ui <Select />
   later if you adopt that library.
   ----------------------------------------------------------------
   Usage:
     <SelectFilter
       id="employmentType"
       label="Employment Type"
       options={[
         { value: 'all', label: 'All' },
         { value: 'F',   label: 'Full‑Time' },
         { value: 'P',   label: 'Part‑Time' },
       ]}
       value={employmentFilter}
       onChange={setEmploymentFilter}
     />
*/
export interface Option {
  value: string;
  label: string;
}

export interface SelectFilterProps {
  /** htmlFor / id so the label is accessible */
  id: string;
  label: string;
  options: Option[];
  /** currently selected value (controlled component) */
  value: string;
  onChange: (value: string) => void;
  /** prepend an "All" option automatically (defaults to false) */
  includeAllOption?: boolean;
}

const SelectFilter: FC<SelectFilterProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  includeAllOption = false,
}) => {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) =>
    onChange(e.target.value);

  const opts = includeAllOption
    ? [{ value: 'all', label: 'All' }, ...options]
    : options;

  return (
    <div className="flex flex-col gap-1 w-full max-w-xs">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={handleChange}
        className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm px-3 py-2"
      >
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectFilter;
