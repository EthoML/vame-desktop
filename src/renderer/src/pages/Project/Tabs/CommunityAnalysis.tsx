import { useState } from "react"

import DynamicForm from "../../../components/DynamicForm"

import communitySchema from '../../../../../schema/community.schema.json'
import { TabProps } from "./types"
import TerminalModal from "../../../components/TerminalModal"
import { ControlButton } from "@renderer/pages/Home/styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTerminal } from "@fortawesome/free-solid-svg-icons"
import { PaddedTab } from "@renderer/components/Tabs/styles"
import Tippy from "@tippyjs/react"

export const CommunityAnalysis = ({
  project,
  onFormSubmit,
  blockSubmission,
  blockTooltip,
}: TabProps) => {
  const [terminal, setTerminal] = useState(false)

  const schema = structuredClone(communitySchema) as Schema

  const communitiesCreated = project.workflow.communities_created
  const states = project.states?.["community"]

  if (communitiesCreated) {
    Object.values(schema.properties).forEach(v => v.readOnly = true)
  }

  return (
    <PaddedTab>
      <ControlButton onClick={() => setTerminal(true)}>
        <FontAwesomeIcon icon={faTerminal} />
      </ControlButton>

      <TerminalModal
        projectPath={project.config.project_path} logName={["community"]}
        isOpen={terminal}
        onClose={() => setTerminal(false)}
      />

      <Tippy 
        content={blockTooltip} 
        placement="bottom" 
        hideOnClick={false} 
        onShow={() => !blockSubmission as false}
      >
        <DynamicForm
          initialValues={states ?? {}}
          schema={schema}
          blockSubmission={blockSubmission}
          submitText={"Create Communities"}
          onFormSubmit={onFormSubmit}
        />
      </Tippy>
    </PaddedTab>
  )

}