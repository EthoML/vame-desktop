import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { extractDefaultValues } from "@renderer/utils/extractDefaultValues"
import { Button, InputGroup, InputLabel } from './styles';
import DynamicInput from "./DynamicInput"
import { header } from "@renderer/utils/text";
import { isEmpty } from "@renderer/utils/objectIsEmpty";

export interface DynamicFormProps {
  schema: Schema
  initialValues?: Record<string, unknown>
  onFormSubmit: <T = unknown>(data: T) => void
  blockSubmission?: boolean
  submitText: string
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  schema,
  onFormSubmit,
  blockSubmission,
  initialValues,
  submitText = "Submit",
}) => {
  const defaultValues = initialValues && !isEmpty(initialValues) ? initialValues : extractDefaultValues(schema)

  const methods = useForm({
    disabled: blockSubmission,
    defaultValues,
  })

  const properties = Object.entries(schema.properties)
  const readOnly = !properties.some(([_,p])=> !p.readOnly)

  return (
    <FormProvider {...methods}>

      <form
        onSubmit={methods.handleSubmit(onFormSubmit)}>
        {properties.map(([name, property]) => {
          const required = schema.required?.includes(name)

          return (
            <InputGroup key={name}>
              <InputLabel required={required} readOnly={property.readOnly}>
                <span>{property.title ?? header(name)}
                </span>
                <br />
                {property.description && <small>{property.description}</small>}
              </InputLabel>
              <DynamicInput name={name} property={property} required={required} readOnly={property.readOnly} />
            </InputGroup>
          )
        })}

        <Button type="submit" disabled={blockSubmission || readOnly}>{submitText}</Button>

      </form>
    </FormProvider>
  );
}

export default DynamicForm