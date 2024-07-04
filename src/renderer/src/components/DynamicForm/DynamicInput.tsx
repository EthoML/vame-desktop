import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import FileInput from "./FileSelector";

type DynamicInputProps = {
  name: string;
  property: Property;
  defaultValue?: any
}

const DynamicInput = ({
  name,
  property,
  defaultValue,
}: DynamicInputProps) => {

  const { register } = useFormContext()

  const type = useMemo(() => {
    if (property && "enum" in property && property?.enum) return "enum";
    if ("type" in property && property.type === 'boolean') return 'boolean';
    if ("type" in property && (property.type === 'number' || property.type === 'integer')) return 'number';
    if ("type" in property && property.type === 'string' && "format" in property && property.format === "file") return 'file';
    if ("type" in property && property.type === 'string' && "format" in property && property.format === "folder") return 'folder';
    if ("type" in property && property.type === 'object') return 'object';
    if ("type" in property && property.type === 'array') return 'array';
    return 'text';

  }, [property]);

  // Handle select fields
  if (type === "enum") {
    return (
      <select
        {...register(name)}
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
        type='checkbox'
        defaultChecked={!!defaultValue}
        {...register(name)}
      />
    );
  }

  if (type === "number") {
    const numberProperty = property as NumberProperty
    const isInteger = numberProperty.type === 'integer';
    return (
      <input
        type="number"
        max={numberProperty?.maximum}
        min={numberProperty?.minimum}
        step={isInteger ? 1 : 0.01}
        defaultValue={defaultValue}
        {...register(name)}
      />
    );
  }

  if (type === "file" || type === "folder") {
    const fileProperty = property as FileProperty
    return (
      <FileInput
        name={name}
        accept={fileProperty?.accept}
        multiple={fileProperty.multiple}
        webkitdirectory={type === "folder"}
      />
    );
  }

  return (
    <input
      type={"text"}
      defaultValue={defaultValue}
      {...register(name)}
      onKeyDown={(e) => {
        if (property && property['allow-spaces'] === false && e.key === ' ') e.preventDefault();
      }}
    />
  );
};

export default DynamicInput;
