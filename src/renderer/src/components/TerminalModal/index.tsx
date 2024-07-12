import { FC, MouseEventHandler, useCallback, useRef } from "react";
import LogComponent from "./LogComponent";
import { BaseModalBackground, TerminalContainer } from "./styles";

interface ModalProps {
  projectPath: string;
  logName: string | string[];
  isOpen: boolean;
  onClose: () => void;
}

const TerminalModal: FC<ModalProps> = ({ isOpen, onClose, logName, projectPath }) => {

  const node = useRef(null)

  const handleBackgroundClick = useCallback<MouseEventHandler<HTMLDivElement>>((e) => {

    if (node.current === e.target) {
      onClose()
    }
  }, [node])

  return (
    <>
      {isOpen &&
        <BaseModalBackground onClick={handleBackgroundClick} ref={node}>
          {typeof logName === "string" ? <LogComponent logName={logName} projectPath={projectPath} /> : (
            <TerminalContainer >
              {logName?.map(l => <LogComponent key={l} logName={l} projectPath={projectPath} />)}
            </TerminalContainer>
          )}
        </BaseModalBackground>}
    </>
  )
}

export default TerminalModal