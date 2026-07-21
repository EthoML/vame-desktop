import React, { useState } from 'react';
import { Accordion, AccordionHeader, AccordionContent } from '@renderer/components/DynamicForm/styles';
import { PaddedTab } from '@renderer/components/Tabs/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { TabProps } from './types';
import DynamicForm from '@renderer/components/DynamicForm';
import { generateReportVAMEProject } from '../../../context/Projects/api/generateReportVAMEProject';
import reportImagesGetSchema from "../../../../../schema/report-get-images.schema.json";
import generateReportSchema from "../../../../../schema/generate-report.schema.json";
import { getReportVAMEProject } from '../../../context/Projects/api/getReportVAMEProject';
import { getUmapVAMEProject } from '../../../context/Projects/api/getUmapVAMEProject';
import { StepBadge, StepStateLine, ErrorNote } from '@renderer/components/StepStatus';
import ResultImageViewer from '@renderer/components/ResultImageViewer';
import ResultHtmlViewer from '@renderer/components/ResultHtmlViewer';
import { useStepPolling, stepDisplayState } from './useStepPolling';

const ALGO_OPTIONS = reportImagesGetSchema.properties.segmentation_algorithm.enum as string[];

const Report: React.FC<TabProps> = ({
    project,
    onFormSubmit,
    blockSubmission,
}) => {
    const [openSteps, setOpenSteps] = useState([false, false, false]);

    // Generate Report states
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState<string | null>(null);

    const sessionNames: string[] = (project.config as any)?.session_names || [];
    const reportSession = project.states?.generate_reports || {};
    const reportCompleted = reportSession.execution_state === 'success';

    const reportPoll = useStepPolling(project.config.project_path, 'generate_reports', async (state) => {
        setReportLoading(false);
        await onFormSubmit({});
        // Panels hold this step's outcome; collapsing hid it.
        if (state === 'success') {
            setOpenSteps((prev) => [prev[0], true, true]);
        }
    });

    const handleToggle = (idx: number) => {
        setOpenSteps((prev) => {
            const next = [...prev];
            next[idx] = !next[idx];
            return next;
        });
    };

    // 1. Generate Report
    const handleGenerateReport = async (formData: any) => {
        setReportLoading(true);
        setReportError(null);
        try {
            await generateReportVAMEProject({ project: project.config.project_path, ...formData });
            reportPoll.start();
        } catch (err: any) {
            setReportError(err.message || 'Failed to start report generation.');
            setReportLoading(false);
        }
    };

    return (
        <PaddedTab>
            {/* Accordion 1: Generate Report */}
            <Accordion>
                <AccordionHeader $disabled={false} onClick={() => handleToggle(0)}>
                    6.1 Generate Report
                    <StepBadge state={reportPoll.polling ? 'running' : reportSession.execution_state} />
                    <span style={{ marginLeft: 'auto' }}>
                        <FontAwesomeIcon icon={openSteps[0] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[0]}>
                    <DynamicForm
                        schema={generateReportSchema as unknown as Schema}
                        blockSubmission={blockSubmission || reportLoading || reportPoll.polling}
                        submitText={reportLoading || reportPoll.polling ? 'Generating...' : 'Generate Report'}
                        onFormSubmit={handleGenerateReport}
                        showLogsButton={true}
                        logName={["report"]}
                        projectPath={project.config.project_path}
                    />
                    {reportError && <ErrorNote>{reportError}</ErrorNote>}
                    <StepStateLine state={stepDisplayState(reportPoll, reportSession.execution_state)} polling={reportPoll.polling} noun="Report generation" />
                </AccordionContent>
            </Accordion>

            {/* Accordion 2: Visualize Motif/Community Report */}
            <Accordion>
                <AccordionHeader $disabled={!reportCompleted} onClick={() => handleToggle(1)}>
                    6.2 Visualize Motif/Community Report
                    <span style={{ marginLeft: 'auto' }}>
                        <FontAwesomeIcon icon={openSteps[1] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[1]}>
                    <ResultImageViewer
                        open={openSteps[1]}
                        algoOptions={ALGO_OPTIONS}
                        sessionOptions={sessionNames}
                        altPrefix="Motif / community report"
                        emptyText="No report image available for this selection."
                        load={async ({ segmentation_algorithm, session }) => {
                            const img = await getReportVAMEProject({
                                project: project.config.project_path,
                                segmentation_algorithm: segmentation_algorithm!,
                                session: session!,
                            });
                            return img ? `data:image/png;base64,${img.content}` : null;
                        }}
                    />
                </AccordionContent>
            </Accordion>

            {/* Accordion 3: Visualize UMAP Report */}
            <Accordion>
                <AccordionHeader $disabled={!reportCompleted} onClick={() => handleToggle(2)}>
                    6.3 Visualize UMAP Report
                    <span style={{ marginLeft: 'auto' }}>
                        <FontAwesomeIcon icon={openSteps[2] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[2]}>
                    <ResultHtmlViewer
                        open={openSteps[2]}
                        algoOptions={ALGO_OPTIONS}
                        title="UMAP"
                        emptyText="No UMAP figure available for this selection."
                        load={async ({ segmentation_algorithm }) =>
                            getUmapVAMEProject({
                                project: project.config.project_path,
                                segmentation_algorithm: segmentation_algorithm!,
                            })
                        }
                    />
                </AccordionContent>
            </Accordion>
        </PaddedTab>
    );
};

export default Report;
