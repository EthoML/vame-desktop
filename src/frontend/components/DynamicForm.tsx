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
  gap: 10px;
`;

const InputGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
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
      setFormState(initialValues);
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

  const inferInputType = (value) => {
    if (typeof value === 'string') return 'text';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'checkbox';
    if (value instanceof File) return 'file';
    return 'text';
  };

  const renderInput = (key, value, property, additionalInfo = {}) => {
    const type = property?.type || inferInputType(value);


    if (property?.enum) {
      return (
        <select name={key} value={formState[key] || ''} onChange={handleChange}>
          {property.enum.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'array') return renderInput(key, value?.[0], property.items, { multiple: true });


    if (type === 'checkbox') {
      return (
        <input
          type={type}
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
          multiple={additionalInfo.multiple}
          onChange={handleChange}
          webkitdirectory={type === 'folder' ? 'true' : null}
        />
      );
    }

    return (
      <input
        type={type}
        name={key}
        value={formState[key] || ''}
        onChange={handleChange}
      />
    );
  };

  const renderFormFields = () => {
    if (schema) {
      return Object.keys(schema.properties).map((key) => {
        const property = schema.properties[key];
        return (
          <InputGroup key={key}>
            <label>{header(key)}</label>
            {renderInput(key, initialValues[key], property)}
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
