import Dexie, { type EntityTable } from "dexie";
import * as z from "zod";
import { RawDatum } from "./raw_datum";

export interface PlutusJsonEntity {
  id: number;
  rawJson: string;
  schema: PlutusJson;
  title: string;
  description: string;
}

export const db = new Dexie("fine-tx") as Dexie & {
  plutusJson: EntityTable<PlutusJsonEntity, "id">;
};

db.version(1).stores({
  plutusJson: "++id, rawJson, schema, title, description",
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// plutus.json schema
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export const preambleSchema = z.object({
  title: z.string(),
  description: z.string(),
  version: z.string().optional(),
  plutusVersion: z.string().optional(),
  compiler: z.unknown().optional(),
  license: z.string().optional(),
});

export type Preamble = z.infer<typeof preambleSchema>;

export const baseSchemaTypeSchema = z.object({});

export type SchemaType = z.infer<typeof baseSchemaTypeSchema> &
  (
    | {
        dataType: "list";
        items: SchemaType[] | SchemaType;
      }
    | {
        dataType: "constructor";
        index: number;
        fields: SchemaType[];
      }
    | {
        $ref: string;
        title?: string;
      }
    | {
        dataType: "bytes";
      }
    | {
        dataType: "integer";
      }
    | object
    | {
        anyOf: SchemaType[];
      }
  );

export const listSchema: z.ZodType<
  SchemaType & { dataType: "list"; items: SchemaType[] | SchemaType }
> = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  dataType: z.literal("list"),
  items: z.lazy(() => z.union([schemaTypeSchema.array(), schemaTypeSchema])),
});

export type ListSchema = z.infer<typeof listSchema>;

export const constructorSchema: z.ZodType<SchemaType> =
  baseSchemaTypeSchema.extend({
    dataType: z.literal("constructor"),
    index: z.number(),
    fields: z.lazy(() => schemaTypeSchema.array()),
  });

export const bytesSchema: z.ZodType<SchemaType> = baseSchemaTypeSchema.extend({
  dataType: z.literal("bytes"),
});

export const integerSchema: z.ZodType<SchemaType> = baseSchemaTypeSchema.extend(
  {
    dataType: z.literal("integer"),
  }
);

export const refSchema: z.ZodType<SchemaType> = baseSchemaTypeSchema.extend({
  $ref: z.string(),
  title: z.string().optional().nullable(),
});

export const anyOfSchema: z.ZodType<SchemaType> = baseSchemaTypeSchema.extend({
  anyOf: z.lazy(() => schemaTypeSchema.array()),
});

export const anySchema: z.ZodType<SchemaType> = z.object({});

export const schemaTypeSchema = z.union([
  listSchema,
  constructorSchema,
  bytesSchema,
  integerSchema,
  refSchema,
  anyOfSchema,
  anySchema,
]);

// Define typeSchema before using it
export const typeSchema = z.object({
  dataType: z.string().optional(),
  $ref: z.string().optional(),
});

export const validatorSchema = z.object({
  title: z.string(),
  datum: z
    .object({
      title: z.string().optional(),
      schema: schemaTypeSchema.optional(),
    })
    .optional(),
  redeemer: z
    .object({
      title: z.string().optional(),
      schema: schemaTypeSchema.optional(),
    })
    .optional(),
  compiledCode: z.string().optional(),
  hash: z.string().optional(),
});

export type Validator = z.infer<typeof validatorSchema>;

export const definitionSchema = schemaTypeSchema;

export type Definition = z.infer<typeof definitionSchema>;

export const plutusJsonSchema = z.object({
  preamble: preambleSchema,
  validators: z.array(validatorSchema),
  definitions: z.record(z.string(), definitionSchema),
});

export type PlutusJson = z.infer<typeof plutusJsonSchema>;

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Using schema to parse datums

export const distillDefinitions = (
  plutusJson: PlutusJson[]
): Record<string, Definition> => {
  return plutusJson.reduce((acc, plutusJson) => {
    return {
      ...acc,
      ...plutusJson.definitions,
    };
  }, {});
};

export const createParsingContext = (
  plutusJson: PlutusJsonEntity[]
): DatumParsingContext => {
  const defs = distillDefinitions(plutusJson.map((b) => b.schema));
  const listSchemas: ListSchema[] = Object.values(defs).filter(
    (d): d is ListSchema => "dataType" in d && d.dataType === "list"
  );
  return {
    listSchemas,
    definitions: defs,
  };
};

export type ParseResult =
  | {
      value: unknown;
      typeName: string;
    }
  | {
      error: string;
    };

export type DatumParsingContext = {
  listSchemas: ListSchema[];
  definitions: Record<string, Definition>;
};

/**
 * Refs, when used in a schema, are global, and look like this:
 * `#/definitions/someModule~1SomeName`
 *
 * This function drops the `#/definitions/` prefix and replaces the `~1` with `/`.
 */
const globalRefToLocal = (ref: string): string => {
  return ref.replace("#/definitions/", "").replace(/~1/g, "/");
};

export const resolveRef = (
  ctx: DatumParsingContext,
  schema: { $ref: string } | SchemaType
): SchemaType => {
  if ("$ref" in schema) {
    const localRef = globalRefToLocal(schema.$ref);
    const def = ctx.definitions[localRef];
    if (!def) {
      throw new Error(`Definition ${localRef} not found`);
    }
    return def;
  }
  return schema;
};

/**
 * Check if a datum matches a schema type.
 *
 * Performs a shallow check. It does resolve $refs, but does not perform any
 * recursive checks.
 */
export const matches = (
  ctx: DatumParsingContext,
  datum: RawDatum,
  schema: SchemaType
): boolean => {
  // Can we drop this? We can if we ensure that all $refs are resolved before we get here.
  if ("$ref" in schema) {
    const def = ctx.definitions[globalRefToLocal(schema.$ref)];
    if (!def) {
      return false;
    }
    return matches(ctx, datum, def);
  }

  if (typeof datum === "string") {
    return "dataType" in schema && schema.dataType === "bytes";
  } else if (typeof datum === "number") {
    return "dataType" in schema && schema.dataType === "integer";
  } else if (Array.isArray(datum)) {
    return "dataType" in schema && schema.dataType === "list";
  } else if (
    typeof datum === "object" &&
    "dataType" in schema &&
    schema.dataType === "constructor"
  ) {
    // Technically, we are too lenient here, but unless there is ambiguity, it won't matter.
    return true;
  } else if (
    "anyOf" in schema &&
    schema.anyOf.some((s) => matches(ctx, datum, s))
  ) {
    // Same as above.
    return true;
  }

  return false;
};

/**
 * Add the record field names to a list type. As a result, this becomes a record.
 *
 * In advance, we know that the raw datum is a list, and we know that it matches
 * the schema.
 */
export const enrichListWithSchema = (
  ctx: DatumParsingContext,
  datum: RawDatum[],
  schema: ListSchema & { items: SchemaType[] }
): Record<string, unknown> => {
  return Object.fromEntries(
    datum.map((item, i) => {
      const parsed = parseAgainstSchema(item, ctx);
      const valueToShow = "error" in parsed ? item : parsed.value;
      if (schema.items[i] && "title" in schema.items[i]) {
        return [schema.items[i].title, valueToShow];
      }
      return [i.toString(), valueToShow];
    })
  );
};

export const parseAgainstSchema = (
  datum: RawDatum,
  context: DatumParsingContext
): ParseResult => {
  if (typeof datum === "string") {
    return { value: datum, typeName: "string" };
  } else if (typeof datum === "number") {
    return { value: datum, typeName: "integer" };
  } else if (Array.isArray(datum)) {
    // Handle `list` types in schema

    const length = datum.length;
    // Handle case where list schema defines a specific length and configuration
    const sameLengthListSchemas = context.listSchemas.filter(
      (schema): schema is ListSchema & { items: SchemaType[] } => {
        return Array.isArray(schema.items) && schema.items.length === length;
      }
    );
    if (sameLengthListSchemas.length === 0) {
      return { value: datum, typeName: "list" };
    }

    const fullyMatchingListSchemas = sameLengthListSchemas.filter(
      (schema): schema is ListSchema & { items: SchemaType[] } => {
        return schema.items.every((item, i) => {
          const datumField = datum[i];
          const resolvedItem = resolveRef(context, item);
          const match = matches(context, datumField, resolvedItem);
          return match;
        });
      }
    );

    if (fullyMatchingListSchemas.length > 0) {
      const choice = fullyMatchingListSchemas[0];

      return {
        value: enrichListWithSchema(context, datum, choice),
        typeName: "list",
      };
    }

    return { value: datum, typeName: "list" };
  }

  return { value: datum, typeName: "unknown" };
};
