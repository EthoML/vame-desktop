import styled, { css } from "styled-components";
import ButtonComponent from "@renderer/components/Button"

// Styled input component with constrained width
export const StyledInput = styled.input`
  width: 350px;
  max-width: 100%;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-sizing: border-box;
  color: var(--color-text);
  background-color: var(--color-surface);

  &:focus {
    outline: none;
    border-color: var(--color-accent);
  }

  &:disabled {
    background-color: var(--color-surface-sunken);
    color: var(--color-text-muted);
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

// Styled select component with constrained width
export const StyledSelect = styled.select`
  width: 350px;
  max-width: 100%;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-sizing: border-box;
  color: var(--color-text);
  background-color: var(--color-surface);

  &:focus {
    outline: none;
    border-color: var(--color-accent);
  }

  &:disabled {
    background-color: var(--color-surface-sunken);
    color: var(--color-text-muted);
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

// --- Layout for the whole form ---
export const FormLayout = styled.form`
  display: flex;
  flex-direction: column;
  min-height: 0; /* for flexbox scrolling */
`;

/* --- Footer for the button --- */
export const FormFooter = styled.div`
  flex-shrink: 0;
  padding: 16px 0 24px 0;
  background: transparent;
  display: flex;
  align-items: flex-end;
  bottom: 0;
`;

/* --- Scrollable content area above the button --- */
export const FormScrollContent = styled.div`
  height: calc(100% - 56px);
  overflow-y: auto;
  min-height: 0;
`;

// Accordion Component
// flex-shrink: 0 keeps each accordion at its natural height inside the
// flex-column tab body — otherwise an expanded panel would squeeze its
// siblings instead of letting the tab scroll.
export const Accordion = styled.div`
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  margin-bottom: 10px;
  overflow: hidden;
  flex-shrink: 0;
`;

export const AccordionHeader = styled.div<{ $disabled?: boolean }>`
  background-color: var(--color-surface-sunken);
  color: var(--color-text);
  font-weight: 600;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  transition: background 0.15s, color 0.15s, opacity 0.15s;

  &:hover {
    background-color: var(--color-border);
  }
`;

interface AccordionContentProps {
  $isOpen: boolean;
}

export const AccordionContent = styled.div<AccordionContentProps>`
  padding: 10px;
  display: ${props => (props.$isOpen ? 'block' : 'none')};
`;

export const InputGroup = styled.div<{ $subfield?: boolean }>`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 4px; /* Reduced gap between label and input */
  margin-bottom: 20px; /* Increased spacing between form items */

  /* A parameter nested under its controlling toggle: indented with a left rail
     and pulled up tight to read as a child of the field above it. */
  ${({ $subfield }) =>
    $subfield &&
    css`
      margin-top: -8px;
      margin-bottom: 12px;
      margin-left: 28px;
      padding-left: 12px;
      border-left: 2px solid var(--color-border);
    `}
`;

// A vertical group of labelled checkboxes (multi-select rendered as checkboxes).
export const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 350px;
  max-width: 100%;
  max-height: 220px;
  overflow-y: auto;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-surface);
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: var(--text-sm);

  input {
    cursor: pointer;
  }
`;

interface InputLabelProps {
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
}

export const InputLabel = styled.label<InputLabelProps>`
  display: flex;
  align-items: flex-start;

  span {
    font-weight: bold;
  }

  &[disabled] {
    span,
    small {
      color: var(--color-text-muted);
    }
  }

  small {
    font-size: var(--text-caption);
    color: var(--color-text-secondary);
    margin-left: 5px;
    &:before {
      content: '(';
    }
    &:after {
      content: ')';
    }
  }

  &[required] span:after {
    content: '*';
    color: var(--color-error);
    margin-left: 5px;
  }

  &[readOnly] span:after {
    content: 'read only';
    color: var(--color-text-muted);
    margin-left: 5px;
  }
`;

// Primary form submit — sized to content (not a fixed 400px block),
// matching the shared Button's primary variant.
export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 160px;
  padding: 10px 20px;
  background-color: var(--color-accent);
  color: var(--color-on-accent);
  border: 1px solid var(--color-accent);
  border-radius: 6px;
  font-family: inherit;
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover:not([disabled]),
  &:focus-visible {
    background-color: var(--color-accent-hover);
    border-color: var(--color-accent-hover);
  }

  &[disabled] {
    pointer-events: none;
    opacity: 0.5;
  }
`;

// Secondary action beside the submit — outlined/neutral (the Logs toggle).
export const LogsButton = styled(Button)`
  min-width: 0;
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border-strong);
  margin-left: 10px;

  &:hover:not([disabled]),
  &:focus-visible {
    background-color: var(--color-surface-sunken);
    color: var(--color-text);
    border-color: var(--color-border-strong);
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

export const ArrayButtons = styled.div`
  display: flex;
  gap: 5px;
`;

export const ArrayButton = styled.button`
  color: var(--color-text-secondary);
  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    color: var(--color-text);
  }
`;

export const AddButton = styled(ButtonComponent)`
  background-color: var(--color-accent);
  color: var(--color-on-accent);
  width: 30px;
  height: 30px;
  min-width: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const FileSelectorBody = styled.div`
  display: grid;
  gap: 10px;

  input[type='file'] {
    color: transparent;
  }

  input[type="file"]::-webkit-file-upload-button {
    background-color: var(--color-accent);
    color: var(--color-on-accent);
    padding: 5px 20px;
    border-radius: 5px;
    border: none;
  }
`;

export const FileList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-caption);
`;

export const FileListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  overflow: auto;
`;
