import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"

import projectConfigSchema from '../../schema/config.schema.json'


const ProjectConfiguration = ({
    configuration,
    onFormSubmit
}: {
    configuration: DynamicFormProps['initialValues']
    onFormSubmit?: DynamicFormProps['onFormSubmit']
}) => {
    return (
        <DynamicForm 
            initialValues={configuration} 
            schema={projectConfigSchema}
            onFormSubmit={onFormSubmit} 
        />
    )
}

export default ProjectConfiguration