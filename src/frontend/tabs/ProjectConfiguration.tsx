import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"


const ProjectConfiguration = ({
    configuration,
    schema,
    onFormSubmit
}: {
    configuration: DynamicFormProps['initialValues']
    schema?: DynamicFormProps['schema']
    onFormSubmit?: DynamicFormProps['onFormSubmit']
}) => {
    return (
        <DynamicForm 
            initialValues={configuration} 
            schema={schema}
            onFormSubmit={onFormSubmit} 
        />
    )
}

export default ProjectConfiguration