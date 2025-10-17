import { z } from "zod";

export const summaryQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  line: z.string().optional(),
  station: z
    .enum(["ScrewCheck", "LabelOCR", "DrawingConform"])
    .optional(),
  model: z.string().optional(),
});

export const inspectionsQuerySchema = summaryQuerySchema.extend({
  result: z.enum(["OK", "NG"]).optional(),
  ngCode: z.string().optional(),
  serial: z.string().optional(),
  workOrder: z.string().optional(),
  cursor: z.string().optional(),
});

export const modelMetricsQuerySchema = summaryQuerySchema;

export const ingestSchema = z.object({
  serial: z.string(),
  workOrder: z.string(),
  station: z.enum(["ScrewCheck", "LabelOCR", "DrawingConform"]),
  line: z.string(),
  model: z.string(),
  modelVersion: z.string(),
  capturedAt: z.string(),
  result: z.enum(["OK", "NG"]),
  ngCode: z
    .enum([
      "SCR_MISSING",
      "SCR_WRONG_TYPE",
      "LBL_MISSING",
      "LBL_MISREAD",
      "DRW_MISALIGN",
      "COS_SCRATCH",
    ])
    .optional(),
  ngCategory: z.enum(["Screw", "Label", "Drawing", "Cosmetic"]).optional(),
  severity: z.enum(["info", "minor", "major", "critical"]),
  confidence: z.number(),
  operator: z.string().optional(),
  cycleTimeSec: z.number(),
  imageUri: z.string(),
  features: z.any(),
});

export const exportSchema = z.object({
  format: z.enum(["csv", "pdf"]),
  filters: inspectionsQuerySchema.partial().optional(),
  columns: z.array(z.string()).optional(),
});
