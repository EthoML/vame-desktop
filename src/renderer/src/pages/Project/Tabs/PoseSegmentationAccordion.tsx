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
import poseSegmentationSchema from "../../../../../schema/pose-segmentation.schema.json";
import motifVideosGenerateSchema from "../../../../../schema/motif-videos-generate.schema.json";
import motifVideosGetSchema from "../../../../../schema/motif-videos-get.schema.json";
import { segmentVAMEProject } from "../../../context/Projects/api/segmentVAMEProject";
import { createMotifVideosVAMEProject } from "../../../context/Projects/api/createMotifVideosVAMEProject";
import { getSegmentVideosVAMEProject } from "../../../context/Projects/api/getSegmentVideosVAMEProject";
import { StepBadge, StepStateLine, ErrorNote, OptionalTag } from "@renderer/components/StepStatus";
import { useStepPolling, stepDisplayState } from "./useStepPolling";
import ResultVideoViewer from "@renderer/components/ResultVideoViewer";

const ALGO_OPTIONS = motifVideosGetSchema.properties.segmentation_algorithm.enum as string[];

type PoseSegmentationAccordionProps = {
    project: ProjectType;
    blockSubmit: boolean;
    setBlockSubmit: (value: boolean) => void;
    onFormSubmit: () => Promise<void>;
};

const PoseSegmentationAccordion = ({
    project,
    blockSubmit,
    setBlockSubmit,
    onFormSubmit,
}: PoseSegmentationAccordionProps) => {
    const [openSteps, setOpenSteps] = useState([false, false]);
    const [motifLoading, setMotifLoading] = useState(false);
    const [motifError, setMotifError] = useState<string | null>(null);

    const sessionNames: string[] = (project.config as any)?.session_names || [];

    // States from project
    const motif_session = project.states?.motif_videos || {};
    const motifCompleted = motif_session.execution_state === "success";
    const [segmentationLoading, setSegmentationLoading] = useState(false);
    const [segmentationError, setSegmentationError] = useState<string | null>(null);

    // States from project
    const segment_session = project.states?.segment_session || {};
    const segmented = segment_session.execution_state === "success";

    const finishStep = async (clearLoading: () => void) => {
        clearLoading();
        try {
            await onFormSubmit();
        } catch (e) {
            console.error("Error calling onFormSubmit:", e);
        }
        setBlockSubmit(false);
    };

    const segmentationPoll = useStepPolling(project.config.project_path, "segment_session", () =>
        finishStep(() => setSegmentationLoading(false))
    );
    const motifPoll = useStepPolling(project.config.project_path, "motif_videos", () =>
        finishStep(() => setMotifLoading(false))
    );

    // Block the Run button until the inputs are valid: at least one cluster and
    // at least one segmentation algorithm selected.
    const validateSegmentation = (values: Record<string, unknown>): string[] => {
        const errors: string[] = [];
        const n = Number(values.n_clusters);
        if (!Number.isFinite(n) || n < 1) {
            errors.push("Number of clusters must be greater than zero.");
        }
        const algos = Array.isArray(values.segmentation_algorithms)
            ? values.segmentation_algorithms
            : values.segmentation_algorithms
            ? [values.segmentation_algorithms]
            : [];
        if (algos.length === 0) {
            errors.push("Select at least one segmentation algorithm.");
        }
        return errors;
    };

    // Handle form submission for segmentation
    const handleRunSegmentation = async (formData: any) => {
        setSegmentationLoading(true);
        setSegmentationError(null);
        setBlockSubmit(true);
        try {
            await segmentVAMEProject({
                project: project.config.project_path,
                ...formData,
            });
            segmentationPoll.start();
        } catch (err: any) {
            setSegmentationError(err.message || "Failed to start segmentation.");
            setSegmentationLoading(false);
            setBlockSubmit(false);
        }
    };

    const handleCreateMotifVideos = async (formData: any) => {
        setMotifLoading(true);
        setMotifError(null);
        setBlockSubmit(true);
        try {
            await createMotifVideosVAMEProject({
                project: project.config.project_path,
                ...formData,
            });
            motifPoll.start();
        } catch (err: any) {
            setMotifError(err.message || "Failed to start video creation.");
            setMotifLoading(false);
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
            {/* Accordion 1: Run Segmentation */}
            <Accordion>
                <AccordionHeader
                    $disabled={false}
                    onClick={() => handleToggle(0, true)}
                >
                    4.1 Run Segmentation
                    <StepBadge state={segmentationPoll.polling ? "running" : segment_session.execution_state} />
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[0] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[0]}>
                    <div>
                        <DynamicForm
                            schema={poseSegmentationSchema as unknown as Schema}
                            blockSubmission={blockSubmit || segmentationPoll.polling}
                            submitText={segmentationLoading || segmentationPoll.polling ? "Running..." : "Run Segmentation"}
                            onFormSubmit={handleRunSegmentation}
                            validate={validateSegmentation}
                            showLogsButton={true}
                            logName={["pose_segmentation"]}
                            projectPath={project.config.project_path}
                        />
                        {segmentationError && <ErrorNote>{segmentationError}</ErrorNote>}
                        <StepStateLine state={stepDisplayState(segmentationPoll, segment_session.execution_state)} polling={segmentationPoll.polling} noun="Segmentation" />
                    </div>
                </AccordionContent>
            </Accordion>
            {/* Accordion 2: Create & View Segmented Videos (optional) */}
            <Accordion>
                <AccordionHeader
                    $disabled={!segmented}
                    onClick={() => handleToggle(1, segmented)}
                >
                    4.2 Create &amp; View Segmented Videos
                    <StepBadge state={motifPoll.polling ? "running" : motif_session.execution_state} />
                    <OptionalTag />
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[1] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[1]}>
                    <div>
                        <DynamicForm
                            schema={motifVideosGenerateSchema as unknown as Schema}
                            blockSubmission={blockSubmit || motifPoll.polling}
                            submitText={motifLoading || motifPoll.polling ? "Creating..." : "Create Segmented Videos"}
                            onFormSubmit={handleCreateMotifVideos}
                            showLogsButton={true}
                            logName={["motif_videos"]}
                            projectPath={project.config.project_path}
                        />
                        {motifError && <ErrorNote>{motifError}</ErrorNote>}
                        <StepStateLine state={stepDisplayState(motifPoll, motif_session.execution_state)} polling={motifPoll.polling} noun="Video creation" />

                        {motifCompleted && (
                            <div style={{ marginTop: "var(--space-5)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--color-border)" }}>
                                <h3 style={{ fontSize: "var(--text-lg)", margin: 0 }}>Segmented videos</h3>
                                <ResultVideoViewer
                                    open={openSteps[1] && motifCompleted}
                                    algoOptions={ALGO_OPTIONS}
                                    sessionOptions={sessionNames}
                                    emptyText="No segmented videos available for this selection."
                                    load={async ({ segmentation_algorithm, session }) => {
                                        const data = await getSegmentVideosVAMEProject({
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

export default PoseSegmentationAccordion;
