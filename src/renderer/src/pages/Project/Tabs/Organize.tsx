import { useState } from "react"

import DynamicForm from "../../../components/DynamicForm"
import TerminalModal from "../../../components/TerminalModal"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTerminal } from "@fortawesome/free-solid-svg-icons"
import { TabProps } from "./types"

import organizeSchema from '../../../../../schema/organize.schema.json'
import { PaddedTab } from "@renderer/components/Tabs/styles"
import { ControlButton } from "@renderer/pages/Home/styles"
import Tippy from "@tippyjs/react"

const Organize = ({
  project,
  onFormSubmit,
  blockSubmission = false,
  blockTooltip,
}: TabProps) => {
  const pose_ref_index_extra_description = project.workflow.pose_ref_index_description ?? ""
  const ref_index_len = project.workflow.ref_index_len

  const schema = structuredClone(organizeSchema) as unknown as Schema
  schema.properties.pose_ref_index.description = `${schema.properties.pose_ref_index.description} - ${pose_ref_index_extra_description}`
  schema.properties.pose_ref_index.items.maximum = ref_index_len

  const isOrganized = project.workflow.organized

  const operations = ["Create Training Set"]

  if (!project.config.egocentric_data) operations.unshift("Align Data")

  if (project.config.egocentric_data) delete schema.properties.advanced_options

  if (isOrganized) {
    // @ts-ignore
    Object.values(schema.properties).forEach(v => v.readOnly = true)
  }

  const { pose_ref_index, crop_size, use_video } = project.states?.["egocentric_alignment"]

  const states = pose_ref_index && crop_size && typeof use_video === "boolean" ? {
    pose_ref_index: pose_ref_index?.map(n => String(n)),
    advanced_options: {
      crop_size: crop_size?.map(n => String(n)),
      use_video
    }
  } : undefined

  const [terminal, setTerminal] = useState(false)

  return (
    <PaddedTab>
      <span>
        Open logs:{" "}
        <ControlButton onClick={() => setTerminal(true)}>
          <FontAwesomeIcon icon={faTerminal} />
        </ControlButton>
      </span>

      <TerminalModal
        projectPath={project.config.project_path}
        logName={["egocentric_alignment", "create_trainset"]}
        isOpen={terminal}
        onClose={() => setTerminal(false)}
      />

      <Tippy
        content={blockTooltip}
        placement="bottom"
        hideOnClick={false}
        disabled={!blockSubmission || !blockTooltip}
      >
        <>
          <DynamicForm
            initialValues={states}
            schema={schema}
            blockSubmission={blockSubmission}
            submitText={operations.join(" + ")}
            onFormSubmit={onFormSubmit}
          />
        </>
      </Tippy>
    </PaddedTab>
  )
}

export default Organize