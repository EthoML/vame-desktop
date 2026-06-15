import { useState } from "react"

import DynamicForm from "../../../components/DynamicForm"
import {
  Accordion,
  AccordionHeader,
  AccordionContent,
} from "@renderer/components/DynamicForm/styles"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faChevronUp, faSpinner } from "@fortawesome/free-solid-svg-icons"
import { TabProps } from "./types"

import preprocessingSchema from '../../../../../schema/preprocessing.schema.json'
import { PaddedTab } from "@renderer/components/Tabs/styles"
import Tippy from "@tippyjs/react"
import { StepBadge, ErrorNote } from "@renderer/components/StepStatus"
import SegmentedControl from "@renderer/components/SegmentedControl"
import ZoomableImage from "@renderer/components/ZoomableImage"

// Error boundary component to catch rendering errors
const ErrorFallback = ({ error }: { error: Error }) => (
  <div style={{ padding: 20, background: "var(--color-error-soft)", border: "1px solid var(--color-error)", borderRadius: 4 }}>
    <h3>Something went wrong in the Preprocessing component</h3>
    <p>Error: {error.message}</p>
    <p>Please check the console for more details.</p>
  </div>
)

const Preprocessing = ({
  project,
  onFormSubmit,
  blockSubmission,
  blockTooltip,
}: TabProps) => {
  // Accordion open/close state
  const [isPreprocessingOpen, setPreprocessingOpen] = useState(false)
  const [isVisualizeOpen, setVisualizeOpen] = useState(false)

  // Check if project is preprocessed
  const preprocessingState = project.states?.preprocessing || {};
  const preprocessingVisualizationState = project.states?.preprocessing_visualization || {};
  const projectPreprocessed = preprocessingState.execution_state === "success" && preprocessingVisualizationState.execution_state === "success";

  try {
    // If keypoints is not available, create a default array with common keypoints
    let keypoints_names: string[] = []
    if (Array.isArray(project?.config?.keypoints) && project.config.keypoints.length > 0) {
      keypoints_names = project.config.keypoints
    } else {
      keypoints_names = [""]
    }

    // Clone schema with safety check
    let schema: any
    try {
      schema = structuredClone(preprocessingSchema) as unknown as Schema
    } catch (err) {
      console.error("Error cloning preprocessing schema:", err)
      schema = { properties: {} } // Fallback empty schema
    }

    // Safely set the enum values for the dropdown fields
    try {
      schema.properties.centered_reference_keypoint.enum = keypoints_names
      schema.properties.orientation_reference_keypoint.enum = keypoints_names
    } catch (err) {
      console.error("Error setting enum values:", err)
    }

    // Safely handle egocentric_data property
    try {
      if (project?.config?.egocentric_data && schema?.properties?.advanced_options) {
        delete schema.properties.advanced_options
      }
    } catch (err) {
      console.error("Error handling egocentric_data:", err)
    }

    // Initialize states with safe defaults
    let states: any = {
      // Default to first keypoint for centered and second for orientation if available
      centered_reference_keypoint: keypoints_names[0] || "",
      orientation_reference_keypoint: keypoints_names[1] || keypoints_names[0] || "",
      // Add the new boolean fields with their default values
      run_lowconf_cleaning: true,
      run_egocentric_alignment: true,
      run_outlier_cleaning: true,
      run_savgol_filtering: true,
      run_rescaling: true
    }

    const [terminal, setTerminal] = useState(false)

    // Safe form submit handler
    const handleFormSubmit = (formData: any) => {
      try {
        // Create a compatible format for the backend
        const compatibleData = {
          centered_reference_keypoint: formData?.centered_reference_keypoint || "",
          orientation_reference_keypoint: formData?.orientation_reference_keypoint || "",
          run_lowconf_cleaning: formData?.run_lowconf_cleaning !== undefined ? formData.run_lowconf_cleaning : true,
          run_egocentric_alignment: formData?.run_egocentric_alignment !== undefined ? formData.run_egocentric_alignment : true,
          run_outlier_cleaning: formData?.run_outlier_cleaning !== undefined ? formData.run_outlier_cleaning : true,
          run_savgol_filtering: formData?.run_savgol_filtering !== undefined ? formData.run_savgol_filtering : true,
          run_rescaling: formData?.run_rescaling !== undefined ? formData.run_rescaling : true,
          // Per-step parameters (only applied by VAME when their step is enabled).
          pose_confidence: formData?.pose_confidence ?? 0.99,
          robust: formData?.robust !== undefined ? formData.robust : true,
          iqr_factor: formData?.iqr_factor ?? 4,
          savgol_length: formData?.savgol_length ?? 5,
          savgol_order: formData?.savgol_order ?? 2
        }
        // Call the original onFormSubmit with the converted data
        onFormSubmit(compatibleData)
      } catch (err) {
        console.error("Error in form submission:", err)
        // Fallback to a minimal valid submission
        onFormSubmit({
          centered_reference_keypoint: keypoints_names[0] || "",
          orientation_reference_keypoint: keypoints_names[1] || keypoints_names[0] || "",
          run_lowconf_cleaning: true,
          run_egocentric_alignment: true,
          run_outlier_cleaning: true,
          run_savgol_filtering: true,
          run_rescaling: true,
          pose_confidence: 0.99,
          robust: true,
          iqr_factor: 4,
          savgol_length: 5,
          savgol_order: 2
        })
      }
    }

    return (
      <PaddedTab>
        <Accordion>
          <AccordionHeader
            onClick={() => setPreprocessingOpen((v) => !v)}
          >
            2.1 Run Preprocessing
            <StepBadge state={preprocessingState.execution_state} />
            <span style={{ marginLeft: "auto" }}>
              <FontAwesomeIcon icon={isPreprocessingOpen ? faChevronUp : faChevronDown} />
            </span>
          </AccordionHeader>
          <AccordionContent $isOpen={isPreprocessingOpen}>
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
                  submitText="Run Preprocessing"
                  onFormSubmit={handleFormSubmit}
                  showLogsButton={true}
                  logName={["preprocessing"]}
                  projectPath={project.config.project_path}
                />
              </>
            </Tippy>
          </AccordionContent>
        </Accordion>
        <Accordion>
          <AccordionHeader
            $disabled={!projectPreprocessed}
            onClick={() => {
              if (projectPreprocessed) setVisualizeOpen((v) => !v);
            }}
          >
            2.2 Visualize Preprocessing Results
            <StepBadge state={preprocessingVisualizationState.execution_state} />
            <span style={{ marginLeft: "auto" }}>
              <FontAwesomeIcon icon={isVisualizeOpen ? faChevronUp : faChevronDown} />
            </span>
          </AccordionHeader>
          <AccordionContent $isOpen={isVisualizeOpen}>
            {/* Visualization UI */}
            <VisualizationSection project={project} />
          </AccordionContent>
        </Accordion>
      </PaddedTab>
    )
  } catch (error) {
    console.error("Error in Preprocessing component:", error)
    return <ErrorFallback error={error as Error} />
  }
}

/**
 * VisualizationSection component for session dropdown, fetch button, and image tabs.
 */
import { useState as useReactState, useContext, useEffect } from "react";
import { ProjectsContext } from "../../../context/Projects";
import type { IProjectContext } from "../../../context/Projects/types";

const IMAGE_TABS = [
  { value: "timeseries", label: "Time series" },
  { value: "scatter", label: "Scatter" },
  { value: "cloud", label: "Cloud" },
] as const;

type ImageTab = (typeof IMAGE_TABS)[number]["value"];

const VisualizationSection = ({ project }: { project: any }) => {
  const { getPreprocessingVisualization } = useContext(ProjectsContext) as IProjectContext;
  const sessionNames: string[] = Array.isArray(project?.config?.session_names)
    ? project.config.session_names
    : [];
  const [selectedSession, setSelectedSession] = useReactState<string>(
    sessionNames[0] || ""
  );
  const [loading, setLoading] = useReactState(false);
  const [images, setImages] = useReactState<{
    timeseries: string | null;
    scatter: string | null;
    cloud: string | null;
  } | null>(null);
  const [activeTab, setActiveTab] = useReactState<ImageTab>("timeseries");
  const [error, setError] = useReactState<string | null>(null);

  // Default to the first session once names are available.
  useEffect(() => {
    if (!selectedSession && sessionNames.length) setSelectedSession(sessionNames[0]);
  }, [sessionNames, selectedSession]);

  // Auto-load whenever the selected session changes (no button). Race-safe.
  useEffect(() => {
    if (!selectedSession) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getPreprocessingVisualization({
          project: project.config.project_path,
          session_name: selectedSession,
        });
        if (cancelled) return;
        setImages({
          timeseries: result.timeseries ?? null,
          scatter: result.scatter ?? null,
          cloud: result.cloud ?? null,
        });
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to fetch images.");
          setImages(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedSession, project.config.project_path]);

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <label
          htmlFor="preproc-session"
          style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}
        >
          Session
          <select
            id="preproc-session"
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text)",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border-strong)",
              borderRadius: 6,
              padding: "6px 10px",
            }}
          >
            {sessionNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>
        <SegmentedControl<ImageTab>
          options={IMAGE_TABS as unknown as { value: ImageTab; label: string }[]}
          value={activeTab}
          onChange={setActiveTab}
          ariaLabel="Visualization type"
        />
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      <div
        style={{
          position: "relative",
          height: "60vh",
          width: "100%",
          background: "var(--color-surface-sunken)",
          border: "1px solid var(--color-border)",
          borderRadius: 6,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
            <FontAwesomeIcon icon={faSpinner} spin style={{ color: "var(--color-accent)" }} />
            Loading {selectedSession}…
          </span>
        ) : images?.[activeTab] ? (
          <ZoomableImage
            src={images[activeTab]!}
            alt={`${activeTab} visualization for ${selectedSession}`}
          />
        ) : (
          <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
            No {activeTab} image available for this session.
          </span>
        )}
      </div>
    </div>
  );
};

export default Preprocessing
