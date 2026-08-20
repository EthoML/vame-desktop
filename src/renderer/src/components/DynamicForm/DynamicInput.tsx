import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import FileInput from "./FileSelector";
import ArrayInput from "./ArrayInput";
import { Accordion, AccordionContent, AccordionHeader, CheckboxGroup, CheckboxLabel, FieldError, InputGroup, InputLabel, StyledInput, StyledSelect } from './styles';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

type DynamicInputProps = {
  name: string;
  property: Property;
  required?: boolean;
  readOnly?: boolean;
  /** Conditionally disabled (RHF drops the value from submission while disabled). */
  disabled?: boolean;
}

const DynamicInput: React.FC<DynamicInputProps> = ({
  name,
  property,
  required,
  readOnly,
  disabled,
}) => {
  const itemKey = name
  readOnly = readOnly ?? property.readOnly

  const [accordionState, setAccordionState] = useState(false)

  const methods = useFormContext()
  const { register } = methods

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
    const enumProperty = property as EnumProperty
    // Multi-value enum rendered as a checkbox group (clearer than a multi-select
    // listbox). RHF aggregates same-named checkboxes into an array of values.
    if (enumProperty.checkboxes) {
      return (
        <CheckboxGroup>
          {enumProperty.enum.map((option) => (
            <CheckboxLabel key={option}>
              <input
                type="checkbox"
                value={option}
                {...register(itemKey, { disabled: disabled || readOnly })}
              />
              <span>{option}</span>
            </CheckboxLabel>
          ))}
        </CheckboxGroup>
      );
    }
    return (
      <StyledSelect
        {...register(itemKey, { required, disabled: readOnly })}
        multiple={enumProperty.multiple}
      >
        {(property as EnumProperty)!.enum.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </StyledSelect>
    );
  }

  if (type === 'boolean') {
    return (
      <StyledInput
        type='checkbox'
        {...register(itemKey, {
          disabled: readOnly
        })}
      />
    );
  }

  if (type === "number") {
    const numberProperty = property as NumberProperty
    const isInteger = numberProperty.type === 'integer';
    const { minimum, maximum } = numberProperty;
    // The min/max attributes only constrain the spinner — RHF has to know the
    // bounds too, or a typed-in value passes straight through.
    const error = methods.formState.errors[itemKey];

    return (
      <>
        <StyledInput
          type="number"
          max={maximum}
          min={minimum}
          step={isInteger ? 1 : "any"}
          {...register(itemKey, {
            required,
            valueAsNumber: true,
            disabled,
            ...(minimum !== undefined && {
              min: { value: minimum, message: `Must be at least ${minimum}.` },
            }),
            ...(maximum !== undefined && {
              max: { value: maximum, message: `Must be at most ${maximum}.` },
            }),
          })}
          readOnly={readOnly}
        />
        {error?.message && <FieldError>{String(error.message)}</FieldError>}
      </>
    );
  }

  if (type === "file" || type === "folder") {
    const fileProperty = property as FileProperty
    return (
      <FileInput
        name={itemKey}
        accept={fileProperty?.accept}
        multiple={fileProperty.multiple}
        webkitdirectory={type === "folder"}
        required={required}
        readOnly={readOnly}
      />
    );
  }

  if (type === "object") {
    const objectProperty = property as ObjectProperty

    return (<>
      <Accordion>
        <AccordionHeader onClick={() => setAccordionState(prevState => !prevState)}>
          {objectProperty.title ?? "Other options"}
          <FontAwesomeIcon icon={accordionState ? faChevronUp : faChevronDown} />
        </AccordionHeader>
        <AccordionContent $isOpen={accordionState}>
          {Object.entries(objectProperty.properties).map(([key, property]) => (
            <InputGroup key={`${itemKey}.${key}`}>
              <InputLabel required={required} readOnly={property.readOnly}>
                <span>{property.title ?? key}</span>
                {property.description && <small>{property.description}</small>}
              </InputLabel>
              <DynamicInput
                name={`${itemKey}.${key}`}
                property={property}
                required={required}
                readOnly={property.readOnly ?? readOnly}
              />
            </InputGroup>
          ))}
        </AccordionContent>
      </Accordion>
    </>
    );
  }

  if (type === "array") {
    const arrayProperty = property as ArrayProperty

    return (
      <ArrayInput
        name={itemKey}
        property={arrayProperty}
        readOnly={readOnly}
      />);
  }

  return (
    <StyledInput
      type={"text"}
      {...register(itemKey, { required })}
      readOnly={readOnly}
      onKeyDown={(e) => {
        if (property && property['allow-spaces'] === false && e.key === ' ') e.preventDefault();
      }}
    />
  );
};

export default DynamicInput;
