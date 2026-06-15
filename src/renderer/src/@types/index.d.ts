declare global {

  export type ProjectStates = {
    update_config: {
      execution_state?: string;
      [key: string]: unknown
    };
    preprocessing: {
      execution_state?: string;
      [key: string]: unknown
    };
    preprocessing_visualization: {
      execution_state?: string;
      [key: string]: unknown
    };
    create_trainset: {
      execution_state?: string;
      [key: string]: unknown
    };
    train_model: {
      execution_state?: string;
      [key: string]: unknown
    };
    evaluate_model: {
      execution_state?: string;
      [key: string]: unknown
    };
    generative_model: {
      execution_state?: string;
      [key: string]: unknown
    };
    community: {
      execution_state?: string;
      [key: string]: unknown
    };
    community_videos: {
      execution_state?: string;
      [key: string]: unknown
    };
    motif_videos: {
      execution_state?: string;
      [key: string]: unknown
    };
    segment_session: {
      execution_state?: string;
      [key: string]: unknown
    };
    generate_reports: {
      execution_state?: string;
      [key: string]: unknown
    };
  };

  export type ProjectType = {
    project: string;
    config: {
      Project: string;
      project_path: string;
      project_name: string;
      creation_datetime: string;
      vame_version: string;
      keypoints: string[];
      all_data: boolean;
      anneal_function: string;
      annealtime: number;
      axis: string;
      batch_size: number;
      beta: number;
      beta_norm: boolean;
      dropout_encoder: number;
      dropout_pred: number;
      dropout_rec: number;
      egocentric_data: boolean;
      hidden_size_layer_1: number;
      hidden_size_layer_2: number;
      hidden_size_pred: number;
      hidden_size_rec: number;
      hmm_trained: boolean;
      individual_parametrization: boolean;
      iqr_factor: number;
      kl_start: number;
      kmeans_lambda: number;
      kmeans_loss: number;
      learning_rate: number;
      legacy: boolean;
      length_of_motif_video: number;
      load_data: string;
      max_epochs: number;
      min_dist: number;
      model_convergence: number;
      model_name: string;
      model_snapshot: number;
      mse_prediction_reduction: string;
      mse_reconstruction_reduction: string;
      n_clusters: number;
      n_init_kmeans: number;
      n_layers: number;
      n_neighbors: number;
      noise: boolean;
      num_features: number;
      num_points: number;
      pose_confidence: number;
      prediction_decoder: number;
      prediction_steps: number;
      pretrained_model: string;
      pretrained_weights: boolean;
      project_random_state: number;
      robust: boolean;
      savgol_filter: boolean;
      savgol_length: number;
      savgol_order: number;
      scheduler: number;
      scheduler_gamma: number;
      scheduler_step_size: number;
      scheduler_threshold: number;
      softplus: boolean;
      test_fraction: number;
      time_window: number;
      transition_function: string;
      zdims: number;
    };
    workflow: {
      organized: boolean;
      modeled: boolean;
      segmented: boolean;
      motif_videos_created: boolean;
      communities_created: boolean;
      community_videos_created: boolean;
      motif_community_videos_created: boolean;
      umaps_created: boolean;
    };
    states: ProjectStates;
    videos: string[];
    pes_paths: string[];
    assets: {
      images: {
        evaluation: string[];
        visualization: {
          hmm: Record<string, string[]>,
          kmeans: Record<string, string[]>
        };
      };
      videos: {
        community: {
          hmm: Record<string, string[]>,
          kmeans: Record<string, string[]>
        };
        motif: {
          hmm: Record<string, string[]>,
          kmeans: Record<string, string[]>
        };
      };
    };
    creation_datetime: string;
    /** Derived on the backend from the project's files; reflects last pipeline activity. */
    last_modified?: string;
  };

  export type TypeName =
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "integer"
    | "array"
    | "null";

  export interface Schema {
    title: string;
    properties: Properties;

    type?: "object";
    description?: string;

    required?: string[];
  }

  export type Properties = Record<string, Property>;

  export type Property =
    | StringProperty
    | BooleanProperty
    | NumberProperty
    | EnumProperty
    | ObjectProperty
    | ArrayStringProperty
    | ArrayNumberProperty
    | ArrayBooleanProperty
    | ArrayObjectProperty

  export type SimpleProperty =
    | StringProperty
    | BooleanProperty
    | NumberProperty
    | EnumProperty
    | ObjectProperty

  export type ArrayProperty =
    | ArrayStringProperty
    | ArrayNumberProperty
    | ArrayBooleanProperty
    | ArrayObjectProperty;

  interface DefaultPropertyAttrs {
    title: string;
    description?: string;
    "allow-spaces"?: boolean;
    readOnly?: boolean;
    /**
     * Conditionally render this field based on another field's current value.
     * - `fileExtension`: visible only when every value of `field` (a file
     *   picker) ends with the given extension (e.g. ".nwb").
     * - `equals`: visible only when `field`'s value strictly equals this.
     * - `nonEmpty`: visible only when `field` has a non-empty value.
     */
    visibleWhen?: FieldCondition;
    /** Disable (grey out) this field when the condition holds. Same shape as `visibleWhen`. */
    disabledWhen?: FieldCondition;
    /** Render indented under its controlling field (e.g. a parameter beneath its toggle). */
    subfield?: boolean;
  }

  interface FieldCondition {
    field: string;
    fileExtension?: string;
    equals?: unknown;
    nonEmpty?: boolean;
  }

  export type StringProperty = DefaultPropertyAttrs & {
    type: "string";
    default?: string;
  };

  export type FileProperty = DefaultPropertyAttrs & {
    type: "string";
    format: "file" | "folder";
    default?: string;
    multiple?: boolean;
    accept?: "string";
  };

  export type BooleanProperty = DefaultPropertyAttrs & {
    type: "boolean";
    default?: boolean;
  };

  export type NumberProperty = DefaultPropertyAttrs & {
    type: "number" | "integer";
    default?: number;
    maximum?: number;
    minimum?: number;
  };

  export type EnumProperty = DefaultPropertyAttrs & {
    type: "string";
    enum: string[];
    multiple?: boolean;
    /** Render the options as a checkbox group instead of a multi-select listbox. */
    checkboxes?: boolean;
    default?: string | string[];
  };

  export type ObjectProperty = DefaultPropertyAttrs & {
    type: "object";
    properties: Record<string, SimpleProperty>
    default?: Record<string, any>
    required?: string[];
  };

  interface DefaultArrayPropertyAttrs extends DefaultPropertyAttrs {
    maxItems?: number;
    minItems?: number;
  }

  export type ArrayBooleanProperty = DefaultArrayPropertyAttrs & {
    type: "array";
    default?: boolean[];
    items: Omit<BooleanProperty, "default">;
  };

  export type ArrayNumberProperty = DefaultArrayPropertyAttrs & {
    type: "array";
    default?: number[];
    items: Omit<NumberProperty, "default">;
  };

  export type ArrayStringProperty = DefaultArrayPropertyAttrs & {
    type: "array";
    default?: string[];
    items: Omit<StringProperty, "default">;
  };

  export type ArrayObjectProperty = DefaultArrayPropertyAttrs & {
    type: "array";
    default?: Array<Record<string, string | boolean | number>>;
    items: Omit<ObjectProperty, "default">;
  };

}

declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T>, HTMLInputTypeAttribute {
    // extends React's HTMLAttributes
    directory?: string;
    webkitdirectory?: string;
  }
}

export { };
