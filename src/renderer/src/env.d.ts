/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Prebuilt Plotly bundle (no bundled types) and the react-plotly factory subpath.
declare module "plotly.js-dist-min" {
  const Plotly: any
  export default Plotly
}

declare module "react-plotly.js/factory" {
  import type { ComponentType } from "react"
  import type { PlotParams } from "react-plotly.js"
  const createPlotlyComponent: (plotly: any) => ComponentType<PlotParams>
  export default createPlotlyComponent
}
