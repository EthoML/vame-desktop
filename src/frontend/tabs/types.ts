import Pipeline from "../Pipeline"
import { DynamicFormProps } from "../components/DynamicForm"
import { DisableToggle } from "../types"

export type TabProps = {
    pipeline: Pipeline
    onFormSubmit?: DynamicFormProps['onFormSubmit'],
    block: DisableToggle
}