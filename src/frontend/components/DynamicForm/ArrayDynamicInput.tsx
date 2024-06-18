import { ChangeEvent, FC, useMemo } from "react";
import { ArrayItemWrapper, ArrayItems } from "./styles";
import BaseDynamicInput from "./BaseDynamicInput";

type ArrayDynamicInputProps = {
  name: string;
  property: ArrayProperty
  initialValue?: any[] | null;
  formState: Record<string, string | number | boolean | readonly string[] | undefined>;
  handleChange: (e: ChangeEvent<HTMLInputElement>, index: number | null, arrayKey: string | null) => void
} | {
  name: string;
  property: null;
  initialValue: any[];
  formState: Record<string, string | number | boolean | readonly string[] | undefined>;
  handleChange: (e: ChangeEvent<HTMLInputElement>, index: number | null, arrayKey: string | null) => void
}

const ArrayDynamicInput: FC<ArrayDynamicInputProps> = ({
  name,
  formState,
  initialValue,
  property,
  handleChange
}) => {

  /*
    // Check if the user can add or remove items
    const canAdd = !property?.maxItems || arrayValue.length < property.maxItems;
    const canRemove = !property?.minItems || arrayValue.length > property.minItems;
  */

  // const handleAddArrayItem = (key) => {
  //   setFormState({
  //     ...formState,
  //     [key]: [...(formState[key] || []), '']
  //   });
  // };

  // const handleRemoveArrayItem = (key, index) => {
  //   const newArray = [...formState[key]];
  //   newArray.splice(index, 1);
  //   setFormState({ ...formState, [key]: newArray });
  // };

  const [canAdd, canRemove] = useMemo(() => [false, false], [])

  return (
    <div>
      <ArrayItems>
        {property ? property?.default?.map((item, index) => {
          const itemKey = `${index}`
          return <ArrayItemWrapper key={itemKey}>

            <BaseDynamicInput
              name={itemKey}
              property={property.items}
              initialValue={item as any}
              formState={formState[name] as any}
              handleChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e, index, name)}
            />
            {/* <ArrayButtons>
              { canRemove && <ArrayButton type="button" onClick={() => handleRemoveArrayItem(key, index)}><FontAwesomeIcon icon={faTrash} /></ArrayButton> }
            </ArrayButtons> */}
          </ArrayItemWrapper>
        }) : initialValue.map((value, index) => {
          const itemKey = `${name}[${index}]`
          return <ArrayItemWrapper key={itemKey}>

            <BaseDynamicInput
              name={itemKey}
              property={null}
              initialValue={value}
              formState={formState}
              handleChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e, index, name)}
            />
            {/* <ArrayButtons>
                { canRemove && <ArrayButton type="button" onClick={() => handleRemoveArrayItem(key, index)}><FontAwesomeIcon icon={faTrash} /></ArrayButton> }
              </ArrayButtons> */}
          </ArrayItemWrapper>
        })}

      </ArrayItems>
      {(canAdd || canRemove) && <small style={{ color: 'gray', fontSize: '10px' }}><b>Note:</b> Array sizes cannot yet be edited. Please specify minItems and maxItems as the same value in the schema.</small>}
      {/* { canAdd && <AddButton type="button" onClick={() => handleAddArrayItem(key)}><FontAwesomeIcon icon={faPlusCircle} /></AddButton> } */}
    </div>
  );
}

export default ArrayDynamicInput