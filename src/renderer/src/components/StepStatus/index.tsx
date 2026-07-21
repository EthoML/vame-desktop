import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleCheck,
    faCircleXmark,
    faTriangleExclamation,
    faSpinner,
    faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";

// ============================================================================
// Single source of truth for pipeline step status.
//
// Every VAME step writes an `execution_state` to states.json: one of
// "success" | "failed" | "aborted" | "running" | "not_found" (or absent).
// Previously each accordion hand-rolled its own colored <span> ladders and
// only ever rendered a green ✓ on success — so a FAILED step looked identical
// to one that had never run. This module centralizes the mapping and, most
// importantly, surfaces failures (red ✗) and aborts (amber ⚠) so a multi-hour
// job that dies is never mistaken for a success.
//
// Colors come exclusively from the semantic design tokens (see main.css);
// no hardcoded greens/reds/Bootstrap blues.
// ============================================================================

export type ExecutionState =
    | "success"
    | "failed"
    | "aborted"
    | "running"
    | "not_found"
    | string
    | null
    | undefined;

type StatusMeta = {
    token: string;
    icon: typeof faCircleCheck;
    label: string;
    spin?: boolean;
    /** Build the long-form status line message from a step noun. */
    message: (noun: string) => string;
};

const STATUS_META: Record<string, StatusMeta> = {
    success: {
        token: "var(--color-success)",
        icon: faCircleCheck,
        label: "Completed",
        message: (n) => `${n} completed successfully.`,
    },
    failed: {
        token: "var(--color-error)",
        icon: faCircleXmark,
        label: "Failed",
        message: (n) => `${n} failed — open the logs to see what went wrong.`,
    },
    aborted: {
        token: "var(--color-warning)",
        icon: faTriangleExclamation,
        label: "Aborted",
        message: (n) => `${n} was aborted before it finished.`,
    },
    running: {
        token: "var(--color-accent)",
        icon: faSpinner,
        label: "Running",
        spin: true,
        message: (n) => `${n} is running…`,
    },
    not_found: {
        token: "var(--color-text-muted)",
        icon: faCircleQuestion,
        label: "Not started",
        message: (n) => `No ${n.toLowerCase()} run found yet.`,
    },
};

const metaFor = (state: ExecutionState): StatusMeta | null =>
    state && STATUS_META[state] ? STATUS_META[state] : null;

/**
 * Small status marker for an accordion / section header.
 * Renders nothing until a step has a meaningful state, then shows
 * ✓ success · ✗ failed · ⚠ aborted · spinner running.
 */
export const StepBadge: React.FC<{ state: ExecutionState }> = ({ state }) => {
    if (!state || state === "not_found") return null;
    const meta = metaFor(state);
    if (!meta) return null;
    return (
        <FontAwesomeIcon
            icon={meta.icon}
            spin={meta.spin}
            title={meta.label}
            aria-label={meta.label}
            style={{ color: meta.token, marginLeft: 8, fontSize: "var(--text-body)" }}
        />
    );
};

/**
 * Long-form status line shown beneath a step's form while/after it runs.
 * Replaces the per-step if-ladders. `noun` is the human name of the step
 * (e.g. "Training", "Segmentation") used to build the message.
 */
export const StepStateLine: React.FC<{
    state: ExecutionState;
    polling?: boolean;
    noun: string;
}> = ({ state, polling, noun }) => {
    const meta = metaFor(state);
    // Polling but no state received yet → neutral "checking" hint.
    const showChecking = polling && !meta;
    if (!showChecking && !meta) return null;

    return (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            {showChecking && (
                <span style={lineStyle("var(--color-text-muted)")}>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Checking {noun.toLowerCase()} status…
                </span>
            )}
            {meta && (
                <span style={lineStyle(meta.token)}>
                    <FontAwesomeIcon icon={meta.icon} spin={meta.spin} />
                    {meta.message(noun)}
                </span>
            )}
        </div>
    );
};

const lineStyle = (color: string): React.CSSProperties => ({
    color,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: "var(--text-sm)",
});

// Errors only: StepStateLine already reports success.

const NoteBase = styled.div`
    margin-top: 8px;
    padding: 8px 10px;
    border-radius: 4px;
    font-size: var(--text-sm);
    display: flex;
    align-items: flex-start;
    gap: 8px;
    overflow-wrap: anywhere;
`;

const ErrorNoteBox = styled(NoteBase)`
    color: var(--color-error);
    background: var(--color-error-soft);
`;

export const ErrorNote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ErrorNoteBox role="alert">
        <FontAwesomeIcon icon={faCircleXmark} style={{ marginTop: 2, flexShrink: 0 }} />
        <span>{children}</span>
    </ErrorNoteBox>
);

// --- Optional-step marker ---------------------------------------------------
// A neutral pill that flags a step as skippable. It sits next to (not instead
// of) the StepBadge, so an optional step that *failed* still shows the red ✗ —
// but the tag makes clear that failure doesn't block the pipeline.

const OptionalTagBox = styled.span`
    margin-left: 8px;
    padding: 1px 6px;
    border-radius: 999px;
    border: 1px solid var(--color-border-strong);
    background: var(--color-surface-sunken);
    color: var(--color-text-secondary);
    font-size: var(--text-caption);
    font-weight: var(--weight-medium);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    line-height: 1.4;
`;

export const OptionalTag: React.FC = () => (
    <OptionalTagBox title="This step is optional — skipping or failing it does not block the pipeline.">
        Optional
    </OptionalTagBox>
);
