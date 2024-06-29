import styled from "styled-components";

// Accordion Component
export const Accordion = styled.div`
  background-color: #f1f1f1;
  border-radius: 5px;
  margin-bottom: 10px;
`;

export const AccordionHeader = styled.div`
  background-color: black;
  color: white;
  cursor: pointer;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

interface AccordionContentProps {
  isOpen: boolean;
}

export const AccordionContent = styled.div<AccordionContentProps>`
  padding: 10px;
  display: ${props => (props.isOpen ? 'block' : 'none')};
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

export const InputGroup = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 10px;
`;

interface InputLabelProps {
  required: boolean;
}

export const InputLabel = styled.label<InputLabelProps>`

  span {
    font-weight: bold;
  }

  small {
    font-size: 12px;
    color: #666;
  }

  &[required] span:after {
    content: '*';
    color: red;
    margin-left: 5px;
  }

`;

export const Button = styled.button`
  padding: 10px;
  background-color: #007bff;
  width: 100%;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;

  &[disabled] {
    pointer-events: none;
    opacity: 0.5;
  }
`;

export const ArrayItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const ArrayItemWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const List = styled.ol`
  margin: 0;
`;

// export const ArrayButtons = styled.div`
//   display: flex;
//   gap: 5px;
// `;

// export const ArrayButton = styled.button`
//   color: black;
//   background: none;
//   border: none;
//   cursor: pointer;
// `;

// export const AddButton = styled.button`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   margin-top: 10px;
//   padding: 10px;
//   background-color: #007bff;
//   width: 100%;
//   color: white;
//   border: none;
//   border-radius: 3px;
//   cursor: pointer;
// `;

export const FileSelectorBody = styled.div`
  display: grid;
  gap: 10px;

  input[type='file'] {
    color: transparent;
  }

  input[type="file"]::-webkit-file-upload-button {
    background-color: black;
    color: white;
    padding: 5px 20px;
    border-radius: 5px;
    border: none;
  }
`;

export const FileList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  font-size: 13px;
`;

export const FileListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  overflow: auto;
`;