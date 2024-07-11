import { useState } from "react"
import { TabProps } from "./types"
import TerminalModal from "../../../components/TerminalModal"
import { Button } from "@renderer/components/DynamicForm/styles"
import { VideoGrid, VideoType } from "@renderer/components/VideoGrid"
import { PaddedTab } from "@renderer/components/Tabs/styles"
import { ControlButton } from "@renderer/pages/Home/styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTerminal } from "@fortawesome/free-solid-svg-icons"
import Tippy from "@tippyjs/react"

const MotifVideos = ({
  project,
  onFormSubmit,
  blockSubmission,
  blockTooltip
}: TabProps) => {
  const [terminal, setTerminal] = useState(false)

  const hasMotifVideos = project.workflow.motif_videos_created

  if (!hasMotifVideos) return (
    <PaddedTab>
      <span>
        Open logs:{" "}
        <ControlButton onClick={() => setTerminal(true)}>
          <FontAwesomeIcon icon={faTerminal} />
        </ControlButton>
      </span>
      <TerminalModal projectPath={project.config.project_path} logName={["motif_videos"]} isOpen={terminal} onClose={() => setTerminal(false)} />

      <Tippy
        content={blockTooltip}
        placement="bottom"
        hideOnClick={false}
        onShow={() => !blockSubmission as false}
      >
        <span>
          <Button
            disabled={blockSubmission}
            onClick={() => onFormSubmit({})}
          >
            Generate Motif Videos
          </Button>
        </span>
      </Tippy>
    </PaddedTab>
  )

  const { videos } = project.assets
  const motifVideos = videos?.motif ?? {}

  const organizedVideos = Object.entries(motifVideos).reduce((acc, [label, videos]) => {
    acc[label] = videos.map((videoPath: string) => {
      const num = videoPath.split("-").pop()?.split("_").pop()?.split(".")[0]!

      return { path: videoPath, label: `Motif ${num}`, idx: Number(num) }
    }).sort((a, b) => a.idx - b.idx)

    return acc
  }, {} as Record<string, VideoType[]>)


  return <PaddedTab>
    <span>
      Open logs:{" "}
      <ControlButton onClick={() => setTerminal(true)}>
        <FontAwesomeIcon icon={faTerminal} />
      </ControlButton>
    </span>

    <TerminalModal
      projectPath={project.config.project_path}
      logName={["motif_videos"]}
      isOpen={terminal}
      onClose={() => setTerminal(false)}
    />

    <VideoGrid
      videos={organizedVideos}
      project={project}
    />
  </PaddedTab>
}

export default MotifVideos