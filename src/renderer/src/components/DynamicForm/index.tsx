import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import Button from "../Button"
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
  const methods = useForm({
    disabled: blockSubmission,
    defaultValues: initialValues,
  })

  const properties = Object.entries(schema.properties)
  // const isRequired = useCallback((key: string) => schema.required?.includes(key), [schema])

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onFormSubmit)}>

        {properties.map(([name, property]) => (
          <DynamicInput key={name} name={name} property={property} />
        ))}

        <Button type="submit">{submitText}</Button>

      </form>
    </FormProvider>
  );
}

export default DynamicForm