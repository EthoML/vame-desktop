import { DynamicFormProps } from "@renderer/components/DynamicForm"

// onRefresh reloads the project without re-submitting: onFormSubmit *starts*
// the work, so completion (learned by polling) needs another door.
export type TabProps = {
    project: ProjectType
    onFormSubmit: DynamicFormProps['onFormSubmit'],
    onRefresh?: () => Promise<void>
    blockSubmission: true
    blockTooltip: string
} | {
    project: ProjectType
    onFormSubmit: DynamicFormProps['onFormSubmit'],
    onRefresh?: () => Promise<void>
    blockSubmission: false
    blockTooltip?: string
}
