import { useState } from "react"

import { TabProps } from "./types"
import TerminalModal from "../../../components/TerminalModal"
import { Button } from "@renderer/components/DynamicForm/styles"
import { PaddedTab } from "@renderer/components/Tabs/styles"
import { ControlButton } from "@renderer/pages/Home/styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTerminal } from "@fortawesome/free-solid-svg-icons"
import Tippy from "@tippyjs/react"


const Segmentation = ({
  project,
  onFormSubmit,
  blockSubmission,
  blockTooltip
}: TabProps) => {
  const [terminal, setTerminal] = useState(false)
  const isSegmented = project.workflow.segmented
  const projectPath = project.config.project_path

  return (
    <PaddedTab>
      {isSegmented ?
        <>
          <span>
            Open logs:{" "}
            <ControlButton onClick={() => setTerminal(true)}>
              <FontAwesomeIcon icon={faTerminal} />
            </ControlButton>
          </span>

          <TerminalModal projectPath={projectPath} logName={["pose_segmentation"]} isOpen={terminal} onClose={() => setTerminal(false)} />
          <p>Pose segmentation has been completed successfully!</p>
        </>
        :
        <PaddedTab>
          <span>
            Open logs:{" "}
            <ControlButton onClick={() => setTerminal(true)}>
              <FontAwesomeIcon icon={faTerminal} />
            </ControlButton>
          </span>
          <TerminalModal projectPath={projectPath} logName={["pose_segmentation"]} isOpen={terminal} onClose={() => setTerminal(false)} />

          <Tippy
            content={blockTooltip}
            placement="bottom"
            hideOnClick={false}
            disabled={!blockSubmission || !blockTooltip}
          >
            <span>
              <Button
                disabled={blockSubmission}
                onClick={() => onFormSubmit({})}
              >
                Run Pose Segmentation
              </Button>
            </span>
          </Tippy>
        </PaddedTab>}
    </PaddedTab>
  )
}

export default Segmentation