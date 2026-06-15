import React, { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinner } from "@fortawesome/free-solid-svg-icons"
import SegmentedControl from "@renderer/components/SegmentedControl"
import { ErrorNote } from "@renderer/components/StepStatus"
import { getTrainMetrics, TrainingFigure } from "../../../context/Projects/api/getTrainMetrics"

// Plotly is a heavy bundle (~1MB gz), so load it lazily and via the prebuilt
// dist (react-plotly.js' factory) — importing plotly.js source breaks Vite.
const Plot = React.lazy(async () => {
    const [{ default: createPlotlyComponent }, plotly] = await Promise.all([
        import("react-plotly.js/factory"),
        import("plotly.js-dist-min"),
    ])
    return { default: createPlotlyComponent((plotly as any).default ?? plotly) }
})

type Granularity = "epoch" | "batch"

const GRANULARITY_TABS = [
    { value: "epoch", label: "Per epoch" },
    { value: "batch", label: "Per batch" },
] as const

// Two stacked epoch plots fit comfortably; the single batch plot gets more room.
const EPOCH_PLOT_HEIGHT = "42vh"
const BATCH_PLOT_HEIGHT = "55vh"

const boxStyle = (height: string): React.CSSProperties => ({
    position: "relative",
    height,
    width: "100%",
    background: "var(--color-surface-sunken)",
    border: "1px solid var(--color-border)",
    borderRadius: 6,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
})

/** One bordered plot box (spinner / figure / empty message). */
const FigureBox: React.FC<{ fig: TrainingFigure | null; height: string; showSpinner: boolean; emptyText: string }> = ({
    fig,
    height,
    showSpinner,
    emptyText,
}) => {
    const hasFigure = fig && Array.isArray(fig.data) && fig.data.length > 0
    return (
        <div style={boxStyle(height)}>
            {showSpinner ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                    <FontAwesomeIcon icon={faSpinner} spin style={{ color: "var(--color-accent)" }} />
                    Loading…
                </span>
            ) : hasFigure ? (
                <Suspense fallback={<FontAwesomeIcon icon={faSpinner} spin style={{ color: "var(--color-accent)" }} />}>
                    <Plot
                        data={fig!.data}
                        layout={{ ...fig!.layout, autosize: true }}
                        useResizeHandler
                        style={{ width: "100%", height: "100%" }}
                        config={{ displaylogo: false, responsive: true }}
                    />
                </Suspense>
            ) : (
                <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>{emptyText}</span>
            )}
        </div>
    )
}

type Props = {
    projectPath: string
    /** Poll for fresh metrics while true (i.e. while training is running). */
    live?: boolean
    /** Only fetch when the section is open/visible. */
    enabled?: boolean
}

const POLL_MS = 3000

const TrainingMetricsCharts: React.FC<Props> = ({ projectPath, live = false, enabled = true }) => {
    const [granularity, setGranularity] = useState<Granularity>("epoch")
    const [epochTrain, setEpochTrain] = useState<TrainingFigure | null>(null)
    const [epochTest, setEpochTest] = useState<TrainingFigure | null>(null)
    const [batch, setBatch] = useState<TrainingFigure | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const fetchedOnce = useRef(false)

    const fetchMetrics = useCallback(async () => {
        try {
            const result = await getTrainMetrics({ project: projectPath })
            setEpochTrain(result.epoch_train)
            setEpochTest(result.epoch_test)
            setBatch(result.batch)
            setError(null)
        } catch (err: any) {
            setError(err.message || "Failed to load training metrics.")
        }
    }, [projectPath])

    // Fetch on open and whenever training starts/stops (so the final epoch shows).
    useEffect(() => {
        if (!enabled) return
        let cancelled = false
        ;(async () => {
            setLoading(true)
            await fetchMetrics()
            if (!cancelled) {
                setLoading(false)
                fetchedOnce.current = true
            }
        })()
        return () => {
            cancelled = true
        }
    }, [enabled, live, fetchMetrics])

    // Live polling while training runs.
    useEffect(() => {
        if (!enabled || !live) return
        const id = setInterval(fetchMetrics, POLL_MS)
        return () => clearInterval(id)
    }, [enabled, live, fetchMetrics])

    if (!enabled) return null

    const showSpinner = loading && !fetchedOnce.current
    const emptyText = live ? "Waiting for training metrics…" : "No training metrics available yet."

    return (
        <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 12 }}>
                <SegmentedControl<Granularity>
                    options={GRANULARITY_TABS as unknown as { value: Granularity; label: string }[]}
                    value={granularity}
                    onChange={setGranularity}
                    ariaLabel="Loss granularity"
                />
            </div>

            {error && <ErrorNote>{error}</ErrorNote>}

            {granularity === "epoch" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <FigureBox fig={epochTrain} height={EPOCH_PLOT_HEIGHT} showSpinner={showSpinner} emptyText={emptyText} />
                    <FigureBox fig={epochTest} height={EPOCH_PLOT_HEIGHT} showSpinner={showSpinner} emptyText={emptyText} />
                </div>
            ) : (
                <FigureBox fig={batch} height={BATCH_PLOT_HEIGHT} showSpinner={showSpinner} emptyText={emptyText} />
            )}
        </div>
    )
}

export default TrainingMetricsCharts
