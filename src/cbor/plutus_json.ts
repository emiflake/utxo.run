import Dexie, { type EntityTable } from "dexie";
import * as z from "zod";

export interface PlutusJsonEntity {
  id: number;
  rawJson: string;
  title: string;
  description: string;
}

export const db = new Dexie("fine-tx") as Dexie & {
  plutusJson: EntityTable<PlutusJsonEntity, "id">;
};

db.version(1).stores({
  plutusJson: "++id, rawJson, title, description",
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
        items: SchemaType[];
      }
    | {
        dataType: "constructor";
        index: number;
        fields: SchemaType[];
      }
    | {
        $ref: string;
      }
    | {
        dataType: "bytes";
      }
    | {
        dataType: "integer";
      }
    | object
  );

export const listSchema: z.ZodType<SchemaType> = baseSchemaTypeSchema.extend({
  dataType: z.literal("list"),
  items: z.lazy(() => schemaTypeSchema.array()),
});

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
});

export const anySchema: z.ZodType<SchemaType> = z.object({});

export const schemaTypeSchema = z.union([
  anySchema,
  listSchema,
  constructorSchema,
  bytesSchema,
  integerSchema,
  refSchema,
]);

// Define typeSchema before using it
export const typeSchema = {
  dataType: z.string().optional(),
  $ref: z.string().optional(),
  schema: z.record(z.string(), z.any()).optional(),
};

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
      schema: z.union([schemaTypeSchema, z.object({})]).optional(),
    })
    .optional(),
  compiledCode: z.string().optional(),
  hash: z.string().optional(),
});

export type Validator = z.infer<typeof validatorSchema>;

export const definitionSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
  })
  .extend(typeSchema);

export type Definition = z.infer<typeof definitionSchema>;

export const plutusJsonSchema = z.object({
  preamble: preambleSchema,
  validators: z.array(validatorSchema),
  definitions: z.record(z.string(), definitionSchema),
});

export type PlutusJson = z.infer<typeof plutusJsonSchema>;
