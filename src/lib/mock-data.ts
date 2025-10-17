import { addMinutes, formatISO, isAfter, isBefore, parseISO } from "date-fns";
import {
  DeploymentEvent,
  InspectionListItem,
  InspectionRecord,
  ModelMetricWindow,
  ModelVersion,
  NgTickerEvent,
  PaginatedResponse,
  ParetoPoint,
  Result,
  StationStatus,
  SummaryFilters,
  SummaryPayload,
  TrendPoint,
  Unit,
  UnitTimelinePayload,
} from "./types";

type InspectionFilters = SummaryFilters & {
  result?: Result;
  ngCode?: string;
  serial?: string;
  workOrder?: string;
  cursor?: string;
};

const now = new Date();
const minusHours = (hours: number) => formatISO(addMinutes(now, hours * -60));

const mockUnits: Unit[] = [
  {
    serial: "AC25W42-L1-00123",
    line: "L1",
    workOrder: "WO-10001",
    model: "HVAC-X100",
    startedAt: minusHours(20),
  },
  {
    serial: "AC25W42-L1-00124",
    line: "L1",
    workOrder: "WO-10001",
    model: "HVAC-X100",
    startedAt: minusHours(18),
  },
  {
    serial: "AC25W42-L2-00004",
    line: "L2",
    workOrder: "WO-10003",
    model: "HVAC-Z200",
    startedAt: minusHours(8),
  },
];

const mockModelVersions: ModelVersion[] = [
  {
    id: "mod-screw-v1",
    station: "ScrewCheck",
    version: "screw-v1.3.2",
    deployedAt: minusHours(30),
    notes: "Torque heuristics tuned; improved false positives.",
  },
  {
    id: "mod-label-v1",
    station: "LabelOCR",
    version: "label-v2.1.0",
    deployedAt: minusHours(48),
    notes: "OCR engine swapped to VisionPro pipeline.",
  },
  {
    id: "mod-drawing-v2",
    station: "DrawingConform",
    version: "drawing-v1.5.4",
    deployedAt: minusHours(16),
    notes: "Retrain with 800 new annotated panels.",
  },
];

const mockDeployments: DeploymentEvent[] = [
  {
    id: "dep-1",
    station: "ScrewCheck",
    modelVersion: "screw-v1.3.2",
    deployedAt: minusHours(30),
    type: "deploy",
    notes: "Baseline release.",
  },
  {
    id: "dep-2",
    station: "DrawingConform",
    modelVersion: "drawing-v1.5.4",
    deployedAt: minusHours(14),
    type: "retrain",
    notes: "Retrain after NG spike on misalignment.",
  },
];

const mockInspections: InspectionRecord[] = [
  {
    id: "insp-10001",
    serial: "AC25W42-L1-00123",
    workOrder: "WO-10001",
    station: "ScrewCheck",
    line: "L1",
    model: "HVAC-X100",
    modelVersion: "screw-v1.3.2",
    capturedAt: minusHours(4),
    result: "OK",
    severity: "info",
    confidence: 0.97,
    cycleTimeSec: 21,
    imageUri: "/mock-images/screw-ok-00123.jpg",
    operator: "op-aj",
    features: {
      station: "ScrewCheck",
      data: {
        expected: 8,
        detected: 8,
        missingPositions: [],
        torqueOk: true,
      },
    },
  },
  {
    id: "insp-10002",
    serial: "AC25W42-L1-00123",
    workOrder: "WO-10001",
    station: "LabelOCR",
    line: "L1",
    model: "HVAC-X100",
    modelVersion: "label-v2.1.0",
    capturedAt: minusHours(3.5),
    result: "NG",
    ngCode: "LBL_MISREAD",
    ngCategory: "Label",
    severity: "major",
    confidence: 0.62,
    cycleTimeSec: 18,
    imageUri: "/mock-images/label-ng-00123.jpg",
    operator: "op-nu",
    features: {
      station: "LabelOCR",
      data: {
        hasLabel: true,
        rotationDeg: 4.2,
        ocrText: "HX-100-AX9",
        mesMatch: false,
        printQualityScore: 0.74,
      },
    },
  },
  {
    id: "insp-10003",
    serial: "AC25W42-L1-00123",
    workOrder: "WO-10001",
    station: "DrawingConform",
    line: "L1",
    model: "HVAC-X100",
    modelVersion: "drawing-v1.5.4",
    capturedAt: minusHours(3),
    result: "OK",
    severity: "info",
    confidence: 0.9,
    cycleTimeSec: 26,
    imageUri: "/mock-images/drawing-ok-00123.jpg",
    operator: "op-rk",
    features: {
      station: "DrawingConform",
      data: {
        misalignmentMm: 2.1,
        missingParts: [],
        connectorRouteOk: true,
        cosmeticDefects: [],
      },
    },
  },
  {
    id: "insp-10004",
    serial: "AC25W42-L1-00124",
    workOrder: "WO-10001",
    station: "ScrewCheck",
    line: "L1",
    model: "HVAC-X100",
    modelVersion: "screw-v1.3.2",
    capturedAt: minusHours(2.5),
    result: "NG",
    ngCode: "SCR_MISSING",
    ngCategory: "Screw",
    severity: "major",
    confidence: 0.81,
    cycleTimeSec: 23,
    imageUri: "/mock-images/screw-ng-00124.jpg",
    operator: "op-aj",
    features: {
      station: "ScrewCheck",
      data: {
        expected: 8,
        detected: 6,
        missingPositions: [5, 7],
        torqueOk: false,
      },
    },
  },
  {
    id: "insp-10005",
    serial: "AC25W42-L1-00124",
    workOrder: "WO-10001",
    station: "LabelOCR",
    line: "L1",
    model: "HVAC-X100",
    modelVersion: "label-v2.1.0",
    capturedAt: minusHours(2.2),
    result: "OK",
    severity: "info",
    confidence: 0.89,
    cycleTimeSec: 17,
    imageUri: "/mock-images/label-ok-00124.jpg",
    operator: "op-nu",
    features: {
      station: "LabelOCR",
      data: {
        hasLabel: true,
        rotationDeg: 1.2,
        ocrText: "HX-100-AX9",
        mesMatch: true,
        printQualityScore: 0.9,
      },
    },
  },
  {
    id: "insp-10006",
    serial: "AC25W42-L1-00124",
    workOrder: "WO-10001",
    station: "DrawingConform",
    line: "L1",
    model: "HVAC-X100",
    modelVersion: "drawing-v1.5.4",
    capturedAt: minusHours(2),
    result: "NG",
    ngCode: "DRW_MISALIGN",
    ngCategory: "Drawing",
    severity: "critical",
    confidence: 0.73,
    cycleTimeSec: 27,
    imageUri: "/mock-images/drawing-ng-00124.jpg",
    operator: "op-rk",
    features: {
      station: "DrawingConform",
      data: {
        misalignmentMm: 7.4,
        missingParts: ["Left bracket"],
        connectorRouteOk: false,
        cosmeticDefects: ["Scratch on panel"],
      },
    },
  },
  {
    id: "insp-10007",
    serial: "AC25W42-L2-00004",
    workOrder: "WO-10003",
    station: "ScrewCheck",
    line: "L2",
    model: "HVAC-Z200",
    modelVersion: "screw-v1.3.2",
    capturedAt: minusHours(1.5),
    result: "OK",
    severity: "info",
    confidence: 0.95,
    cycleTimeSec: 24,
    imageUri: "/mock-images/screw-ok-00004.jpg",
    operator: "op-ml",
    features: {
      station: "ScrewCheck",
      data: {
        expected: 8,
        detected: 8,
        missingPositions: [],
        torqueOk: true,
      },
    },
  },
  {
    id: "insp-10008",
    serial: "AC25W42-L2-00004",
    workOrder: "WO-10003",
    station: "LabelOCR",
    line: "L2",
    model: "HVAC-Z200",
    modelVersion: "label-v2.1.0",
    capturedAt: minusHours(1.2),
    result: "OK",
    severity: "info",
    confidence: 0.92,
    cycleTimeSec: 19,
    imageUri: "/mock-images/label-ok-00004.jpg",
    operator: "op-ml",
    features: {
      station: "LabelOCR",
      data: {
        hasLabel: true,
        rotationDeg: 0.6,
        ocrText: "HZ-200-BV1",
        mesMatch: true,
        printQualityScore: 0.95,
      },
    },
  },
  {
    id: "insp-10009",
    serial: "AC25W42-L2-00004",
    workOrder: "WO-10003",
    station: "DrawingConform",
    line: "L2",
    model: "HVAC-Z200",
    modelVersion: "drawing-v1.5.4",
    capturedAt: minusHours(1),
    result: "OK",
    severity: "info",
    confidence: 0.91,
    cycleTimeSec: 25,
    imageUri: "/mock-images/drawing-ok-00004.jpg",
    operator: "op-ml",
    features: {
      station: "DrawingConform",
      data: {
        misalignmentMm: 3.1,
        missingParts: [],
        connectorRouteOk: true,
        cosmeticDefects: [],
      },
    },
  },
];

const mockStationStatuses: StationStatus[] = [
  {
    station: "ScrewCheck",
    line: "L1",
    camera: "Cam-01",
    status: "online",
    lastHeartbeat: minusHours(0.1),
  },
  {
    station: "LabelOCR",
    line: "L1",
    camera: "Cam-03",
    status: "degraded",
    lastHeartbeat: minusHours(0.2),
  },
  {
    station: "DrawingConform",
    line: "L1",
    camera: "Cam-05",
    status: "online",
    lastHeartbeat: minusHours(0.1),
  },
  {
    station: "ScrewCheck",
    line: "L2",
    camera: "Cam-02",
    status: "online",
    lastHeartbeat: minusHours(0.05),
  },
  {
    station: "LabelOCR",
    line: "L2",
    camera: "Cam-04",
    status: "online",
    lastHeartbeat: minusHours(0.05),
  },
  {
    station: "DrawingConform",
    line: "L2",
    camera: "Cam-06",
    status: "offline",
    lastHeartbeat: minusHours(1.5),
  },
];

const mockNgTicker: NgTickerEvent[] = [
  {
    id: "ng-evt-1",
    station: "LabelOCR",
    serial: "AC25W42-L1-00123",
    capturedAt: minusHours(3.5),
    ngCode: "LBL_MISREAD",
    severity: "major",
  },
  {
    id: "ng-evt-2",
    station: "ScrewCheck",
    serial: "AC25W42-L1-00124",
    capturedAt: minusHours(2.5),
    ngCode: "SCR_MISSING",
    severity: "major",
  },
  {
    id: "ng-evt-3",
    station: "DrawingConform",
    serial: "AC25W42-L1-00124",
    capturedAt: minusHours(2),
    ngCode: "DRW_MISALIGN",
    severity: "critical",
  },
];

const mockModelMetrics: ModelMetricWindow[] = [
  {
    station: "ScrewCheck",
    modelVersion: "screw-v1.3.2",
    windowStart: minusHours(24),
    windowEnd: minusHours(18),
    precision: 0.94,
    recall: 0.9,
    accuracy: 0.96,
    auc: 0.97,
    tp: 47,
    fp: 3,
    tn: 810,
    fn: 5,
  },
  {
    station: "ScrewCheck",
    modelVersion: "screw-v1.3.2",
    windowStart: minusHours(18),
    windowEnd: minusHours(12),
    precision: 0.95,
    recall: 0.92,
    accuracy: 0.97,
    auc: 0.98,
    tp: 56,
    fp: 3,
    tn: 820,
    fn: 4,
  },
  {
    station: "DrawingConform",
    modelVersion: "drawing-v1.5.4",
    windowStart: minusHours(12),
    windowEnd: minusHours(6),
    precision: 0.89,
    recall: 0.87,
    accuracy: 0.93,
    auc: 0.94,
    tp: 24,
    fp: 5,
    tn: 430,
    fn: 7,
  },
  {
    station: "DrawingConform",
    modelVersion: "drawing-v1.5.4",
    windowStart: minusHours(6),
    windowEnd: minusHours(0),
    precision: 0.93,
    recall: 0.91,
    accuracy: 0.95,
    auc: 0.96,
    tp: 27,
    fp: 3,
    tn: 460,
    fn: 5,
  },
];

function matchesFilters(
  inspection: InspectionRecord,
  filters: SummaryFilters,
): boolean {
  if (filters.station && inspection.station !== filters.station) {
    return false;
  }
  if (filters.model && inspection.model !== filters.model) {
    return false;
  }
  if (filters.line && inspection.line !== filters.line) {
    return false;
  }

  if (filters.from) {
    const from = parseISO(filters.from);
    if (isBefore(inspectionDate(inspection), from)) {
      return false;
    }
  }

  if (filters.to) {
    const to = parseISO(filters.to);
    if (isAfter(inspectionDate(inspection), to)) {
      return false;
    }
  }

  return true;
}

function inspectionDate(inspection: InspectionRecord) {
  return parseISO(inspection.capturedAt);
}

function calculateSummary(filters: SummaryFilters): SummaryPayload {
  const filtered = mockInspections.filter((insp) => matchesFilters(insp, filters));
  const ok = filtered.filter((insp) => insp.result === "OK").length;
  const ng = filtered.filter((insp) => insp.result === "NG").length;
  const total = filtered.length || 1;

  const passRate = ok / total;
  const ngRate = ng / total;
  const avgCycleTime =
    filtered.reduce((acc, insp) => acc + insp.cycleTimeSec, 0) / total;

  const ngByCode = filtered
    .filter((insp) => insp.result === "NG" && insp.ngCode)
    .reduce<Record<string, number>>((acc, insp) => {
      const code = insp.ngCode as string;
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {});

  const topNg = Object.entries(ngByCode)
    .map(([code, count]) => ({
      code: code as SummaryPayload["topNg"][number]["code"],
      count,
      ratio: count / (ng || 1),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    passRate,
    ngRate,
    topNg,
    avgCycleTime,
    inspectedToday: filtered.length,
    ok,
    ng,
  };
}

function calculatePareto(filters: SummaryFilters): ParetoPoint[] {
  const filtered = mockInspections.filter((insp) => matchesFilters(insp, filters));
  const ngItems = filtered.filter(
    (insp) => insp.result === "NG" && insp.ngCode && insp.ngCategory,
  );
  const totalNG = ngItems.length || 1;

  const grouped = ngItems.reduce<Record<string, ParetoPoint>>((acc, insp) => {
    const key = insp.ngCode as string;
    if (!acc[key]) {
      acc[key] = {
        ngCode: insp.ngCode!,
        ngCategory: insp.ngCategory!,
        count: 0,
        ratio: 0,
      };
    }
    acc[key].count += 1;
    return acc;
  }, {});

  return Object.values(grouped)
    .map((item) => ({
      ...item,
      ratio: item.count / totalNG,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function calculateTrend(filters: SummaryFilters): TrendPoint[] {
  const filtered = mockInspections.filter((insp) => matchesFilters(insp, filters));

  const groups = new Map<string, TrendPoint>();

  filtered.forEach((insp) => {
    const date = parseISO(insp.capturedAt);
    const bucket = new Date(date);
    bucket.setMinutes(0, 0, 0);
    const bucketKey = formatISO(bucket);

    const entry = groups.get(bucketKey) ?? {
      bucketStart: bucketKey,
      passRate: 0,
      total: 0,
      modelVersion: insp.modelVersion,
    };

    entry.total += 1;
    if (insp.result === "OK") {
      entry.passRate += 1;
    }
    entry.modelVersion = insp.modelVersion;
    groups.set(bucketKey, entry);
  });

  return Array.from(groups.values())
    .map((entry) => {
      const deployment = mockDeployments.find(
        (dep) =>
          dep.modelVersion === entry.modelVersion &&
          parseISO(dep.deployedAt) <= parseISO(entry.bucketStart),
      );
      return {
        ...entry,
        passRate: entry.total ? entry.passRate / entry.total : 0,
        marker: deployment?.type,
      };
    })
    .sort((a, b) =>
      parseISO(a.bucketStart).getTime() - parseISO(b.bucketStart).getTime(),
    );
}

function listInspections(
  filters: InspectionFilters,
): PaginatedResponse<InspectionListItem> {
  const size = 25;
  const cursorIndex = filters.cursor
    ? mockInspections.findIndex((insp) => insp.id === filters.cursor)
    : -1;

  const filtered = mockInspections.filter((insp) => {
    if (!matchesFilters(insp, filters)) return false;
    if (filters.result && insp.result !== filters.result) return false;
    if (filters.ngCode && insp.ngCode !== filters.ngCode) return false;
    if (filters.serial && insp.serial !== filters.serial) return false;
    if (filters.workOrder && insp.workOrder !== filters.workOrder) return false;
    return true;
  });

  filtered.sort(
    (a, b) =>
      parseISO(b.capturedAt).getTime() - parseISO(a.capturedAt).getTime(),
  );

  const start = cursorIndex >= 0 ? cursorIndex + 1 : 0;
  const page = filtered.slice(start, start + size);
  const nextCursor = page.length === size ? page[size - 1].id : undefined;

  return {
    data: page.map((insp) => ({
      id: insp.id,
      serial: insp.serial,
      workOrder: insp.workOrder,
      result: insp.result,
      station: insp.station,
      ngCode: insp.ngCode,
      severity: insp.severity,
      modelVersion: insp.modelVersion,
      confidence: insp.confidence,
      capturedAt: insp.capturedAt,
      operator: insp.operator,
    })),
    nextCursor,
  };
}

function getInspection(id: string): InspectionRecord | undefined {
  return mockInspections.find((insp) => insp.id === id);
}

function getTimeline(serial: string): UnitTimelinePayload | undefined {
  const unit = mockUnits.find((item) => item.serial === serial);
  if (!unit) return undefined;

  const inspections = mockInspections
    .filter((insp) => insp.serial === serial)
    .sort(
      (a, b) =>
        parseISO(a.capturedAt).getTime() - parseISO(b.capturedAt).getTime(),
    );

  const last = inspections.at(-1);

  return {
    serial,
    currentStatus: last?.result ?? "OK",
    route: inspections.map((insp) => ({
      station: insp.station,
      result: insp.result,
      ngCode: insp.ngCode,
      capturedAt: insp.capturedAt,
      inspectionId: insp.id,
      operator: insp.operator,
    })),
  };
}

function getModelMetrics(filters: SummaryFilters) {
  const metrics = mockModelMetrics.filter((metric) => {
    if (filters.station && metric.station !== filters.station) return false;
    if (filters.model && metric.modelVersion !== filters.model) return false;
    if (filters.from && isBefore(parseISO(metric.windowEnd), parseISO(filters.from))) {
      return false;
    }
    if (filters.to && isAfter(parseISO(metric.windowStart), parseISO(filters.to))) {
      return false;
    }
    return true;
  });

  const deployments = mockDeployments.filter((dep) => {
    if (filters.station && dep.station !== filters.station) return false;
    if (filters.model && dep.modelVersion !== filters.model) return false;
    return true;
  });

  return { metrics, deployments };
}

function getLiveMonitorData() {
  return {
    statuses: mockStationStatuses,
    thumbnails: mockInspections
      .slice(-3)
      .map((insp) => ({ station: insp.station, imageUri: insp.imageUri, capturedAt: insp.capturedAt })),
    ticker: mockNgTicker,
  };
}

function ingestInspection(payload: InspectionRecord) {
  mockInspections.push(payload);
  mockNgTicker.push({
    id: `ng-${Date.now()}`,
    station: payload.station,
    serial: payload.serial,
    capturedAt: payload.capturedAt,
    ngCode: payload.ngCode ?? "SCR_MISSING",
    severity: payload.severity,
  });
}

export const mockDb = {
  units: mockUnits,
  inspections: mockInspections,
  modelVersions: mockModelVersions,
  modelMetrics: mockModelMetrics,
  deployments: mockDeployments,
  stationStatuses: mockStationStatuses,
  ngTicker: mockNgTicker,
  getSummary: calculateSummary,
  getPareto: calculatePareto,
  getTrend: calculateTrend,
  listInspections,
  getInspection,
  getTimeline,
  getModelMetrics,
  getLiveMonitorData,
  ingestInspection,
};
