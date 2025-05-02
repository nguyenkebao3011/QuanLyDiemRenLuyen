import React from "react";

interface FormFieldProps {
  label: string;
  id: string;
  name: string;
  value: string | number | undefined;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  placeholder,
  options,
  className = "",
}) => {
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={id}>{label}</label>
      {type === "select" ? (
        <select
          id={id}
          name={name}
          value={value !== undefined ? value : ""}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className="form-control"
        >
          <option value="">{placeholder || `-- Chọn ${label} --`}</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={id}
          name={name}
          value={value !== undefined ? value : ""}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className="form-control"
        />
      )}
    </div>
  );
};

export default FormField;
