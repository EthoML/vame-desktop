import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { header } from '../utils/text';
import { faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/*

Custom Behaviors
----------------------
type: file OR folder
  - Accepts a file or a folder
  - If type is file, the user can only select files
  - If type is folder, the user can only select folders
  - The accepted files can be specified using the `accept` attribute
  - The user can select multiple files using the `multiple` attribute

allow-spaces: boolean
  - Blocks the user from entering spaces in the input field if set to false


*/

export type DynamicFormProps = {
  submitText?: string,
  initialValues: Record<string, any>,
  schema: Record<string, any>,
  onFormSubmit: (formData: Record<string, any>) => void
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const InputGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`;

const InputLabel = styled.label`
  small {
    font-size: 12px;
    color: #666;
  }
`;

const Button = styled.button`
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
`;

const ArrayItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const ArrayItemWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ArrayButtons = styled.div`
  display: flex;
  gap: 5px;
`;

const ArrayButton = styled.button`
  color: black;
  background: none;
  border: none;
  cursor: pointer;
`;

const AddButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  padding: 10px;
  background-color: #007bff;
  width: 100%;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
`;

const DynamicForm = ({ 
  initialValues, 
  schema, 
  onFormSubmit,
  submitText = 'Submit' 
}: Partial<DynamicFormProps>) => {
  const [formState, setFormState] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormState(structuredClone(initialValues));
    }
  }, [initialValues]);

  if (!initialValues) initialValues = {};

  const handleChange = (e, index = null, arrayKey = null) => {
    const { name, value, type, checked, files } = e.target;

    if (arrayKey !== null) {
      const oldArray = formState[arrayKey]
      const newArray = oldArray ? [...oldArray] : [];
      const resolvedValue = type === 'number' ? Number(value) : value;
      newArray[index] = resolvedValue;
      setFormState({ ...formState, [arrayKey]: newArray });
      return;
    }

    if (type === 'file') {
      if (files.length === 0) return;
      setFormState({
        ...formState,
        [name]: Array.from(files)
      });
      return;
    }

    if (type === 'checkbox') {
      setFormState({ ...formState, [name]: checked });
      return;
    }

    if (type === 'number') {
      setFormState({ ...formState, [name]: Number(value) });
      return;
    }

    setFormState({ ...formState, [name]: value });
  };

  const handleAddArrayItem = (key) => {
    setFormState({
      ...formState,
      [key]: [...(formState[key] || []), '']
    });
  };

  const handleRemoveArrayItem = (key, index) => {
    const newArray = [...formState[key]];
    newArray.splice(index, 1);
    setFormState({ ...formState, [key]: newArray });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onFormSubmit) onFormSubmit({ ...formState });
  };

  const inferType = (value) => {
    if (typeof value === 'string') return 'text';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof File) return 'file';
    return 'text';
  };

  const renderInput = (
    key, 
    value, 
    property, 
    additionalInfo = {}
  ) => {

    const type = property?.type || inferType(value);
    const required = schema?.required?.includes(key) || false;
    const isReadOnly = property?.readOnly || false;

    const isArrayValue = Array.isArray(value);
    const isArray = property?.type === 'array' || isArrayValue
    

    if (isReadOnly) {
      if (isArray) {
        return <ol>{isArrayValue ? value.map((item, index) => <li key={index}>{item}</li>) : [] }</ol>;
      }
      return <span>{value}</span>;
    }


    // Handle Files First
    if (type === 'file' || type === 'folder') {
      return (
        <input
          type="file"
          name={key}
          accept={property.accept}
          required={required}
          multiple={property.multiple}
          onChange={handleChange}
          webkitdirectory={type === 'folder' ? 'true' : null}
        />
      );
    }

    // Handle editable arrays
    if (isArray) {

      if (!isArrayValue && value) console.warn(`The value of ${key} is not an array`, value)

      let arrayValue = isArrayValue ? value : [];

      const itemType = property?.items?.type || inferType(arrayValue[0]);

      const isInteger = itemType === 'integer';
      const isNumber = itemType === 'number' || isInteger;
      const isText = itemType === 'string' || itemType === 'text';
      const inputType = isNumber ? 'number' : (isText ? 'text' : itemType); 
  
      const fillerValue = isText ? '' : isNumber ? 0 : null;

      // Set to the minimum number of items if the length is locked
      const lockedLength = property?.minItems === property?.maxItems;
      if (lockedLength) arrayValue = formState[key] = Array.from({ length: property.minItems }).map((_, index) => arrayValue[index] ?? fillerValue);

      // Check if the user can add or remove items
      const canAdd = !property?.maxItems || arrayValue.length < property.maxItems;
      const canRemove = !property?.minItems || arrayValue.length > property.minItems;

      return (
        <div>
          <ArrayItems>
            {arrayValue.map((item, index) => {
              const itemKey = `${key}[${index}]`
              return <ArrayItemWrapper key={itemKey}>
                <input
                  name={itemKey}
                  type={inputType}
                  defaultValue={item}
                  onChange={(e) => handleChange(e, index, key)}
                />
                <ArrayButtons>
                  { canRemove && <ArrayButton type="button" onClick={() => handleRemoveArrayItem(key, index)}><FontAwesomeIcon icon={faTrash} /></ArrayButton> }
                </ArrayButtons>
              </ArrayItemWrapper>
      })}
          </ArrayItems>
          { canAdd && <AddButton type="button" onClick={() => handleAddArrayItem(key)}><FontAwesomeIcon icon={faPlusCircle} /></AddButton> }
        </div>
      );
    }

    // Handle select fields
    if (property?.enum) {
      return (
        <select 
          name={key} 
          value={formState[key] || ''} 
          required={required}
          onChange={handleChange}
        >
          {property.enum.map((option) => (
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
          name={key}
          checked={formState[key] || false}
          onChange={handleChange}
        />
      );
    }

    const isInteger = type === 'integer';
    const isNumber = type === 'number' || isInteger;
    // const isText = type === 'string' || type === 'text';

    if (isNumber) {
      return (
        <input
          type="number"
          name={key}
          required={required}
          step={isInteger ? 1 : 0.01}
          value={formState[key] || ''}
          onChange={handleChange}
        />
      );
    }

    return (
      <input
        type={type}
        name={key}
        required={required}
        value={formState[key] || ''}
        onKeyPress={(e) => {
          if (property['allow-spaces'] === false && e.key === ' ') e.preventDefault();
        }}
        onChange={handleChange}
      />
    );
  };

  const renderFormFields = () => {
    if (schema) {
      return Object.keys(schema.properties).map((key) => {
        const property = schema.properties[key];
        const title = property.title || key;
        const value = initialValues[key] || property.default;
        if ('default' in property && !(key in formState)) formState[key] = property.default;
        return (
          <InputGroup key={key}>
            <InputLabel>{header(title)}<br/>{property.description && <small>{property.description}</small>}</InputLabel>
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

  return (
    <Form onSubmit={handleSubmit}>
      {renderFormFields()}
      <Button type="submit">{submitText}</Button>
    </Form>
  );
};

export default DynamicForm;
