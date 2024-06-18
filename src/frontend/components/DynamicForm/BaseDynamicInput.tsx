import { ChangeEventHandler, useMemo } from "react";

type BaseDynamicInputProps  = {
  name: string;
  property: SimpleProperty;
  initialValue?: null
  required?: boolean;
  formState: Record<string, string | number | boolean | readonly string[] | undefined>;
  handleChange: ChangeEventHandler;
} | {
  name: string;
  initialValue: any;
  property: null;
  required?: boolean;
  formState: Record<string, string | number | boolean | readonly string[] | undefined>;
  handleChange: ChangeEventHandler;
}

const BaseDynamicInput = ({
  name,
  property,
  initialValue,
  required,
  formState,
  handleChange
}: BaseDynamicInputProps) => {

  const type = useMemo(() => {
    if(property){
      if(property && "enum" in property && property?.enum) return "enum";
      if ("type" in property && property.type === 'boolean') return 'boolean';
      if ("type" in property && (property.type === 'number' || property.type === 'integer')) return 'number';
    } else {
      if (typeof initialValue === 'string') return 'text';
      if (typeof initialValue === 'number') return 'number';
      if (typeof initialValue === 'boolean') return 'boolean';
      if (initialValue instanceof File) return 'file';
      return 'text';
    }
  }, []);

  // Handle select fields
  if (type==="enum") {
    return (
      <select
        name={name}
        defaultValue={initialValue}
        value={formState[name] as string ?? ''}
        required={required}
        onChange={handleChange}
      >
        {(property as EnumProperty)!.enum.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (type === 'boolean') {
    return (
      <input
        name={name}
        type='checkbox'
        defaultChecked={!!initialValue}
        checked={formState[name] as boolean ?? false}
        onChange={handleChange}
      />
    );
  }

  if (type === "number") {
    const numberProperty = property as NumberProperty
    const isInteger = numberProperty.type === 'integer';
    return (
      <input
        type="number"
        name={name}
        required={required}
        max={numberProperty?.maximum}
        min={numberProperty?.minimum}
        step={isInteger ? 1 : 0.01}
        defaultValue={initialValue}
        value={formState[name] as number ?? ''}
        onChange={handleChange}
      />
    );
  }

  return (
    <input
      type={type}
      name={name}
      required={required}
      defaultValue={initialValue}
      value={formState[name] as any ?? ''}
      onKeyDown={(e) => {
        if (property && property['allow-spaces'] === false && e.key === ' ') e.preventDefault();
      }}
      onChange={handleChange}
    />
  );
};

export default BaseDynamicInput;
