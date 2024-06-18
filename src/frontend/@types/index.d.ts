declare global {

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
    "allow-spaces": boolean;
    readOnly?: boolean;
  }

  export type StringProperty = DefaultPropertyAttrs & {
    type: "string";
    format?: "file" | "folder";
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

  export type EnumProperty = DefaultPropertyAttrs &  {
    type: "string";
    enum: string[];
    default?: string;
  };

  export type ObjectProperty = DefaultPropertyAttrs &  {
    type: "object";
    properties: Record<string, SimpleProperty>
    default?: Record<string, any>
    required?: string[];
  };

  interface DefaultArrayPropertyAttrs extends DefaultPropertyAttrs{
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

  // NOT USED YET

  export type AnyOfProperty = DefaultPropertyAttrs & {
    anyOf: Array<
      {
        type: "null" | "number" | "integer" | "string" | "boolean";
      } & DefaultPropertyAttrs
    >;
    default?: any;
  };

  export type AnyOfArrayProperty = DefaultPropertyAttrs & {
    anyOf: Array<
      { items: AnyOf["anyOf"] ; type: "array" } | { type: "null" }
    >;
    default?: any[];
  };

}

declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T>, HTMLInputTypeAttribute<T> {
    // extends React's HTMLAttributes
    directory?: string;
    webkitdirectory?: string;
  }
}

export {};