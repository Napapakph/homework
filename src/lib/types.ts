export type Role = "viewer" | "qa_engineer" | "admin";

export type Station = "ScrewCheck" | "LabelOCR" | "DrawingConform";

export type Result = "OK" | "NG";

export type Severity = "info" | "minor" | "major" | "critical";

export type NgCode =
  | "SCR_MISSING"
  | "SCR_WRONG_TYPE"
  | "LBL_MISSING"
  | "LBL_MISREAD"
  | "DRW_MISALIGN"
  | "COS_SCRATCH";

export type NgCategory = "Screw" | "Label" | "Drawing" | "Cosmetic";

export type Unit = {
  serial: string;
  line: string;
  workOrder: string;
  model: string;
  startedAt: string;
};

export type InspectionFeatureScrew = {
  expected: number;
  detected: number;
  missingPositions: number[];
  torqueOk: boolean;
};

export type InspectionFeatureLabel = {
  hasLabel: boolean;
  rotationDeg: number;
  ocrText: string;
  mesMatch: boolean;
  printQualityScore: number;
};

export type InspectionFeatureDrawing = {
  misalignmentMm: number;
  missingParts: string[];
  connectorRouteOk: boolean;
  cosmeticDefects: string[];
};

export type InspectionFeature =
  | { station: "ScrewCheck"; data: InspectionFeatureScrew }
  | { station: "LabelOCR"; data: InspectionFeatureLabel }
  | { station: "DrawingConform"; data: InspectionFeatureDrawing };

export type InspectionRecord = {
  id: string;
  serial: string;
  workOrder: string;
  station: Station;
  line: string;
  model: string;
  modelVersion: string;
  capturedAt: string;
  result: Result;
  ngCode?: NgCode;
  ngCategory?: NgCategory;
  severity: Severity;
  confidence: number;
  operator?: string;
  cycleTimeSec: number;
  imageUri: string;
  features: InspectionFeature;
};

export type ModelVersion = {
  id: string;
  station: Station;
  version: string;
  deployedAt: string;
  notes: string;
};

export type ModelMetricWindow = {
  station: Station;
  modelVersion: string;
  windowStart: string;
  windowEnd: string;
  precision: number;
  recall: number;
  accuracy: number;
  auc: number;
  tp: number;
  fp: number;
  tn: number;
  fn: number;
};

export type StationStatus = {
  station: Station;
  line: string;
  camera: string;
  status: "online" | "offline" | "degraded";
  lastHeartbeat: string;
};

export type LiveThumbnail = {
  station: Station;
  imageUri: string;
  capturedAt: string;
};

export type NgTickerEvent = {
  id: string;
  station: Station;
  serial: string;
  capturedAt: string;
  ngCode: NgCode;
  severity: Severity;
};

export type SummaryFilters = {
  from?: string;
  to?: string;
  line?: string;
  station?: Station;
  model?: string;
};

export type SummaryPayload = {
  passRate: number;
  ngRate: number;
  topNg: Array<{ code: NgCode; count: number; ratio: number }>;
  avgCycleTime: number;
  inspectedToday: number;
  ok: number;
  ng: number;
};

export type TrendPoint = {
  bucketStart: string;
  passRate: number;
  total: number;
  modelVersion: string;
  marker?: "deploy" | "retrain";
};

export type ParetoPoint = {
  ngCode: NgCode;
  ngCategory: NgCategory;
  count: number;
  ratio: number;
};

export type InspectionListItem = {
  id: string;
  serial: string;
  workOrder: string;
  result: Result;
  station: Station;
  ngCode?: NgCode;
  severity: Severity;
  modelVersion: string;
  confidence: number;
  capturedAt: string;
  operator?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  nextCursor?: string;
};

export type UnitTimelineEntry = {
  station: Station;
  result: Result;
  ngCode?: NgCode;
  capturedAt: string;
  inspectionId: string;
  operator?: string;
};

export type UnitTimelinePayload = {
  serial: string;
  currentStatus: Result;
  route: UnitTimelineEntry[];
};

export type DeploymentEvent = {
  id: string;
  station: Station;
  modelVersion: string;
  deployedAt: string;
  type: "deploy" | "retrain";
  notes: string;
};
