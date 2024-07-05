import { DynamicFormProps } from "@renderer/components/DynamicForm"

export type TabProps = {
    project: Project
    onFormSubmit: DynamicFormProps['onFormSubmit'],
    blockSubmission: true
    blockTooltip: string
} | {
    project: Project
    onFormSubmit: DynamicFormProps['onFormSubmit'],
    blockSubmission: false
    blockTooltip?: string
}