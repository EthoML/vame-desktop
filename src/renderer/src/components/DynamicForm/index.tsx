import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { extractDefaultValues } from "@renderer/utils/extractDefaultValues"
import { Button, Form, InputGroup, InputLabel } from './styles';
import DynamicInput from "./DynamicInput"

interface Props {
  schema: Schema
  initialValues?: Record<string, unknown>
  onFormSubmit: <T = unknown>(data: T) => void
  blockSubmission: boolean
  submitText: string
}

const DynamicForm: React.FC<Props> = ({
  schema,
  onFormSubmit,
  blockSubmission,
  initialValues,
  submitText = "Submit",
}) => {
  const defaultValues = extractDefaultValues(schema) ?? initialValues

  const methods = useForm({
    disabled: blockSubmission,
    defaultValues,
  })

  const properties = Object.entries(schema.properties)

  return (
    <FormProvider {...methods}>
      
      <Form
        onSubmit={methods.handleSubmit(onFormSubmit)}>
        {properties.map(([name, property]) => {
          const required = schema.required?.includes(name)

          return (
          <InputGroup key={name}>
            <InputLabel required={required}>
              <span>{property.title}
              </span>
              <br />
              {property.description && <small>{property.description}</small>}
            </InputLabel>
            <DynamicInput  name={name} property={property} required={required} />
          </InputGroup>
        )})}

        <Button type="submit">{submitText}</Button>

      </Form>
    </FormProvider>
  );
}

export default DynamicForm