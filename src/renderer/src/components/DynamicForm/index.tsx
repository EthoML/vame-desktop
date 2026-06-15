import React, { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTerminal } from "@fortawesome/free-solid-svg-icons"
import LogComponent from "../TerminalModal/LogComponent"
import { ErrorNote } from "@renderer/components/StepStatus"
import { extractDefaultValues } from "@renderer/utils/extractDefaultValues"
import { Button, LogsButton, InputGroup, InputLabel, FormLayout, FormScrollContent, FormFooter } from './styles';
import DynamicInput from "./DynamicInput"
import { header } from "@renderer/utils/text";

export interface DynamicFormProps {
  schema: Schema
  initialValues?: Record<string, unknown>
  onFormSubmit: <T = unknown>(data: T) => void
  blockSubmission?: boolean
  submitText: string
  showLogsButton?: boolean
  logName?: string | string[]
  projectPath?: string
  /**
   * Cross-field validation. Returns a list of human-readable requirements that
   * are NOT yet satisfied; an empty list means the form is valid. While any
   * remain, the submit button is disabled and the list is surfaced to the user.
   */
  validate?: (values: Record<string, unknown>) => string[]
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  schema,
  onFormSubmit,
  blockSubmission,
  initialValues,
  submitText = "Submit",
  showLogsButton = false,
  logName,
  projectPath,
  validate,
}) => {
  const [logsOpen, setLogsOpen] = useState(false)

  const defaultValues = {
    ...extractDefaultValues(schema),
    ...initialValues
  }

  const methods = useForm({
    disabled: blockSubmission,
    defaultValues,
  })

  const properties = Object.entries(schema.properties)
  const readOnly = properties.length > 0 && !properties.some(([_, p]) => !p.readOnly)

  const logNames = logName ? (Array.isArray(logName) ? logName : [logName]) : []

  // Subscribe to all values so conditional fields (visibleWhen) re-evaluate as
  // the user edits their dependencies.
  const values = methods.watch()

  // Evaluate a visibleWhen/disabledWhen condition against the current values.
  const evalCondition = (cond: NonNullable<Property["visibleWhen"]>): boolean => {
    const dep = (values as Record<string, unknown>)[cond.field]
    const arr = Array.isArray(dep) ? dep : dep != null && dep !== "" ? [dep] : []
    if (cond.fileExtension) {
      return arr.length > 0 && arr.every((p) => String(p).toLowerCase().endsWith(cond.fileExtension!))
    }
    if (cond.nonEmpty) return arr.length > 0
    if ("equals" in cond) return dep === cond.equals
    return true
  }

  const isVisible = (property: Property): boolean =>
    !property.visibleWhen || evalCondition(property.visibleWhen)

  const isDisabled = (property: Property): boolean =>
    !!property.disabledWhen && evalCondition(property.disabledWhen)

  // Unmet requirements (empty = valid). Shown once the user starts editing so a
  // pristine form isn't pre-painted with errors, but the button stays disabled.
  const validationErrors = validate ? validate(values as Record<string, unknown>) : []
  const showValidation = validationErrors.length > 0 && methods.formState.isDirty

  return (
    <FormProvider {...methods}>
      <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
        {/* Left column: the form (everything that was in the collapsible) */}
        <FormLayout
          onSubmit={methods.handleSubmit(onFormSubmit)}
          style={{ flex: 1, minWidth: 0 }}
        >
          <FormScrollContent>
            {properties.map(([name, property]) => {
              if (!isVisible(property)) return null
              const required = schema.required?.includes(name)

              return (
                <InputGroup key={name} $subfield={property.subfield}>
                  <InputLabel required={required} readOnly={property.readOnly} disabled={isDisabled(property)}>
                    <span>{property.title ?? header(name)}</span>
                    {property.description && <small>{property.description}</small>}
                  </InputLabel>
                  <DynamicInput name={name} property={property} required={required} readOnly={property.readOnly} disabled={isDisabled(property)} />
                </InputGroup>
              )
            })}
          </FormScrollContent>
          {showValidation && (
            <ErrorNote>
              {validationErrors.map((msg) => (
                <span key={msg} style={{ display: "block" }}>• {msg}</span>
              ))}
            </ErrorNote>
          )}
          <FormFooter>
            <Button
              type="submit"
              disabled={blockSubmission || readOnly || validationErrors.length > 0}
            >
              {submitText}
            </Button>
            {showLogsButton && (
              <LogsButton type="button" onClick={() => setLogsOpen((open) => !open)}>
                {logsOpen ? "Hide Logs" : "Logs"} <FontAwesomeIcon icon={faTerminal} />
              </LogsButton>
            )}
          </FormFooter>
        </FormLayout>

        {/* Right column: logs, shown beside the form instead of as a modal */}
        {showLogsButton && logsOpen && (
          <div
            style={{
              flex: 1,
              minWidth: 0,
              alignSelf: "stretch",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              minHeight: 240,
              maxHeight: 600,
              overflowY: "auto",
            }}
          >
            {logNames.length === 0 ? (
              <LogComponent projectPath={projectPath || ""} />
            ) : (
              logNames.map((l) => (
                <LogComponent key={l} logName={l} projectPath={projectPath || ""} />
              ))
            )}
          </div>
        )}
      </div>
    </FormProvider>
  );
}

export default DynamicForm
