import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"


const ProjectConfiguration = ({
    configuration,
    onFormSubmit
}: {
    configuration: DynamicFormProps['initialValues']
    onFormSubmit?: DynamicFormProps['onFormSubmit']
}) => {
    return (
        <DynamicForm initialValues={configuration} onFormSubmit={onFormSubmit} />
    )
}

export default ProjectConfiguration