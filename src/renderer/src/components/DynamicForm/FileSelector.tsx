import React, { useCallback, useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Tree } from "react-arborist";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolder,
  faFile,
  faChevronDown,
  faChevronRight,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { get } from "@renderer/utils/requests";
import { FileList, FileListItem } from "./styles";

// Server-side file browser (replaces the old Electron native picker, which
// relied on the non-standard File.path). It walks the backend filesystem via
// the /fs API and yields absolute *server* paths — exactly what the VAME
// backend expects — so it works identically for local and remote backends.
//
// Layout: a navigable tree on the left (with checkboxes for selectable items)
// and the list of currently-selected files on the right, side by side.

type FsEntry = { name: string; path: string; is_dir: boolean; size?: number };
type TreeNode = { id: string; name: string; isDir: boolean; children?: TreeNode[] };

const PLACEHOLDER = "::__loading__";

interface FileSelectorProps {
  name: string;
  multiple?: boolean;
  accept?: string | string[];
  webkitdirectory?: boolean;
  required?: boolean;
  readOnly?: boolean;
}

// Only dot-extensions are used for server-side filtering; mime globs like
// "video/*" are ignored (all files shown).
const toExts = (accept?: string | string[]): string => {
  if (!accept) return "";
  const arr = Array.isArray(accept) ? accept : [accept];
  return arr.filter((a) => a.startsWith(".")).join(",");
};

const basename = (p: string): string => p.split(/[\\/]/).pop() || p;

// Selections are kept sorted by file name: VAME pairs videos to pose files
// positionally, so the two lists must agree on order. Sort on the name rather
// than the full path — sessions are keyed by stem, and the lists may come from
// different directories.
const byName = (a: string, b: string) =>
  basename(a).localeCompare(basename(b), undefined, {
    numeric: true,
    sensitivity: "base",
  }) || a.localeCompare(b);

const sortPaths = (paths: string[]): string[] => [...paths].sort(byName);

const entryToNode = (e: FsEntry): TreeNode => ({
  id: e.path,
  name: e.name,
  isDir: e.is_dir,
  // Directories get a placeholder child so react-arborist always shows an
  // expander; the real children are fetched lazily on first open.
  children: e.is_dir
    ? [{ id: e.path + PLACEHOLDER, name: "Loading…", isDir: false }]
    : undefined,
});

const isPlaceholder = (id: string) => id.endsWith(PLACEHOLDER);

// A directory still holding its placeholder child has not been fetched yet.
const isLoaded = (d: TreeNode): boolean =>
  !(d.children?.length === 1 && isPlaceholder(d.children[0].id));

// Immediate file children of a directory; undefined while it is still unloaded.
const dirFiles = (d: TreeNode): TreeNode[] | undefined =>
  isLoaded(d) ? (d.children ?? []).filter((c) => !c.isDir) : undefined;

const FileInput: React.FC<FileSelectorProps> = ({
  name,
  multiple,
  accept,
  webkitdirectory,
  required,
  readOnly,
}) => {
  const folderMode = !!webkitdirectory;
  const exts = folderMode ? "" : toExts(accept);
  const { getValues } = useFormContext();

  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [error, setError] = useState<string | null>(null);

  const listDir = useCallback(
    async (path?: string): Promise<TreeNode[]> => {
      const qs = new URLSearchParams();
      if (path) qs.set("path", path);
      if (exts) qs.set("exts", exts);
      const res = await get<{ entries: FsEntry[] }>(`fs/list?${qs.toString()}`);
      if (!res.success) {
        setError(res.error);
        return [];
      }
      setError(null);
      return res.data.entries
        .filter((e) => (folderMode ? e.is_dir : true))
        .map(entryToNode);
    },
    [exts, folderMode]
  );

  useEffect(() => {
    (async () => {
      const rootsRes = await get<{ data_root: string }>("fs/roots");
      const start = rootsRes.success ? rootsRes.data.data_root : undefined;
      setTreeData(await listDir(start));
    })();
  }, [listDir]);

  const replaceChildren = (
    nodes: TreeNode[],
    id: string,
    children: TreeNode[]
  ): TreeNode[] =>
    nodes.map((n) => {
      if (n.id === id) return { ...n, children };
      if (n.children?.length) {
        return { ...n, children: replaceChildren(n.children, id, children) };
      }
      return n;
    });

  const findNode = (nodes: TreeNode[], id: string): TreeNode | undefined => {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) {
        const found = findNode(n.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  // Shared by row expansion and "select all in folder", which needs the listing
  // even when the user never opened the directory.
  const ensureChildren = useCallback(
    async (id: string): Promise<TreeNode[]> => {
      const node = findNode(treeData, id);
      if (!node?.isDir) return [];
      if (isLoaded(node)) return node.children ?? [];
      const children = await listDir(id);
      setTreeData((prev) => replaceChildren(prev, id, children));
      return children;
    },
    [treeData, listDir]
  );

  const handleToggle = useCallback(
    (id: string) => {
      void ensureChildren(id);
    },
    [ensureChildren]
  );

  return (
    <Controller
      name={name}
      rules={{ required }}
      render={({ field: { value, onChange } }) => {
        const selected: string[] = Array.isArray(value)
          ? value
          : value
          ? [value]
          : [];
        const selectedSet = new Set(selected);

        const isSelectable = (d: TreeNode) =>
          !isPlaceholder(d.id) && (folderMode ? d.isDir : !d.isDir);

        const toggleSelected = (path: string) => {
          if (readOnly) return;
          if (selectedSet.has(path)) {
            onChange(selected.filter((p) => p !== path));
          } else if (folderMode || !multiple) {
            onChange([path]);
          } else {
            onChange(sortPaths([...selected, path]));
          }
        };

        // Select/deselect every file directly inside a folder, fetching the
        // listing first if it has not been expanded yet.
        const toggleFolder = async (d: TreeNode) => {
          if (readOnly) return;
          const paths = (await ensureChildren(d.id))
            .filter((c) => !c.isDir)
            .map((c) => c.id);
          if (!paths.length) return;
          // Re-read the field: `selected` was captured before the await, so a
          // second folder clicked while this one loaded would be clobbered.
          const raw = getValues(name);
          const current: string[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
          const inFolder = new Set(paths);
          onChange(
            paths.every((p) => current.includes(p))
              ? current.filter((p) => !inFolder.has(p))
              : sortPaths([...new Set([...current, ...paths])])
          );
        };

        return (
          <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
            {/* Left column: file browser */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {error && (
                <div style={{ color: "var(--color-error)", marginBottom: 6 }}>{error}</div>
              )}
              <div
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: 4,
                  height: 260,
                  overflow: "auto",
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-sm)",
                }}
              >
                <Tree<TreeNode>
                  data={treeData}
                  openByDefault={false}
                  width="100%"
                  height={256}
                  rowHeight={28}
                  indent={16}
                  disableEdit
                  disableDrag
                  disableDrop
                  onToggle={handleToggle}
                >
                  {({ node, style }) => {
                    const isDir = node.data.isDir;
                    const placeholder = isPlaceholder(node.data.id);
                    const selectable = isSelectable(node.data);
                    // In multi-file mode directories are not selectable
                    // themselves, so their checkbox slot bulk-selects the files
                    // inside instead. `kids` is undefined until the fetch lands.
                    const bulk = isDir && !!multiple && !folderMode && !placeholder;
                    const kids = bulk ? dirFiles(node.data) : undefined;
                    const allSel =
                      !!kids?.length && kids.every((c) => selectedSet.has(c.id));
                    const someSel =
                      !allSel && !!kids?.some((c) => selectedSet.has(c.id));
                    return (
                      <div
                        style={{
                          ...style,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          minWidth: 0,
                          fontStyle: placeholder ? "italic" : undefined,
                          color: placeholder ? "var(--color-text-muted)" : undefined,
                        }}
                      >
                        {isDir ? (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              node.toggle();
                            }}
                            style={{
                              width: 14,
                              cursor: "pointer",
                              userSelect: "none",
                              color: "var(--color-text-muted)",
                              textAlign: "center",
                            }}
                          >
                            <FontAwesomeIcon
                              icon={node.isOpen ? faChevronDown : faChevronRight}
                              style={{ fontSize: 10 }}
                            />
                          </span>
                        ) : (
                          <span style={{ width: 14 }} />
                        )}
                        {selectable ? (
                          <input
                            type="checkbox"
                            checked={selectedSet.has(node.data.id)}
                            disabled={readOnly}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => toggleSelected(node.data.id)}
                            style={{ flexShrink: 0 }}
                          />
                        ) : bulk ? (
                          <input
                            type="checkbox"
                            ref={(el) => {
                              if (el) el.indeterminate = someSel;
                            }}
                            checked={allSel}
                            disabled={readOnly}
                            title="Select all files in this folder"
                            aria-label={`Select all files in ${node.data.name}`}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => void toggleFolder(node.data)}
                            style={{ flexShrink: 0 }}
                          />
                        ) : (
                          <span style={{ width: 13 }} />
                        )}
                        <span style={{ width: 16, flexShrink: 0, textAlign: "center", color: "var(--color-text-secondary)" }}>
                          {placeholder ? null : (
                            <FontAwesomeIcon icon={isDir ? faFolder : faFile} />
                          )}
                        </span>
                        <span
                          title={node.data.name}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            cursor: isDir || selectable ? "pointer" : "default",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isDir) node.toggle();
                            else if (selectable) toggleSelected(node.data.id);
                          }}
                        >
                          {node.data.name}
                        </span>
                      </div>
                    );
                  }}
                </Tree>
              </div>
            </div>

            {/* Right column: selected files */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                border: "1px solid var(--color-border)",
                borderRadius: 4,
                height: 260,
                overflow: "auto",
                padding: 8,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                Selected ({selected.length})
              </div>
              {selected.length === 0 ? (
                <div style={{ color: "var(--color-text-muted)" }}>
                  {folderMode ? "No folder selected" : "No files selected"}
                </div>
              ) : (
                <FileList>
                  {selected.map((p) => (
                    <FileListItem key={p}>
                      <span
                        title={p}
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {basename(p)}
                      </span>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => toggleSelected(p)}
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            color: "var(--color-error)",
                            flexShrink: 0,
                          }}
                          title="Remove"
                          aria-label={`Remove ${basename(p)}`}
                        >
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      )}
                    </FileListItem>
                  ))}
                </FileList>
              )}
            </div>
          </div>
        );
      }}
    />
  );
};

export default FileInput;
