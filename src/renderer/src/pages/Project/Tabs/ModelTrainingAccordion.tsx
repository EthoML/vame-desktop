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
import { useStepPolling, stepDisplayState } from "./useStepPolling";
import Button from "@renderer/components/Button";
import { evaluateVAMEProject } from "../../../context/Projects/api/evaluateVAMEProject";
import createTrainsetSchema from '../../../../../schema/create-trainset.schema.json';
import trainModelSchema from '../../../../../schema/train-model.schema.json';
import evaluateModelSchema from '../../../../../schema/evaluate-model.schema.json';
import ModelVisualizationSection from "./ModelVisualizationSection";
import TrainingMetricsCharts from "./TrainingMetricsCharts";
import { StepBadge, StepStateLine, ErrorNote } from "@renderer/components/StepStatus";

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

    // Stop-training state
    const [stopping, setStopping] = useState(false);
    const [stopError, setStopError] = useState<string | null>(null);

    // Evaluate Model form state
    const [evaluateError, setEvaluateError] = useState<string | null>(null);
    const [evaluateLoading, setEvaluateLoading] = useState(false);

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

    const finishStep = async (clearLoading: () => void) => {
        clearLoading();
        try {
            await onFormSubmit();
        } catch (e) {
            console.error("Error calling onFormSubmit:", e);
        }
        setBlockSubmit(false);
    };

    const trainsetPoll = useStepPolling(project.config.project_path, "create_trainset", () =>
        finishStep(() => setCreateTrainsetLoading(false))
    );
    const evaluatePoll = useStepPolling(project.config.project_path, "evaluate_model", () =>
        finishStep(() => setEvaluateLoading(false))
    );
    const trainPoll = useStepPolling(project.config.project_path, "train_model", async (state) => {
        setStopping(false);
        await finishStep(() => setTrainLoading(false));
        // Panels hold this step's outcome; collapsing hid it.
        if (state === "success") {
            setOpenSteps((prev) => [prev[0], prev[1], true]);
        }
    });

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
            trainsetPoll.start();
        } catch (err: any) {
            setCreateTrainsetError(err.message || "Failed to create training set.");
            setCreateTrainsetLoading(false);
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
            trainPoll.start();
        } catch (err: any) {
            setTrainError(err.message || "Failed to start model training.");
            setTrainLoading(false);
            setBlockSubmit(false);
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
        setEvaluateLoading(true);
        setEvaluateError(null);
        try {
            await evaluateVAMEProject({
                project: project.config.project_path,
                ...formData,
            });
            evaluatePoll.start();
        } catch (err: any) {
            setEvaluateError(err.message || "Failed to start model evaluation.");
            setEvaluateLoading(false);
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
                    <StepBadge state={trainsetPoll.polling ? "running" : create_trainset.execution_state} />
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[0] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[0]}>
                    <div>
                        <DynamicForm
                            schema={createTrainsetSchemaWithKeypoints}
                            initialValues={{ project_random_state: project.config.project_random_state ?? 42 }}
                            blockSubmission={blockSubmit || trainsetPoll.polling}
                            submitText={createTrainsetLoading || trainsetPoll.polling ? "Creating..." : "Create Training Set"}
                            onFormSubmit={handleCreateTrainset}
                            showLogsButton={true}
                            logName={["create_trainset"]}
                            projectPath={project.config.project_path}
                        />
                        {createTrainsetError && <ErrorNote>{createTrainsetError}</ErrorNote>}
                        <StepStateLine state={stepDisplayState(trainsetPoll, create_trainset.execution_state)} polling={trainsetPoll.polling} noun="Training set creation" />
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
                    <StepBadge state={trainPoll.polling ? "running" : train_model.execution_state} />
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
                            blockSubmission={blockSubmit || trainPoll.polling}
                            submitText={trainLoading || trainPoll.polling ? "Training..." : "Train Model"}
                            onFormSubmit={handleTrainModel}
                            showLogsButton={true}
                            logName={["train_model"]}
                            projectPath={project.config.project_path}
                        />
                        {trainError && <ErrorNote>{trainError}</ErrorNote>}
                        <StepStateLine state={stepDisplayState(trainPoll, train_model.execution_state)} polling={trainPoll.polling} noun="Training" />
                        {trainPoll.polling && (
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
                            live={trainPoll.polling}
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
                    <StepBadge state={evaluatePoll.polling ? "running" : evaluate_model.execution_state} />
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[2] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[2]}>
                    <div>
                        <DynamicForm
                            schema={evaluateModelSchema as Schema}
                            blockSubmission={blockSubmit || evaluatePoll.polling}
                            submitText={evaluateLoading || evaluatePoll.polling ? "Evaluating..." : "Evaluate Model"}
                            onFormSubmit={handleEvaluateModel}
                            showLogsButton={true}
                            logName={["evaluate_model"]}
                            projectPath={project.config.project_path}
                        />
                        {evaluateError && <ErrorNote>{evaluateError}</ErrorNote>}
                        <StepStateLine state={stepDisplayState(evaluatePoll, evaluate_model.execution_state)} polling={evaluatePoll.polling} noun="Model evaluation" />
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
