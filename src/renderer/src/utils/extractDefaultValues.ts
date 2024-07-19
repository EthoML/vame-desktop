export function extractDefaultValues(schema: Schema): Record<string, any> {
  const result: Record<string, any> = {};

  const extractDefaults = (properties: Properties, parentKey?: string) => {
    for (const [key, property] of Object.entries(properties)) {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      if (property.type === 'object' && property.properties) {
        extractDefaults(property.properties, fullKey);
      } else if (property.type === 'array' && 'items' in property) {
        // to use useFildArray as flat we need convert to string
        result[fullKey] = Array.isArray(property.default) ? property.default.map(i=> (typeof i !== "object" ? String(i) : i)) : [];
      } else if ('default' in property) {
        result[fullKey] = property.default
      }
    }
  };

  if (schema?.properties) {
    extractDefaults(schema.properties);
  }

  return result;
}
