

import styled from "styled-components"
import { TabProps } from "./types"
import TerminalModal from "../../../components/TerminalModal"
import { useState } from "react"
import { Button } from "@renderer/components/DynamicForm/styles"
import { useProjects } from "@renderer/context/Projects"
import { PaddedTab } from "@renderer/components/Tabs/styles"
import { ControlButton } from "@renderer/pages/Home/styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTerminal } from "@fortawesome/free-solid-svg-icons"
import Tippy from "@tippyjs/react"

const FlexDiv = styled.div`
    display: flex;
`

const Image = styled.img`
    width: 400px;
    height: auto;
`

const Model = ({
  project,
  onFormSubmit,
  blockSubmission,
  blockTooltip
}: TabProps) => {
  const { getAssetsPath } = useProjects()
  const [terminal, setTerminal] = useState(false)
  const isModeled = project.workflow.modeled

  if (isModeled) {

    const { images } = project.assets

    const evaluationImages = images?.evaluation ?? []

    return (
      <PaddedTab>
        <ControlButton onClick={() => setTerminal(true)}>
          <FontAwesomeIcon icon={faTerminal} />
        </ControlButton>

        <TerminalModal
          projectPath={project.config.project_path}
          logName={["train_model", "evaluate_model"]}
          isOpen={terminal}
          onClose={() => setTerminal(false)}
        />

        <FlexDiv>
          {evaluationImages.map(((imgPath: string) => {
            return <Image src={
              `${getAssetsPath(project.config.project_path, imgPath)}?${Date.now()}` // Ensure images refresh when same URL is used
            } alt={imgPath} key={imgPath} />
          }))}
        </FlexDiv>
        <br />
        <Tippy
          content={blockTooltip}
          placement="bottom"
          hideOnClick={false}
          onShow={() => !blockSubmission as false}
        >
          <span>

            <Button
              disabled={blockSubmission}
              onClick={() => onFormSubmit({ evaluate: true })}
            >
              Regenerate Images
            </Button>
          </span>
        </Tippy>
      </PaddedTab>
    )
  }

  // Show the form to train the model
  return (
    <PaddedTab>
      <Tippy
        content={blockTooltip}
        placement="bottom"
        hideOnClick={false}
        onShow={() => !blockSubmission as false}
      >
        <span>

          <Button
            disabled={blockSubmission}
            onClick={() => onFormSubmit({ evaluate: true, train: true })}
          >
            Train Model
          </Button>
        </span>
      </Tippy>
    </PaddedTab>
  )
}

export default Model