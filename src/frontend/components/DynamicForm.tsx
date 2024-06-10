import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { header } from '../utils/text';

export type DynamicFormProps = {
  submitText?: string,
  initialValues: Record<string, any>,
  schema: Record<string, any>,
  onFormSubmit: (formData: Record<string, any>) => void
}

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

  if (!initialValues) initialValues = {}

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {

      if (files.length === 0) return
      
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
      setFormState({ ...formState, [name]: new Number(value) });
      return;
    }

    setFormState({ ...formState, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onFormSubmit) onFormSubmit({ ...formState }); // Copy the form state to prevent mutation
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

    const isArray = type === 'array';

    const isReadOnly = property?.readOnly || false;

    if (isReadOnly) {
      if (isArray) {
        return <ol>{value.map((item) => <li key={item}>{item}</li>)}</ol>;
      }

      return <span>{value}</span>;
    }

    if (property?.enum) {
      return (
        <select 
        name={key} value={formState[key] || ''} 
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

    if (isArray) {
      if (Array.isArray(value)) return <ol>{value.map((item) => <li key={item}>{item}</li>)}</ol>; // Existing arrays are immutable
      return renderInput(key, value?.[0], property.items, { multiple: true });
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

    if (type === 'file' || type === 'folder') {
      return (
        <input
          type="file"
          name={key}
          accept={property.accept}
          required={required}
          multiple={additionalInfo.multiple}
          onChange={handleChange}
          webkitdirectory={type === 'folder' ? 'true' : null}
        />
      );
    }

    const isInteger = type === 'integer'
    const isNumber = type === 'number' || isInteger

    if (isNumber) {
      return (
        <input
          type="number"
          name={ key }
          required={required}
          step={ isInteger ? 1 : 0.01 }
          value={ formState[key] || '' }
          onChange={ handleChange }
        />
      );
    }

    return (
      <input
        type={type}
        name={key}
        required={required}
        value={formState[key] || ''}
        onChange={handleChange}
      />
    );
  };

  const renderFormFields = () => {

    // Schema-based generation
    if (schema) {
      return Object.keys(schema.properties).map((key) => {
        const property = schema.properties[key];

        const title = property.title || key;


        const value = initialValues[key] || property.default;

        // Set default value for the input 
        if ('default' in property && !(key in formState)) formState[key] = property.default
        
        return (
          <InputGroup key={key}>
              <InputLabel>{header(title)}<br/>{property.description && <small>{property.description}</small>}</InputLabel>
            {renderInput(key, value, property)}
          </InputGroup>
        );
      });
    }

    // Infer from initial values
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
