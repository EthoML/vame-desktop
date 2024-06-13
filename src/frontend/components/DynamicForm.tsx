import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { header } from '../utils/text';
import { faPlusCircle, faTrash, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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

const checkIfObject = (value) => value && value instanceof Object && !Array.isArray(value)
    
// Accordion Component
const Accordion = styled.div`
  background-color: #f1f1f1;
  border-radius: 5px;
  margin-bottom: 10px;
`;

const AccordionHeader = styled.div`
  background-color: black;
  color: white;
  cursor: pointer;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AccordionContent = styled.div`
  padding: 10px;
  display: ${props => (props.isopen ? 'block' : 'none')};
`;

export type DynamicFormProps = {
  initialValues: Record<string, any>,
  schema: Record<string, any>,

  // Change Workflow
  onChange?: (key: string, value: any) => void,

  // Submit workflow
  submitText?: string,
  onFormSubmit?: (formData: Record<string, any>) => void
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const InputGroup = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 10px;
`;

const InputLabel = styled.label`
  font-weight: bold;

  small {
    font-size: 12px;
    color: #666;
    font-weight: normal;
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

const List = styled.ol`
  margin: 0;
`;

// const ArrayButtons = styled.div`
//   display: flex;
//   gap: 5px;
// `;

// const ArrayButton = styled.button`
//   color: black;
//   background: none;
//   border: none;
//   cursor: pointer;
// `;

// const AddButton = styled.button`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   margin-top: 10px;
//   padding: 10px;
//   background-color: #007bff;
//   width: 100%;
//   color: white;
//   border: none;
//   border-radius: 3px;
//   cursor: pointer;
// `;

const FileSelectorBody = styled.div`
  display: grid;
  gap: 10px;

  input[type='file'] {
    color: transparent;
    direction: rtl;
  }

  input[type="file"]::-webkit-file-upload-button {
    background-color: black;
    color: white;
    padding: 5px 20px;
    border-radius: 5px;
    border: none;
    float: right;
  }
`;

const FileList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  font-size: 13px;
`;

const FileListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  overflow: auto;
`;

const getFilePath = (file) => file.path || file;

const FileSelector = ({ name, value, onChange, multiple, accept, webkitdirectory }) => {
  
  // Ensure value is an array
  value = value !== undefined ? (Array.isArray(value) ? value : [ value ]) : value
    
  return (
    
    <FileSelectorBody>
      <FileList>
        {value && value.map((file, index) => {
          const label = getFilePath(file);

         return <FileListItem key={index}>
            <span>{label}</span>
          </FileListItem>
      })}
      </FileList>
      <input
        type="file"
        title={`Choose your ${webkitdirectory ? 'folder' : 'file'}${multiple ? 's' : ''}`}
        name={name}
        accept={accept}
        multiple={multiple}
        onChange={(e) => onChange(e)}
        webkitdirectory={webkitdirectory}
      />
    </FileSelectorBody>
  );
};


const DynamicForm = ({ 
  initialValues, 
  schema, 
  onChange,
  onFormSubmit,
  submitText = 'Submit' 
}: Partial<DynamicFormProps>) => {
  const [formState, setFormState] = useState({});
  const [accordionState, setAccordionState] = useState({});


  schema = structuredClone(schema); // Clone the schema to prevent mutation


  useEffect(() => {
    if (initialValues) {
      setFormState(structuredClone(initialValues));
    }
  }, [initialValues]);

  if (!initialValues) initialValues = {};

  const handleChange = (e, index = null, arrayKey = null) => {
    const { name, value, type, checked, files } = e.target;

    const resolvedValue = type === 'number' ? Number(value) : value;


    if (onChange) onChange(name, resolvedValue);

    if (arrayKey !== null) {
      const oldArray = formState[arrayKey]
      const newArray = oldArray ? [...oldArray] : [];
      newArray[index] = resolvedValue;
      setFormState({ ...formState, [arrayKey]: newArray });
      return;
    }

    if (type === 'file') {
      if (files.length === 0) return;
      setFormState({
        ...formState,
        [name]: Array.from(files).map((file) =>  file.path) // Convert to full file path in form
      });
      return;
    }

    if (type === 'checkbox') {
      setFormState({ ...formState, [name]: checked });
      return;
    }

    setFormState({ ...formState, [name]: resolvedValue });
};

  // const handleAddArrayItem = (key) => {
  //   setFormState({
  //     ...formState,
  //     [key]: [...(formState[key] || []), '']
  //   });
  // };

  // const handleRemoveArrayItem = (key, index) => {
  //   const newArray = [...formState[key]];
  //   newArray.splice(index, 1);
  //   setFormState({ ...formState, [key]: newArray });
  // };

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
    const format = property?.format
    const required = schema?.required?.includes(key) || false;
    const isReadOnly = property?.readOnly || false;

    const isArrayValue = Array.isArray(value);
    const isArray = property?.type === 'array' || isArrayValue;

    if (isReadOnly) {
      if (isArray) {
        return <List>{isArrayValue ? value.map((item, index) => <li key={index}>{item}</li>) : [] }</List>;
      }
      
      return <span>{new String(type === 'boolean' ? !!value : value)}</span>;
    }

    // Handle Files First
    if (type === 'string' && (format === 'file' || format === 'folder')) {
        return (
          <FileSelector
            name={key}
            value={formState[key] || []}
            onChange={handleChange}
            webkitdirectory={type === 'folder' ? 'true' : null}
            multiple={property.multiple}
            accept={property.accept}
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
      const lockedLength = 'minItems' in property && 'maxItems' in property && property?.minItems === property?.maxItems;
      if (lockedLength) arrayValue = Array.from({ length: property.minItems }).map((_, index) => arrayValue[index] ?? fillerValue);

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
                {/* <ArrayButtons>
                  { canRemove && <ArrayButton type="button" onClick={() => handleRemoveArrayItem(key, index)}><FontAwesomeIcon icon={faTrash} /></ArrayButton> }
                </ArrayButtons> */}
              </ArrayItemWrapper>
            })}
          </ArrayItems>
          { (canAdd || canRemove) && <small style={{color: 'gray', fontSize: '10px'}}><b>Note:</b> Array sizes cannot yet be edited. Please specify minItems and maxItems as the same value in the schema.</small>}
          {/* { canAdd && <AddButton type="button" onClick={() => handleAddArrayItem(key)}><FontAwesomeIcon icon={faPlusCircle} /></AddButton> } */}
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


        const isObject = property.type === 'object' || property.properties || checkIfObject(value);

        // Handle nested objects
        if (isObject) {

            const resolvedValue = formState[key] = value || {};

            if (property.readOnly) Object.values(property.properties).forEach((v) => v.readOnly = true)

            return (
                <Accordion>
                    <AccordionHeader onClick={() => setAccordionState(prevState => ({ ...prevState, [key]: !prevState[key] }))}>
                    {header(title)}
                    <FontAwesomeIcon icon={accordionState[key] ? faChevronUp : faChevronDown} />
                    </AccordionHeader>
                    <AccordionContent isopen={accordionState[key] ? 1 : 0}>
                        <DynamicForm 
                            initialValues={resolvedValue} 
                            schema={property} 
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

  const allReadOnly = schema ? Object.values(schema.properties ?? {}).every((property) => property.readOnly) : false;

  return (
    <Form onSubmit={handleSubmit}>
      {renderFormFields()}
      {!allReadOnly && onFormSubmit && <Button type="submit">{submitText}</Button>}
    </Form>
  );
};

export default DynamicForm;
