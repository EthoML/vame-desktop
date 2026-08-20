import React, { useState } from "react";
import {
    Accordion,
    AccordionHeader,
    AccordionContent,
} from "@renderer/components/DynamicForm/styles";
import { PaddedTab } from "@renderer/components/Tabs/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import DynamicForm from "@renderer/components/DynamicForm";
import communitySchema from "../../../../../schema/community.schema.json";
import communityVideosGenerateSchema from "../../../../../schema/community-videos-generate.schema.json";
import communityImagesGetSchema from "../../../../../schema/community-images-get.schema.json";
import { communityAnalysisVAMEProject } from "../../../context/Projects/api/communityAnalysisVAMEProject";
import { createCommunityVideosVAMEProject } from "../../../context/Projects/api/createCommunityVideosVAMEProject";
import { getCommunityVideosVAMEProject } from "../../../context/Projects/api/getCommunityVideosVAMEProject";
import { getCommunityImagesVAMEProject } from "../../../context/Projects/api/getCommunityImagesVAMEProject";
import { StepBadge, StepStateLine, ErrorNote, OptionalTag } from "@renderer/components/StepStatus";
import { useStepPolling, stepDisplayState } from "./useStepPolling";
import ResultImageViewer from "@renderer/components/ResultImageViewer";
import ResultVideoViewer from "@renderer/components/ResultVideoViewer";

const ALGO_OPTIONS = communityImagesGetSchema.properties.segmentation_algorithm.enum as string[];

type CommunityAnalysisAccordionProps = {
    project: ProjectType;
    blockSubmit: boolean;
    setBlockSubmit: (value: boolean) => void;
    onFormSubmit: () => Promise<void>;
};

const CommunityAnalysisAccordion = ({
    project,
    blockSubmit,
    setBlockSubmit,
    onFormSubmit,
}: CommunityAnalysisAccordionProps) => {
    const [openSteps, setOpenSteps] = useState([false, false, false]);
    const [communityVideosLoading, setCommunityVideosLoading] = useState(false);
    const [communityVideosError, setCommunityVideosError] = useState<string | null>(null);

    const sessionNames: string[] = (project.config as any)?.session_names || [];

    // States from project
    const community_videos_session = project.states?.community_videos || {};
    const communityVideosCompleted = community_videos_session.execution_state === "success";
    const [communityLoading, setCommunityLoading] = useState(false);
    const [communityError, setCommunityError] = useState<string | null>(null);

    // States from project
    const community_session = project.states?.community || {};
    const communityAnalysisCompleted = community_session.execution_state === "success";

    const finishStep = async (clearLoading: () => void) => {
        clearLoading();
        try {
            await onFormSubmit();
        } catch (e) {
            console.error("Error calling onFormSubmit:", e);
        }
        setBlockSubmit(false);
    };

    const communityPoll = useStepPolling(project.config.project_path, "community", () =>
        finishStep(() => setCommunityLoading(false))
    );
    const communityVideosPoll = useStepPolling(project.config.project_path, "community_videos", () =>
        finishStep(() => setCommunityVideosLoading(false))
    );

    // Handle form submission for community analysis
    const handleRunCommunityAnalysis = async (formData: any) => {
        setCommunityLoading(true);
        setCommunityError(null);
        setBlockSubmit(true);
        try {
            await communityAnalysisVAMEProject({
                project: project.config.project_path,
                ...formData,
            });
            communityPoll.start();
        } catch (err: any) {
            setCommunityError(err.message || "Failed to start community analysis.");
            setCommunityLoading(false);
            setBlockSubmit(false);
        }
    };

    const handleCreateCommunityVideos = async (formData: any) => {
        setCommunityVideosLoading(true);
        setCommunityVideosError(null);
        setBlockSubmit(true);
        try {
            await createCommunityVideosVAMEProject({
                project: project.config.project_path,
                ...formData,
            });
            communityVideosPoll.start();
        } catch (err: any) {
            setCommunityVideosError(err.message || "Failed to start community video creation.");
            setCommunityVideosLoading(false);
            setBlockSubmit(false);
        }
    };

    // Toggle handler for accordions
    const handleToggle = (idx: number, enabled: boolean) => {
        if (!enabled) return;
        setOpenSteps((prev) => {
            const next = [...prev];
            next[idx] = !next[idx];
            return next;
        });
    };

    return (
        <PaddedTab>
            {/* Accordion 1: Run Community Analysis */}
            <Accordion>
                <AccordionHeader
                    $disabled={false}
                    onClick={() => handleToggle(0, true)}
                >
                    5.1 Run Community Analysis
                    <StepBadge state={communityPoll.polling ? "running" : community_session.execution_state} />
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[0] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[0]}>
                    <div>
                        <DynamicForm
                            schema={communitySchema as unknown as Schema}
                            blockSubmission={blockSubmit || communityPoll.polling}
                            submitText={communityLoading || communityPoll.polling ? "Running..." : "Run Community Analysis"}
                            onFormSubmit={handleRunCommunityAnalysis}
                            showLogsButton={true}
                            logName={["community"]}
                            projectPath={project.config.project_path}
                        />
                        {communityError && <ErrorNote>{communityError}</ErrorNote>}
                        <StepStateLine state={stepDisplayState(communityPoll, community_session.execution_state)} polling={communityPoll.polling} noun="Community analysis" />
                    </div>
                </AccordionContent>
            </Accordion>
            {/* Accordion 2: Visualize Results - Images (independent of videos) */}
            <Accordion>
                <AccordionHeader
                    $disabled={!communityAnalysisCompleted}
                    onClick={() => handleToggle(1, communityAnalysisCompleted)}
                >
                    5.2 Visualize Results - Images
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[1] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[1]}>
                    <ResultImageViewer
                        open={openSteps[1]}
                        algoOptions={ALGO_OPTIONS}
                        altPrefix="Community tree"
                        emptyText="No community image available for this selection."
                        load={async ({ segmentation_algorithm }) => {
                            const data = await getCommunityImagesVAMEProject({
                                project: project.config.project_path,
                                segmentation_algorithm: segmentation_algorithm!,
                            });
                            return data?.tree_image ? `data:image/png;base64,${data.tree_image.content}` : null;
                        }}
                    />
                </AccordionContent>
            </Accordion>

            {/* Accordion 3: Create & View Community Videos (optional) */}
            <Accordion>
                <AccordionHeader
                    $disabled={!communityAnalysisCompleted}
                    onClick={() => handleToggle(2, communityAnalysisCompleted)}
                >
                    5.3 Create &amp; View Community Videos
                    <StepBadge state={communityVideosPoll.polling ? "running" : community_videos_session.execution_state} />
                    <OptionalTag />
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[2] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[2]}>
                    <div>
                        <DynamicForm
                            schema={communityVideosGenerateSchema as unknown as Schema}
                            blockSubmission={blockSubmit || communityVideosPoll.polling}
                            submitText={communityVideosLoading || communityVideosPoll.polling ? "Creating..." : "Create Community Videos"}
                            onFormSubmit={handleCreateCommunityVideos}
                            showLogsButton={true}
                            logName={["community_videos"]}
                            projectPath={project.config.project_path}
                        />
                        {communityVideosError && <ErrorNote>{communityVideosError}</ErrorNote>}
                        <StepStateLine state={stepDisplayState(communityVideosPoll, community_videos_session.execution_state)} polling={communityVideosPoll.polling} noun="Video creation" />

                        {communityVideosCompleted && (
                            <div style={{ marginTop: "var(--space-5)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--color-border)" }}>
                                <h3 style={{ fontSize: "var(--text-lg)", margin: 0 }}>Community videos</h3>
                                <ResultVideoViewer
                                    open={openSteps[2] && communityVideosCompleted}
                                    algoOptions={ALGO_OPTIONS}
                                    sessionOptions={sessionNames}
                                    emptyText="No community videos available for this selection."
                                    load={async ({ segmentation_algorithm, session }) => {
                                        const data = await getCommunityVideosVAMEProject({
                                            project: project.config.project_path,
                                            segmentation_algorithm: segmentation_algorithm!,
                                            session: session!,
                                        });
                                        return data.videos;
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </AccordionContent>
            </Accordion>
        </PaddedTab>
    );
};

export default CommunityAnalysisAccordion;
