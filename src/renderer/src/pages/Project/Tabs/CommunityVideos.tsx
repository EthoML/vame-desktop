import { useState } from "react"
import TerminalModal from "../../../components/TerminalModal"
import { VideoGrid, VideoType } from "../../../components/VideoGrid"
import { TabProps } from "./types"
import { Button } from "@renderer/components/DynamicForm/styles"
import { PaddedTab } from "@renderer/components/Tabs/styles"
import Tippy from "@tippyjs/react"
import { ControlButton } from "@renderer/pages/Home/styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTerminal } from "@fortawesome/free-solid-svg-icons"

const CommunityVideos = ({
  project,
  onFormSubmit,
  blockSubmission,
  blockTooltip,
}: TabProps) => {
  const [terminal, setTerminal] = useState(false)

  const hasCommunityVideos = project.workflow.community_videos_created

  if (!hasCommunityVideos) return (
    <PaddedTab>
      <span>
        Open logs:{" "}
        <ControlButton onClick={() => setTerminal(true)}>
          <FontAwesomeIcon icon={faTerminal} />
        </ControlButton>
      </span>

      <TerminalModal
        projectPath={project.config.project_path}
        logName={["community_videos"]}
        isOpen={terminal}
        onClose={() => setTerminal(false)}
      />

      <Tippy
        content={blockTooltip}
        placement="bottom"
        hideOnClick={false}
        disabled={!blockSubmission}
      >
        <span>
          <Button
            disabled={blockSubmission}
            onClick={onFormSubmit}
          >
            Create Community Videos
          </Button>
        </span>
      </Tippy>
    </PaddedTab>
  )


  const { videos } = project.assets

  const communityVideos = videos?.community ?? {}

  const organizedVideos = Object.entries(communityVideos).reduce((acc, [label, videos]) => {
    acc[label] = videos.map((videoPath: string) => {
      const number = videoPath.split('-').pop()?.split('_').pop()?.split('.')[0]
      return { path: videoPath, label: `Community ${number}`, idx: Number(number) }
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
      logName={["community_videos"]}
      isOpen={terminal}
      onClose={() => setTerminal(false)}
    />
    <VideoGrid
      videos={organizedVideos}
      project={project}
    />
  </PaddedTab>
}

export default CommunityVideos