import { useMemo } from "react";
import { Control, useFieldArray, useFormContext } from "react-hook-form";
import FileInput from "./FileSelector";
import Button from "../Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import DynamicInput from "./DynamicInput";

type ArrayInputProps = {
  name: string;
  property: ArrayProperty;
  required?: boolean;
}

const ArrayInput = ({
  name,
  property,
  required,
}: ArrayInputProps) => {

  const methods = useFormContext()

  const { fields, remove, append } = useFieldArray({
    name, control: methods.control, rules: {
      minLength: property.minItems,
      maxLength: property.maxItems,
      required: required,
    },
  })

  return (<>
    <Button type="button" onClick={() => append(null)} disabled={fields.length === property.maxItems}>
      <FontAwesomeIcon icon={faPlus} />
    </Button>
    {fields.map((item, index) => (
      <li key={item.id}>
        <DynamicInput
          name={`${name}.${index}`}
          property={property.items}
        />
        <Button type="button" onClick={() => remove(index)} disabled={fields.length === property.minItems}>
          <FontAwesomeIcon icon={faTrash} />
        </Button>
      </li>
    ))}
  </>);
};

export default ArrayInput;
