import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faArrowsLeftRight, faArrowsUpDown } from "@fortawesome/free-solid-svg-icons";

// Image viewer for large result figures (matplotlib PNGs).
//   • Zoom is expressed as a multiple of fit-width (zoom = 1 = image fills WIDTH).
//   • Zoom out to "contain": the smallest zoom shows the whole image, bounded by
//     whichever dimension is larger relative to the viewport (max height/width).
//   • Fit-width / fit-height buttons snap to either dimension; +/- step zoom.
//   • Mouse wheel pans (native scroll); drag pans when the image overflows.
// Native scroll keeps the wheel-pans / zoom behaviour simple and predictable,
// so no zoom-pan library is needed.

const MAX_ZOOM = 8;
const STEP = 1.25;
const EPS = 0.01;

type Props = {
    src: string;
    alt: string;
};

const ZoomableImage: React.FC<Props> = ({ src, alt }) => {
    const boxRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
    const [container, setContainer] = useState<{ w: number; h: number } | null>(null);
    // Fractional viewport centre to preserve across a zoom change.
    const pendingCenter = useRef<{ fx: number; fy: number } | null>(null);
    const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

    // Zoom (× fit-width) at which the image height equals the viewport height.
    // > 1 for landscape images (fit-height enlarges), < 1 for tall images.
    const fitHeightZoom = useMemo(() => {
        if (!natural || !container || !natural.h || !container.w) return null;
        return (container.h * natural.w) / (container.w * natural.h);
    }, [natural, container]);

    // Max zoom-out = "contain": the larger dimension just fits the viewport.
    const minZoom = useMemo(() => {
        if (fitHeightZoom == null) return 1;
        return Math.min(1, fitHeightZoom);
    }, [fitHeightZoom]);

    // Track the viewport size so the fit calculations follow window/layout changes.
    useEffect(() => {
        const box = boxRef.current;
        if (!box) return;
        const update = () => setContainer({ w: box.clientWidth, h: box.clientHeight });
        update();
        const ro = new ResizeObserver(update);
        ro.observe(box);
        return () => ro.disconnect();
    }, []);

    // Keep the current zoom within the (dynamic) allowed range.
    useEffect(() => {
        setZoom((z) => Math.min(Math.max(z, minZoom), MAX_ZOOM));
    }, [minZoom]);

    const zoomTo = (next: number) => {
        const clamped = Math.min(Math.max(next, minZoom), MAX_ZOOM);
        const box = boxRef.current;
        if (box && Math.abs(clamped - zoom) > 1e-6) {
            pendingCenter.current = {
                fx: (box.scrollLeft + box.clientWidth / 2) / box.scrollWidth,
                fy: (box.scrollTop + box.clientHeight / 2) / box.scrollHeight,
            };
        }
        setZoom(clamped);
    };

    // After a zoom re-render, restore the prior viewport centre so zooming
    // grows/shrinks around the middle instead of jumping to a corner.
    useLayoutEffect(() => {
        const box = boxRef.current;
        const pc = pendingCenter.current;
        if (box && pc) {
            box.scrollLeft = pc.fx * box.scrollWidth - box.clientWidth / 2;
            box.scrollTop = pc.fy * box.scrollHeight - box.clientHeight / 2;
            pendingCenter.current = null;
        }
    }, [zoom]);

    // Drag-to-pan complements native wheel scrolling.
    const onMouseDown = (e: React.MouseEvent) => {
        const box = boxRef.current;
        if (!box) return;
        drag.current = { x: e.clientX, y: e.clientY, left: box.scrollLeft, top: box.scrollTop };
    };
    const onMouseMove = (e: React.MouseEvent) => {
        const box = boxRef.current;
        if (!box || !drag.current) return;
        box.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
        box.scrollTop = drag.current.top - (e.clientY - drag.current.y);
    };
    const endDrag = () => {
        drag.current = null;
    };

    const overflowing = zoom > minZoom + EPS;

    return (
        <Wrap>
            <Toolbar>
                <ToolButton type="button" onClick={() => zoomTo(zoom * STEP)} disabled={zoom >= MAX_ZOOM - EPS} title="Zoom in" aria-label="Zoom in">
                    <FontAwesomeIcon icon={faPlus} />
                </ToolButton>
                <ToolButton type="button" onClick={() => zoomTo(zoom / STEP)} disabled={zoom <= minZoom + EPS} title="Zoom out" aria-label="Zoom out">
                    <FontAwesomeIcon icon={faMinus} />
                </ToolButton>
                <ToolButton type="button" onClick={() => zoomTo(1)} disabled={Math.abs(zoom - 1) < EPS} title="Fit to width" aria-label="Fit to width">
                    <FontAwesomeIcon icon={faArrowsLeftRight} />
                </ToolButton>
                <ToolButton
                    type="button"
                    onClick={() => fitHeightZoom != null && zoomTo(fitHeightZoom)}
                    disabled={fitHeightZoom == null || Math.abs(zoom - fitHeightZoom) < EPS}
                    title="Fit to height"
                    aria-label="Fit to height"
                >
                    <FontAwesomeIcon icon={faArrowsUpDown} />
                </ToolButton>
            </Toolbar>
            <ScrollBox
                ref={boxRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={endDrag}
                onMouseLeave={endDrag}
                $grab={overflowing}
            >
                <img
                    src={src}
                    alt={alt}
                    draggable={false}
                    onLoad={(e) =>
                        setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })
                    }
                    style={{ display: "block", flex: "0 0 auto", width: `${zoom * 100}%`, height: "auto", userSelect: "none" }}
                />
            </ScrollBox>
        </Wrap>
    );
};

const Wrap = styled.div`
    position: absolute;
    inset: 0;
`;

const Toolbar = styled.div`
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 2;
    display: flex;
    gap: 4px;
`;

const ToolButton = styled.button`
    width: 30px;
    height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-border-strong);
    border-radius: 6px;
    background: var(--color-surface);
    color: var(--color-text-secondary);
    cursor: pointer;
    font-size: var(--text-sm);
    transition: background 0.12s, color 0.12s;

    &:hover:not(:disabled) {
        background: var(--color-surface-sunken);
        color: var(--color-text);
    }

    &:disabled {
        opacity: 0.4;
        cursor: default;
    }
`;

// safe centring keeps the image centred when it is smaller than the viewport,
// but falls back to start-aligned (scrollable) when it overflows.
const ScrollBox = styled.div<{ $grab: boolean }>`
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    align-items: safe center;
    justify-content: safe center;
    cursor: ${({ $grab }) => ($grab ? "grab" : "default")};

    &:active {
        cursor: ${({ $grab }) => ($grab ? "grabbing" : "default")};
    }
`;

export default ZoomableImage;
