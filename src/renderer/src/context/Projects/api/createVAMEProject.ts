import { post } from "@renderer/utils/requests"

export interface CreateProps {
  name: string
  videos: string[]
  pes_paths: string[]
  // Only used for NWB sources; surfaced by the create form when .nwb is picked.
  processing_module_key?: string
  pose_estimation_key?: string
  // Reproducibility seed (config.project_random_state); the create form suggests one.
  project_random_state?: number
  // Frame rate; only sent when no video is selected (otherwise read from the video).
  fps?: number
}

export interface CreateResponse {
  config: ProjectType["config"]
  created: boolean
  project: string
}

// Derive the VAME `source_software` from the selected files' extensions.
// VAME applies one source_software to the whole project, so this assumes the
// selection is homogeneous (enforced by the UI guidance).
//   .nwb            -> "NWB"      (movement's NWB loader, default pose keys)
//   .nc             -> "movement" (movement-schema NetCDF read directly)
//   .csv/.slp/.h5   -> "auto"     (movement infers DLC / SLEAP / LightningPose)
const inferSourceSoftware = (pes_paths: string[]): string => {
  const ext = (p: string) => p.slice(p.lastIndexOf(".")).toLowerCase()
  const exts = (pes_paths ?? []).map(ext)
  if (exts.length > 0 && exts.every((e) => e === ".nwb")) return "NWB"
  if (exts.length > 0 && exts.every((e) => e === ".nc")) return "movement"
  return "auto"
}

export const createVAMEProject = async ({
  name,
  videos,
  pes_paths,
  processing_module_key,
  pose_estimation_key,
  project_random_state,
  fps,
}: CreateProps) => {
  const source_software = inferSourceSoftware(pes_paths)

  const result = await post<CreateResponse>('create', {
    project: name,
    source_software,
    videos: videos,
    poses_estimations: pes_paths,
    // Omit when blank/NaN so the backend falls back to VAME's default seed.
    ...(Number.isFinite(project_random_state) ? { project_random_state } : {}),
    // Only sent when no video is present; with videos, VAME reads fps from them.
    ...((!videos || videos.length === 0) && Number.isFinite(fps) ? { fps } : {}),
    // The NWB pose-location keys only matter for NWB sources.
    ...(source_software === "NWB"
      ? { processing_module_key, pose_estimation_key }
      : {}),
  })

  if (result.success) {
    return result.data
  } else {
    throw new Error(result.error)
  }
}
