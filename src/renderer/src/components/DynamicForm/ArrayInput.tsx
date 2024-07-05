import { useFieldArray, useFormContext } from "react-hook-form";
import DynamicInput from "./DynamicInput";
import { ArrayItems, ArrayItemWrapper } from "./styles";

type ArrayInputProps = {
  name: string;
  property: ArrayProperty;
  required?: boolean;
  readOnly?: boolean;
}

const ArrayInput = ({
  name,
  property,
  required,
  readOnly,
}: ArrayInputProps) => {

  const methods = useFormContext()

  const { fields } = useFieldArray({
    name, control: methods.control, rules: {
      minLength: property.minItems,
      maxLength: property.maxItems,
      required: required,
    },
  })

  return (
    <ArrayItems>
      {/* <AddButton type="button" onClick={() => append(null)} disabled={fields.length === property.maxItems}>
        <FontAwesomeIcon icon={faPlus} />
      </AddButton> */}

      {fields.map((item, index) => (
        <ArrayItemWrapper key={item.id}>
          <DynamicInput
            name={`${name}.${index}`}
            property={property.items}
            readOnly={readOnly}
          />
          {/* <Button type="button" onClick={() => remove(index)} disabled={fields.length === property.minItems}>
            <FontAwesomeIcon icon={faTrash} />
          </Button> */}
        </ArrayItemWrapper>
      ))}
    </ArrayItems>
  );
};

export default ArrayInput;
