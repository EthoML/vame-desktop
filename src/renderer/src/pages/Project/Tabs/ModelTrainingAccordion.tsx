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
import { createTrainsetVAMEProject } from "../../../context/Projects/api/createTrainsetVAMEProject";
import { trainVAMEProject } from "../../../context/Projects/api/trainVAMEProject";
import { stopTrainVAMEProject } from "../../../context/Projects/api/stopTrainVAMEProject";
import { getProjectStateVAMEProject } from "../../../context/Projects/api/getProjectStateVAMEProject";
import Button from "@renderer/components/Button";
import { evaluateVAMEProject } from "../../../context/Projects/api/evaluateVAMEProject";
import createTrainsetSchema from '../../../../../schema/create-trainset.schema.json';
import trainModelSchema from '../../../../../schema/train-model.schema.json';
import evaluateModelSchema from '../../../../../schema/evaluate-model.schema.json';
import ModelVisualizationSection from "./ModelVisualizationSection";
import TrainingMetricsCharts from "./TrainingMetricsCharts";
import { StepBadge, StepStateLine, ErrorNote, SuccessNote } from "@renderer/components/StepStatus";

type ModelTrainingAccordionProps = {
    project: ProjectType;
    onFormSubmit: () => Promise<void>;
    setBlockSubmit: (value: boolean) => void;
    blockSubmit: boolean;
};

const ModelTrainingAccordion = ({
    project,
    onFormSubmit,
    setBlockSubmit,
    blockSubmit,
}: ModelTrainingAccordionProps) => {
    // Independent open/close state for each accordion
    const [openSteps, setOpenSteps] = useState([false, false, false]);

    // Populate the keypoint checkboxes from the project's keypoints, all selected
    // by default (training uses every keypoint unless the user unchecks some).
    const createTrainsetSchemaWithKeypoints = React.useMemo(() => {
        const keypoints: string[] = Array.isArray(project.config?.keypoints) ? project.config.keypoints : [];
        const schema = structuredClone(createTrainsetSchema) as any;
        schema.properties.keypoints_to_include.enum = keypoints;
        schema.properties.keypoints_to_include.default = keypoints;
        return schema as Schema;
    }, [project.config?.keypoints]);

    // Below this, KL annealing never completes and training saves no model, so
    // /train rejects the run. Derived on the backend from the project's annealing
    // config; null means it could not be determined and no floor is enforced.
    const minEpochs = project.min_epochs ?? null;

    const trainModelSchemaWithMinEpochs = React.useMemo(() => {
        const schema = structuredClone(trainModelSchema) as any;
        if (minEpochs) {
            const field = schema.properties.max_epochs;
            field.minimum = minEpochs;
            // Never let the form open below its own floor.
            field.default = Math.max(field.default ?? minEpochs, minEpochs);
            field.description = `${field.description}. At least ${minEpochs} for this project, so KL annealing completes and a model is saved`;
        }
        return schema as Schema;
    }, [minEpochs]);

    // Mirrors check_max_epochs on the backend: disable submit with an inline
    // message instead of letting the request fail.
    const validateTrain = React.useCallback(
        (values: Record<string, unknown>): string[] => {
            if (!minEpochs) return [];
            const epochs = Number(values.max_epochs);
            if (Number.isFinite(epochs) && epochs < minEpochs) {
                return [
                    `Max Epochs must be at least ${minEpochs}: below that, KL annealing never completes and training finishes without saving a model.`,
                ];
            }
            return [];
        },
        [minEpochs]
    );

    // Create Trainset form state
    const [createTrainsetLoading, setCreateTrainsetLoading] = useState(false);
    const [createTrainsetError, setCreateTrainsetError] = useState<string | null>(null);

    // Train Model form state
    const [trainLoading, setTrainLoading] = useState(false);
    const [trainError, setTrainError] = useState<string | null>(null);

    // Polling state for train_model
    const [trainModelState, setTrainModelState] = useState<string | null>(null);
    const [isPolling, setIsPolling] = useState(false);

    // Stop-training state
    const [stopping, setStopping] = useState(false);
    const [stopError, setStopError] = useState<string | null>(null);

    // Evaluate Model form state
    const [evaluateError, setEvaluateError] = useState<string | null>(null);

    // States
    const create_trainset = project.states.create_trainset || {};
    const train_model = project.states.train_model || {};
    const evaluate_model = project.states.evaluate_model || {};

    const trainsetCreated = create_trainset.execution_state === "success";
    // Aborted (user-stopped) runs still save a usable model, so the Evaluate
    // step unblocks just like a completed run.
    const modelCreated =
        train_model.execution_state === "success" ||
        train_model.execution_state === "aborted";
    const modelEvaluated = evaluate_model.execution_state === "success";

    // Poll train_model state after training starts
    React.useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isPolling) {
            interval = setInterval(async () => {
                try {
                    const projectStates = await getProjectStateVAMEProject({
                        project: project.config.project_path,
                    });
                    const state = projectStates.states?.train_model?.execution_state || null;
                    setTrainModelState(state);
                    if (
                        state === "success" ||
                        state === "failed" ||
                        state === "aborted" ||
                        state === "not_found"
                    ) {
                        setIsPolling(false);
                        setStopping(false);
                        try {
                            await onFormSubmit();
                        } catch (e) {
                            console.error("Error calling onFormSubmit:", e);
                        }
                        setBlockSubmit(false);
                        setOpenSteps([false, false, false]);
                    }
                } catch (err) {
                    console.error("Error during polling:", err);
                }
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPolling, project.config.project_path, setBlockSubmit]);

    // Handler for Create Training Set form submission
    const handleCreateTrainset = async (formData: any) => {
        setCreateTrainsetLoading(true);
        setCreateTrainsetError(null);
        setBlockSubmit(true);
        try {
            await createTrainsetVAMEProject({
                project: project.config.project_path,
                test_fraction: formData.test_fraction,
                split_mode: formData.split_mode,
                project_random_state: formData.project_random_state,
                keypoints_to_include: formData.keypoints_to_include,
            });
        } catch (err: any) {
            setCreateTrainsetError(err.message || "Failed to create training set.");
        } finally {
            setCreateTrainsetLoading(false);
            try {
                await onFormSubmit();
            } catch (e) {
                console.error("Error calling onFormSubmit:", e);
            }
            setBlockSubmit(false);
        }
    };

    // Handler for Train Model form submission
    const handleTrainModel = async (formData: any) => {
        setBlockSubmit(true);
        setTrainLoading(true);
        setTrainError(null);
        try {
            await trainVAMEProject({
                project: project.config.project_path,
                ...formData,
            });
            setIsPolling(true);
        } catch (err: any) {
            setTrainError(err.message || "Failed to start model training.");
            setBlockSubmit(false);
        } finally {
            setTrainLoading(false);
        }
    };

    // Handler for stopping a running training. Writes VAME's stop sentinel; the
    // existing poll above flips to "aborted" once training stops at the next
    // epoch boundary (and the current model is saved).
    const handleStopTraining = async () => {
        setStopping(true);
        setStopError(null);
        try {
            await stopTrainVAMEProject({ project: project.config.project_path });
        } catch (err: any) {
            setStopError(err.message || "Failed to request training stop.");
            setStopping(false);
        }
    };

    // Handler for Evaluate Model form submission
    const handleEvaluateModel = async (formData: any) => {
        setBlockSubmit(true);
        try {
            await evaluateVAMEProject({
                project: project.config.project_path,
                ...formData,
            });
        } catch (err: any) {
            setEvaluateError(err.message || "Failed to start model evaluation.");
        } finally {
            try {
                await onFormSubmit();
            } catch (e) {
                console.error("Error calling onFormSubmit:", e);
            }
            setBlockSubmit(false);
        }
    };

    // (Removed unused handleGetImages and related state)

    // Toggle handler for independent accordions
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
            {/* Accordion 1: Create Training Set */}
            <Accordion>
                <AccordionHeader
                    $disabled={false}
                    onClick={() => handleToggle(0, true)}
                >
                    3.1 Create Training Set
                    <StepBadge state={create_trainset.execution_state} />
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[0] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[0]}>
                    <div>
                        <DynamicForm
                            schema={createTrainsetSchemaWithKeypoints}
                            initialValues={{ project_random_state: project.config.project_random_state ?? 42 }}
                            blockSubmission={blockSubmit}
                            submitText={createTrainsetLoading ? "Creating..." : "Create Training Set"}
                            onFormSubmit={handleCreateTrainset}
                            showLogsButton={true}
                            logName={["create_trainset"]}
                            projectPath={project.config.project_path}
                        />
                        {createTrainsetError && <ErrorNote>{createTrainsetError}</ErrorNote>}
                        {trainsetCreated && <SuccessNote>Training set created successfully.</SuccessNote>}
                    </div>
                </AccordionContent>
            </Accordion>
            {/* Accordion 2: Train Model */}
            <Accordion>
                <AccordionHeader
                    $disabled={!trainsetCreated}
                    onClick={() => handleToggle(1, true)}
                >
                    3.2 Train Model
                    <StepBadge state={train_model.execution_state} />
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[1] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[1]}>
                    <div>
                        <DynamicForm
                            schema={trainModelSchemaWithMinEpochs}
                            validate={validateTrain}
                            initialValues={{ project_random_state: project.config.project_random_state ?? 42 }}
                            blockSubmission={blockSubmit}
                            submitText={trainLoading ? "Training..." : "Train Model"}
                            onFormSubmit={handleTrainModel}
                            showLogsButton={true}
                            logName={["train_model"]}
                            projectPath={project.config.project_path}
                        />
                        {trainError && <ErrorNote>{trainError}</ErrorNote>}
                        <StepStateLine state={trainModelState} polling={isPolling} noun="Training" />
                        {isPolling && (
                            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
                                <Button
                                    variant="danger"
                                    type="button"
                                    onClick={handleStopTraining}
                                    disabled={stopping}
                                >
                                    {stopping ? "Stopping…" : "Stop training"}
                                </Button>
                                <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                                    Stops after the current epoch and saves the current model.
                                </span>
                            </div>
                        )}
                        {stopError && <ErrorNote>{stopError}</ErrorNote>}
                        <TrainingMetricsCharts
                            projectPath={project.config.project_path}
                            live={isPolling}
                            enabled={openSteps[1]}
                        />
                    </div>
                </AccordionContent>
            </Accordion>
            {/* Accordion 3: Evaluate Model */}
            <Accordion>
                <AccordionHeader
                    $disabled={!modelCreated}
                    onClick={() => handleToggle(2, modelCreated)}
                >
                    3.3 Evaluate Model
                    <StepBadge state={evaluate_model.execution_state} />
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[2] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[2]}>
                    <div>
                        <DynamicForm
                            schema={evaluateModelSchema as Schema}
                            blockSubmission={blockSubmit}
                            submitText={"Evaluate Model"}
                            onFormSubmit={handleEvaluateModel}
                            showLogsButton={true}
                            logName={["evaluate_model"]}
                            projectPath={project.config.project_path}
                        />
                        {evaluateError && <ErrorNote>{evaluateError}</ErrorNote>}
                        {modelEvaluated && <SuccessNote>Model evaluated successfully.</SuccessNote>}
                        {modelEvaluated && (
                            <ModelVisualizationSection project={project} enabled={openSteps[2]} />
                        )}
                    </div>
                </AccordionContent>
            </Accordion>
        </PaddedTab>
    );
};

export default ModelTrainingAccordion;
