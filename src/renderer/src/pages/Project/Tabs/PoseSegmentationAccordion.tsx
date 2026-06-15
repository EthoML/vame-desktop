import React, { useState, useEffect } from "react";
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
import { getProjectStateVAMEProject } from "../../../context/Projects/api/getProjectStateVAMEProject";
import { createMotifVideosVAMEProject } from "../../../context/Projects/api/createMotifVideosVAMEProject";
import { getSegmentVideosVAMEProject } from "../../../context/Projects/api/getSegmentVideosVAMEProject";
import { StepBadge, StepStateLine, ErrorNote, SuccessNote, OptionalTag } from "@renderer/components/StepStatus";
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
    const [isPollingMotif, setIsPollingMotif] = useState(false);
    const [motifState, setMotifState] = useState<string | null>(null);

    const sessionNames: string[] = (project.config as any)?.session_names || [];

    // States from project
    const motif_session = project.states?.motif_videos || {};
    const motifCompleted = motif_session.execution_state === "success";
    const [segmentationLoading, setSegmentationLoading] = useState(false);
    const [segmentationError, setSegmentationError] = useState<string | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [segmentationState, setSegmentationState] = useState<string | null>(null);

    // States from project
    const segment_session = project.states?.segment_session || {};
    const segmented = segment_session.execution_state === "success";

    // Polling for segmentation state
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isPolling) {
            interval = setInterval(async () => {
                try {
                    const projectState = await getProjectStateVAMEProject({
                        project: project.config.project_path,
                    });
                    const state = projectState.states?.segment_session?.execution_state || null;
                    setSegmentationState(state);
                    if (
                        state === "success" ||
                        state === "failed" ||
                        state === "aborted" ||
                        state === "not_found"
                    ) {
                        setIsPolling(false);
                        try {
                            await onFormSubmit();
                        } catch (e) {
                            console.error("Error calling onFormSubmit:", e);
                        }
                        setBlockSubmit(false);
                        setOpenSteps([false, false]);
                    }
                } catch (err) {
                    console.error("Error during polling:", err);
                    setBlockSubmit(false);
                }
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPolling, project.config.project_path, setBlockSubmit]);

    // Polling for motif videos state
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isPollingMotif) {
            interval = setInterval(async () => {
                try {
                    const projectState = await getProjectStateVAMEProject({
                        project: project.config.project_path,
                    });
                    const state = projectState.states?.motif_videos?.execution_state || null;
                    setMotifState(state);
                    if (
                        state === "success" ||
                        state === "failed" ||
                        state === "aborted" ||
                        state === "not_found"
                    ) {
                        setIsPollingMotif(false);
                        try {
                            await onFormSubmit();
                        } catch (e) {
                            console.error("Error calling onFormSubmit:", e);
                        }
                        setBlockSubmit(false);
                        setOpenSteps([false, false]);
                    }
                } catch (err) {
                    console.error("Error during polling videos:", err);
                    setBlockSubmit(false);
                }
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPollingMotif, project.config.project_path, setBlockSubmit]);

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
            setIsPolling(true);
        } catch (err: any) {
            setSegmentationError(err.message || "Failed to start segmentation.");
            setBlockSubmit(false);
        } finally {
            setSegmentationLoading(false);
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
            setIsPollingMotif(true);
        } catch (err: any) {
            setMotifError(err.message || "Failed to start video creation.");
            setBlockSubmit(false);
        } finally {
            setMotifLoading(false);
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
                    <StepBadge state={segment_session.execution_state} />
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[0] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[0]}>
                    <div>
                        <DynamicForm
                            schema={poseSegmentationSchema as unknown as Schema}
                            blockSubmission={blockSubmit}
                            submitText={segmentationLoading ? "Running..." : "Run Segmentation"}
                            onFormSubmit={handleRunSegmentation}
                            validate={validateSegmentation}
                            showLogsButton={true}
                            logName={["pose_segmentation"]}
                            projectPath={project.config.project_path}
                        />
                        {segmentationError && <ErrorNote>{segmentationError}</ErrorNote>}
                        <StepStateLine state={segmentationState} polling={isPolling} noun="Segmentation" />
                        {segmented && <SuccessNote>Segmentation completed successfully.</SuccessNote>}
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
                    <StepBadge state={motif_session.execution_state} />
                    <OptionalTag />
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[1] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[1]}>
                    <div>
                        <DynamicForm
                            schema={motifVideosGenerateSchema as unknown as Schema}
                            blockSubmission={blockSubmit}
                            submitText={motifLoading ? "Creating..." : "Create Segmented Videos"}
                            onFormSubmit={handleCreateMotifVideos}
                            showLogsButton={true}
                            logName={["motif_videos"]}
                            projectPath={project.config.project_path}
                        />
                        {motifError && <ErrorNote>{motifError}</ErrorNote>}
                        <StepStateLine state={motifState} polling={isPollingMotif} noun="Video creation" />
                        {motifCompleted && <SuccessNote>Videos created successfully.</SuccessNote>}

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
