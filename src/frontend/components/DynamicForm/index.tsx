import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { header } from '../../utils/text';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { DisableToggle } from '../../types';
import BaseDynamicInput from './BaseDynamicInput';
import FileSelector from './FileSelector';
import { Accordion, AccordionContent, AccordionHeader, Button, Form, InputGroup, InputLabel, List } from './styles';
import ArrayDynamicInput from './ArrayDynamicInput';

/*

Custom Behaviors
----------------------
format: file OR folder (type: string)
NOTE: Will always output as an array of file paths (though it would be more correct to require an array is specified in the schema)
  - Accepts a file or a folder
  - If type is file, the user can only select files
  - If type is folder, the user can only select folders
  - The accepted files can be specified using the `accept` attribute
  - The user can select multiple files using the `multiple` attribute

allow-spaces: boolean
  - Blocks the user from entering spaces in the input field if set to false


*/

export type DynamicFormProps = {
  initialValues: Record<string, any>,
  schema: Schema,

  // Change Workflow
  onChange?: (key: string, value: any) => void,

  // Submit workflow
  blockSubmission?: DisableToggle,
  submitText?: string,
  onFormSubmit?: (formData: Record<string, any>) => void
};

const DynamicForm = ({
  initialValues,
  schema,
  onChange,
  onFormSubmit,
  blockSubmission = false,
  submitText = 'Submit'
}: Partial<DynamicFormProps>) => {
  const [formState, setFormState] = useState<Record<string,any>>({});
  const [accordionState, setAccordionState] = useState<Record<string,any>>({});

  schema = structuredClone(schema); // Clone the schema to prevent mutation

  const checkIfObject = useCallback((value: unknown) => value && value instanceof Object && !Array.isArray(value), [])


  useEffect(() => {
    if (initialValues) {
      setFormState(structuredClone(initialValues));
    }
  }, [initialValues]);

  if (!initialValues) initialValues = {};

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number | null = null, arrayKey: string | null = null) => {
    const { name, value, type, checked, files } = e.target;

    const resolvedValue = type === 'number' ? Number(value) : value;


    if (onChange) onChange(name, resolvedValue);

    if (arrayKey !== null && index !== null) {
      const oldArray = formState[arrayKey] as Array<unknown>
      const newArray = oldArray ? [...oldArray] : [];
      newArray[index] = resolvedValue;
      setFormState({ ...formState, [arrayKey]: newArray });
      return;
    }

    if (type === 'file') {
      if (!files || files?.length === 0) return;
      setFormState({
        ...formState,
        [name]: Array.from(files).map((file) => (file as any).path) // Convert to full file path in form
      });
      return;
    }

    if (type === 'checkbox') {
      setFormState({ ...formState, [name]: checked });
      return;
    }

    setFormState({ ...formState, [name]: resolvedValue });
  };



  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (onFormSubmit) onFormSubmit({ ...formState });
  };

  const renderInput = (
    key: string,
    value: any,
    property: SimpleProperty | ArrayProperty | null,
  ) => {
    const format = property && "format" in property ? property?.format : undefined
    const required = schema?.required?.includes(key) || false;
    const isReadOnly = property?.readOnly || false;

    const isArrayValue = Array.isArray(value);
    const isArray = property?.type === 'array' || isArrayValue;

    if (isReadOnly) {
      if (isArray) {
        return <List>{isArrayValue ? value.map((item, index) => <li key={index}>{item}</li>) : []}</List>;
      }

      return <span>{new String(property!.type === 'boolean' ? !!value : value)}</span>;
    }

    // Handle Files First
    if (property && property.type === 'string' && "format" in property && (format === 'file' || format === 'folder')) {
      return (
        <FileSelector
          name={key}
          value={formState[key] || []}
          onChange={handleChange}
          webkitdirectory={format === 'folder' ? 'true' : undefined}
          multiple={property.multiple}
          accept={property.accept}
        />
      );
    }

    // Handle editable arrays
    if (isArray) {
      const arrayProperty = property as ArrayProperty
      if (!isArrayValue && value) console.warn(`The value of ${key} is not an array`, value)

      let arrayValue = isArrayValue ? value : [];

      // Set to the minimum number of items if the length is locked
      const lockedLength = 'minItems' in arrayProperty && 'maxItems' in arrayProperty && arrayProperty?.minItems === arrayProperty?.maxItems;
      if (lockedLength) arrayValue = Array.from({ length: arrayProperty.minItems ?? 1 }).map((_, index) => arrayValue[index] ?? null);

      return (
        <ArrayDynamicInput
          name={key}
          initialValue={value}
          property={arrayProperty}
          formState={formState}
          handleChange={handleChange}
        />
      );
    }

    return <BaseDynamicInput
      name={key}
      initialValue={value}
      property={property}
      formState={formState}
      handleChange={handleChange}
      required={required}
    />
  };

  const renderFormFields = () => {
    if (schema) {
      return Object.keys(schema.properties).map((key) => {
        const property = schema.properties[key];
        const title = property.title || key;
        const value = initialValues[key] ?? property.default;

        const formValueDefined = key in formState && formState[key] !== undefined;

        if ('default' in property && !formValueDefined) formState[key] = value

        const isObject = ("type" in property && property.type === 'object') || ("properties" in property && property.properties )|| checkIfObject(value);

        // Handle nested objects
        if (isObject) {

          const resolvedValue = formState[key] = value ?? {};

          if (property.readOnly) Object.values((property as ObjectProperty).properties).forEach((v) => v.readOnly = true)

          return (
            <Accordion>
              <AccordionHeader onClick={() => setAccordionState(prevState => ({ ...prevState, [key]: !prevState[key] }))}>
                {header(title)}
                <FontAwesomeIcon icon={accordionState[key] ? faChevronUp : faChevronDown} />
              </AccordionHeader>
              <AccordionContent isOpen={accordionState[key] ? true : false}>
                <DynamicForm
                  initialValues={resolvedValue}
                  schema={property as Schema}
                  onChange={(nested_key, value) => {
                    resolvedValue[nested_key] = value;
                    if (onChange) onChange(key, resolvedValue);
                    // setFormState({ ...formState, [key]: resolvedValue })
                  }}
                />
              </AccordionContent>
            </Accordion>
          );
        }

        const inputIsRequired = schema?.required?.includes(key) ?? false;

        return (
          <InputGroup key={key}>
            <InputLabel required={inputIsRequired}><span>{header(title)}</span><br />{property.description && <small>{property.description}</small>}</InputLabel>
            {renderInput(key, value, property)}
          </InputGroup>
        );
      });
    } 

    return Object.keys(initialValues).map((key) => (
      <InputGroup key={key}>
        <label>{header(key)}</label>
        {renderInput(key, initialValues[key], null)}
      </InputGroup>
    ));
  };

  const allReadOnly = schema ? Object.values(schema.properties ?? {}).every((property) => property.readOnly) : false;

  const willBlock = !!blockSubmission;
  const blockTooltip = blockSubmission instanceof Object && "tooltip" in blockSubmission && blockSubmission?.tooltip || '';

  const buttonToRender = !allReadOnly && onFormSubmit && <Button type="submit" disabled={willBlock ? true : false}>{submitText}</Button>;

  return (
    <Form onSubmit={handleSubmit}>
      {renderFormFields()}
      {blockTooltip ?
        <Tippy content={blockTooltip} hideOnClick={false}>
          <div>{buttonToRender}</div>
        </Tippy> : buttonToRender}
    </Form>
  );
};

export default DynamicForm;
