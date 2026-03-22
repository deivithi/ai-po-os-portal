const DATA_PATHS = {
  overview: "/data/overview.json",
  portal: "/data/portal.json",
  artifacts: "/data/artifacts.json",
  freshnessStatus: "/data/freshness_status.json",
  vendorSources: "/data/vendor_sources.json",
  vendorUpdates: "/data/vendor_updates.json",
  domainMap: "/data/domain_map.json",
  promptsGuide: "/data/prompts_page.json",
  promptLibrary: "/data/prompt_library.json",
  promptBuilder: "/data/prompt_builder.json",
  promptProviderOverlays: "/data/prompt_provider_overlays.json",
  promptQualityLab: "/data/prompt_quality_lab.json",
  promptProductization: "/data/prompt_productization.json",
  matrixGuide: "/data/matrix_page.json",
  matrixArtifact: "/artifacts/files/model_matrix.json",
  guideGuide: "/data/guide_page.json",
  todayGuide: "/data/today_page.json",
  labsGuide: "/data/labs_page.json",
  analyticsGuide: "/data/analytics_page.json",
  analyticsRules: "/data/analytics_rules.json",
  launchGuide: "/data/launch_page.json",
  journeyGuide: "/data/journey_page.json",
  trilhaGuide: "/data/trilha_page.json",
  progressGuide: "/data/progress_page.json",
  studyUnits: "/data/study_units.json",
  learningPathTemplates: "/data/learning_path_templates.json",
  adaptivePathRules: "/data/adaptive_path_rules.json",
  workflowsGuide: "/data/workflows_page.json",
  ragGuide: "/data/rag_page.json",
  seniorGuide: "/data/senior_page.json",
  roadmapGuide: "/data/roadmap_page.json",
  releaseManifest: "/data/release_manifest.json",
};

const PAGE_DATA_KEYS = {
  home: ["overview", "artifacts", "freshnessStatus", "vendorSources", "vendorUpdates", "domainMap", "studyUnits"],
  hoje: [
    "todayGuide",
    "analyticsGuide",
    "analyticsRules",
    "studyUnits",
    "learningPathTemplates",
    "adaptivePathRules",
    "labsGuide",
    "progressGuide",
    "vendorSources",
    "freshnessStatus",
  ],
  guia: ["guideGuide", "vendorSources", "freshnessStatus"],
  labs: ["labsGuide", "vendorSources", "freshnessStatus"],
  analytics: [
    "analyticsGuide",
    "analyticsRules",
    "labsGuide",
    "progressGuide",
    "studyUnits",
    "learningPathTemplates",
    "adaptivePathRules",
    "vendorSources",
    "freshnessStatus",
  ],
  lancamentos: [
    "launchGuide",
    "analyticsGuide",
    "analyticsRules",
    "labsGuide",
    "progressGuide",
    "studyUnits",
    "learningPathTemplates",
    "adaptivePathRules",
    "guideGuide",
    "freshnessStatus",
  ],
  jornada: ["journeyGuide", "freshnessStatus"],
  trilha: ["trilhaGuide", "studyUnits", "learningPathTemplates", "adaptivePathRules", "vendorSources", "freshnessStatus"],
  progresso: ["progressGuide", "studyUnits", "learningPathTemplates", "adaptivePathRules", "vendorSources", "freshnessStatus"],
  prompts: ["promptsGuide", "promptLibrary", "promptBuilder", "promptProviderOverlays", "promptQualityLab", "promptProductization", "freshnessStatus"],
  matriz: ["overview", "artifacts", "matrixGuide", "matrixArtifact", "freshnessStatus"],
  workflows: ["overview", "workflowsGuide", "freshnessStatus"],
  rag: ["ragGuide", "freshnessStatus"],
  senior: ["seniorGuide", "freshnessStatus"],
  roadmap: ["roadmapGuide", "releaseManifest", "freshnessStatus"],
  artefatos: ["artifacts", "freshnessStatus"],
};

const PREFETCH_ROUTE_MAP = {
  home: ["/hoje/", "/trilha/", "/analytics/"],
  hoje: ["/trilha/", "/progresso/", "/labs/"],
  guia: ["/trilha/", "/analytics/", "/labs/"],
  labs: ["/analytics/", "/progresso/", "/senior/"],
  analytics: ["/lancamentos/", "/trilha/", "/progresso/"],
  lancamentos: ["/analytics/", "/roadmap/", "/prompts/"],
  trilha: ["/analytics/", "/progresso/", "/prompts/"],
  progresso: ["/analytics/", "/trilha/", "/roadmap/"],
  jornada: ["/prompts/", "/matriz/", "/rag/"],
  prompts: ["/matriz/", "/rag/", "/artefatos/"],
  matriz: ["/prompts/", "/rag/", "/workflows/"],
  rag: ["/workflows/", "/senior/", "/roadmap/"],
  workflows: ["/senior/", "/roadmap/", "/artefatos/"],
  senior: ["/roadmap/", "/artefatos/", "/trilha/"],
  roadmap: ["/lancamentos/", "/analytics/", "/guia/"],
  artefatos: ["/trilha/", "/prompts/", "/matriz/"],
};

const SESSION_CACHE_PREFIX = "ai-po-os::";
const SESSION_CACHE_TTL_MS = 1000 * 60 * 15;
const FAVORITES_STORAGE_KEY = "ai-po-os::prompt-favorites::v1";
const ADAPTIVE_PATH_STORAGE_KEY = "ai-po-os::adaptive-path::v1";
const STUDY_PROGRESS_STORAGE_KEY = "ai-po-os::study-progress::v1";
const STUDY_FLAGS_STORAGE_KEY = "ai-po-os::study-flags::v1";
const TODAY_SESSION_STORAGE_KEY = "ai-po-os::today-session::v1";
const LABS_FILTER_STORAGE_KEY = "ai-po-os::labs-filters::v1";
const STUDY_ANALYTICS_STORAGE_KEY = "ai-po-os::study-analytics::v1";
const RESUME_STATE_STORAGE_KEY = "ai-po-os::resume-state::v1";
const memoryCache = new Map();
const prefetchedRoutes = new Set();
const SITE_BASE_PATH = detectSiteBasePath();
let studyAnalyticsRuntime = null;
let resumeStateRuntime = null;

const STUDY_ROUTE_IDS = new Set([
  "guia",
  "hoje",
  "jornada",
  "trilha",
  "progresso",
  "labs",
  "analytics",
  "prompts",
  "matriz",
  "workflows",
  "rag",
  "senior",
  "roadmap",
  "artefatos",
  "lancamentos",
]);

const pageId = document.body.dataset.page || "home";
const MATRIX_METRIC_ORDER = [
  "precision",
  "citation",
  "cost_efficiency",
  "latency",
  "control",
  "risk_management",
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function detectSiteBasePath() {
  const override = new URLSearchParams(window.location.search).get("base-path");
  if (override) {
    const normalizedOverride = override.startsWith("/") ? override : `/${override}`;
    return normalizedOverride.endsWith("/") ? normalizedOverride : `${normalizedOverride}/`;
  }

  const { hostname, pathname } = window.location;
  if (!hostname.endsWith(".github.io")) {
    return "/";
  }

  const segments = pathname.split("/").filter(Boolean);
  return segments.length > 0 ? `/${segments[0]}/` : "/";
}

function stripBasePath(pathname) {
  if (SITE_BASE_PATH === "/") {
    return pathname;
  }

  const prefix = SITE_BASE_PATH.endsWith("/") ? SITE_BASE_PATH.slice(0, -1) : SITE_BASE_PATH;
  if (pathname === prefix || pathname === SITE_BASE_PATH) {
    return "/";
  }

  if (pathname.startsWith(SITE_BASE_PATH)) {
    return `/${pathname.slice(SITE_BASE_PATH.length)}`;
  }

  return pathname;
}

function resolveUrl(value) {
  if (!value) {
    return value;
  }

  if (
    value.startsWith("#") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    /^(?:[a-z]+:)?\/\//i.test(value)
  ) {
    return value;
  }

  if (!value.startsWith("/")) {
    return value;
  }

  if (SITE_BASE_PATH === "/") {
    return value;
  }

  return `${SITE_BASE_PATH.slice(0, -1)}${value}`;
}

function titleCase(value) {
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatNumber(value, digits = 3) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(digits) : "n/a";
}

function formatPercent(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? `${Math.round(parsed * 100)}%` : "n/a";
}

function downloadJsonFile(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 0);
}

function formatShortDate(value) {
  if (!value) {
    return "n/a";
  }

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(`${value}T00:00:00`));
  } catch (_error) {
    return value;
  }
}

function formatDateTimeCompact(value) {
  if (!value) {
    return "n/a";
  }

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch (_error) {
    return value;
  }
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function diffCalendarDays(fromDate, toDate = todayIsoDate()) {
  try {
    const from = new Date(`${fromDate}T00:00:00`);
    const to = new Date(`${toDate}T00:00:00`);
    const diffMs = to.getTime() - from.getTime();
    return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  } catch (_error) {
    return 0;
  }
}

function average(values) {
  const numbers = values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  if (numbers.length === 0) {
    return 0;
  }

  return numbers.reduce((total, value) => total + value, 0) / numbers.length;
}

function uniqueBy(items, keySelector) {
  const seen = new Set();

  return items.filter((item) => {
    const key = keySelector(item);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

async function fetchJson(path) {
  const cached = readCachedJson(path);
  if (cached) {
    return cached;
  }

  return fetchJsonFresh(path);
}

async function fetchJsonFresh(path, options = {}) {
  const { fallbackToCache = true } = options;

  try {
    const response = await fetch(resolveUrl(path));
    if (!response.ok) {
      throw new Error(`Falha ao carregar ${path}: ${response.status}`);
    }

    const data = await response.json();
    writeCachedJson(path, data);
    return data;
  } catch (error) {
    if (fallbackToCache) {
      const cached = readCachedJson(path);
      if (cached) {
        return cached;
      }
    }

    throw error;
  }
}

function readCachedJson(path) {
  if (memoryCache.has(path)) {
    return memoryCache.get(path);
  }

  try {
    const raw = window.sessionStorage.getItem(`${SESSION_CACHE_PREFIX}${path}`);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    if (Date.now() - Number(parsed.cachedAt || 0) > SESSION_CACHE_TTL_MS) {
      window.sessionStorage.removeItem(`${SESSION_CACHE_PREFIX}${path}`);
      return null;
    }

    memoryCache.set(path, parsed.data);
    return parsed.data;
  } catch (_error) {
    return null;
  }
}

function writeCachedJson(path, data) {
  memoryCache.set(path, data);

  try {
    window.sessionStorage.setItem(
      `${SESSION_CACHE_PREFIX}${path}`,
      JSON.stringify({
        cachedAt: Date.now(),
        data,
      }),
    );
  } catch (_error) {
    // Ignore quota/storage issues and keep the in-memory cache for this page load.
  }
}

function loadPromptFavorites() {
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) {
      return {
        templates: [],
        examples: [],
      };
    }

    const parsed = JSON.parse(raw);
    return {
      templates: Array.isArray(parsed?.templates) ? parsed.templates : [],
      examples: Array.isArray(parsed?.examples) ? parsed.examples : [],
    };
  } catch (_error) {
    return {
      templates: [],
      examples: [],
    };
  }
}

function persistPromptFavorites(favorites) {
  window.__promptFavorites = favorites;

  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (_error) {
    // Keep runtime-only state if storage is unavailable.
  }

  document.dispatchEvent(
    new CustomEvent("prompt-favorites:updated", {
      detail: favorites,
    }),
  );
}

function ensurePromptFavorites() {
  const favorites = window.__promptFavorites || loadPromptFavorites();
  window.__promptFavorites = favorites;
  return favorites;
}

function isPromptFavorite(kind, id, favorites = ensurePromptFavorites()) {
  return Array.isArray(favorites?.[kind]) && favorites[kind].includes(id);
}

function togglePromptFavorite(kind, id) {
  const favorites = ensurePromptFavorites();
  const current = Array.isArray(favorites[kind]) ? favorites[kind] : [];
  const nextValues = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  const nextFavorites = {
    ...favorites,
    [kind]: nextValues,
  };
  persistPromptFavorites(nextFavorites);
  return nextFavorites;
}

function uniqueValues(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function loadAdaptivePathPreferences(defaults = {}) {
  try {
    const raw = window.localStorage.getItem(ADAPTIVE_PATH_STORAGE_KEY);
    if (!raw) {
      return { ...defaults };
    }

    const parsed = JSON.parse(raw);
    return {
      ...defaults,
      ...(parsed && typeof parsed === "object" ? parsed : {}),
    };
  } catch (_error) {
    return { ...defaults };
  }
}

function persistAdaptivePathPreferences(preferences) {
  try {
    window.localStorage.setItem(ADAPTIVE_PATH_STORAGE_KEY, JSON.stringify(preferences));
  } catch (_error) {
    // Keep runtime-only state if storage is unavailable.
  }
}

function loadLabsPreferences(defaults = {}) {
  const query = new URL(window.location.href).searchParams;

  try {
    const raw = window.localStorage.getItem(LABS_FILTER_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      ...defaults,
      ...(parsed && typeof parsed === "object" ? parsed : {}),
      domain: query.get("domain") || parsed?.domain || defaults.domain || "all",
      difficulty: query.get("difficulty") || parsed?.difficulty || defaults.difficulty || "all",
      timebox: query.get("timebox") || parsed?.timebox || defaults.timebox || "all",
      objective: query.get("objective") || parsed?.objective || defaults.objective || "all",
    };
  } catch (_error) {
    return {
      ...defaults,
      domain: query.get("domain") || defaults.domain || "all",
      difficulty: query.get("difficulty") || defaults.difficulty || "all",
      timebox: query.get("timebox") || defaults.timebox || "all",
      objective: query.get("objective") || defaults.objective || "all",
    };
  }
}

function persistLabsPreferences(preferences) {
  try {
    window.localStorage.setItem(LABS_FILTER_STORAGE_KEY, JSON.stringify(preferences));
  } catch (_error) {
    // Keep runtime-only state if storage is unavailable.
  }
}

function loadStudyProgressState() {
  const defaultState = {
    version: 1,
    started_on: todayIsoDate(),
    updated_on: todayIsoDate(),
    units: {},
  };

  try {
    const raw = window.localStorage.getItem(STUDY_PROGRESS_STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...(parsed && typeof parsed === "object" ? parsed : {}),
      units: parsed?.units && typeof parsed.units === "object" ? parsed.units : {},
    };
  } catch (_error) {
    return defaultState;
  }
}

function persistStudyProgressState(state) {
  try {
    window.localStorage.setItem(STUDY_PROGRESS_STORAGE_KEY, JSON.stringify(state));
  } catch (_error) {
    // Keep runtime-only state if storage is unavailable.
  }
}

function createDefaultStudyFlagsState() {
  return {
    version: 1,
    updated_at: null,
    items: {},
  };
}

function loadStudyFlagsState() {
  const defaultState = createDefaultStudyFlagsState();

  try {
    const raw = window.localStorage.getItem(STUDY_FLAGS_STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...(parsed && typeof parsed === "object" ? parsed : {}),
      items: parsed?.items && typeof parsed.items === "object" ? parsed.items : {},
    };
  } catch (_error) {
    return defaultState;
  }
}

function persistStudyFlagsState(state) {
  try {
    window.localStorage.setItem(STUDY_FLAGS_STORAGE_KEY, JSON.stringify(state));
  } catch (_error) {
    // Keep runtime-only state if storage is unavailable.
  }

  document.dispatchEvent(
    new CustomEvent("study-flags:updated", {
      detail: state,
    }),
  );
}

function createDefaultTodaySessionState() {
  return {
    version: 1,
    updated_at: null,
    day_records: {},
  };
}

function loadTodaySessionState() {
  const defaultState = createDefaultTodaySessionState();

  try {
    const raw = window.localStorage.getItem(TODAY_SESSION_STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...(parsed && typeof parsed === "object" ? parsed : {}),
      day_records: parsed?.day_records && typeof parsed.day_records === "object" ? parsed.day_records : {},
    };
  } catch (_error) {
    return defaultState;
  }
}

function persistTodaySessionState(state) {
  try {
    window.localStorage.setItem(TODAY_SESSION_STORAGE_KEY, JSON.stringify(state));
  } catch (_error) {
    // Keep runtime-only state if storage is unavailable.
  }

  document.dispatchEvent(
    new CustomEvent("today-session:updated", {
      detail: state,
    }),
  );
}

function getTodaySessionRecord(state = loadTodaySessionState(), dayKey = todayIsoDate()) {
  return state.day_records?.[dayKey] && typeof state.day_records[dayKey] === "object"
    ? state.day_records[dayKey]
    : {
        mode_id: null,
        completed_step_ids: [],
      };
}

function updateTodaySessionRecord(mutator, dayKey = todayIsoDate()) {
  const state = loadTodaySessionState();
  const currentRecord = getTodaySessionRecord(state, dayKey);
  const nextRecord =
    typeof mutator === "function"
      ? mutator({
          ...currentRecord,
          completed_step_ids: Array.isArray(currentRecord.completed_step_ids) ? currentRecord.completed_step_ids : [],
        })
      : currentRecord;

  const nextState = {
    ...state,
    updated_at: new Date().toISOString(),
    day_records: {
      ...(state.day_records || {}),
      [dayKey]: {
        ...currentRecord,
        ...(nextRecord && typeof nextRecord === "object" ? nextRecord : {}),
        completed_step_ids: Array.isArray(nextRecord?.completed_step_ids) ? nextRecord.completed_step_ids : [],
      },
    },
  };

  persistTodaySessionState(nextState);
  return nextState;
}

function setTodaySessionMode(modeId, dayKey = todayIsoDate()) {
  return updateTodaySessionRecord(
    (record) => ({
      ...record,
      mode_id: modeId,
    }),
    dayKey,
  );
}

function toggleTodaySessionChecklistStep(stepId, dayKey = todayIsoDate()) {
  return updateTodaySessionRecord(
    (record) => {
      const current = Array.isArray(record.completed_step_ids) ? record.completed_step_ids : [];
      return {
        ...record,
        completed_step_ids: current.includes(stepId)
          ? current.filter((item) => item !== stepId)
          : [...current, stepId],
      };
    },
    dayKey,
  );
}

function resetTodaySession(dayKey = todayIsoDate()) {
  return updateTodaySessionRecord(
    () => ({
      mode_id: null,
      completed_step_ids: [],
    }),
    dayKey,
  );
}

function buildStudyFlagKey(kind, id) {
  return `${kind}:${id}`;
}

function isStudyFlagged(kind, id, state = loadStudyFlagsState()) {
  if (!kind || !id) {
    return false;
  }

  return Boolean(state.items?.[buildStudyFlagKey(kind, id)]);
}

function toggleStudyFlag(kind, payload = {}) {
  const state = loadStudyFlagsState();
  const key = buildStudyFlagKey(kind, payload.id);
  const nowIso = new Date().toISOString();
  const items = {
    ...(state.items || {}),
  };

  if (items[key]) {
    delete items[key];
    const nextState = {
      ...state,
      updated_at: nowIso,
      items,
    };
    persistStudyFlagsState(nextState);
    return {
      state: nextState,
      active: false,
    };
  }

  items[key] = {
    kind,
    id: payload.id || "",
    title: payload.title || "",
    summary: payload.summary || "",
    href: payload.href || "/",
    route_label: payload.route_label || titleCase(kind),
    domain: payload.domain || "",
    updated_at: nowIso,
  };

  const nextState = {
    ...state,
    updated_at: nowIso,
    items,
  };
  persistStudyFlagsState(nextState);
  return {
    state: nextState,
    active: true,
  };
}

function createDefaultResumeState() {
  return {
    version: 1,
    updated_at: null,
    last_route: null,
    last_study_route: null,
    study: null,
    trilha: null,
    progresso: null,
  };
}

function loadResumeState() {
  const defaultState = createDefaultResumeState();

  try {
    const raw = window.localStorage.getItem(RESUME_STATE_STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...(parsed && typeof parsed === "object" ? parsed : {}),
      last_route: parsed?.last_route && typeof parsed.last_route === "object" ? parsed.last_route : null,
      last_study_route:
        parsed?.last_study_route && typeof parsed.last_study_route === "object" ? parsed.last_study_route : null,
      study: parsed?.study && typeof parsed.study === "object" ? parsed.study : null,
      trilha: parsed?.trilha && typeof parsed.trilha === "object" ? parsed.trilha : null,
      progresso: parsed?.progresso && typeof parsed.progresso === "object" ? parsed.progresso : null,
    };
  } catch (_error) {
    return defaultState;
  }
}

function persistResumeState(state) {
  resumeStateRuntime = state;

  try {
    window.localStorage.setItem(RESUME_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch (_error) {
    // Keep runtime-only state if storage is unavailable.
  }

  document.dispatchEvent(
    new CustomEvent("study-resume:updated", {
      detail: state,
    }),
  );
}

function ensureResumeState() {
  const state = resumeStateRuntime || loadResumeState();
  resumeStateRuntime = state;
  return state;
}

function mergeResumeNode(currentNode, patchNode, nowIso) {
  if (!patchNode || typeof patchNode !== "object") {
    return currentNode || null;
  }

  return {
    ...(currentNode && typeof currentNode === "object" ? currentNode : {}),
    ...patchNode,
    updated_at: patchNode.updated_at || nowIso,
  };
}

function persistResumePatch(patch) {
  const current = ensureResumeState();
  const nowIso = new Date().toISOString();

  const next = {
    ...createDefaultResumeState(),
    ...current,
    updated_at: nowIso,
    last_route: mergeResumeNode(current.last_route, patch?.last_route, nowIso),
    last_study_route: mergeResumeNode(current.last_study_route, patch?.last_study_route, nowIso),
    study: mergeResumeNode(current.study, patch?.study, nowIso),
    trilha: mergeResumeNode(current.trilha, patch?.trilha, nowIso),
    progresso: mergeResumeNode(current.progresso, patch?.progresso, nowIso),
  };

  persistResumeState(next);
  return next;
}

function getPortalNavigationEntry(portal, targetPageId = pageId) {
  return (portal?.navigation || []).find((item) => item.id === targetPageId) || null;
}

function buildRouteResumeMeta(portal, targetPageId = pageId, extra = {}) {
  const pageMeta = portal?.pages?.[targetPageId] || {};
  const navigationEntry = getPortalNavigationEntry(portal, targetPageId);

  return {
    page_id: targetPageId,
    href: extra.href || navigationEntry?.href || "/",
    label: extra.label || pageMeta.nav_label || pageMeta.title || navigationEntry?.label || titleCase(targetPageId),
    summary: extra.summary || pageMeta.summary || navigationEntry?.description || "",
    unit_id: extra.unit_id || null,
    unit_title: extra.unit_title || null,
    cue: extra.cue || "",
    updated_at: extra.updated_at || null,
  };
}

function rememberRouteVisit(portal, targetPageId = pageId) {
  const routeMeta = buildRouteResumeMeta(portal, targetPageId);
  const patch = {
    last_route: routeMeta,
  };

  if (STUDY_ROUTE_IDS.has(targetPageId)) {
    patch.last_study_route = routeMeta;
  }

  persistResumePatch(patch);
}

function getPrimaryResumeTarget(portal) {
  const resumeState = ensureResumeState();
  const candidate = resumeState.study || resumeState.last_study_route || resumeState.last_route;

  if (!candidate?.href) {
    return null;
  }

  const merged = buildRouteResumeMeta(portal, candidate.page_id || "home", candidate);
  return {
    ...merged,
    action_label: candidate.unit_title ? "Continuar estudo" : "Retomar rota",
    title: candidate.unit_title || merged.label,
    description:
      candidate.cue ||
      merged.summary ||
      "A plataforma manteve o ultimo ponto de estudo para voce retomar sem recomecar.",
  };
}

function normalizeIsoDateKey(value) {
  if (!value) {
    return null;
  }

  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch (_error) {
    return null;
  }
}

function buildStudyActivityDateKeys(analyticsState) {
  const keys = new Set();

  const pushKey = (value) => {
    const key = normalizeIsoDateKey(value);
    if (key) {
      keys.add(key);
    }
  };

  pushKey(analyticsState?.last_activity_at);
  pushKey(analyticsState?.updated_on);

  (analyticsState?.recent_events || []).forEach((event) => {
    pushKey(event?.occurred_at);
  });

  return Array.from(keys).sort();
}

function computeStudyStreakDays(analyticsState) {
  const activityDateKeys = buildStudyActivityDateKeys(analyticsState);
  if (activityDateKeys.length === 0) {
    return 0;
  }

  const activitySet = new Set(activityDateKeys);
  let cursor = todayIsoDate();
  let streak = 0;

  while (activitySet.has(cursor)) {
    streak += 1;
    const previousDate = new Date(`${cursor}T00:00:00`);
    previousDate.setDate(previousDate.getDate() - 1);
    cursor = previousDate.toISOString().slice(0, 10);
  }

  return streak;
}

function computeJourneyXp(progressState, analyticsState, flagsState) {
  const units = Object.values(progressState?.units || {});
  const statusCounts = units.reduce(
    (accumulator, record) => {
      accumulator[record.status_id] = Number(accumulator[record.status_id] || 0) + 1;
      return accumulator;
    },
    {
      mastered: 0,
      in_progress: 0,
      checkpoint: 0,
      blocked: 0,
    },
  );

  const routeCount = Object.values(analyticsState?.page_views || {}).reduce(
    (total, value) => total + Number(value || 0),
    0,
  );
  const interactionCount = Object.values(analyticsState?.route_interactions || {}).reduce(
    (total, value) => total + Number(value || 0),
    0,
  );
  const openFlags = Object.keys(flagsState?.items || {}).length;

  return (
    statusCounts.mastered * 180 +
    statusCounts.in_progress * 70 +
    statusCounts.checkpoint * 45 +
    Math.min(routeCount * 12, 180) +
    Math.min(interactionCount * 6, 180) -
    Math.min(openFlags * 10, 80)
  );
}

function computeJourneyLevel(xpTotal) {
  if (xpTotal >= 1100) {
    return {
      label: "Senior Applied",
      summary: "Voce ja opera com sinais fortes de criterio, execucao e consistencia.",
    };
  }

  if (xpTotal >= 760) {
    return {
      label: "System Operator",
      summary: "A base ja saiu do estudo passivo e entrou em pratica com repeticao real.",
    };
  }

  if (xpTotal >= 420) {
    return {
      label: "Builder",
      summary: "O estudo ja se traduz em blocos concluidos, labs e checkpoints mais disciplinados.",
    };
  }

  return {
    label: "Explorer",
    summary: "A jornada ainda esta consolidando ritmo, mapa mental e primeiras evidencias.",
  };
}

function buildJourneyBadges(snapshot, analyticsState) {
  const distinctRoutes = Object.keys(analyticsState?.page_views || {}).filter(
    (key) => Number(analyticsState.page_views[key] || 0) > 0,
  );
  const badges = [
    {
      id: "streak",
      title: "Ritmo ligado",
      summary: "Mantem o estudo vivo por varios dias seguidos.",
      unlocked: snapshot.streakDays >= 3,
      progress: Math.min(1, snapshot.streakDays / 3),
      kicker: `${snapshot.streakDays} dias de streak`,
    },
    {
      id: "proof",
      title: "Primeiras evidencias",
      summary: "Ja existe massa critica de unidades dominadas.",
      unlocked: snapshot.masteredCount >= 3,
      progress: Math.min(1, snapshot.masteredCount / 3),
      kicker: `${snapshot.masteredCount}/${Math.max(3, snapshot.masteredCount)} unidades dominadas`,
    },
    {
      id: "map",
      title: "Mapa do sistema",
      summary: "Voce ja abriu varias camadas-chave do portal.",
      unlocked: distinctRoutes.length >= 6,
      progress: Math.min(1, distinctRoutes.length / 6),
      kicker: `${distinctRoutes.length} rotas exploradas`,
    },
    {
      id: "senior",
      title: "Camada senior aberta",
      summary: "Ja existe contato real com evals, memoria, agents ou producao.",
      unlocked: Number(analyticsState?.page_views?.senior || 0) > 0,
      progress: Number(analyticsState?.page_views?.senior || 0) > 0 ? 1 : 0,
      kicker: Number(analyticsState?.page_views?.senior || 0) > 0 ? "Senior visitado" : "Senior ainda nao aberto",
    },
  ];

  return badges;
}

function buildFlagToggleButton(kind, payload = {}) {
  const flagged = isStudyFlagged(kind, payload.id);
  return `
    <button
      class="button ghost flag-toggle ${flagged ? "active" : ""}"
      type="button"
      data-flag-toggle="${escapeHtml(kind)}"
      data-flag-id="${escapeHtml(payload.id || "")}"
      data-flag-title="${escapeHtml(payload.title || "")}"
      data-flag-summary="${escapeHtml(payload.summary || "")}"
      data-flag-href="${escapeHtml(payload.href || "/")}"
      data-flag-route-label="${escapeHtml(payload.route_label || titleCase(kind))}"
      data-flag-domain="${escapeHtml(payload.domain || "")}"
    >
      ${escapeHtml(flagged ? "Remover flag" : "Marcar flag")}
    </button>
  `;
}

function buildLearningMissionSnapshot(portal, studyUnits = []) {
  const progressState = loadStudyProgressState();
  const analyticsState = loadStudyAnalyticsState();
  const flagsState = loadStudyFlagsState();
  const resumeTarget = getPrimaryResumeTarget(portal);
  const studyUnitList = Array.isArray(studyUnits)
    ? studyUnits
    : Array.isArray(studyUnits?.units)
      ? studyUnits.units
      : [];
  const totalUnits = Math.max(1, studyUnitList.length || Object.keys(progressState.units || {}).length || 1);
  const unitRecords = Object.values(progressState.units || {});
  const masteredCount = unitRecords.filter((item) => item.status_id === "mastered").length;
  const inProgressCount = unitRecords.filter((item) => item.status_id === "in_progress").length;
  const checkpointCount = unitRecords.filter((item) => item.status_id === "checkpoint").length;
  const blockedCount = unitRecords.filter((item) => item.status_id === "blocked").length;
  const flaggedItems = Object.values(flagsState.items || {})
    .sort((left, right) => String(right.updated_at || "").localeCompare(String(left.updated_at || "")))
    .slice(0, 4);
  const streakDays = computeStudyStreakDays(analyticsState);
  const elapsedDays = Math.max(1, diffCalendarDays(progressState.started_on) + 1);
  const dayIndex = Math.min(30, elapsedDays);
  const progressPercent = Math.max(0, Math.min(100, Math.round((masteredCount / totalUnits) * 100)));
  const xpTotal = Math.max(0, computeJourneyXp(progressState, analyticsState, flagsState));
  const level = computeJourneyLevel(xpTotal);
  const badges = buildJourneyBadges(
    {
      streakDays,
      masteredCount,
    },
    analyticsState,
  );

  return {
    totalUnits,
    masteredCount,
    inProgressCount,
    checkpointCount,
    blockedCount,
    flaggedItems,
    streakDays,
    elapsedDays,
    dayIndex,
    progressPercent,
    xpTotal,
    level,
    resumeTarget,
    badges,
    nextActionLabel: flaggedItems.length
      ? "Resolver a fila de revisao"
      : resumeTarget?.title || "Montar a trilha",
    nextActionSummary: flaggedItems.length
      ? `Existem ${flaggedItems.length} flags abertas pedindo revisao antes do proximo salto.`
      : resumeTarget?.description || "Comece montando a trilha para o portal passar a trabalhar a seu favor.",
    startedOn: progressState.started_on,
  };
}

function createDefaultStudyAnalyticsState() {
  const nowIso = new Date().toISOString();
  return {
    version: 1,
    started_on: todayIsoDate(),
    updated_on: nowIso,
    last_activity_at: nowIso,
    page_views: {},
    active_ms_by_page: {},
    route_interactions: {},
    cta_targets: {},
    cta_edges: {},
    latest_adaptive_preferences: {},
    latest_labs_preferences: {},
    labs: {
      filter_updates: 0,
      focus_counts: {},
      domain_counts: {},
      last_focus: null,
    },
    units: {
      focus_counts: {},
      domain_counts: {},
      last_focus: null,
    },
    progress: {
      status_counts: {},
      unit_updates: {},
      attributed_labs: {},
      attributed_domains: {},
    },
    recent_events: [],
  };
}

function loadStudyAnalyticsState() {
  const defaultState = createDefaultStudyAnalyticsState();

  try {
    const raw = window.localStorage.getItem(STUDY_ANALYTICS_STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...(parsed && typeof parsed === "object" ? parsed : {}),
      page_views: parsed?.page_views && typeof parsed.page_views === "object" ? parsed.page_views : {},
      active_ms_by_page:
        parsed?.active_ms_by_page && typeof parsed.active_ms_by_page === "object" ? parsed.active_ms_by_page : {},
      route_interactions:
        parsed?.route_interactions && typeof parsed.route_interactions === "object" ? parsed.route_interactions : {},
      cta_targets: parsed?.cta_targets && typeof parsed.cta_targets === "object" ? parsed.cta_targets : {},
      cta_edges: parsed?.cta_edges && typeof parsed.cta_edges === "object" ? parsed.cta_edges : {},
      latest_adaptive_preferences:
        parsed?.latest_adaptive_preferences && typeof parsed.latest_adaptive_preferences === "object"
          ? parsed.latest_adaptive_preferences
          : {},
      latest_labs_preferences:
        parsed?.latest_labs_preferences && typeof parsed.latest_labs_preferences === "object"
          ? parsed.latest_labs_preferences
          : {},
      labs:
        parsed?.labs && typeof parsed.labs === "object"
          ? {
              ...defaultState.labs,
              ...parsed.labs,
              focus_counts:
                parsed.labs?.focus_counts && typeof parsed.labs.focus_counts === "object"
                  ? parsed.labs.focus_counts
                  : {},
              domain_counts:
                parsed.labs?.domain_counts && typeof parsed.labs.domain_counts === "object"
                  ? parsed.labs.domain_counts
                  : {},
            }
          : defaultState.labs,
      units:
        parsed?.units && typeof parsed.units === "object"
          ? {
              ...defaultState.units,
              ...parsed.units,
              focus_counts:
                parsed.units?.focus_counts && typeof parsed.units.focus_counts === "object"
                  ? parsed.units.focus_counts
                  : {},
              domain_counts:
                parsed.units?.domain_counts && typeof parsed.units.domain_counts === "object"
                  ? parsed.units.domain_counts
                  : {},
            }
          : defaultState.units,
      progress:
        parsed?.progress && typeof parsed.progress === "object"
          ? {
              ...defaultState.progress,
              ...parsed.progress,
              status_counts:
                parsed.progress?.status_counts && typeof parsed.progress.status_counts === "object"
                  ? parsed.progress.status_counts
                  : {},
              unit_updates:
                parsed.progress?.unit_updates && typeof parsed.progress.unit_updates === "object"
                  ? parsed.progress.unit_updates
                  : {},
              attributed_labs:
                parsed.progress?.attributed_labs && typeof parsed.progress.attributed_labs === "object"
                  ? parsed.progress.attributed_labs
                  : {},
              attributed_domains:
                parsed.progress?.attributed_domains && typeof parsed.progress.attributed_domains === "object"
                  ? parsed.progress.attributed_domains
                  : {},
            }
          : defaultState.progress,
      recent_events: Array.isArray(parsed?.recent_events) ? parsed.recent_events : [],
    };
  } catch (_error) {
    return defaultState;
  }
}

function persistStudyAnalyticsState(state) {
  try {
    window.localStorage.setItem(STUDY_ANALYTICS_STORAGE_KEY, JSON.stringify(state));
  } catch (_error) {
    // Keep runtime-only state if storage is unavailable.
  }
}

function incrementCounter(bucket, key, amount = 1) {
  if (!bucket || !key) {
    return;
  }

  bucket[key] = Number(bucket[key] || 0) + amount;
}

function pushAnalyticsEvent(state, event, limit = 60) {
  const history = Array.isArray(state.recent_events) ? state.recent_events.slice(-(limit - 1)) : [];
  history.push(event);
  state.recent_events = history.slice(-limit);
}

function inferPageIdFromPath(path) {
  const normalizedPath = normalizeInternalPath(path);
  if (!normalizedPath) {
    return null;
  }

  if (normalizedPath === "/") {
    return "home";
  }

  const segment = normalizedPath.split("/").filter(Boolean)[0];
  return segment || "home";
}

function trackStudyAnalyticsEvent(type, payload = {}) {
  const state = loadStudyAnalyticsState();
  const occurredAt = payload.occurred_at || new Date().toISOString();
  state.updated_on = occurredAt;
  state.last_activity_at = occurredAt;

  const recentEventLimit = Number(payload.recent_event_limit || 60);

  switch (type) {
    case "page_view": {
      incrementCounter(state.page_views, payload.page_id);
      break;
    }
    case "active_time": {
      if (!payload.page_id || !payload.milliseconds) {
        break;
      }

      incrementCounter(state.active_ms_by_page, payload.page_id, Number(payload.milliseconds || 0));
      break;
    }
    case "route_interaction": {
      incrementCounter(state.route_interactions, payload.page_id);
      const targetPageId = inferPageIdFromPath(payload.target_path);
      if (targetPageId) {
        incrementCounter(state.cta_targets, targetPageId);
        incrementCounter(state.cta_edges, `${payload.page_id || "unknown"}->${targetPageId}`);
      }
      break;
    }
    case "adaptive_path_update": {
      state.latest_adaptive_preferences =
        payload.preferences && typeof payload.preferences === "object" ? payload.preferences : {};
      incrementCounter(state.route_interactions, payload.page_id || "trilha");
      break;
    }
    case "labs_filters": {
      state.latest_labs_preferences =
        payload.preferences && typeof payload.preferences === "object" ? payload.preferences : {};
      state.labs.filter_updates = Number(state.labs.filter_updates || 0) + 1;
      incrementCounter(state.route_interactions, payload.page_id || "labs");
      break;
    }
    case "lab_focus": {
      incrementCounter(state.route_interactions, payload.page_id || "labs");
      incrementCounter(state.labs.focus_counts, payload.lab_id);
      incrementCounter(state.labs.domain_counts, payload.domain);
      state.labs.last_focus = {
        lab_id: payload.lab_id || "",
        title: payload.title || "",
        domain: payload.domain || "",
        occurred_at: occurredAt,
      };
      break;
    }
    case "unit_focus": {
      incrementCounter(state.route_interactions, payload.page_id || pageId);
      incrementCounter(state.units.focus_counts, payload.unit_id);
      incrementCounter(state.units.domain_counts, payload.domain);
      state.units.last_focus = {
        unit_id: payload.unit_id || "",
        title: payload.title || "",
        domain: payload.domain || "",
        occurred_at: occurredAt,
      };
      break;
    }
    case "flag_toggle": {
      incrementCounter(state.route_interactions, payload.page_id || pageId);
      break;
    }
    case "progress_status": {
      incrementCounter(state.route_interactions, payload.page_id || "progresso");
      incrementCounter(state.progress.status_counts, payload.status_id);
      incrementCounter(state.progress.unit_updates, payload.unit_id);

      const lastLabFocus = state.labs.last_focus;
      if (lastLabFocus?.lab_id && lastLabFocus?.occurred_at) {
        const lastLabTime = new Date(lastLabFocus.occurred_at).getTime();
        const currentTime = new Date(occurredAt).getTime();
        const diffHours = Number.isFinite(lastLabTime)
          ? (currentTime - lastLabTime) / (1000 * 60 * 60)
          : Number.POSITIVE_INFINITY;
        const recentWindowHours = Number(payload.recent_lab_window_hours || 72);
        if (diffHours >= 0 && diffHours <= recentWindowHours) {
          incrementCounter(state.progress.attributed_labs, lastLabFocus.lab_id);
          incrementCounter(state.progress.attributed_domains, lastLabFocus.domain);
        }
      }
      break;
    }
    default:
      break;
  }

  pushAnalyticsEvent(
    state,
    {
      type,
      page_id: payload.page_id || pageId,
      label: payload.label || "",
      target_path: payload.target_path || "",
      lab_id: payload.lab_id || "",
      unit_id: payload.unit_id || "",
      domain: payload.domain || "",
      status_id: payload.status_id || "",
      occurred_at: occurredAt,
    },
    recentEventLimit,
  );

  persistStudyAnalyticsState(state);
  return state;
}

function flushStudyAnalyticsActivity(reason = "manual") {
  studyAnalyticsRuntime?.flush?.(reason);
}

function setupStudyAnalytics() {
  if (studyAnalyticsRuntime || typeof window === "undefined") {
    return;
  }

  trackStudyAnalyticsEvent("page_view", { page_id: pageId, target_path: window.location.pathname });

  const runtime = {
    visible_since: document.visibilityState === "visible" ? Date.now() : null,
    interval_id: null,
    flush(reason = "manual") {
      if (runtime.visible_since === null) {
        return;
      }

      const delta = Date.now() - runtime.visible_since;
      if (delta >= 1000) {
        trackStudyAnalyticsEvent("active_time", {
          page_id: pageId,
          milliseconds: delta,
          label: reason,
        });
      }

      runtime.visible_since = document.visibilityState === "visible" ? Date.now() : null;
    },
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      runtime.flush("visibility_hidden");
      return;
    }

    runtime.visible_since = Date.now();
  });

  window.addEventListener("pagehide", () => runtime.flush("pagehide"));
  window.addEventListener("beforeunload", () => runtime.flush("beforeunload"));

  runtime.interval_id = window.setInterval(() => {
    if (document.visibilityState === "visible") {
      runtime.flush("interval");
    }
  }, 30000);

  const content = document.getElementById("content");
  content?.addEventListener(
    "click",
    (event) => {
      const actionable = event.target.closest("a, button");
      if (!actionable) {
        return;
      }

      const label =
        actionable.getAttribute("aria-label") ||
        actionable.getAttribute("data-track-label") ||
        actionable.textContent?.trim() ||
        actionable.getAttribute("href") ||
        "";
      const href = actionable.getAttribute("href");
      trackStudyAnalyticsEvent("route_interaction", {
        page_id: pageId,
        label,
        target_path: href || "",
      });
    },
    { capture: true },
  );

  studyAnalyticsRuntime = runtime;
}

function setQueryParam(name, value) {
  const url = new URL(window.location.href);
  if (!value || value === "all") {
    url.searchParams.delete(name);
  } else {
    url.searchParams.set(name, value);
  }
  window.history.replaceState({}, "", url.toString());
}

function normalizeInternalPath(value) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(resolveUrl(value), window.location.origin);
    if (url.origin !== window.location.origin) {
      return null;
    }

    const normalizedPath = stripBasePath(url.pathname);
    if (normalizedPath === "/") {
      return "/";
    }

    return normalizedPath.endsWith("/") ? normalizedPath : `${normalizedPath}/`;
  } catch (_error) {
    return null;
  }
}

function findPageIdByPath(portal, path) {
  if (path === "/") {
    return "home";
  }

  return portal.navigation.find((item) => normalizeInternalPath(item.href) === path)?.id || null;
}

function getDataKeysForPage(targetPageId) {
  return PAGE_DATA_KEYS[targetPageId] || [];
}

function requestIdle(callback) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout: 1200 });
    return;
  }

  window.setTimeout(callback, 200);
}

function shouldPrefetchResources() {
  const connection = navigator.connection;
  if (!connection) {
    return true;
  }

  if (connection.saveData) {
    return false;
  }

  const effectiveType = String(connection.effectiveType || "").toLowerCase();
  return !["slow-2g", "2g"].includes(effectiveType);
}

function prefetchDocument(path) {
  if (prefetchedRoutes.has(`doc:${path}`)) {
    return;
  }

  prefetchedRoutes.add(`doc:${path}`);
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.as = "document";
  link.href = resolveUrl(path);
  document.head.appendChild(link);
}

function prefetchRoute(portal, href, options = {}) {
  const { intent = false } = options;

  if (!intent && !shouldPrefetchResources()) {
    return;
  }

  const path = normalizeInternalPath(href);
  if (!path) {
    return;
  }

  const targetPageId = findPageIdByPath(portal, path);
  if (!targetPageId) {
    return;
  }

  prefetchDocument(path);

  getDataKeysForPage(targetPageId).forEach((key) => {
    const dataPath = DATA_PATHS[key];
    if (!dataPath || memoryCache.has(dataPath)) {
      return;
    }

    fetchJson(dataPath).catch(() => {});
  });
}

function setupNavigationPrefetch(portal) {
  const internalLinks = Array.from(document.querySelectorAll("a[href]")).filter((link) =>
    Boolean(normalizeInternalPath(link.getAttribute("href"))),
  );

  internalLinks.forEach((link) => {
    const href = link.getAttribute("href");
    const prefetch = () => prefetchRoute(portal, href, { intent: true });

    link.addEventListener("pointerenter", prefetch, { once: true });
    link.addEventListener("focus", prefetch, { once: true });
    link.addEventListener("touchstart", prefetch, { once: true });
  });

  requestIdle(() => {
    (PREFETCH_ROUTE_MAP[pageId] || []).slice(0, 2).forEach((href) => prefetchRoute(portal, href));
  });
}

async function loadPageData() {
  const portal = await fetchJsonFresh(DATA_PATHS.portal);
  const data = { portal };

  const requiredKeys = getDataKeysForPage(pageId);

  await Promise.all(
    requiredKeys.map(async (key) => {
      data[key] = await fetchJson(DATA_PATHS[key]);
    }),
  );

  return data;
}

function renderShell(portal, freshnessStatus) {
  const page = portal.pages[pageId] || portal.pages.home;
  const sidebar = document.getElementById("sidebar");
  const topbar = document.getElementById("topbar");
  const footer = document.getElementById("portal-footer");
  const pageFreshness = findFreshnessPage(freshnessStatus);
  const stripMeta = freshnessStatus?.strip || null;
  const currentPageIsStudyRoute = STUDY_ROUTE_IDS.has(pageId);

  rememberRouteVisit(portal, pageId);
  const resumeTarget = getPrimaryResumeTarget(portal);
  const canShowResumeAction = resumeTarget && (!currentPageIsStudyRoute || resumeTarget.page_id !== pageId);

  if (sidebar) {
    sidebar.innerHTML = `
      <div class="brand">
        <span class="brand-kicker">AI Applied Study Portal</span>
        <h1 class="brand-title">${escapeHtml(portal.site.title)}</h1>
        <p class="brand-copy">${escapeHtml(portal.site.tagline)}</p>
      </div>
      <nav class="sidebar-nav" aria-label="Navegacao principal">
        ${portal.navigation
          .map(
            (item) => `
              <a class="nav-link ${item.id === pageId ? "active" : ""}" href="${resolveUrl(item.href)}" ${item.id === pageId ? 'aria-current="page"' : ""}>
                <span class="nav-title">${escapeHtml(item.label)}</span>
                <span class="nav-description">${escapeHtml(item.description)}</span>
              </a>
            `,
          )
          .join("")}
      </nav>
      <div class="sidebar-note">
        <span class="label">Lembrete de uso</span>
        <p class="brand-copy">
          Leia, compare e aplique. Este portal foi desenhado para ensinar e
          tambem para operar.
        </p>
        ${
          resumeTarget
            ? `
              <div class="sidebar-resume">
                <span class="label">Retomada salva</span>
                <strong>${escapeHtml(resumeTarget.title)}</strong>
                <p class="brand-copy">${escapeHtml(resumeTarget.description)}</p>
                <a class="button ghost" href="${resolveUrl(resumeTarget.href)}">${escapeHtml(resumeTarget.action_label)}</a>
              </div>
            `
            : ""
        }
      </div>
    `;
  }

  if (topbar) {
    topbar.innerHTML = `
      <div class="topbar-group">
        <div class="breadcrumb" aria-label="Breadcrumb">
          <span>Portal</span>
          <span class="breadcrumb-separator">/</span>
          <span>${escapeHtml(page.nav_label || page.title)}</span>
        </div>
        <h2 class="topbar-title">${escapeHtml(page.title)}</h2>
        <p class="topbar-summary">${escapeHtml(page.summary)}</p>
      </div>
      <div class="topbar-actions">
        ${
          pageFreshness
            ? `<span class="status-badge ${escapeHtml(pageFreshness.status_class)}">${escapeHtml(pageFreshness.status_label)}</span>`
            : ""
        }
        ${
          canShowResumeAction
            ? `<a class="button secondary" href="${resolveUrl(resumeTarget.href)}">${escapeHtml(resumeTarget.action_label)}</a>`
            : ""
        }
        <button class="mobile-nav-toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="sidebar">
          Menu
        </button>
        <a class="button ghost" href="${resolveUrl(portal.site.deploy_url)}">Producao</a>
      </div>
    `;
  }

  if (topbar?.parentElement && stripMeta) {
    let strip = document.getElementById("freshness-strip");
    if (!strip) {
      strip = document.createElement("section");
      strip.id = "freshness-strip";
      strip.className = "freshness-strip";
      topbar.insertAdjacentElement("afterend", strip);
    }

    strip.innerHTML = `
      <div class="freshness-strip-copy">
        <span class="eyebrow">${escapeHtml(stripMeta.eyebrow || "Radar Vivo")}</span>
        <div class="freshness-strip-header">
          <h3>${escapeHtml(stripMeta.title || "Mercado monitorado")}</h3>
          ${
            pageFreshness
              ? `<span class="status-badge ${escapeHtml(pageFreshness.status_class)}">${escapeHtml(pageFreshness.title || page.title)}</span>`
              : ""
          }
        </div>
        <p class="freshness-strip-summary">${escapeHtml(stripMeta.summary || "")}</p>
        ${
          pageFreshness
            ? `<p class="freshness-strip-page">Nesta rota: <strong>${escapeHtml(pageFreshness.status_label)}</strong> - ${escapeHtml(pageFreshness.summary)}</p>`
            : ""
        }
      </div>
      <div class="freshness-strip-actions">
        <div class="freshness-strip-metrics">
          ${(stripMeta.metrics || [])
            .map(
              (item) => `
                <article class="freshness-metric">
                  <span class="label">${escapeHtml(item.label)}</span>
                  <strong>${escapeHtml(item.value)}</strong>
                </article>
              `,
            )
            .join("")}
        </div>
        ${renderButtonList(stripMeta.buttons || [])}
      </div>
    `;
  }

  if (footer) {
    footer.innerHTML = `
      <div class="footer-copy">
        Atualizado em ${escapeHtml(portal.site.updated_on)}. Fase atual: ${escapeHtml(portal.site.phase_label)}.
      </div>
      <a href="${resolveUrl(portal.site.deploy_url)}">Abrir URL oficial</a>
    `;
  }

  const toggle = document.getElementById("nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }
}

function renderCards(containerId, items, template) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  if (!items || items.length === 0) {
    container.innerHTML = '<div class="empty-note">Nenhum conteudo disponivel.</div>';
    return;
  }

  container.innerHTML = items.map(template).join("");
}

function renderButtonList(buttons) {
  if (!buttons || buttons.length === 0) {
    return "";
  }

  return `
    <div class="button-group">
      ${buttons
        .map(
          (button) => `
            <a class="button ${button.variant === "secondary" ? "secondary" : ""}" href="${resolveUrl(button.href)}">
              ${escapeHtml(button.label)}
            </a>
          `,
        )
        .join("")}
    </div>
  `;
}

function findFreshnessPage(freshnessStatus, targetPageId = pageId) {
  return (freshnessStatus?.pages || []).find((item) => item.id === targetPageId) || null;
}

function buildSourceLookup(vendorSources) {
  const entries = Array.isArray(vendorSources?.sources) ? vendorSources.sources : [];
  return new Map(entries.map((item) => [item.id, item]));
}

function buildSourceButtons(sourceLookup, sourceIds, limit = 2) {
  return (sourceIds || [])
    .map((sourceId) => sourceLookup.get(sourceId))
    .filter(Boolean)
    .slice(0, limit)
    .map((source) => ({
      label: source.short_label || source.title || "Fonte oficial",
      href: source.url,
      variant: "secondary",
    }));
}

function renderTagList(tags) {
  if (!tags || tags.length === 0) {
    return "";
  }

  return `
    <div class="chip-list">
      ${tags.map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}
    </div>
  `;
}

function renderRouteWorkspace(targetId, workspace) {
  const target = document.getElementById(targetId);
  if (!target || !workspace) {
    return;
  }

  const metricCards = (workspace.metrics || [])
    .map(
      (metric) => `
        <article class="route-workspace-metric">
          <span class="label">${escapeHtml(metric.label)}</span>
          <strong>${escapeHtml(metric.value)}</strong>
          <p class="metric-note">${escapeHtml(metric.note)}</p>
        </article>
      `,
    )
    .join("");

  const studyOrder = (workspace.study_order || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const watchouts = (workspace.watchouts || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  target.innerHTML = `
    <div class="route-workspace-shell">
      <div class="route-workspace-main">
        <span class="eyebrow">${escapeHtml(workspace.eyebrow || "Decision desk")}</span>
        <h2>${escapeHtml(workspace.title || "")}</h2>
        <p class="lead">${escapeHtml(workspace.description || "")}</p>
        ${renderTagList(workspace.pills || [])}
        <div class="route-workspace-metric-grid">${metricCards}</div>
        ${renderButtonList(workspace.buttons || [])}
      </div>
      <aside class="route-workspace-side">
        ${
          workspace.accent
            ? `
              <div class="route-workspace-card route-workspace-accent">
                <span class="label">${escapeHtml(workspace.accent.label || "Ponto-chave")}</span>
                <strong>${escapeHtml(workspace.accent.value || "")}</strong>
                <p>${escapeHtml(workspace.accent.note || "")}</p>
              </div>
            `
            : ""
        }
        ${
          studyOrder
            ? `
              <div class="route-workspace-card">
                <span class="label">${escapeHtml(workspace.study_order_title || "Como usar")}</span>
                <ol class="step-list">${studyOrder}</ol>
              </div>
            `
            : ""
        }
        ${
          watchouts
            ? `
              <div class="route-workspace-card">
                <span class="label">${escapeHtml(workspace.watchouts_title || "Atencao")}</span>
                <ul class="resource-list">${watchouts}</ul>
              </div>
            `
            : ""
        }
      </aside>
    </div>
  `;
}

function renderMissionControlSurface(prefix, snapshot) {
  const panel = document.getElementById(`${prefix}-mission-panel`);
  const badges = document.getElementById(`${prefix}-mission-badges`);
  const flagQueue = document.getElementById(`${prefix}-flag-queue`);

  if (panel) {
    panel.innerHTML = `
      <div class="mission-control-shell">
        <div class="mission-visual-cluster">
          <div class="mission-progress-ring" style="--progress:${escapeHtml(String(snapshot.progressPercent))}">
            <strong>${escapeHtml(String(snapshot.progressPercent))}%</strong>
            <span>dominio</span>
          </div>
          <div class="mission-visual-copy">
            <span class="eyebrow">Dia ${escapeHtml(String(snapshot.dayIndex))} de 30</span>
            <h3>${escapeHtml(snapshot.nextActionLabel)}</h3>
            <p class="card-copy">${escapeHtml(snapshot.nextActionSummary)}</p>
            <div class="mission-pill-row">
              <span class="mission-pill">Streak ${escapeHtml(String(snapshot.streakDays))}d</span>
              <span class="mission-pill">XP ${escapeHtml(String(snapshot.xpTotal))}</span>
              <span class="mission-pill">${escapeHtml(snapshot.level.label)}</span>
            </div>
          </div>
        </div>
        <div class="mission-metric-grid">
          <article class="mission-metric-card">
            <span class="label">Unidades dominadas</span>
            <strong>${escapeHtml(String(snapshot.masteredCount))}/${escapeHtml(String(snapshot.totalUnits))}</strong>
            <p class="metric-note">A trilha fica forte quando dominio e evidencia andam juntos.</p>
          </article>
          <article class="mission-metric-card">
            <span class="label">Em progresso</span>
            <strong>${escapeHtml(String(snapshot.inProgressCount))}</strong>
            <p class="metric-note">Blocos que pedem repeticao antes de serem promovidos para dominio.</p>
          </article>
          <article class="mission-metric-card">
            <span class="label">Flags abertas</span>
            <strong>${escapeHtml(String(snapshot.flaggedItems.length))}</strong>
            <p class="metric-note">Fila visual de revisao para nao deixar pontos importantes escaparem.</p>
          </article>
          <article class="mission-metric-card">
            <span class="label">Nivel atual</span>
            <strong>${escapeHtml(snapshot.level.label)}</strong>
            <p class="metric-note">${escapeHtml(snapshot.level.summary)}</p>
          </article>
        </div>
        <div class="button-group">
          <a class="button" href="${resolveUrl(snapshot.resumeTarget?.href || "/trilha/")}">${escapeHtml(
            snapshot.resumeTarget?.action_label || "Montar trilha",
          )}</a>
          <a class="button secondary" href="${resolveUrl(snapshot.flaggedItems.length ? "/progresso/" : "/analytics/")}">${escapeHtml(
            snapshot.flaggedItems.length ? "Resolver flags no Progresso" : "Ler proxima missao no Analytics",
          )}</a>
        </div>
      </div>
    `;
  }

  if (badges) {
    renderCards(
      `${prefix}-mission-badges`,
      snapshot.badges || [],
      (item) => `
        <article class="study-card compact-card ${item.unlocked ? "recommended" : ""}">
          <span class="status-badge ${item.unlocked ? "status-done" : "status-next"}">${escapeHtml(
            item.unlocked ? "Badge ativo" : "A caminho",
          )}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.summary)}</p>
          <p class="metric-note">${escapeHtml(item.kicker)}</p>
          <div class="quality-score-rail">
            <span class="quality-score-fill ${item.unlocked ? "status-done" : "status-in-progress"}" style="width:${escapeHtml(
              `${Math.round((item.progress || 0) * 100)}%`,
            )}"></span>
          </div>
        </article>
      `,
    );
  }

  if (flagQueue) {
    renderCards(
      `${prefix}-flag-queue`,
      snapshot.flaggedItems.length
        ? snapshot.flaggedItems
        : [
            {
              title: "Nenhuma flag aberta",
              summary: "Quando algum ponto pedir revisao, ele aparecera aqui para voce nao perder o fio da jornada.",
              route_label: "Fluxo limpo",
              href: "/trilha/",
            },
          ],
      (item) => `
        <article class="workflow-card flag-card">
          <span class="status-badge ${snapshot.flaggedItems.length ? "status-in-progress" : "status-done"}">${escapeHtml(
            item.route_label || "Fluxo limpo",
          )}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.summary)}</p>
          <div class="button-group">
            <a class="button secondary" href="${resolveUrl(item.href || "/trilha/")}">${escapeHtml(
              snapshot.flaggedItems.length ? "Abrir ponto marcado" : "Voltar para a Trilha",
            )}</a>
          </div>
        </article>
      `,
    );
  }
}

function buildMatrixInsights(matrixArtifact, matrixGuide, overview) {
  const rows = Array.isArray(matrixArtifact?.rows) ? matrixArtifact.rows : [];
  const weights = matrixArtifact?.weights || {};
  const metricMeta = Array.isArray(matrixGuide?.metric_meta) ? matrixGuide.metric_meta : [];
  const useCaseMeta = Array.isArray(matrixGuide?.use_case_meta) ? matrixGuide.use_case_meta : [];
  const metricMetaById = new Map(metricMeta.map((item) => [item.id, item]));
  const useCaseMetaById = new Map(useCaseMeta.map((item) => [item.id, item]));
  const rankingLookup = new Map((overview?.ranking || []).map((item) => [item.model_id, item]));
  const rowsByModel = new Map();
  const rowsByUseCase = new Map();

  rows.forEach((row) => {
    if (!rowsByModel.has(row.model_id)) {
      rowsByModel.set(row.model_id, []);
    }
    rowsByModel.get(row.model_id).push(row);

    if (!rowsByUseCase.has(row.use_case_id)) {
      rowsByUseCase.set(row.use_case_id, []);
    }
    rowsByUseCase.get(row.use_case_id).push(row);
  });

  const modelProfiles = Array.from(rowsByModel.entries())
    .map(([modelId, modelRows]) => {
      const baseRow = modelRows[0];
      const rankingEntry = rankingLookup.get(modelId) || {};
      const metricScores = MATRIX_METRIC_ORDER.map((metricId) => {
        const meta = metricMetaById.get(metricId);
        return {
          id: metricId,
          label: meta?.label || titleCase(metricId),
          description: meta?.description || "",
          question: meta?.question || "",
          score: average(modelRows.map((row) => row[metricId])),
        };
      });
      const sortedMetrics = metricScores.slice().sort((left, right) => right.score - left.score);
      const bestUseCaseRow = modelRows.slice().sort((left, right) => right.weighted_total - left.weighted_total)[0];
      const weakestUseCaseRow = modelRows.slice().sort((left, right) => left.weighted_total - right.weighted_total)[0];
      const bestUseCase = useCaseMetaById.get(bestUseCaseRow?.use_case_id);
      const weakestUseCase = useCaseMetaById.get(weakestUseCaseRow?.use_case_id);

      return {
        model_id: modelId,
        vendor: baseRow.vendor,
        model: baseRow.model,
        average_total: average(modelRows.map((row) => row.weighted_total)),
        strongest_metric: sortedMetrics[0],
        weakest_metric: sortedMetrics[sortedMetrics.length - 1],
        best_use_case: bestUseCase || {
          title: bestUseCaseRow?.use_case || titleCase(bestUseCaseRow?.use_case_id || ""),
        },
        weakest_use_case: weakestUseCase || {
          title: weakestUseCaseRow?.use_case || titleCase(weakestUseCaseRow?.use_case_id || ""),
        },
        notes: rankingEntry.notes || "",
        source_urls: rankingEntry.source_urls || [],
      };
    })
    .sort((left, right) => right.average_total - left.average_total);

  const useCases = useCaseMeta
    .map((meta) => {
      const useCaseRows = (rowsByUseCase.get(meta.id) || []).slice().sort((left, right) => right.weighted_total - left.weighted_total);
      const leader = useCaseRows[0] || null;
      const runnerUp = useCaseRows[1] || null;

      return {
        ...meta,
        leader,
        runnerUp,
        gap: leader && runnerUp ? leader.weighted_total - runnerUp.weighted_total : 0,
      };
    })
    .filter((item) => item.leader);

  const biggestGap = useCases
    .slice()
    .sort((left, right) => right.gap - left.gap)
    .find((item) => item.leader && item.runnerUp);

  const sources = uniqueBy(
    modelProfiles.flatMap((profile) =>
      (profile.source_urls || []).map((url, index) => ({
        url,
        vendor: profile.vendor,
        model: profile.model,
        label: index === 0 ? "Fonte principal" : "Fonte complementar",
      })),
    ),
    (item) => item.url,
  );

  return {
    weights,
    metricMeta,
    modelProfiles,
    useCases,
    biggestGap,
    sources,
    decisionFlow: Array.isArray(matrixGuide?.decision_flow) ? matrixGuide.decision_flow : [],
    freshnessNotes: Array.isArray(matrixGuide?.freshness_notes) ? matrixGuide.freshness_notes : [],
    boundaryNotes: Array.isArray(matrixGuide?.boundary_notes) ? matrixGuide.boundary_notes : [],
  };
}

function renderHome(portal, overview, artifacts, freshnessStatus, vendorUpdates, vendorSources, domainMap, studyUnits) {
  const phaseFocus = document.getElementById("phase-focus");
  const phaseSummary = document.getElementById("phase-summary");
  const resumeTitle = document.getElementById("resume-title");
  const resumeCopy = document.getElementById("resume-copy");
  const resumeAction = document.getElementById("resume-action");
  const sourceLookup = buildSourceLookup(vendorSources);
  const resumeTarget = getPrimaryResumeTarget(portal);

  if (phaseFocus) {
    phaseFocus.textContent = `${portal.site.phase_label} - ${portal.site.phase_focus}`;
  }

  if (phaseSummary) {
    phaseSummary.textContent = portal.site.phase_summary;
  }

  if (resumeTitle) {
    resumeTitle.textContent = resumeTarget ? resumeTarget.title : "Nenhuma retomada salva ainda";
  }

  if (resumeCopy) {
    resumeCopy.textContent = resumeTarget
      ? `${resumeTarget.description} Ultima atualizacao: ${formatDateTimeCompact(resumeTarget.updated_at || ensureResumeState().updated_at)}.`
      : "Monte a trilha uma vez e o portal passa a lembrar seu foco, sua configuracao e o ponto exato da retomada.";
  }

  if (resumeAction) {
    resumeAction.innerHTML = resumeTarget
      ? `<a class="button" href="${resolveUrl(resumeTarget.href)}">${escapeHtml(resumeTarget.action_label)}</a>`
      : `<a class="button" href="${resolveUrl("/trilha/")}">Montar trilha agora</a>`;
  }

  renderMissionControlSurface("home", buildLearningMissionSnapshot(portal, studyUnits));

  renderCards(
    "home-overview",
    [
      {
        label: "Snapshot calibrado",
        value: overview.evaluated_on,
        note: "Data em que o harness operacional foi consolidado.",
      },
      {
        label: "Mercado conferido",
        value: overview.market_checked_on || overview.evaluated_on,
        note: "Data da revisao editorial das familias atuais nas fontes oficiais.",
      },
      {
        label: "Top snapshot",
        value: `${overview.top_model.vendor} / ${overview.top_model.snapshot_model || overview.top_model.model}`,
        note: overview.top_model.market_note || `Score medio ${overview.top_model.average_total}.`,
      },
      {
        label: "Workflows monitorados",
        value: String(overview.runs.length),
        note: "Executados com aprovacao humana e leitura de risco.",
      },
    ],
    (item) => `
      <article class="metric-card">
        <span class="label">${escapeHtml(item.label)}</span>
        <p class="metric-value">${escapeHtml(item.value)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  renderCards(
    "home-freshness-overview",
    freshnessStatus?.global?.cards || [],
    (item) => `
      <article class="metric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="metric-value">${escapeHtml(item.value)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  const freshnessPolicy = document.getElementById("freshness-policy");
  if (freshnessPolicy) {
    freshnessPolicy.innerHTML = (freshnessStatus?.policy || [])
      .map(
        (item) => `
          <li>
            <strong>${escapeHtml(item.label)}.</strong> ${escapeHtml(item.description)}
          </li>
        `,
      )
      .join("");
  }

  renderCards(
    "home-page-freshness",
    freshnessStatus?.pages || [],
    (item) => `
      <article class="study-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.status_label)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.summary)}</p>
        <p class="metric-note">Ultima leitura: ${escapeHtml(item.checked_on)}. ${escapeHtml(item.note || "")}</p>
        <div class="button-group">
          <a class="button secondary" href="${resolveUrl(item.action_href)}">${escapeHtml(item.action_label || "Abrir rota")}</a>
        </div>
      </article>
    `,
  );

  renderCards(
    "study-principles",
    portal.study_principles,
    (item) => `
      <article class="study-card">
        <span class="label">${escapeHtml(item.kicker)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
      </article>
    `,
  );

  renderCards(
    "study-tracks",
    portal.study_tracks,
    (item) => `
      <article class="study-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <div class="button-group">
          <a class="button secondary" href="${resolveUrl(item.href)}">Abrir rota</a>
        </div>
      </article>
    `,
  );

  renderCards(
    "study-validation",
    portal.study_validation,
    (item) => `
      <article class="study-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          ${(item.points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
      </article>
    `,
  );

  renderCards(
    "home-vendor-updates",
    vendorUpdates?.updates || [],
    (item) => {
      const buttons = [
        ...buildSourceButtons(sourceLookup, item.source_ids, 2),
        item.route_href
          ? {
              label: item.route_label || "Abrir rota",
              href: item.route_href,
              variant: "primary",
            }
          : null,
      ].filter(Boolean);

      return `
        <article class="artifact-card">
          <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.status_label)}</span>
          <h3>${escapeHtml(item.vendor)}</h3>
          <p class="card-copy">${escapeHtml(item.headline)}</p>
          <p class="metric-note">Conferido em ${escapeHtml(item.checked_on)}. ${escapeHtml(item.summary)}</p>
          <ul class="summary-list">
            <li><strong>Estudar agora:</strong> ${escapeHtml(item.study_now)}</li>
            <li><strong>No portal:</strong> ${escapeHtml(item.portal_hook)}</li>
          </ul>
          ${renderButtonList(buttons)}
        </article>
      `;
    },
  );

  renderCards(
    "home-domain-map",
    domainMap?.domains || [],
    (item) => `
      <article class="study-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.coverage_label)}</span>
        <h3>${escapeHtml(item.domain)}</h3>
        <p class="card-copy">${escapeHtml(item.summary)}</p>
        <p class="metric-note">Melhor porta de entrada: ${escapeHtml(item.route_label)}. ${escapeHtml(item.next_step)}</p>
        <div class="button-group">
          <a class="button secondary" href="${resolveUrl(item.href)}">${escapeHtml(item.action_label || "Abrir estudo")}</a>
        </div>
      </article>
    `,
  );

  const ranking = document.getElementById("home-ranking");
  if (ranking) {
    ranking.innerHTML = overview.ranking
      .map(
        (item) => `
          <tr>
            <td>
              <strong>${escapeHtml(item.market_family || item.model)}</strong>
              <span class="table-meta">
                ${item.market_source_url ? `<a class="resource-link" href="${item.market_source_url}">${escapeHtml(item.market_source_label || "Fonte atual")}</a>` : ""}
              </span>
            </td>
            <td>
              <strong>${escapeHtml(item.snapshot_model || item.model)}</strong>
              <span class="table-meta">${escapeHtml(item.snapshot_note || "")}</span>
            </td>
            <td>${escapeHtml(item.vendor)}</td>
            <td>${escapeHtml(formatNumber(item.average_total))}</td>
            <td>
              <strong>${escapeHtml(item.study_now || item.notes || "")}</strong>
              <span class="table-meta">${escapeHtml(item.market_note || "")}</span>
            </td>
          </tr>
        `,
      )
      .join("");
  }

  renderCards(
    "home-featured-artifacts",
    artifacts.featured_artifacts.slice(0, 4),
    (item) => `
      <article class="artifact-card" id="${escapeHtml(item.id)}">
        <span class="status-badge status-done">${escapeHtml(item.category)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.summary)}</p>
        <p class="metric-note">${escapeHtml(item.study_tip)}</p>
        ${renderTagList(item.tags)}
        ${renderButtonList(item.buttons)}
      </article>
    `,
  );

  renderCards(
    "home-llm-watchlist",
    artifacts.llm_watchlist,
    (item) => `
      <article class="study-card">
        <span class="status-badge status-in-progress">${escapeHtml(item.vendor)} / ${escapeHtml(item.region)}</span>
        <h3>${escapeHtml(item.model)}</h3>
        <p class="card-copy">${escapeHtml(item.summary)}</p>
        <p class="metric-note">Foco: ${escapeHtml(item.focus)}</p>
        <div class="button-group">
          <a class="button secondary" href="${item.source_url}">${escapeHtml(item.source_label)}</a>
        </div>
      </article>
    `,
  );
}

function renderMatrix(portal, overview, artifacts, matrixGuide, matrixArtifact) {
  const insights = buildMatrixInsights(matrixArtifact, matrixGuide, overview);
  renderRouteWorkspace("matrix-decision-workspace", {
    ...(matrixGuide.decision_workspace || {}),
    metrics: [
      {
        label: "Modelos calibrados",
        value: String(insights.modelProfiles.length),
        note: "Cobertura seed pronta para leitura comparativa.",
      },
      {
        label: "Casos reais",
        value: String(insights.useCases.length),
        note: "Tarefas operacionais usadas para sair do ranking vazio.",
      },
      {
        label: "Maior gap",
        value: insights.biggestGap ? formatNumber(insights.biggestGap.gap) : "0.000",
        note: insights.biggestGap
          ? insights.biggestGap.title
          : "Sem abertura dominante entre os modelos atuais.",
      },
      {
        label: "Snapshot",
        value: "21/03",
        note: "Mercado atual e score operacional precisam continuar separados.",
      },
    ],
  });

  renderCards(
    "matrix-orientation",
    [
      {
        badge: "Snapshot",
        status_class: "status-done",
        title: "Cobertura atual",
        body: `${insights.modelProfiles.length} modelos x ${insights.useCases.length} casos`,
        note: `${insights.freshnessNotes[0] || ""} ${insights.freshnessNotes[1] || ""}`.trim(),
      },
      {
        badge: "Top model",
        status_class: "status-done",
        title: "Lider geral da matriz",
        body: `${overview.top_model.vendor} / ${overview.top_model.model}`,
        note: `Score medio ${formatNumber(overview.top_model.average_total)}. ${overview.top_model.notes}`,
      },
      insights.biggestGap
        ? {
            badge: "Maior abertura",
            status_class: "status-in-progress",
            title: insights.biggestGap.title,
            body: `${insights.biggestGap.leader.vendor} / ${insights.biggestGap.leader.model}`,
            note: `Abre ${formatNumber(insights.biggestGap.gap)} pontos sobre ${insights.biggestGap.runnerUp.vendor} / ${insights.biggestGap.runnerUp.model}. ${insights.biggestGap.decision_note}`,
          }
        : {
            badge: "Maior abertura",
            status_class: "status-in-progress",
            title: "Leitura equilibrada",
            body: "Sem gap dominante",
            note: "A matriz atual pede leitura mais contextual e menos dependente de um unico score.",
          },
      {
        badge: "Regra de leitura",
        status_class: "status-next",
        title: "Ranking orienta; criterio decide",
        body: "Nao use a media como piloto automatico",
        note: "Custo, risco, citacao e controle continuam sendo filtros obrigatorios antes de promover um modelo.",
      },
    ],
    (item) => `
      <article class="metric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="metric-value">${escapeHtml(item.body)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  renderCards(
    "matrix-rubric",
    insights.metricMeta,
    (item) => `
      <article class="study-card">
        <span class="status-badge status-done">Peso ${escapeHtml(formatPercent(insights.weights[item.id]))}</span>
        <h3>${escapeHtml(item.label)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <div class="metric-breakdown">
          <div class="bar-row">
            <div class="bar-header">
              <span>${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(formatPercent(insights.weights[item.id]))}</strong>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width: ${escapeHtml(formatPercent(insights.weights[item.id]))}"></div>
            </div>
          </div>
        </div>
        <p class="metric-note">${escapeHtml(item.question)}</p>
      </article>
    `,
  );

  const freshness = document.getElementById("matrix-freshness");
  if (freshness) {
    freshness.innerHTML = insights.freshnessNotes
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  renderCards(
    "matrix-usecases",
    insights.useCases,
    (item) => `
      <article class="workflow-card">
        <span class="status-badge status-done">Lider ${escapeHtml(item.leader.vendor)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          <li><strong>Lider:</strong> ${escapeHtml(item.leader.model)} (${escapeHtml(formatNumber(item.leader.weighted_total))})</li>
          <li><strong>Runner-up:</strong> ${item.runnerUp ? `${escapeHtml(item.runnerUp.model)} (${escapeHtml(formatNumber(item.runnerUp.weighted_total))})` : "n/a"}</li>
          <li><strong>Gap:</strong> ${escapeHtml(formatNumber(item.gap))}</li>
          <li><strong>Como decidir:</strong> ${escapeHtml(item.decision_note)}</li>
          <li><strong>Atencao:</strong> ${escapeHtml(item.watch_for)}</li>
        </ul>
      </article>
    `,
  );

  renderCards(
    "matrix-model-profiles",
    insights.modelProfiles,
    (item) => `
      <article class="artifact-card">
        <span class="status-badge status-in-progress">${escapeHtml(item.vendor)}</span>
        <h3>${escapeHtml(item.model)}</h3>
        <p class="metric-value">${escapeHtml(formatNumber(item.average_total))}</p>
        <p class="card-copy">${escapeHtml(item.notes)}</p>
        ${renderTagList([item.best_use_case.title, item.strongest_metric.label, item.weakest_metric.label])}
        <ul class="summary-list">
          <li><strong>Melhor encaixe:</strong> ${escapeHtml(item.best_use_case.title)}</li>
          <li><strong>Maior forca:</strong> ${escapeHtml(item.strongest_metric.label)} (${escapeHtml(formatNumber(item.strongest_metric.score, 2))})</li>
          <li><strong>Ponto de atencao:</strong> ${escapeHtml(item.weakest_metric.label)} (${escapeHtml(formatNumber(item.weakest_metric.score, 2))})</li>
          <li><strong>Uso prudente:</strong> ${escapeHtml(item.weakest_use_case.title)}</li>
        </ul>
        ${renderButtonList(
          (item.source_urls || []).slice(0, 2).map((url, index) => ({
            label: index === 0 ? "Fonte principal" : "Fonte complementar",
            href: url,
            variant: index === 0 ? "primary" : "secondary",
          })),
        )}
      </article>
    `,
  );

  const ranking = document.getElementById("matrix-ranking");
  if (ranking) {
    ranking.innerHTML = insights.modelProfiles
      .map(
        (item) => `
          <tr>
            <td>
              <strong>${escapeHtml(item.model)}</strong>
              <span class="table-meta">${escapeHtml(item.vendor)}</span>
            </td>
            <td>${escapeHtml(formatNumber(item.average_total))}</td>
            <td>
              <strong>${escapeHtml(item.best_use_case.title)}</strong>
              <span class="table-meta">${escapeHtml(item.notes)}</span>
            </td>
            <td>
              <strong>${escapeHtml(item.strongest_metric.label)}</strong>
              <span class="table-meta">${escapeHtml(formatNumber(item.strongest_metric.score, 2))}</span>
            </td>
            <td>
              <strong>${escapeHtml(item.weakest_metric.label)}</strong>
              <span class="table-meta">${escapeHtml(item.weakest_use_case.title)}</span>
            </td>
          </tr>
        `,
      )
      .join("");
  }

  const sources = document.getElementById("matrix-sources");
  if (sources) {
    sources.innerHTML = insights.sources
      .map(
        (item) => `
          <li>
            <span class="label">${escapeHtml(item.vendor)}</span>
            <div class="resource-detail">
              <strong>${escapeHtml(item.model)}</strong>
              <a class="resource-link" href="${item.url}">${escapeHtml(item.label)}</a>
            </div>
          </li>
        `,
      )
      .join("");
  }

  const boundary = document.getElementById("matrix-boundary");
  if (boundary) {
    boundary.innerHTML = insights.boundaryNotes
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  renderCards(
    "matrix-questions",
    [...insights.decisionFlow, ...(portal.pages.matriz.questions || [])],
    (item) => `
      <article class="study-card">
        <span class="label">${escapeHtml(item.kicker)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
      </article>
    `,
  );

  renderCards(
    "matrix-llm-watchlist",
    artifacts.llm_watchlist,
    (item) => `
      <article class="study-card">
        <span class="status-badge status-next">${escapeHtml(item.vendor)}</span>
        <h3>${escapeHtml(item.model)}</h3>
        <p class="card-copy">${escapeHtml(item.summary)}</p>
        <p class="metric-note">Leitura: ${escapeHtml(item.focus)}</p>
        <div class="button-group">
          <a class="button secondary" href="${item.source_url}">Fonte oficial</a>
        </div>
      </article>
    `,
  );
}

function renderWorkflows(portal, overview, workflowsGuide) {
  const pendingApprovals = overview.runs.filter(
    (item) => item.approval_status === "pending",
  ).length;

  renderRouteWorkspace("workflow-decision-workspace", {
    ...(workflowsGuide.decision_workspace || {}),
    metrics: [
      {
        label: "Workflows ativos",
        value: String((portal.pages.workflows.catalog || []).length),
        note: "Saneamento operacional e prontidao de homologacao.",
      },
      {
        label: "Runs auditaveis",
        value: String((overview.runs || []).length),
        note: "Cada execucao gera evidencia, resumo e proxima acao.",
      },
      {
        label: "Approval pendente",
        value: String(pendingApprovals),
        note: "Mudancas sensiveis continuam presas ao gate humano.",
      },
      {
        label: "Artefatos abertos",
        value: String((workflowsGuide.run_commentary || []).length),
        note: "Runs comentados prontos para estudo e operacao.",
      },
    ],
  });

  renderCards(
    "workflow-orientation",
    workflowsGuide.orientation || [],
    (item) => `
      <article class="metric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="metric-value">${escapeHtml(item.body)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  renderCards(
    "workflow-anatomy",
    workflowsGuide.anatomy || [],
    (item) => `
      <article class="study-card">
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          ${(item.points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
      </article>
    `,
  );

  const operatorRules = document.getElementById("workflow-operator-rules");
  if (operatorRules) {
    operatorRules.innerHTML = (workflowsGuide.operator_rules || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  renderCards(
    "workflow-cards",
    portal.pages.workflows.catalog,
    (item) => `
      <article class="workflow-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          ${item.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
      </article>
    `,
  );

  renderCards(
    "workflow-run-cards",
    workflowsGuide.run_commentary || [],
    (item) => `
      <article class="workflow-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">
          ${escapeHtml(item.status_label)}
        </span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.narrative)}</p>
        <ul class="summary-list">
          <li><strong>Por que importa:</strong> ${escapeHtml(item.why_it_matters)}</li>
          ${(item.key_findings || []).map((finding) => `<li>${escapeHtml(finding)}</li>`).join("")}
          <li><strong>Proxima acao:</strong> ${escapeHtml(item.next_action)}</li>
        </ul>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );

  renderCards(
    "workflow-approval-steps",
    workflowsGuide.approval_protocol || [],
    (item) => `
      <article class="study-card">
        <span class="label">${escapeHtml(item.kicker)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
      </article>
    `,
  );

  renderCards(
    "workflow-risk-ladder",
    workflowsGuide.risk_ladder || [],
    (item) => `
      <article class="study-card compact-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
      </article>
    `,
  );

  const runMeta = new Map((workflowsGuide.run_commentary || []).map((item) => [item.run_id, item]));

  const table = document.getElementById("workflow-runs-table");
  if (table) {
    table.innerHTML = overview.runs
      .map((item) => {
        const meta = runMeta.get(item.run_id);
        return `
          <tr>
            <td><strong>${escapeHtml(item.run_id)}</strong></td>
            <td>${escapeHtml(titleCase(item.workflow))}</td>
            <td><span class="status-badge ${item.approval_status === "pending" ? "status-pending" : "status-done"}">${escapeHtml(item.approval_status)}</span></td>
            <td>${Object.entries(item.summary)
              .map(([key, value]) => `${escapeHtml(titleCase(key))}: ${escapeHtml(value)}`)
              .join(" | ")}</td>
            <td>${escapeHtml(meta?.next_action || "Revisar artefato correspondente.")}</td>
          </tr>
        `;
      })
      .join("");
  }
}

function renderRag(portal, ragGuide) {
  renderRouteWorkspace("rag-decision-workspace", {
    ...(ragGuide.decision_workspace || {}),
    metrics: [
      {
        label: "Chunks indexados",
        value: "15",
        note: "Base local pronta para citacao por arquivo e linha.",
      },
      {
        label: "Modos ativos",
        value: String((portal.rag_modes || []).length),
        note: "Long context, NotebookLM, Projects e vector RAG.",
      },
      {
        label: "Camadas reais",
        value: String((ragGuide.system_views || []).length),
        note: "Evidencias abertas para manifesto, indice e playbook.",
      },
      {
        label: "Regra",
        value: "Citar primeiro",
        note: "Resposta elegante so entra quando origem e limite ficam visiveis.",
      },
    ],
  });

  renderCards(
    "rag-orientation",
    ragGuide.orientation || [],
    (item) => `
      <article class="metric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="metric-value">${escapeHtml(item.body)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  renderCards(
    "rag-decision-tracks",
    ragGuide.decision_tracks || [],
    (item) => `
      <article class="study-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
      </article>
    `,
  );

  renderCards(
    "rag-modes",
    portal.rag_modes,
    (item) => `
      <article class="study-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          ${(item.points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
      </article>
    `,
  );

  renderCards(
    "rag-trust-contract",
    ragGuide.trust_contract || [],
    (item) => `
      <article class="study-card">
        <span class="label">${escapeHtml(item.kicker)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
      </article>
    `,
  );

  const antiPatterns = document.getElementById("rag-anti-patterns");
  if (antiPatterns) {
    antiPatterns.innerHTML = (ragGuide.anti_patterns || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  renderCards(
    "rag-system-views",
    ragGuide.system_views || [],
    (item) => `
      <article class="artifact-card">
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.summary)}</p>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );
}

function renderJourney(journeyGuide) {
  renderCards(
    "journey-orientation",
    journeyGuide.orientation || [],
    (item) => `
      <article class="metric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="metric-value">${escapeHtml(item.body)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  renderCards(
    "journey-map",
    journeyGuide.navigation_path || [],
    (item) => `
      <article class="study-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <p class="metric-note">${escapeHtml(item.time_box)}</p>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );

  const rules = document.getElementById("journey-rules");
  if (rules) {
    rules.innerHTML = (journeyGuide.rules || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  renderCards(
    "journey-hours",
    journeyGuide.hours_by_route || [],
    (item) => `
      <article class="workflow-card">
        <span class="status-badge status-done">${escapeHtml(item.hours)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          <li><strong>Entregavel:</strong> ${escapeHtml(item.output)}</li>
        </ul>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );

  renderCards(
    "journey-session-templates",
    journeyGuide.session_templates || [],
    (item) => `
      <article class="study-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          ${(item.blocks || []).map((block) => `<li>${escapeHtml(block)}</li>`).join("")}
        </ul>
      </article>
    `,
  );

  renderCards(
    "journey-weeks",
    journeyGuide.weekly_sprints || [],
    (item) => `
      <article class="phase-card">
        <span class="status-badge status-done">${escapeHtml(item.hours)}</span>
        <p class="timeline-kicker">${escapeHtml(item.window)}</p>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="timeline-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          ${(item.deliverables || []).map((deliverable) => `<li>${escapeHtml(deliverable)}</li>`).join("")}
        </ul>
        ${renderTagList(item.focus_routes || [])}
      </article>
    `,
  );

  renderCards(
    "journey-support",
    journeyGuide.support_materials || [],
    (item) => `
      <article class="artifact-card">
        <span class="status-badge status-in-progress">${escapeHtml(item.category)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.summary)}</p>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );

  renderCards(
    "journey-outcomes",
    journeyGuide.outcomes || [],
    (item) => `
      <article class="study-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          ${(item.points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
      </article>
    `,
  );

  const checklist = document.getElementById("journey-checklist");
  if (checklist) {
    checklist.innerHTML = (journeyGuide.checklist || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }
}

function renderGuide(guideGuide, vendorSources) {
  const sourceLookup = buildSourceLookup(vendorSources);

  renderCards(
    "guide-orientation",
    guideGuide.orientation || [],
    (item) => `
      <article class="metric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="metric-value">${escapeHtml(item.body)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  const studySteps = document.getElementById("guide-study-steps");
  if (studySteps) {
    studySteps.innerHTML = (guideGuide.study_steps || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  renderCards(
    "guide-entry-modes",
    guideGuide.entry_modes || [],
    (item) => `
      <article class="study-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <p class="metric-note"><strong>Resultado:</strong> ${escapeHtml(item.outcome)}</p>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );

  const checklist = document.getElementById("guide-checklist");
  if (checklist) {
    checklist.innerHTML = (guideGuide.quick_start_checklist || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  renderCards(
    "guide-timeboxes-grid",
    guideGuide.timeboxes || [],
    (item) => `
      <article class="workflow-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          ${(item.recipe || []).map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
        </ul>
        <p class="metric-note"><strong>Entrega:</strong> ${escapeHtml(item.outcome)}</p>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );

  renderCards(
    "guide-route-playbooks",
    guideGuide.route_playbooks || [],
    (item) => {
      const buttons = [
        ...(item.buttons || []),
        ...buildSourceButtons(sourceLookup, item.source_ids, 2),
      ];

      return `
        <article class="artifact-card">
          <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.description)}</p>
          <ul class="summary-list">
            <li><strong>Melhor para:</strong> ${escapeHtml(item.best_for)}</li>
            <li><strong>Saida esperada:</strong> ${escapeHtml(item.output)}</li>
            <li><strong>Erro comum:</strong> ${escapeHtml(item.common_trap)}</li>
          </ul>
          ${renderTagList(item.tags || [])}
          ${renderButtonList(buttons)}
        </article>
      `;
    },
  );

  renderCards(
    "guide-rituals",
    guideGuide.rituals || [],
    (item) => `
      <article class="study-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          ${(item.steps || []).map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
        </ul>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );

  renderCards(
    "guide-anti-patterns",
    guideGuide.anti_patterns || [],
    (item) => `
      <article class="study-card compact-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          ${(item.points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
      </article>
    `,
  );

  renderCards(
    "guide-official-support",
    guideGuide.official_support || [],
    (item) => {
      const buttons = [
        ...(item.buttons || []),
        ...buildSourceButtons(sourceLookup, item.source_ids, 3),
      ];

      return `
        <article class="artifact-card">
          <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.summary)}</p>
          ${renderButtonList(buttons)}
        </article>
      `;
    },
  );

  renderCards(
    "guide-quick-actions",
    guideGuide.quick_actions || [],
    (item) => `
      <article class="study-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );
}

function renderLabs(labsGuide, vendorSources) {
  const sourceLookup = buildSourceLookup(vendorSources);
  const labs = Array.isArray(labsGuide?.labs) ? labsGuide.labs : [];
  const filterMeta = labsGuide?.filters || {};

  renderMissionControlSurface("labs", buildLearningMissionSnapshot(null, []));

  renderCards(
    "labs-orientation",
    labsGuide.orientation || [],
    (item) => `
      <article class="metric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="metric-value">${escapeHtml(item.body)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  const studySteps = document.getElementById("labs-study-steps");
  if (studySteps) {
    studySteps.innerHTML = (labsGuide.study_steps || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  renderCards(
    "labs-rubric",
    labsGuide.rubric || [],
    (item) => `
      <article class="study-card compact-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
      </article>
    `,
  );

  const form = document.getElementById("labs-filter-form");
  if (!form) {
    return;
  }

  const domainSelect = document.getElementById("labs-domain");
  const difficultySelect = document.getElementById("labs-difficulty");
  const timeboxSelect = document.getElementById("labs-timebox");
  const objectiveSelect = document.getElementById("labs-objective");
  const feedback = document.getElementById("labs-feedback");
  const storyTitle = document.getElementById("labs-story-title");
  const storyCopy = document.getElementById("labs-story-copy");
  const focusPanel = document.getElementById("labs-focus");
  const pageContent = document.getElementById("content");
  const defaults = labsGuide.defaults || {};
  let activeLabId = new URL(window.location.href).searchParams.get("lab") || null;

  fillSelectOptions(domainSelect, filterMeta.domains || []);
  fillSelectOptions(difficultySelect, filterMeta.difficulties || []);
  fillSelectOptions(timeboxSelect, filterMeta.timeboxes || []);
  fillSelectOptions(objectiveSelect, filterMeta.objectives || []);

  function getFilterLabel(options, value) {
    return (options || []).find((item) => item.value === value)?.label || "Todos";
  }

  function readPreferences() {
    return {
      domain: domainSelect?.value || defaults.domain || "all",
      difficulty: difficultySelect?.value || defaults.difficulty || "all",
      timebox: timeboxSelect?.value || defaults.timebox || "all",
      objective: objectiveSelect?.value || defaults.objective || "all",
    };
  }

  function applyPreferences(preferences) {
    if (domainSelect) {
      domainSelect.value = preferences.domain || defaults.domain || "all";
    }
    if (difficultySelect) {
      difficultySelect.value = preferences.difficulty || defaults.difficulty || "all";
    }
    if (timeboxSelect) {
      timeboxSelect.value = preferences.timebox || defaults.timebox || "all";
    }
    if (objectiveSelect) {
      objectiveSelect.value = preferences.objective || defaults.objective || "all";
    }
  }

  function buildFilteredLabs(preferences) {
    return labs.filter((lab) => {
      if (preferences.domain !== "all" && lab.domain !== preferences.domain) {
        return false;
      }
      if (preferences.difficulty !== "all" && lab.difficulty !== preferences.difficulty) {
        return false;
      }
      if (preferences.timebox !== "all" && lab.timebox !== preferences.timebox) {
        return false;
      }
      if (preferences.objective !== "all" && lab.objective !== preferences.objective) {
        return false;
      }
      return true;
    });
  }

  function resolveActiveLab(filteredLabs) {
    return filteredLabs.find((lab) => lab.id === activeLabId) || filteredLabs[0] || null;
  }

  function renderPacks(currentLab) {
    renderCards(
      "labs-packs",
      (labsGuide.packs || []).map((pack) => ({
        ...pack,
        recommended: currentLab ? pack.labs.includes(currentLab.id) : false,
        labTitles: (pack.labs || [])
          .map((labId) => labs.find((lab) => lab.id === labId)?.title)
          .filter(Boolean),
      })),
      (item) => `
        <article class="study-card compact-card ${item.recommended ? "recommended" : ""}">
          <span class="status-badge ${item.recommended ? "status-done" : escapeHtml(item.status_class)}">${escapeHtml(item.recommended ? "Pack sugerido" : item.badge)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.description)}</p>
          <ul class="summary-list">
            ${(item.labTitles || []).map((title) => `<li>${escapeHtml(title)}</li>`).join("")}
          </ul>
          ${renderButtonList(item.buttons || [])}
        </article>
      `,
    );
  }

  function renderSummary(filteredLabs, preferences) {
    const currentLab = resolveActiveLab(filteredLabs);

    renderCards(
      "labs-summary",
      [
        {
          label: "Labs visiveis",
          value: String(filteredLabs.length),
          note: "Desafios que combinam com os filtros atuais.",
        },
        {
          label: "Dominio atual",
          value: getFilterLabel(filterMeta.domains, preferences.domain),
          note: "Tema principal selecionado para a sessao.",
        },
        {
          label: "Tempo de hoje",
          value: getFilterLabel(filterMeta.timeboxes, preferences.timebox),
          note: "Faixa de tempo usada para montar o proximo desafio.",
        },
        {
          label: "Objetivo",
          value: getFilterLabel(filterMeta.objectives, preferences.objective),
          note: "Tipo de ganho que a sessao deve entregar.",
        },
      ],
      (item) => `
        <article class="metric-card">
          <span class="label">${escapeHtml(item.label)}</span>
          <p class="metric-value">${escapeHtml(item.value)}</p>
          <p class="metric-note">${escapeHtml(item.note)}</p>
        </article>
      `,
    );

    if (storyTitle) {
      storyTitle.textContent = currentLab
        ? `Comece por ${currentLab.title}`
        : "Nenhum lab bate com o filtro atual";
    }

    if (storyCopy) {
      storyCopy.textContent = currentLab
        ? `${currentLab.summary} O melhor movimento agora e executar a missao, registrar as evidencias e depois voltar para Progresso ou Roadmap.`
        : "Relaxe um dos filtros para voltar a ter desafios recomendados nesta rota.";
    }

    renderPacks(currentLab);
  }

  function renderBoard(filteredLabs) {
    renderCards(
      "labs-board",
      filteredLabs,
      (lab) => `
        <article class="workflow-card progress-unit-card ${lab.id === activeLabId ? "active" : ""}">
          <span class="status-badge ${escapeHtml(lab.status_class)}">${escapeHtml(lab.badge)}</span>
          <h3>${escapeHtml(lab.title)}</h3>
          <p class="card-copy">${escapeHtml(lab.summary)}</p>
          <ul class="summary-list">
            <li><strong>Dominio:</strong> ${escapeHtml(lab.domain_label)}</li>
            <li><strong>Nivel:</strong> ${escapeHtml(lab.difficulty_label)}</li>
            <li><strong>Tempo:</strong> ${escapeHtml(lab.time_label)}</li>
          </ul>
          ${renderTagList(lab.tags || [])}
          <div class="button-group">
            <button class="button secondary" type="button" data-lab-focus="${escapeHtml(lab.id)}">Focar lab</button>
          </div>
        </article>
      `,
    );
  }

  function renderFocus(filteredLabs) {
    if (!focusPanel) {
      return;
    }

    const currentLab = resolveActiveLab(filteredLabs);
    if (!currentLab) {
      focusPanel.innerHTML = '<div class="empty-note">Nenhum lab disponivel para esta combinacao de filtros.</div>';
      setQueryParam("lab", "all");
      renderPacks(null);
      return;
    }

    activeLabId = currentLab.id;
    setQueryParam("lab", activeLabId);
    persistResumePatch({
      study: {
        page_id: "labs",
        href: `/labs/?domain=${encodeURIComponent(currentLab.domain)}&lab=${encodeURIComponent(currentLab.id)}`,
        label: "Labs",
        summary: currentLab.summary,
        unit_id: currentLab.id,
        unit_title: currentLab.title,
        cue: `Execute o lab ${currentLab.title} e volte com evidencia concreta antes de abrir outro tema.`,
      },
    });

    const buttons = [
      ...(currentLab.buttons || []),
      ...buildSourceButtons(sourceLookup, currentLab.source_ids, 3),
    ];

    focusPanel.innerHTML = `
      <div class="adaptive-unit-header">
        <div>
          <span class="status-badge ${escapeHtml(currentLab.status_class)}">${escapeHtml(currentLab.badge)}</span>
          <h3>${escapeHtml(currentLab.title)}</h3>
          <p class="card-copy">${escapeHtml(currentLab.summary)}</p>
        </div>
        <div class="adaptive-unit-metrics">
          <article>
            <span class="label">Dominio</span>
            <strong>${escapeHtml(currentLab.domain_label)}</strong>
          </article>
          <article>
            <span class="label">Nivel</span>
            <strong>${escapeHtml(currentLab.difficulty_label)}</strong>
          </article>
          <article>
            <span class="label">Tempo</span>
            <strong>${escapeHtml(currentLab.time_label)}</strong>
          </article>
        </div>
      </div>
      <div class="adaptive-unit-grid">
        <section class="adaptive-unit-section">
          <span class="eyebrow">Missao</span>
          <p>${escapeHtml(currentLab.mission)}</p>
        </section>
        <section class="adaptive-unit-section">
          <span class="eyebrow">Contexto</span>
          <p>${escapeHtml(currentLab.scenario)}</p>
        </section>
      </div>
      <section class="adaptive-unit-section">
        <span class="eyebrow">Entregaveis</span>
        <ul class="summary-list">
          ${(currentLab.deliverables || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
      <section class="adaptive-unit-section">
        <span class="eyebrow">Criterio de conclusao</span>
        <ul class="summary-list">
          ${(currentLab.completion_criteria || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
      <section class="adaptive-unit-section">
        <span class="eyebrow">Falhas comuns</span>
        <ul class="summary-list">
          ${(currentLab.common_failures || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
      ${renderTagList(currentLab.tags || [])}
      <div class="button-group">
        ${buildFlagToggleButton("lab", {
          id: currentLab.id,
          title: currentLab.title,
          summary: currentLab.summary,
          href: `/labs/?domain=${encodeURIComponent(currentLab.domain)}&lab=${encodeURIComponent(currentLab.id)}`,
          route_label: "Labs",
          domain: currentLab.domain,
        })}
      </div>
      ${renderButtonList(buttons)}
    `;

    renderPacks(currentLab);
    renderMissionControlSurface("labs", buildLearningMissionSnapshot(null, []));
  }

  function syncLabs(message = "") {
    const preferences = readPreferences();
    persistLabsPreferences(preferences);
    trackStudyAnalyticsEvent("labs_filters", {
      page_id: "labs",
      preferences,
    });
    setQueryParam("domain", preferences.domain);
    setQueryParam("difficulty", preferences.difficulty);
    setQueryParam("timebox", preferences.timebox);
    setQueryParam("objective", preferences.objective);

    const filteredLabs = buildFilteredLabs(preferences);

    if (!filteredLabs.some((lab) => lab.id === activeLabId)) {
      activeLabId = filteredLabs[0]?.id || null;
    }

    renderSummary(filteredLabs, preferences);
    renderBoard(filteredLabs);
    renderFocus(filteredLabs);

    if (feedback) {
      feedback.textContent =
        message || `${filteredLabs.length} labs combinam com os filtros atuais.`;
    }
  }

  const savedPreferences = loadLabsPreferences(defaults);
  applyPreferences(savedPreferences);

  if (pageContent && pageContent.dataset.labsBound !== "true") {
    pageContent.addEventListener("click", (event) => {
      const flagButton = event.target.closest("[data-flag-toggle]");
      if (flagButton) {
        const result = toggleStudyFlag(flagButton.getAttribute("data-flag-toggle"), {
          id: flagButton.getAttribute("data-flag-id"),
          title: flagButton.getAttribute("data-flag-title"),
          summary: flagButton.getAttribute("data-flag-summary"),
          href: flagButton.getAttribute("data-flag-href"),
          route_label: flagButton.getAttribute("data-flag-route-label"),
          domain: flagButton.getAttribute("data-flag-domain"),
        });
        trackStudyAnalyticsEvent("flag_toggle", {
          page_id: "labs",
          state: result.active ? "open" : "closed",
        });
        syncLabs(result.active ? "Flag adicionada ao lab." : "Flag removida do lab.");
        return;
      }

      const target = event.target.closest("[data-lab-focus]");
      if (!target) {
        return;
      }

      activeLabId = target.getAttribute("data-lab-focus");
      const trackedLab = labs.find((lab) => lab.id === activeLabId);
      if (trackedLab) {
        trackStudyAnalyticsEvent("lab_focus", {
          page_id: "labs",
          lab_id: trackedLab.id,
          title: trackedLab.title,
          domain: trackedLab.domain,
        });
      }
      syncLabs("Lab em foco atualizado.");
    });

    pageContent.dataset.labsBound = "true";
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    syncLabs("Selecao de labs atualizada.");
  });

  [domainSelect, difficultySelect, timeboxSelect, objectiveSelect].forEach((element) => {
    element?.addEventListener("change", () => syncLabs("Filtro atualizado."));
  });

  const resetButton = document.getElementById("labs-reset");
  resetButton?.addEventListener("click", () => {
    applyPreferences(defaults);
    activeLabId = null;
    syncLabs("Filtros restaurados.");
  });

  syncLabs();
}

function renderSenior(seniorGuide) {
  renderCards(
    "senior-orientation",
    seniorGuide.orientation || [],
    (item) => `
      <article class="metric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="metric-value">${escapeHtml(item.body)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  const studySteps = document.getElementById("senior-study-steps");
  if (studySteps) {
    studySteps.innerHTML = (seniorGuide.study_steps || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  renderCards(
    "senior-pillars",
    seniorGuide.pillars || [],
    (item) => `
      <article class="artifact-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          ${(item.points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );

  renderCards(
    "senior-evals-cards",
    seniorGuide.evals_cards || [],
    (item) => `
      <article class="workflow-card">
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          ${(item.points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );

  const evalsRules = document.getElementById("senior-evals-rules");
  if (evalsRules) {
    evalsRules.innerHTML = (seniorGuide.evals_rules || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  renderCards(
    "senior-memory-cards",
    seniorGuide.memory_cards || [],
    (item) => `
      <article class="workflow-card">
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          ${(item.points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );

  const memoryRules = document.getElementById("senior-memory-rules");
  if (memoryRules) {
    memoryRules.innerHTML = (seniorGuide.memory_rules || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  renderCards(
    "senior-agents-cards",
    seniorGuide.agents_cards || [],
    (item) => `
      <article class="workflow-card">
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          ${(item.points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );

  const agentsRules = document.getElementById("senior-agents-rules");
  if (agentsRules) {
    agentsRules.innerHTML = (seniorGuide.agents_rules || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  renderCards(
    "senior-production-cards",
    seniorGuide.production_cards || [],
    (item) => `
      <article class="workflow-card">
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          ${(item.points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );

  const productionRules = document.getElementById("senior-production-rules");
  if (productionRules) {
    productionRules.innerHTML = (seniorGuide.production_rules || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  renderCards(
    "senior-mastery",
    seniorGuide.mastery || [],
    (item) => `
      <article class="phase-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="timeline-copy">${escapeHtml(item.description)}</p>
      </article>
    `,
  );

  renderCards(
    "senior-route-sequence",
    seniorGuide.route_sequence || [],
    (item) => `
      <article class="artifact-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );
}

function roundToHalf(value) {
  return Math.round(Number(value) * 2) / 2;
}

function normalizeWeightMap(weightMap, floor = 0) {
  const entries = Object.entries(weightMap || {}).map(([key, value]) => [
    key,
    Math.max(Number(value) || 0, floor),
  ]);

  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  if (!total) {
    return Object.fromEntries(entries.map(([key]) => [key, 0]));
  }

  return Object.fromEntries(entries.map(([key, value]) => [key, value / total]));
}

function resolveSessionProfile(hoursPerDay, adaptivePathRules) {
  const profiles = Array.isArray(adaptivePathRules?.session_profiles) ? adaptivePathRules.session_profiles : [];
  return (
    profiles.find((item) => Number(hoursPerDay) <= Number(item.max_hours_per_day)) ||
    profiles[profiles.length - 1] ||
    null
  );
}

function resolvePaceMessage(calendarDays, adaptivePathRules) {
  const messages = Array.isArray(adaptivePathRules?.pace_messages) ? adaptivePathRules.pace_messages : [];
  return (
    messages.find((item) => Number(calendarDays) <= Number(item.max_calendar_days)) ||
    messages[messages.length - 1] ||
    null
  );
}

function buildAdaptivePlan(studyUnits, learningPathTemplates, adaptivePathRules, vendorSources, preferences) {
  const unitCatalog = Array.isArray(studyUnits?.units) ? studyUnits.units : [];
  const unitMap = new Map(unitCatalog.map((unit) => [unit.id, unit]));
  const templates = Array.isArray(learningPathTemplates?.templates) ? learningPathTemplates.templates : [];
  const focusProfiles = Array.isArray(learningPathTemplates?.focus_profiles)
    ? learningPathTemplates.focus_profiles
    : [];
  const levelProfiles = Array.isArray(learningPathTemplates?.level_profiles)
    ? learningPathTemplates.level_profiles
    : [];
  const domains = Array.isArray(studyUnits?.domains) ? studyUnits.domains : [];
  const sourceLookup = buildSourceLookup(vendorSources);
  const generationRules = adaptivePathRules?.generation_rules || {};

  const template =
    templates.find((item) => item.id === preferences.goal) ||
    templates[0] ||
    {
      id: "fallback",
      label: "Trilha base",
      summary: "Plano base",
      target_hours: 60,
      required_unit_ids: unitCatalog.map((unit) => unit.id),
      stretch_unit_ids: [],
      domain_weights: {},
      outcomes: [],
    };
  const focusProfile =
    focusProfiles.find((item) => item.id === preferences.focus) ||
    focusProfiles[0] ||
    {
      id: "fallback-focus",
      label: "Foco base",
      summary: "",
      hours_delta: 0,
      priority_domains: {},
      highlight_unit_ids: [],
    };
  const levelProfile =
    levelProfiles.find((item) => item.id === preferences.level) ||
    levelProfiles[0] ||
    {
      id: "fallback-level",
      label: "Intermediario",
      summary: "",
      hours_multiplier: 1,
      prepend_unit_ids: [],
      priority_domains: {},
    };

  const orderedUnitIds = uniqueValues([
    ...(levelProfile.prepend_unit_ids || []),
    ...(template.required_unit_ids || []),
    ...(focusProfile.highlight_unit_ids || []),
    ...(template.stretch_unit_ids || []),
  ]).filter((unitId) => unitMap.has(unitId));

  const selectedUnits = orderedUnitIds
    .map((unitId) => unitMap.get(unitId))
    .filter(Boolean)
    .sort((left, right) => Number(left.sequence) - Number(right.sequence));

  const baseDomainWeights = domains.reduce((accumulator, domain) => {
    accumulator[domain.id] = Number(template.domain_weights?.[domain.id] || 0);
    return accumulator;
  }, {});

  Object.entries(focusProfile.priority_domains || {}).forEach(([domainId, value]) => {
    baseDomainWeights[domainId] = Number(baseDomainWeights[domainId] || 0) + Number(value || 0);
  });

  Object.entries(levelProfile.priority_domains || {}).forEach(([domainId, value]) => {
    baseDomainWeights[domainId] = Number(baseDomainWeights[domainId] || 0) + Number(value || 0);
  });

  const domainWeights = normalizeWeightMap(
    baseDomainWeights,
    Number(generationRules.domain_weight_floor || 0.02),
  );

  const targetHours = Math.max(
    24,
    Math.round((Number(template.target_hours || 60) + Number(focusProfile.hours_delta || 0)) * Number(levelProfile.hours_multiplier || 1)),
  );

  const minimumUnitHours = Number(generationRules.minimum_unit_hours || 1.5);
  const weightedUnits = selectedUnits.map((unit) => {
    const domainWeight = Number(domainWeights[unit.domain] || 0);
    const focusBoost = (unit.focus_tags || []).includes(focusProfile.id) ? 0.18 : 0;
    const goalBoost = (unit.goal_tags || []).includes(template.id) ? 0.08 : 0;
    const weightedBase = Number(unit.base_hours || 1) * (1 + domainWeight * 1.8 + focusBoost + goalBoost);

    return {
      ...unit,
      weighted_base_hours: weightedBase,
    };
  });

  const weightedBaseTotal = weightedUnits.reduce((sum, unit) => sum + Number(unit.weighted_base_hours || 0), 0) || 1;
  const scaledUnits = weightedUnits.map((unit) => ({
    ...unit,
    allocated_hours: Math.max(
      minimumUnitHours,
      roundToHalf((Number(unit.weighted_base_hours || 0) / weightedBaseTotal) * targetHours),
    ),
  }));

  const totalHours = roundToHalf(
    scaledUnits.reduce((sum, unit) => sum + Number(unit.allocated_hours || 0), 0),
  );
  const hoursPerDay = Math.max(1, Number(preferences.hours_per_day || adaptivePathRules?.defaults?.hours_per_day || 3));
  const daysPerWeek = Math.max(1, Number(preferences.days_per_week || adaptivePathRules?.defaults?.days_per_week || 5));
  const weeklyHours = roundToHalf(hoursPerDay * daysPerWeek);
  const sessionProfile = resolveSessionProfile(hoursPerDay, adaptivePathRules);

  const sessions = [];
  scaledUnits.forEach((unit) => {
    let remainingHours = Number(unit.allocated_hours || 0);
    let part = 1;

    while (remainingHours > 0.01) {
      const plannedHours = Math.min(hoursPerDay, remainingHours);
      const roundedHours = Math.min(remainingHours, Math.max(0.5, roundToHalf(plannedHours)));
      sessions.push({
        unit_id: unit.id,
        unit_title: unit.title,
        portal_href: unit.portal_href,
        portal_label: unit.portal_label,
        hours: roundToHalf(roundedHours),
        sequence: unit.sequence,
        deliverable: unit.deliverable,
        exercise: unit.exercise,
        mastery: unit.mastery,
        official_resource_ids: unit.official_resource_ids || [],
        part,
      });

      remainingHours = roundToHalf(remainingHours - roundedHours);
      part += 1;
    }
  });

  sessions.forEach((session, index) => {
    const weekNumber = Math.floor(index / daysPerWeek) + 1;
    const dayOfWeek = index % daysPerWeek;
    const calendarDay = (weekNumber - 1) * 7 + dayOfWeek + 1;
    session.study_session = index + 1;
    session.week_number = weekNumber;
    session.calendar_day = calendarDay;
  });

  const totalStudySessions = sessions.length;
  const fullWeeks = Math.floor((Math.max(totalStudySessions, 1) - 1) / daysPerWeek);
  const trailingStudyDays = (Math.max(totalStudySessions, 1) - 1) % daysPerWeek;
  const totalCalendarDays = fullWeeks * 7 + trailingStudyDays + 1;
  const totalWeeks = Math.max(1, Math.ceil(totalStudySessions / daysPerWeek));
  const paceMessage = resolvePaceMessage(totalCalendarDays, adaptivePathRules);

  const weeks = Array.from({ length: totalWeeks }, (_, index) => index + 1).map((weekNumber) => {
    const weekSessions = sessions.filter((session) => session.week_number === weekNumber);
    const firstSession = weekSessions[0];
    const lastSession = weekSessions[weekSessions.length - 1];
    const resourceIds = uniqueValues(weekSessions.flatMap((session) => session.official_resource_ids || []));

    return {
      week_number: weekNumber,
      calendar_label: `Dias ${firstSession?.calendar_day || 1} a ${lastSession?.calendar_day || 1}`,
      hours: roundToHalf(weekSessions.reduce((sum, session) => sum + Number(session.hours || 0), 0)),
      session_count: weekSessions.length,
      units: uniqueValues(weekSessions.map((session) => session.unit_title)),
      deliverables: uniqueValues(weekSessions.map((session) => session.deliverable)).slice(0, 3),
      primary_href: firstSession?.portal_href || "/",
      primary_label: firstSession?.portal_label || "Abrir rota",
      source_buttons: buildSourceButtons(sourceLookup, resourceIds, 2),
    };
  });

  const firstSession = sessions[0] || null;
  const nextDistinctSession =
    sessions.find((session) => session.unit_id !== firstSession?.unit_id) || sessions[1] || null;
  const domainMix = domains
    .map((domain) => ({
      ...domain,
      weight: Number(domainWeights[domain.id] || 0),
    }))
    .sort((left, right) => right.weight - left.weight);

  const materialCards = uniqueValues(
    scaledUnits.flatMap((unit) => unit.official_resource_ids || []),
  )
    .map((sourceId) => sourceLookup.get(sourceId))
    .filter(Boolean)
    .slice(0, Number(generationRules.resource_limit || 8))
    .map((source) => ({
      vendor: source.vendor,
      title: source.title,
      summary: source.scope,
      buttons: [
        {
          label: source.short_label || "Fonte oficial",
          href: source.url,
          variant: "secondary",
        },
      ],
    }));

  return {
    preferences,
    template,
    focusProfile,
    levelProfile,
    targetHours,
    totalHours,
    weeklyHours,
    totalStudySessions,
    totalWeeks,
    totalCalendarDays,
    sessionProfile,
    paceMessage,
    domainMix,
    scaledUnits,
    sessions,
    weeks,
    firstSession,
    nextDistinctSession,
    materialCards,
  };
}

function renderAdaptiveDomainMix(plan) {
  const container = document.getElementById("trilha-domain-mix");
  if (!container) {
    return;
  }

  container.innerHTML = (plan.domainMix || [])
    .map(
      (domain) => `
        <article class="adaptive-domain-row">
          <div class="adaptive-domain-header">
            <div>
              <strong>${escapeHtml(domain.label)}</strong>
              <p class="metric-note">${escapeHtml(domain.summary)}</p>
            </div>
            <span>${formatPercent(domain.weight)}</span>
          </div>
          <div class="adaptive-domain-track">
            <span class="adaptive-domain-fill" style="width:${Math.max(6, Math.round(domain.weight * 100))}%"></span>
          </div>
        </article>
      `,
    )
      .join("");
}

function fillSelectOptions(element, options, valueKey = "value", labelKey = "label") {
  if (!element) {
    return;
  }

  element.innerHTML = (options || [])
    .map(
      (option) => `
        <option value="${escapeHtml(option[valueKey])}">${escapeHtml(option[labelKey])}</option>
      `,
    )
    .join("");
}

function buildProgressStatusLookup(progressGuide) {
  const entries = Array.isArray(progressGuide?.status_model) ? progressGuide.status_model : [];
  return new Map(
    entries.map((item) => [
      item.id,
      {
        ...item,
        weight: Number(item.weight || 0),
      },
    ]),
  );
}

function getProgressRecord(progressState, unitId, fallbackStatus = "not_started") {
  const record = progressState?.units?.[unitId];
  return {
    status: record?.status || fallbackStatus,
    updated_on: record?.updated_on || progressState?.started_on || todayIsoDate(),
  };
}

function updateProgressRecord(progressState, unitId, statusId) {
  const now = todayIsoDate();
  return {
    ...progressState,
    started_on: progressState?.started_on || now,
    updated_on: now,
    units: {
      ...(progressState?.units || {}),
      [unitId]: {
        status: statusId,
        updated_on: now,
      },
    },
  };
}

function buildFilteredStudyUnits(studyUnits, includedUnitIds) {
  const includeSet = new Set(includedUnitIds || []);
  return {
    ...studyUnits,
    units: (studyUnits?.units || []).filter((unit) => includeSet.has(unit.id)),
  };
}

function resolveProgressPace(ratio) {
  if (ratio >= 1.05) {
    return {
      status_class: "status-done",
      title: "Ritmo acima do esperado",
      summary: "Voce esta adiantado em relacao ao plano atual. Vale puxar comparativos reais, capstone ou camada senior mais cedo.",
    };
  }

  if (ratio >= 0.75) {
    return {
      status_class: "status-in-progress",
      title: "Ritmo sustentavel",
      summary: "O plano continua coerente com a sua disponibilidade. Priorize checkpoints antes de aumentar escopo.",
    };
  }

  return {
    status_class: "status-next",
    title: "Ritmo abaixo do planejado",
    summary: "O estudo continua viavel, mas o restante da trilha pede replanejamento, corte de foco ou aumento de consistencia semanal.",
  };
}

function buildProgressSnapshot(
  progressGuide,
  studyUnits,
  learningPathTemplates,
  adaptivePathRules,
  vendorSources,
  preferences,
  progressState,
) {
  const basePlan = buildAdaptivePlan(
    studyUnits,
    learningPathTemplates,
    adaptivePathRules,
    vendorSources,
    preferences,
  );
  const statusLookup = buildProgressStatusLookup(progressGuide);
  const defaultStatus = statusLookup.get("not_started") || {
    id: "not_started",
    label: "Nao iniciado",
    status_class: "status-next",
    summary: "",
    weight: 0,
  };

  const planUnits = (basePlan.scaledUnits || []).map((unit) => {
    const record = getProgressRecord(progressState, unit.id, defaultStatus.id);
    const status = statusLookup.get(record.status) || defaultStatus;
    const unitSessions = (basePlan.sessions || []).filter((session) => session.unit_id === unit.id);
    const firstSession = unitSessions[0] || null;
    const lastSession = unitSessions[unitSessions.length - 1] || null;

    return {
      ...unit,
      progress_record: record,
      progress_status: status,
      session_count: unitSessions.length,
      first_session: firstSession,
      last_session: lastSession,
      equivalent_hours: roundToHalf(Number(unit.allocated_hours || 0) * Number(status.weight || 0)),
    };
  });

  const totalUnits = planUnits.length;
  const masteredUnits = planUnits.filter((unit) => unit.progress_status.id === "mastered");
  const checkpointUnits = planUnits.filter((unit) => ["checkpoint", "blocked"].includes(unit.progress_status.id));
  const inProgressUnits = planUnits.filter((unit) => unit.progress_status.id === "in_progress");
  const blockedUnits = planUnits.filter((unit) => unit.progress_status.id === "blocked");
  const remainingUnits = planUnits.filter((unit) => unit.progress_status.id !== "mastered");
  const completedEquivalentHours = roundToHalf(
    planUnits.reduce((sum, unit) => sum + Number(unit.equivalent_hours || 0), 0),
  );
  const elapsedCalendarDays = diffCalendarDays(progressState?.started_on || todayIsoDate()) + 1;
  const expectedEquivalentHours = Math.min(
    Number(basePlan.totalHours || 0),
    roundToHalf((elapsedCalendarDays / 7) * Number(basePlan.weeklyHours || 0)),
  );
  const paceRatio = expectedEquivalentHours > 0 ? completedEquivalentHours / expectedEquivalentHours : 1;
  const pace = resolveProgressPace(paceRatio);
  const coverageRatio = totalUnits > 0 ? masteredUnits.length / totalUnits : 0;
  const nextPriorityUnit = remainingUnits[0] || null;
  const nextCheckpointUnit = checkpointUnits[0] || inProgressUnits[0] || nextPriorityUnit;
  const remainingPlan =
    remainingUnits.length > 0
      ? buildAdaptivePlan(
          buildFilteredStudyUnits(
            studyUnits,
            remainingUnits.map((unit) => unit.id),
          ),
          learningPathTemplates,
          adaptivePathRules,
          vendorSources,
          preferences,
        )
      : null;
  const milestones = (progressGuide?.milestones || []).map((milestone) => ({
    ...milestone,
    unlocked: coverageRatio >= Number(milestone.threshold || 0),
  }));

  return {
    preferences,
    basePlan,
    planUnits,
    totalUnits,
    masteredUnits,
    checkpointUnits,
    inProgressUnits,
    blockedUnits,
    remainingUnits,
    completedEquivalentHours,
    expectedEquivalentHours,
    elapsedCalendarDays,
    paceRatio,
    pace,
    coverageRatio,
    remainingPlan,
    nextPriorityUnit,
    nextCheckpointUnit,
    milestones,
  };
}

function sumNumericValues(object) {
  return Object.values(object || {}).reduce((sum, value) => sum + Number(value || 0), 0);
}

function buildStudyDomainLookup(studyUnits) {
  return new Map(
    (studyUnits?.domains || []).map((domain) => [
      domain.id,
      {
        id: domain.id,
        label: domain.label,
        summary: domain.summary,
      },
    ]),
  );
}

function buildDomainProgressMap(progressSnapshot, studyUnits) {
  const lookup = buildStudyDomainLookup(studyUnits);
  const map = new Map();

  (progressSnapshot?.planUnits || []).forEach((unit) => {
    const meta = lookup.get(unit.domain) || {
      id: unit.domain,
      label: titleCase(unit.domain || "dominio"),
      summary: "",
    };
    const current = map.get(unit.domain) || {
      id: meta.id,
      label: meta.label,
      summary: meta.summary,
      total_units: 0,
      mastered_units: 0,
      in_progress_units: 0,
      checkpoint_units: 0,
      blocked_units: 0,
      allocated_hours: 0,
      equivalent_hours: 0,
    };

    current.total_units += 1;
    current.allocated_hours += Number(unit.allocated_hours || 0);
    current.equivalent_hours += Number(unit.equivalent_hours || 0);

    if (unit.progress_status?.id === "mastered") {
      current.mastered_units += 1;
    }
    if (unit.progress_status?.id === "in_progress") {
      current.in_progress_units += 1;
    }
    if (unit.progress_status?.id === "checkpoint") {
      current.checkpoint_units += 1;
    }
    if (unit.progress_status?.id === "blocked") {
      current.blocked_units += 1;
    }

    map.set(unit.domain, current);
  });

  return map;
}

function resolveRouteEngagementStatus(route, thresholds) {
  if (
    route.active_minutes >= thresholds.strong_minutes ||
    route.views >= thresholds.high_view_count ||
    route.interactions >= thresholds.strong_interactions ||
    route.traction_score >= 18
  ) {
    return {
      status_class: "status-done",
      label: "Tracao forte",
      interpretation: "Esta rota esta realmente puxando o estudo e nao so aparecendo aberta por acaso.",
    };
  }

  if (route.active_minutes >= thresholds.warming_minutes || route.views > 0 || route.interactions > 0) {
    return {
      status_class: "status-in-progress",
      label: "Tracao em formacao",
      interpretation: "Ja existe uso real, mas ainda vale decidir se isso esta virando criterio ou so exploracao.",
    };
  }

  return {
    status_class: "status-next",
    label: "Tracao fria",
    interpretation: "Esta rota ainda nao virou habito no seu fluxo local e pode estar faltando para equilibrar o estudo.",
  };
}

function buildRouteAnalytics(routeProfiles, analyticsState, progressByDomain, focusDomains) {
  return (routeProfiles || []).map((route) => {
    const views = Number(analyticsState.page_views?.[route.id] || 0);
    const activeMinutes = roundToHalf(Number(analyticsState.active_ms_by_page?.[route.id] || 0) / 60000);
    const interactions = Number(analyticsState.route_interactions?.[route.id] || 0);
    const ctaTargets = Number(analyticsState.cta_targets?.[route.id] || 0);
    const relevantProgressEntries = (route.domains || [])
      .map((domainId) => progressByDomain.get(domainId))
      .filter(Boolean);
    const coverageRatio =
      relevantProgressEntries.length > 0
        ? relevantProgressEntries.reduce(
            (sum, entry) => sum + entry.mastered_units / Math.max(1, entry.total_units),
            0,
          ) / relevantProgressEntries.length
        : 0;
    const tractionScore = views * 1.9 + activeMinutes * 0.42 + interactions * 1.35 + ctaTargets * 0.9;
    const advanceSignal = tractionScore * (0.65 + coverageRatio * 1.45);
    const focusCritical = (route.domains || []).some((domainId) => focusDomains.includes(domainId));

    return {
      ...route,
      views,
      active_minutes: activeMinutes,
      interactions,
      cta_targets: ctaTargets,
      traction_score: Number(tractionScore.toFixed(2)),
      advance_signal: Number(advanceSignal.toFixed(2)),
      coverage_ratio: coverageRatio,
      focus_critical: focusCritical,
    };
  });
}

function buildAnalyticsLabLookup(labsGuide) {
  return new Map((labsGuide?.labs || []).map((lab) => [lab.id, lab]));
}

function buildLabDomainReverseMap(analyticsRules) {
  const reverse = new Map();
  Object.entries(analyticsRules?.unit_domain_to_lab_domain || {}).forEach(([unitDomain, labDomain]) => {
    if (!reverse.has(labDomain)) {
      reverse.set(labDomain, []);
    }
    reverse.get(labDomain).push(unitDomain);
  });
  return reverse;
}

function resolveDomainAnalyticsStatus(domainInsight, focusDomains) {
  if (domainInsight.engagement_score >= 16 && domainInsight.mastery_ratio >= 0.35) {
    return {
      status_class: "status-done",
      label: "Movendo o ponteiro",
      interpretation: "Leitura, pratica e progresso ja estao andando juntos neste dominio.",
    };
  }

  if (domainInsight.engagement_score >= 12 && domainInsight.mastery_ratio < 0.2) {
    return {
      status_class: "status-in-progress",
      label: "Muita tracao, pouca prova",
      interpretation: "Voce esta investindo energia aqui, mas a conversao em evidencia e dominio ainda pode melhorar.",
    };
  }

  if (focusDomains.includes(domainInsight.id) && domainInsight.engagement_score < 8) {
    return {
      status_class: "status-next",
      label: "Subinvestido para o foco atual",
      interpretation: "Este dominio deveria aparecer mais forte pelo foco salvo da Trilha.",
    };
  }

  return {
    status_class: "status-in-progress",
    label: "Tracao moderada",
    interpretation: "Ja existe sinal local, mas ainda cabe reforcar consistencia ou prova pratica.",
  };
}

function buildDomainAnalytics(progressSnapshot, studyUnits, analyticsState, analyticsRules, routeInsights, labsGuide, focusDomains) {
  const progressByDomain = buildDomainProgressMap(progressSnapshot, studyUnits);
  const labReverseMap = buildLabDomainReverseMap(analyticsRules);
  const routeGroups = new Map();

  routeInsights.forEach((route) => {
    (route.domains || []).forEach((domainId) => {
      if (!routeGroups.has(domainId)) {
        routeGroups.set(domainId, []);
      }
      routeGroups.get(domainId).push(route);
    });
  });

  const relevantDomainIds = new Set([...progressByDomain.keys(), ...focusDomains]);
  return [...relevantDomainIds]
    .map((domainId) => {
      const progressEntry =
        progressByDomain.get(domainId) || {
          id: domainId,
          label: titleCase(domainId),
          summary: "",
          total_units: 0,
          mastered_units: 0,
          in_progress_units: 0,
          checkpoint_units: 0,
          blocked_units: 0,
          allocated_hours: 0,
          equivalent_hours: 0,
        };
      const matchingRoutes = routeGroups.get(domainId) || [];
      const routeMinutes = matchingRoutes.reduce((sum, route) => sum + Number(route.active_minutes || 0), 0);
      const routeViews = matchingRoutes.reduce((sum, route) => sum + Number(route.views || 0), 0);
      const routeInteractions = matchingRoutes.reduce((sum, route) => sum + Number(route.interactions || 0), 0);
      const mappedLabDomain = analyticsRules?.unit_domain_to_lab_domain?.[domainId] || null;
      const labFocusCount = Number(
        mappedLabDomain ? analyticsState.labs?.domain_counts?.[mappedLabDomain] || 0 : 0,
      );
      const attributedProgress = Number(
        mappedLabDomain ? analyticsState.progress?.attributed_domains?.[mappedLabDomain] || 0 : 0,
      );
      const unitFocusCount = Number(analyticsState.units?.domain_counts?.[domainId] || 0);
      const masteryRatio = progressEntry.mastered_units / Math.max(1, progressEntry.total_units || 0);
      const engagementScore =
        routeMinutes * 0.45 +
        routeViews * 1.6 +
        routeInteractions * 1.2 +
        labFocusCount * 2.1 +
        unitFocusCount * 1.4 +
        attributedProgress * 2.4;
      const bestRoute =
        matchingRoutes.slice().sort((left, right) => right.traction_score - left.traction_score)[0] || null;
      const recommendedLab = (labsGuide?.labs || []).find((lab) => {
        const mappedDomains = labReverseMap.get(lab.domain) || [];
        return mappedDomains.includes(domainId);
      });
      const insight = {
        ...progressEntry,
        route_minutes: routeMinutes,
        route_views: routeViews,
        route_interactions: routeInteractions,
        lab_focus_count: labFocusCount,
        attributed_progress: attributedProgress,
        unit_focus_count: unitFocusCount,
        mastery_ratio: masteryRatio,
        engagement_score: Number(engagementScore.toFixed(2)),
        best_route: bestRoute,
        recommended_lab: recommendedLab,
      };
      return {
        ...insight,
        status: resolveDomainAnalyticsStatus(insight, focusDomains),
      };
    })
    .sort((left, right) => right.engagement_score - left.engagement_score);
}

function resolveLabSuggestionTimebox(preferences) {
  if (Number(preferences?.hours_per_day || 0) <= 1) {
    return "quick";
  }

  if (Number(preferences?.hours_per_day || 0) <= 3) {
    return "session";
  }

  return "deep";
}

function selectRecommendedLab(labsGuide, analyticsRules, preferences, progressSnapshot, analyticsState, missionContext = {}) {
  const focusDomains = analyticsRules?.focus_domain_map?.[preferences.focus] || [];
  const primaryUnitDomain = missionContext.unit?.domain || progressSnapshot?.nextPriorityUnit?.domain || focusDomains[0];
  const preferredLabDomain = analyticsRules?.unit_domain_to_lab_domain?.[primaryUnitDomain] || null;
  const preferredTimebox = resolveLabSuggestionTimebox(preferences);
  const preferredObjective =
    missionContext.objective ||
    (preferredLabDomain === "models"
      ? "criteria"
      : preferredLabDomain === "rag"
        ? "knowledge"
        : preferredLabDomain === "workflows"
          ? "operation"
          : preferredLabDomain === "senior"
            ? "senior"
            : "criteria");

  return (labsGuide?.labs || [])
    .map((lab) => {
      let score = 0;
      if (lab.domain === preferredLabDomain) {
        score += 6;
      }
      if (lab.timebox === preferredTimebox) {
        score += 2.5;
      }
      if (lab.objective === preferredObjective) {
        score += 2;
      }
      score += Number(analyticsState.progress?.attributed_labs?.[lab.id] || 0) * 1.5;
      score += Number(analyticsState.labs?.focus_counts?.[lab.id] || 0) * 0.4;
      if (missionContext.force_domain && lab.domain === missionContext.force_domain) {
        score += 3;
      }

      return {
        ...lab,
        recommendation_score: Number(score.toFixed(2)),
      };
    })
    .sort((left, right) => right.recommendation_score - left.recommendation_score)[0] || null;
}

function buildAnalyticsMission(analyticsRules, preferences, progressSnapshot, routeInsights, domainInsights, labsGuide, analyticsState) {
  const templates = analyticsRules?.mission_templates || {};
  const totalViews = sumNumericValues(analyticsState.page_views);
  const totalActiveMinutes = roundToHalf(sumNumericValues(analyticsState.active_ms_by_page) / 60000);
  const labsFocusTotal = sumNumericValues(analyticsState.labs?.focus_counts);
  const focusDomains = analyticsRules?.focus_domain_map?.[preferences.focus] || [];
  const focusGap = domainInsights.find(
    (domain) => focusDomains.includes(domain.id) && domain.status.status_class === "status-next",
  );
  const strongestDomain = domainInsights[0] || null;
  const strongestRoute = routeInsights.slice().sort((left, right) => right.advance_signal - left.advance_signal)[0] || null;
  const checkpointUnit = progressSnapshot.nextCheckpointUnit || progressSnapshot.nextPriorityUnit || null;
  let templateKey = "continuity";

  if (progressSnapshot.blockedUnits.length > 0 || progressSnapshot.checkpointUnits.length >= 2) {
    templateKey = "checkpoint_recovery";
  } else if (totalViews < 5 || totalActiveMinutes < 18) {
    templateKey = "baseline";
  } else if (labsFocusTotal < 2) {
    templateKey = "prove_with_lab";
  } else if (focusGap) {
    templateKey = "focus_rebalance";
  } else if (progressSnapshot.coverageRatio >= 0.42 && progressSnapshot.paceRatio >= 0.9) {
    templateKey = "senior_escalation";
  }

  const template = templates[templateKey] || templates.continuity || {
    badge: "Continuidade",
    title: "Sustentar o proximo bloco",
    summary: "",
    success: "",
  };

  const recommendedLab = selectRecommendedLab(
    labsGuide,
    analyticsRules,
    preferences,
    progressSnapshot,
    analyticsState,
    {
      unit: checkpointUnit,
      force_domain:
        templateKey === "senior_escalation"
          ? "senior"
          : templateKey === "prove_with_lab"
            ? analyticsRules?.unit_domain_to_lab_domain?.[checkpointUnit?.domain || focusDomains[0]]
            : "",
    },
  );

  const labHref = recommendedLab
    ? `/labs/?domain=${encodeURIComponent(recommendedLab.domain)}&difficulty=${encodeURIComponent(
        recommendedLab.difficulty,
      )}&timebox=${encodeURIComponent(recommendedLab.timebox)}&objective=${encodeURIComponent(
        recommendedLab.objective,
      )}&lab=${encodeURIComponent(recommendedLab.id)}`
    : "/labs/";

  const checkpointHref = checkpointUnit?.portal_href || "/progresso/";
  const checkpointLabel = checkpointUnit?.portal_label || "Abrir Progresso";

  let primaryButton = {
    label: "Abrir Trilha",
    href: "/trilha/",
    variant: "primary",
  };
  let secondaryButton = {
    label: "Abrir Labs",
    href: labHref,
    variant: "secondary",
  };
  let whyNow = [];

  switch (templateKey) {
    case "checkpoint_recovery":
      primaryButton = {
        label: "Abrir Progresso",
        href: "/progresso/",
        variant: "primary",
      };
      secondaryButton = {
        label: checkpointLabel,
        href: checkpointHref,
        variant: "secondary",
      };
      whyNow = [
        `${progressSnapshot.checkpointUnits.length} unidade(s) estao em checkpoint e ${progressSnapshot.blockedUnits.length} bloqueada(s).`,
        `O proximo gargalo explicito e ${checkpointUnit?.title || "a unidade ativa"}.`,
        "Abrir mais conteudo agora tende a aumentar dispersao antes de corrigir o essencial.",
      ];
      break;
    case "baseline":
      primaryButton = {
        label: "Abrir Trilha",
        href: "/trilha/",
        variant: "primary",
      };
      secondaryButton = {
        label: "Abrir Guia",
        href: "/guia/",
        variant: "secondary",
      };
      whyNow = [
        `Seu historico local ainda mostra ${totalViews} abertura(s) de rota e ${formatNumber(totalActiveMinutes, 1)} minuto(s) ativos.`,
        "O melhor retorno agora e consolidar um baseline forte de plano, tempo e proxima sessao.",
        "Depois disso, a recomendacao consegue ficar mais precisa sem chute.",
      ];
      break;
    case "prove_with_lab":
      primaryButton = {
        label: "Abrir lab recomendado",
        href: labHref,
        variant: "primary",
      };
      secondaryButton = {
        label: checkpointLabel,
        href: checkpointHref,
        variant: "secondary",
      };
      whyNow = [
        `Seu comportamento ja mostra ${formatNumber(totalActiveMinutes, 1)} minuto(s) ativos, mas so ${labsFocusTotal} foco(s) de lab registrados.`,
        "A plataforma esta pedindo uma prova pratica para converter criterio em evidencia.",
        `O lab mais alinhado agora e ${recommendedLab?.title || "o proximo lab filtrado"}.`,
      ];
      break;
    case "focus_rebalance": {
      const focusRoute =
        routeInsights.find((route) => (route.domains || []).includes(focusGap?.id) && route.href !== "/analytics/") ||
        strongestRoute;
      primaryButton = {
        label: `Abrir ${focusRoute?.label || "rota do foco"}`,
        href: focusRoute?.href || checkpointHref,
        variant: "primary",
      };
      secondaryButton = {
        label: "Rever Trilha",
        href: "/trilha/",
        variant: "secondary",
      };
      whyNow = [
        `Seu foco salvo continua sendo ${titleCase(preferences.focus || "foco atual")}.`,
        `${focusGap?.label || "O dominio principal"} esta com tracao abaixo do ideal para este objetivo.`,
        "Reforcar agora evita que o plano declarado e o estudo real sigam caminhos diferentes.",
      ];
      break;
    }
    case "senior_escalation":
      primaryButton = {
        label: "Abrir Senior",
        href: "/senior/",
        variant: "primary",
      };
      secondaryButton = {
        label: recommendedLab?.domain === "senior" ? "Abrir lab senior" : "Abrir Roadmap",
        href: recommendedLab?.domain === "senior" ? labHref : "/roadmap/",
        variant: "secondary",
      };
      whyNow = [
        `A cobertura atual ja chegou a ${formatPercent(progressSnapshot.coverageRatio)} de unidades dominadas.`,
        `O ritmo local esta em ${formatPercent(progressSnapshot.paceRatio)} do esperado para o plano salvo.`,
        "Este e um bom momento para puxar evals, memoria, agents/MCP e producao sem pular o processo.",
      ];
      break;
    default:
      primaryButton = {
        label: checkpointLabel,
        href: checkpointHref,
        variant: "primary",
      };
      secondaryButton = {
        label: recommendedLab ? "Abrir lab alinhado" : "Abrir Labs",
        href: recommendedLab ? labHref : "/labs/",
        variant: "secondary",
      };
      whyNow = [
        `A rota com mais sinal local agora e ${strongestRoute?.label || "a rota ativa"}.`,
        `${strongestDomain?.label || "O dominio principal"} aparece com a melhor combinacao de tracao e progresso no momento.`,
        "A melhor jogada e sustentar o proximo bloco antes de trocar de frente de estudo.",
      ];
      break;
  }

  const suggestedDuration =
    Number(preferences?.hours_per_day || 0) <= 1
      ? "30-45 min"
      : Number(preferences?.hours_per_day || 0) <= 3
        ? "60-90 min"
        : "120-180 min";

  return {
    id: templateKey,
    ...template,
    primary_button: primaryButton,
    secondary_button: secondaryButton,
    why_now: whyNow,
    suggested_duration: suggestedDuration,
    focus_unit: checkpointUnit,
    recommended_lab: recommendedLab,
    strongest_route: strongestRoute,
    strongest_domain: strongestDomain,
  };
}

function buildAnalyticsSnapshot(
  analyticsRules,
  studyUnits,
  learningPathTemplates,
  adaptivePathRules,
  labsGuide,
  progressGuide,
  vendorSources,
) {
  const preferences = loadAdaptivePathPreferences(adaptivePathRules.defaults || {});
  const progressState = loadStudyProgressState();
  const labsPreferences = loadLabsPreferences(labsGuide.defaults || {});
  const analyticsState = loadStudyAnalyticsState();
  const progressSnapshot = buildProgressSnapshot(
    progressGuide,
    studyUnits,
    learningPathTemplates,
    adaptivePathRules,
    vendorSources,
    preferences,
    progressState,
  );
  const focusDomains = analyticsRules?.focus_domain_map?.[preferences.focus] || [];
  const routeInsights = buildRouteAnalytics(
    analyticsRules?.route_profiles || [],
    analyticsState,
    buildDomainProgressMap(progressSnapshot, studyUnits),
    focusDomains,
  ).map((route) => ({
    ...route,
    status: resolveRouteEngagementStatus(route, analyticsRules?.engagement_thresholds || {}),
  }));
  const domainInsights = buildDomainAnalytics(
    progressSnapshot,
    studyUnits,
    analyticsState,
    analyticsRules,
    routeInsights,
    labsGuide,
    focusDomains,
  );
  const mission = buildAnalyticsMission(
    analyticsRules,
    preferences,
    progressSnapshot,
    routeInsights,
    domainInsights,
    labsGuide,
    analyticsState,
  );
  const labLookup = buildAnalyticsLabLookup(labsGuide);
  const topLabs = (labsGuide?.labs || [])
    .map((lab) => {
      const focusCount = Number(analyticsState.labs?.focus_counts?.[lab.id] || 0);
      const attributedProgress = Number(analyticsState.progress?.attributed_labs?.[lab.id] || 0);
      const signalScore = focusCount * 1.4 + attributedProgress * 2.7;
      return {
        ...lab,
        focus_count: focusCount,
        attributed_progress: attributedProgress,
        signal_score: Number(signalScore.toFixed(2)),
      };
    })
    .sort((left, right) => right.signal_score - left.signal_score || right.focus_count - left.focus_count)
    .slice(0, 4);

  return {
    preferences,
    labs_preferences: labsPreferences,
    analytics_state: analyticsState,
    progress_snapshot: progressSnapshot,
    route_insights: routeInsights,
    domain_insights: domainInsights,
    top_labs: topLabs,
    mission,
    totals: {
      total_views: sumNumericValues(analyticsState.page_views),
      total_active_minutes: roundToHalf(sumNumericValues(analyticsState.active_ms_by_page) / 60000),
      total_route_interactions: sumNumericValues(analyticsState.route_interactions),
      total_labs_focused: sumNumericValues(analyticsState.labs?.focus_counts),
      total_progress_updates: sumNumericValues(analyticsState.progress?.unit_updates),
    },
    lab_lookup: labLookup,
  };
}

function buildAnalyticsSessionCards(analyticsGuide, snapshot) {
  const mission = snapshot.mission;
  const baseQuickAction = mission.primary_button;

  return (analyticsGuide?.session_presets || []).map((preset) => {
    let blocks = [];
    let action = baseQuickAction;

    switch (preset.id) {
      case "quick":
        blocks = [
          `Abrir ${mission.primary_button.label.toLowerCase()} e revisar o objetivo da missao.`,
          mission.focus_unit
            ? `Focar ${mission.focus_unit.title} e corrigir o ponto que mais trava o ritmo.`
            : "Revisar o bloco recomendado e anotar a unica evidencia que precisa sair hoje.",
          "Fechar a sessao com checkpoint, nota ou comparativo curto.",
        ];
        action = mission.primary_button;
        break;
      case "standard":
        blocks = [
          "Estudar a rota recomendada com o objetivo da missao em mente.",
          mission.recommended_lab
            ? `Executar o lab ${mission.recommended_lab.title} ou pelo menos preparar o setup dele.`
            : "Executar uma evidencia pratica ou checkpoint alinhado ao foco atual.",
          "Voltar para Progresso ou Analytics para registrar o que mudou.",
        ];
        action = mission.secondary_button || mission.primary_button;
        break;
      default:
        blocks = [
          "Rodar a rota principal em profundidade sem abrir mais de uma frente nova.",
          mission.recommended_lab
            ? `Fechar a sessao com a evidencia completa do lab ${mission.recommended_lab.title}.`
            : "Fechar a sessao com evidencia completa da unidade ou bloco em foco.",
          "Registrar no Progresso e revisar se a proxima missao mudou.",
        ];
        action = mission.secondary_button || mission.primary_button;
        break;
    }

    return {
      ...preset,
      blocks,
      button: action,
      };
    });
}

function resolveTodayModeId(todayRecord, analyticsGuide, preferences) {
  const presets = Array.isArray(analyticsGuide?.session_presets) ? analyticsGuide.session_presets : [];
  const availableIds = new Set(presets.map((item) => item.id));
  if (todayRecord?.mode_id && availableIds.has(todayRecord.mode_id)) {
    return todayRecord.mode_id;
  }

  const hoursPerDay = Number(preferences?.hours_per_day || 0);
  if (hoursPerDay <= 1.5 && availableIds.has("quick")) {
    return "quick";
  }
  if (hoursPerDay >= 4 && availableIds.has("deep")) {
    return "deep";
  }
  if (availableIds.has("standard")) {
    return "standard";
  }

  return presets[0]?.id || null;
}

function buildTodaySessionSnapshot(
  todayGuide,
  analyticsGuide,
  analyticsRules,
  studyUnits,
  learningPathTemplates,
  adaptivePathRules,
  labsGuide,
  progressGuide,
  vendorSources,
) {
  const snapshot = buildAnalyticsSnapshot(
    analyticsRules,
    studyUnits,
    learningPathTemplates,
    adaptivePathRules,
    labsGuide,
    progressGuide,
    vendorSources,
  );
  const sourceLookup = buildSourceLookup(vendorSources);
  const todayState = loadTodaySessionState();
  const todayRecord = getTodaySessionRecord(todayState);
  const modes = buildAnalyticsSessionCards(analyticsGuide, snapshot);
  const selectedModeId = resolveTodayModeId(todayRecord, analyticsGuide, snapshot.preferences);
  const selectedMode = modes.find((item) => item.id === selectedModeId) || modes[0] || null;
  const checklistTemplate = Array.isArray(todayGuide?.completion_checklist) ? todayGuide.completion_checklist : [];
  const completedIds = Array.isArray(todayRecord.completed_step_ids) ? todayRecord.completed_step_ids : [];
  const checklist = checklistTemplate.map((item) => ({
    ...item,
    done: completedIds.includes(item.id),
  }));
  const focusSources = uniqueBy(
    [
      ...buildSourceButtons(sourceLookup, snapshot.mission.focus_unit?.official_resource_ids, 2),
      ...buildSourceButtons(sourceLookup, snapshot.mission.recommended_lab?.source_ids, 2),
    ],
    (item) => `${item.href}:${item.label}`,
  );
  const flags = Object.values(loadStudyFlagsState().items || {})
    .sort((left, right) => String(right.updated_at || "").localeCompare(String(left.updated_at || "")))
    .slice(0, 4);
  const completionRatio = checklist.length
    ? checklist.filter((item) => item.done).length / checklist.length
    : 0;

  return {
    ...snapshot,
    today_state: todayState,
    today_record: todayRecord,
    modes,
    selected_mode_id: selectedModeId,
    selected_mode: selectedMode,
    checklist,
    completion_ratio: completionRatio,
    focus_sources: focusSources,
    flagged_items: flags,
    day_label: formatShortDate(todayIsoDate()),
  };
}

function renderToday(
  todayGuide,
  analyticsGuide,
  analyticsRules,
  studyUnits,
  learningPathTemplates,
  adaptivePathRules,
  labsGuide,
  progressGuide,
  vendorSources,
) {
  renderCards(
    "today-orientation",
    todayGuide.orientation || [],
    (item) => `
      <article class="metric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="metric-value">${escapeHtml(item.body)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  const readingRules = document.getElementById("today-reading-rules");
  if (readingRules) {
    readingRules.innerHTML = (todayGuide.reading_rules || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  const ritualRules = document.getElementById("today-ritual-rules");
  if (ritualRules) {
    ritualRules.innerHTML = (todayGuide.ritual_rules || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  const pageContent = document.getElementById("content");
  const feedback = document.getElementById("today-feedback");

  function renderSnapshot(message = "") {
    flushStudyAnalyticsActivity("today_refresh");
    const snapshot = buildTodaySessionSnapshot(
      todayGuide,
      analyticsGuide,
      analyticsRules,
      studyUnits,
      learningPathTemplates,
      adaptivePathRules,
      labsGuide,
      progressGuide,
      vendorSources,
    );
    const missionPanel = document.getElementById("today-focus-panel");
    if (missionPanel) {
      missionPanel.innerHTML = `
        <div class="adaptive-unit-header">
          <div>
            <span class="status-badge status-done">${escapeHtml(snapshot.mission.badge)}</span>
            <h3>${escapeHtml(snapshot.mission.title)}</h3>
            <p class="card-copy">${escapeHtml(snapshot.mission.summary)}</p>
          </div>
          <div class="adaptive-unit-metrics">
            <article>
              <span class="label">Data</span>
              <strong>${escapeHtml(snapshot.day_label)}</strong>
            </article>
            <article>
              <span class="label">Modo</span>
              <strong>${escapeHtml(snapshot.selected_mode?.title || "Sessao do dia")}</strong>
            </article>
            <article>
              <span class="label">Checklist</span>
              <strong>${escapeHtml(formatPercent(snapshot.completion_ratio))}</strong>
            </article>
          </div>
        </div>
        <div class="adaptive-unit-grid">
          <section class="adaptive-unit-section">
            <span class="eyebrow">Por que hoje</span>
            <ul class="summary-list">
              ${snapshot.mission.why_now.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </section>
          <section class="adaptive-unit-section">
            <span class="eyebrow">Unidade em foco</span>
            <p>${escapeHtml(snapshot.mission.focus_unit?.title || "Sem unidade explicita neste momento.")}</p>
          </section>
          <section class="adaptive-unit-section">
            <span class="eyebrow">Evidencia de saida</span>
            <p>${escapeHtml(snapshot.mission.success)}</p>
          </section>
          <section class="adaptive-unit-section">
            <span class="eyebrow">Lab alinhado</span>
            <p>${escapeHtml(snapshot.mission.recommended_lab?.title || "Sem lab obrigatorio para esta sessao.")}</p>
          </section>
        </div>
        <div class="button-group adaptive-unit-actions">
          <a class="button" href="${resolveUrl(snapshot.mission.primary_button.href)}">${escapeHtml(snapshot.mission.primary_button.label)}</a>
          <a class="button secondary" href="${resolveUrl(snapshot.mission.secondary_button.href)}">${escapeHtml(snapshot.mission.secondary_button.label)}</a>
          <button class="button ghost" id="today-reset" type="button">Resetar sessao de hoje</button>
        </div>
      `;
    }

    renderCards(
      "today-mode-cards",
      snapshot.modes,
      (item) => `
        <article class="workflow-card today-mode-card ${item.id === snapshot.selected_mode_id ? "recommended" : ""}">
          <span class="status-badge ${item.id === snapshot.selected_mode_id ? "status-done" : "status-next"}">${escapeHtml(
            item.id === snapshot.selected_mode_id ? "Modo ativo" : item.badge,
          )}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.description)}</p>
          <ul class="summary-list">
            ${(item.blocks || []).map((block) => `<li>${escapeHtml(block)}</li>`).join("")}
          </ul>
          <div class="button-group">
            <button class="button ${item.id === snapshot.selected_mode_id ? "" : "secondary"}" type="button" data-today-mode="${escapeHtml(item.id)}">
              ${escapeHtml(item.id === snapshot.selected_mode_id ? "Modo atual" : "Usar este modo")}
            </button>
            ${
              item.button
                ? `<a class="button ghost" href="${resolveUrl(item.button.href)}">${escapeHtml(item.button.label)}</a>`
                : ""
            }
          </div>
        </article>
      `,
    );

    const sessionPlan = document.getElementById("today-session-plan");
    if (sessionPlan) {
      sessionPlan.innerHTML = `
        <div class="adaptive-unit-header">
          <div>
            <span class="eyebrow">Plano executavel</span>
            <h3>${escapeHtml(snapshot.selected_mode?.title || "Sessao do dia")}</h3>
            <p class="card-copy">${escapeHtml(snapshot.selected_mode?.description || "O sistema nao conseguiu montar o plano de hoje.")}</p>
          </div>
          <div class="adaptive-unit-metrics">
            <article>
              <span class="label">Duracao</span>
              <strong>${escapeHtml(snapshot.selected_mode?.badge || snapshot.mission.suggested_duration)}</strong>
            </article>
            <article>
              <span class="label">Foco</span>
              <strong>${escapeHtml(titleCase(snapshot.preferences.focus || "foco"))}</strong>
            </article>
            <article>
              <span class="label">Flags abertas</span>
              <strong>${escapeHtml(String(snapshot.flagged_items.length))}</strong>
            </article>
          </div>
        </div>
        <div class="adaptive-unit-grid">
          <section class="adaptive-unit-section">
            <span class="eyebrow">Abrir</span>
            <p>${escapeHtml(snapshot.mission.primary_button.label)}</p>
          </section>
          <section class="adaptive-unit-section">
            <span class="eyebrow">Executar</span>
            <ul class="summary-list">
              ${(snapshot.selected_mode?.blocks || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </section>
          <section class="adaptive-unit-section">
            <span class="eyebrow">Provar</span>
            <p>${escapeHtml(snapshot.mission.success)}</p>
          </section>
          <section class="adaptive-unit-section">
            <span class="eyebrow">Fechar</span>
            <p>Volte para Progresso ou Analytics no fim da sessao para consolidar o ganho real do dia.</p>
          </section>
        </div>
        <div class="button-group adaptive-unit-actions">
          <a class="button" href="${resolveUrl(snapshot.mission.primary_button.href)}">Comecar agora</a>
          <a class="button secondary" href="${resolveUrl("/progresso/")}">Fechar no Progresso</a>
          <a class="button ghost" href="${resolveUrl("/analytics/")}">Revisar sinal no Analytics</a>
        </div>
      `;
    }

    renderCards(
      "today-checklist",
      snapshot.checklist,
      (item) => `
        <article class="study-card compact-card today-checklist-card ${item.done ? "recommended done" : ""}">
          <span class="status-badge ${item.done ? "status-done" : "status-next"}">${escapeHtml(
            item.done ? "Concluido" : "Pendente",
          )}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.summary)}</p>
          <div class="button-group">
            <button class="button ghost ${item.done ? "flag-toggle active" : ""}" type="button" data-today-check="${escapeHtml(item.id)}">
              ${escapeHtml(item.done ? "Marcar como pendente" : "Marcar como feito")}
            </button>
          </div>
        </article>
      `,
    );

    renderCards(
      "today-flag-queue",
      snapshot.flagged_items.length
        ? snapshot.flagged_items
        : [
            {
              title: "Sem pendencia de revisao agora",
              summary: "Quando uma unidade ou lab precisar voltar para sua mesa, ela aparecera aqui.",
              route_label: "Fluxo limpo",
              href: "/trilha/",
            },
          ],
      (item) => `
        <article class="workflow-card flag-card">
          <span class="status-badge ${snapshot.flagged_items.length ? "status-in-progress" : "status-done"}">${escapeHtml(
            item.route_label || "Fluxo limpo",
          )}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.summary)}</p>
          ${renderButtonList([
            {
              label: snapshot.flagged_items.length ? "Abrir ponto marcado" : "Voltar para a trilha",
              href: item.href || "/trilha/",
              variant: "secondary",
            },
          ])}
        </article>
      `,
    );

    renderCards(
      "today-support-cards",
      [
        ...(todayGuide.support_cards || []),
        ...snapshot.focus_sources.map((button) => ({
          badge: "Fonte oficial",
          status_class: "status-done",
          title: button.label,
          description: "Documento oficial alinhado ao foco desta sessao.",
          buttons: [button],
        })),
      ],
      (item) => `
        <article class="artifact-card compact-card">
          <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.description)}</p>
          ${renderButtonList(item.buttons || [])}
        </article>
      `,
    );

    if (feedback) {
      feedback.textContent = message;
      if (message) {
        window.clearTimeout(window.__todayFeedbackTimer);
        window.__todayFeedbackTimer = window.setTimeout(() => {
          feedback.textContent = "";
        }, 2200);
      }
    }
  }

  if (pageContent && pageContent.dataset.todayBound !== "true") {
    pageContent.addEventListener("click", (event) => {
      const modeButton = event.target.closest("[data-today-mode]");
      if (modeButton) {
        const modeId = modeButton.getAttribute("data-today-mode");
        setTodaySessionMode(modeId);
        trackStudyAnalyticsEvent("route_interaction", {
          page_id: "hoje",
          label: `today_mode_${modeId}`,
        });
        renderSnapshot("Modo de sessao atualizado para hoje.");
        return;
      }

      const checklistButton = event.target.closest("[data-today-check]");
      if (checklistButton) {
        const stepId = checklistButton.getAttribute("data-today-check");
        toggleTodaySessionChecklistStep(stepId);
        trackStudyAnalyticsEvent("route_interaction", {
          page_id: "hoje",
          label: `today_check_${stepId}`,
        });
        renderSnapshot("Checklist do dia atualizado.");
        return;
      }

      const resetButton = event.target.closest("#today-reset");
      if (resetButton) {
        resetTodaySession();
        trackStudyAnalyticsEvent("route_interaction", {
          page_id: "hoje",
          label: "today_reset",
        });
        renderSnapshot("Sessao de hoje reiniciada.");
      }
    });

    pageContent.dataset.todayBound = "true";
  }

  renderSnapshot();
}

function resolveLaunchCandidate(launchGuide, progressSnapshot, analyticsSnapshot, freshnessStatus, favorites) {
  const candidates = launchGuide?.next_wave || [];
  const routeCoverage = analyticsSnapshot.route_insights.filter(
    (route) => route.views > 0 || route.interactions > 0 || route.active_minutes >= 0.5,
  ).length;
  const totalFavorites = Number(favorites?.templates?.length || 0) + Number(favorites?.examples?.length || 0);
  const reviewPages = (freshnessStatus?.pages || []).filter((page) => page.status_class !== "status-done").length;

  let recommendedId = "session-of-today";

  if (progressSnapshot.coverageRatio >= 0.55 || analyticsSnapshot.totals.total_labs_focused >= 3) {
    recommendedId = "capstone-hub";
  } else if (totalFavorites >= 2 || (analyticsSnapshot.analytics_state?.page_views?.prompts || 0) > 0) {
    recommendedId = "persona-packs";
  } else if (routeCoverage >= 5 && reviewPages > 0) {
    recommendedId = "review-refresh";
  }

  return {
    routeCoverage,
    totalFavorites,
    reviewPages,
    recommended: candidates.find((candidate) => candidate.id === recommendedId) || candidates[0] || null,
  };
}

function buildLaunchSummaryText(portal, snapshot) {
  const whyNow = String(snapshot.candidate?.why_now || "ele concentra a maior alavanca atual do sistema").replace(/[.]+$/u, "");
  return [
    `${portal?.site?.title || "O portal"} ja tem ${snapshot.readyCount} camada(s) launch-ready com narrativa clara e CTA funcional.`,
    `Hoje existem ${snapshot.routeCoverage} rota(s) com uso real local, ${snapshot.progressSnapshot.masteredUnits.length} unidade(s) dominada(s) e ${snapshot.evidenceCount} sinal(is) combinados de evidencia local.`,
    `O melhor proximo release agora e ${snapshot.candidate?.title || "a proxima feature"} porque ${whyNow}.`,
  ].join(" ");
}

function buildLaunchSnapshot(
  portal,
  launchGuide,
  analyticsRules,
  studyUnits,
  learningPathTemplates,
  adaptivePathRules,
  labsGuide,
  progressGuide,
  freshnessStatus,
) {
  const preferences = loadAdaptivePathPreferences();
  const progressState = loadStudyProgressState();
  const favorites = loadPromptFavorites();
  const progressSnapshot = buildProgressSnapshot(
    progressGuide,
    studyUnits,
    learningPathTemplates,
    adaptivePathRules,
    [],
    preferences,
    progressState,
  );
  const analyticsSnapshot = buildAnalyticsSnapshot(
    analyticsRules,
    studyUnits,
    learningPathTemplates,
    adaptivePathRules,
    labsGuide,
    progressGuide,
    [],
  );
  const candidateMeta = resolveLaunchCandidate(
    launchGuide,
    progressSnapshot,
    analyticsSnapshot,
    freshnessStatus,
    favorites,
  );
  const readyCount = (launchGuide?.launch_ready || []).length;
  const evidenceCount =
    analyticsSnapshot.totals.total_progress_updates +
    analyticsSnapshot.totals.total_labs_focused +
    candidateMeta.totalFavorites;
  const maturityScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        readyCount * 10 +
          candidateMeta.routeCoverage * 6 +
          progressSnapshot.masteredUnits.length * 8 +
          evidenceCount * 3 -
          candidateMeta.reviewPages * 4,
      ),
    ),
  );
  const nextWave = (launchGuide?.next_wave || []).map((item) => {
    const isRecommended = item.id === candidateMeta.recommended?.id;
    return {
      ...item,
      recommended: isRecommended,
      status_class: isRecommended ? "status-done" : item.status_class,
      badge: isRecommended ? "Melhor proximo release" : item.badge,
    };
  });
  const summaryText = buildLaunchSummaryText(portal, {
    readyCount,
    routeCoverage: candidateMeta.routeCoverage,
    progressSnapshot,
    evidenceCount,
    candidate: candidateMeta.recommended,
  });

  return {
    preferences,
    favorites,
    progressSnapshot,
    analyticsSnapshot,
    readyCount,
    routeCoverage: candidateMeta.routeCoverage,
    reviewPages: candidateMeta.reviewPages,
    evidenceCount,
    maturityScore,
    candidate: candidateMeta.recommended,
    nextWave,
    summaryText,
    exportPayload: {
      exported_on: new Date().toISOString(),
      portal_phase: portal?.site?.phase_focus || "",
      next_phase: portal?.site?.next_phase || "",
      readiness: {
        launch_ready_count: readyCount,
        route_coverage: candidateMeta.routeCoverage,
        review_pages: candidateMeta.reviewPages,
        maturity_score: maturityScore,
      },
      preferences,
      favorites,
      progress: {
        coverage_ratio: progressSnapshot.coverageRatio,
        mastered_units: progressSnapshot.masteredUnits.length,
        checkpoint_units: progressSnapshot.checkpointUnits.length,
        blocked_units: progressSnapshot.blockedUnits.length,
        next_priority_unit: progressSnapshot.nextPriorityUnit?.title || "",
      },
      analytics: {
        total_views: analyticsSnapshot.totals.total_views,
        total_active_minutes: analyticsSnapshot.totals.total_active_minutes,
        total_route_interactions: analyticsSnapshot.totals.total_route_interactions,
        total_labs_focused: analyticsSnapshot.totals.total_labs_focused,
        total_progress_updates: analyticsSnapshot.totals.total_progress_updates,
      },
      recommended_release: candidateMeta.recommended,
      launch_summary: summaryText,
    },
  };
}

function renderLaunches(
  portal,
  launchGuide,
  analyticsRules,
  studyUnits,
  learningPathTemplates,
  adaptivePathRules,
  labsGuide,
  progressGuide,
  freshnessStatus,
) {
  renderCards(
    "launch-orientation",
    launchGuide.orientation || [],
    (item) => `
      <article class="metric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="metric-value">${escapeHtml(item.body)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  const studySteps = document.getElementById("launch-study-steps");
  if (studySteps) {
    studySteps.innerHTML = (launchGuide.study_steps || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  renderCards(
    "launch-product-rules",
    launchGuide.product_rules || [],
    (item) => `
      <article class="study-card compact-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
      </article>
    `,
  );

  renderCards(
    "launch-ready-board",
    launchGuide.launch_ready || [],
    (item) => `
      <article class="artifact-card launch-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <p class="metric-note"><strong>Prova:</strong> ${escapeHtml(item.proof)}</p>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );

  const snapshot = buildLaunchSnapshot(
    portal,
    launchGuide,
    analyticsRules,
    studyUnits,
    learningPathTemplates,
    adaptivePathRules,
    labsGuide,
    progressGuide,
    freshnessStatus,
  );

  renderCards(
    "launch-summary",
    [
      {
        badge: "Camadas prontas",
        status_class: "status-done",
        title: `${snapshot.readyCount} launch-ready`,
        body: "Blocos com narrativa, CTA e prova funcional.",
        note: "Essas camadas ja sustentam demo, onboarding ou distribuicao sem parecer rascunho.",
      },
      {
        badge: "Cobertura real",
        status_class: snapshot.routeCoverage >= 5 ? "status-done" : "status-in-progress",
        title: `${snapshot.routeCoverage} rotas com uso`,
        body: `${formatNumber(snapshot.analyticsSnapshot.totals.total_active_minutes, 1)} min ativos`,
        note: "A leitura premium fica mais forte quando o produto ja tem uso local consistente.",
      },
      {
        badge: "Evidencias locais",
        status_class: snapshot.evidenceCount >= 4 ? "status-done" : "status-in-progress",
        title: `${snapshot.evidenceCount} sinais`,
        body: `${snapshot.progressSnapshot.masteredUnits.length} unidade(s) dominada(s)`,
        note: "Aqui entram progresso, labs focados e favoritos do Prompt Studio.",
      },
      {
        badge: "Melhor proximo release",
        status_class: "status-done",
        title: snapshot.candidate?.title || "Definindo proximo release",
        body: `Maturidade atual: ${snapshot.maturityScore}%`,
        note: snapshot.candidate?.why_now || "A proxima onda sera definida a partir do uso e do roadmap.",
      },
    ],
    (item) => `
      <article class="metric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="metric-value">${escapeHtml(item.body)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  const launchStoryTitle = document.getElementById("launch-story-title");
  if (launchStoryTitle) {
    launchStoryTitle.textContent = snapshot.candidate?.title || "Produto pronto para refinamento final";
  }

  const launchStoryBody = document.getElementById("launch-story-body");
  if (launchStoryBody) {
    launchStoryBody.textContent = snapshot.summaryText;
  }

  renderCards(
    "launch-next-wave",
    snapshot.nextWave,
    (item) => `
      <article class="workflow-card launch-card ${item.recommended ? "launch-highlight-card" : ""}">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <p class="metric-note">${escapeHtml(item.why_now)}</p>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );

  renderCards(
    "launch-packaging",
    launchGuide.packaging_options || [],
    (item) => `
      <article class="phase-card launch-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <p class="timeline-kicker">${escapeHtml(item.audience)}</p>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="timeline-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          ${(item.includes || []).map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}
        </ul>
      </article>
    `,
  );

  const checklist = document.getElementById("launch-checklist");
  if (checklist) {
    checklist.innerHTML = (launchGuide.launch_checklist || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  const feedback = document.getElementById("launch-feedback");
  let feedbackTimer = null;

  function setFeedback(message) {
    if (!feedback) {
      return;
    }
    feedback.textContent = message;
    if (feedbackTimer) {
      window.clearTimeout(feedbackTimer);
    }
    feedbackTimer = window.setTimeout(() => {
      feedback.textContent = "";
    }, 2600);
  }

  document.getElementById("launch-export")?.addEventListener("click", () => {
    const fileName = `ai-po-os-launch-dossie-${todayIsoDate()}.json`;
    downloadJsonFile(fileName, snapshot.exportPayload);
    setFeedback("Dossie exportado.");
  });

  document.getElementById("launch-copy")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(snapshot.summaryText);
      setFeedback("Resumo copiado.");
    } catch (_error) {
      setFeedback("Nao foi possivel copiar automaticamente.");
    }
  });
}

function renderAnalytics(
  analyticsGuide,
  analyticsRules,
  studyUnits,
  learningPathTemplates,
  adaptivePathRules,
  labsGuide,
  progressGuide,
  vendorSources,
) {
  const sourceLookup = buildSourceLookup(vendorSources);

  renderCards(
    "analytics-orientation",
    analyticsGuide.orientation || [],
    (item) => `
      <article class="metric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="metric-value">${escapeHtml(item.body)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  const studySteps = document.getElementById("analytics-study-steps");
  if (studySteps) {
    studySteps.innerHTML = (analyticsGuide.study_steps || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  const readingRules = document.getElementById("analytics-reading-rules");
  if (readingRules) {
    readingRules.innerHTML = (analyticsGuide.reading_rules || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  const engineRules = document.getElementById("analytics-engine-rules");
  if (engineRules) {
    engineRules.innerHTML = (analyticsGuide.engine_rules || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  renderCards(
    "analytics-route-sequence",
    analyticsGuide.route_sequence || [],
    (item) => `
      <article class="artifact-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );

  renderCards(
    "analytics-privacy-cards",
    analyticsGuide.privacy_cards || [],
    (item) => `
      <article class="study-card compact-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
      </article>
    `,
  );

  function renderSnapshot(message = "") {
    flushStudyAnalyticsActivity("analytics_refresh");
    const snapshot = buildAnalyticsSnapshot(
      analyticsRules,
      studyUnits,
      learningPathTemplates,
      adaptivePathRules,
      labsGuide,
      progressGuide,
      vendorSources,
    );

    const topRoute = snapshot.route_insights.slice().sort((left, right) => right.advance_signal - left.advance_signal)[0];
    const topDomain = snapshot.domain_insights[0];
    renderCards(
      "analytics-summary",
      [
        {
          badge: "Tempo ativo local",
          status_class: "status-done",
          title: `${formatNumber(snapshot.totals.total_active_minutes, 1)} min`,
          body: `${snapshot.totals.total_views} abertura(s) de rota`,
          note: "Tempo ativo usa visibilidade da pagina para evitar inflar leitura com abas esquecidas.",
        },
        {
          badge: "Rota mais forte",
          status_class: topRoute?.status?.status_class || "status-next",
          title: topRoute?.label || "Sem rota dominante ainda",
          body: topRoute ? `${formatNumber(topRoute.active_minutes, 1)} min / ${topRoute.views} views` : "Precisa de mais sessoes reais",
          note: topRoute?.status?.interpretation || "A rota mais forte vai aparecer depois de algumas sessoes.",
        },
        {
          badge: "Dominio com mais tracao",
          status_class: topDomain?.status?.status_class || "status-next",
          title: topDomain?.label || "Sem dominio dominante ainda",
          body: topDomain ? `${formatPercent(topDomain.mastery_ratio)} de dominio` : "Aguardando progresso local",
          note: topDomain?.status?.interpretation || "O dominio com mais tracao aparece quando rotas e progresso comecam a convergir.",
        },
        {
          badge: "Missao recomendada",
          status_class: "status-done",
          title: snapshot.mission.title,
          body: snapshot.mission.suggested_duration,
          note: snapshot.mission.summary,
        },
      ],
      (item) => `
        <article class="metric-card">
          <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="metric-value">${escapeHtml(item.body)}</p>
          <p class="metric-note">${escapeHtml(item.note)}</p>
        </article>
      `,
    );

    const paceTitle = document.getElementById("analytics-pace-title");
    if (paceTitle) {
      paceTitle.textContent = snapshot.mission.title;
    }

    const paceStory = document.getElementById("analytics-pace-story");
    if (paceStory) {
      paceStory.textContent =
        `Voce acumulou ${formatNumber(snapshot.totals.total_active_minutes, 1)} minuto(s) ativos, ` +
        `${snapshot.totals.total_route_interactions} interacao(oes) e ${snapshot.totals.total_progress_updates} atualizacao(oes) de progresso. ` +
        `${snapshot.mission.summary}${message ? ` ${message}` : ""}`;
    }

    renderCards(
      "analytics-route-board",
      snapshot.route_insights,
      (route) => `
        <article class="workflow-card analytics-signal-card ${route.focus_critical ? "analytics-priority-card" : ""}">
          <span class="status-badge ${escapeHtml(route.status.status_class)}">${escapeHtml(route.status.label)}</span>
          <h3>${escapeHtml(route.label)}</h3>
          <p class="card-copy">${escapeHtml(route.summary)}</p>
          <div class="analytics-metric-row">
            <span><strong>${escapeHtml(formatNumber(route.active_minutes, 1))} min</strong> ativos</span>
            <span>${escapeHtml(String(route.views))} views</span>
            <span>${escapeHtml(String(route.interactions))} interacoes</span>
          </div>
          <div class="adaptive-domain-track">
            <span class="adaptive-domain-fill" style="width:${Math.max(8, Math.min(100, Math.round(route.advance_signal * 3.4)))}%"></span>
          </div>
          <p class="metric-note">${escapeHtml(route.status.interpretation)}</p>
          <p class="metric-note">Sinal local de avanco: ${escapeHtml(formatNumber(route.advance_signal, 1))}</p>
          ${renderButtonList([
            {
              label: `Abrir ${route.label}`,
              href: route.href,
              variant: route.focus_critical ? "primary" : "secondary",
            },
          ])}
        </article>
      `,
    );

    renderCards(
      "analytics-domain-board",
      snapshot.domain_insights,
      (domain) => `
        <article class="phase-card analytics-domain-card">
          <span class="status-badge ${escapeHtml(domain.status.status_class)}">${escapeHtml(domain.status.label)}</span>
          <p class="timeline-kicker">${escapeHtml(domain.label)}</p>
          <h3>${escapeHtml(formatPercent(domain.mastery_ratio))} de dominio</h3>
          <p class="timeline-copy">${escapeHtml(domain.summary || domain.status.interpretation)}</p>
          <ul class="summary-list">
            <li><strong>Unidades:</strong> ${escapeHtml(String(domain.mastered_units))}/${escapeHtml(String(domain.total_units))} dominadas</li>
            <li><strong>Tempo das rotas:</strong> ${escapeHtml(formatNumber(domain.route_minutes, 1))} min</li>
            <li><strong>Labs do dominio:</strong> ${escapeHtml(String(domain.lab_focus_count))} foco(s)</li>
            <li><strong>Checkpoint:</strong> ${escapeHtml(String(domain.checkpoint_units + domain.blocked_units))} pendencia(s)</li>
          </ul>
          <div class="adaptive-domain-track">
            <span class="adaptive-domain-fill" style="width:${Math.max(8, Math.min(100, Math.round(domain.engagement_score * 4.2)))}%"></span>
          </div>
          <p class="metric-note">${escapeHtml(domain.status.interpretation)}</p>
          ${renderButtonList(
            [
              domain.best_route
                ? {
                    label: `Abrir ${domain.best_route.label}`,
                    href: domain.best_route.href,
                    variant: "secondary",
                  }
                : null,
              domain.recommended_lab
                ? {
                    label: "Abrir lab alinhado",
                    href: `/labs/?domain=${encodeURIComponent(domain.recommended_lab.domain)}&lab=${encodeURIComponent(
                      domain.recommended_lab.id,
                    )}`,
                    variant: "ghost",
                  }
                : null,
            ].filter(Boolean),
          )}
        </article>
      `,
    );

    renderCards(
      "analytics-lab-board",
      snapshot.top_labs,
      (lab) => `
        <article class="artifact-card analytics-lab-card">
          <span class="status-badge ${lab.attributed_progress > 0 ? "status-done" : "status-in-progress"}">${escapeHtml(
            lab.badge,
          )}</span>
          <h3>${escapeHtml(lab.title)}</h3>
          <p class="card-copy">${escapeHtml(lab.summary)}</p>
          <ul class="summary-list">
            <li><strong>Foco local:</strong> ${escapeHtml(String(lab.focus_count))} vez(es)</li>
            <li><strong>Sinal de avanco:</strong> ${escapeHtml(String(lab.attributed_progress))}</li>
            <li><strong>Tempo:</strong> ${escapeHtml(lab.time_label)}</li>
          </ul>
          <p class="metric-note">
            [Inferencia] O sinal de avanco local considera progresso registrado depois de foco recente em labs.
          </p>
          ${renderButtonList([
            {
              label: "Abrir lab",
              href: `/labs/?domain=${encodeURIComponent(lab.domain)}&difficulty=${encodeURIComponent(
                lab.difficulty,
              )}&timebox=${encodeURIComponent(lab.timebox)}&objective=${encodeURIComponent(
                lab.objective,
              )}&lab=${encodeURIComponent(lab.id)}`,
              variant: "secondary",
            },
          ])}
        </article>
      `,
    );

    const missionPanel = document.getElementById("analytics-mission-focus");
    if (missionPanel) {
      const missionSources = [
        ...buildSourceButtons(sourceLookup, snapshot.mission.focus_unit?.official_resource_ids, 2),
        ...buildSourceButtons(sourceLookup, snapshot.mission.recommended_lab?.source_ids, 2),
      ];
      missionPanel.innerHTML = `
        <div class="adaptive-unit-header">
          <div>
            <span class="status-badge status-done">${escapeHtml(snapshot.mission.badge)}</span>
            <h3>${escapeHtml(snapshot.mission.title)}</h3>
            <p class="card-copy">${escapeHtml(snapshot.mission.summary)}</p>
          </div>
          <div class="adaptive-unit-metrics">
            <article>
              <span class="label">Duracao sugerida</span>
              <strong>${escapeHtml(snapshot.mission.suggested_duration)}</strong>
            </article>
            <article>
              <span class="label">Foco salvo</span>
              <strong>${escapeHtml(titleCase(snapshot.preferences.focus || "foco"))}</strong>
            </article>
            <article>
              <span class="label">Ritmo</span>
              <strong>${escapeHtml(formatPercent(snapshot.progress_snapshot.paceRatio))}</strong>
            </article>
          </div>
        </div>
        <div class="adaptive-unit-grid">
          <section class="adaptive-unit-section">
            <span class="eyebrow">Por que agora</span>
            <ul class="summary-list">
              ${snapshot.mission.why_now.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </section>
          <section class="adaptive-unit-section">
            <span class="eyebrow">Sinal de sucesso</span>
            <p>${escapeHtml(snapshot.mission.success)}</p>
          </section>
          <section class="adaptive-unit-section">
            <span class="eyebrow">Unidade em foco</span>
            <p>${escapeHtml(snapshot.mission.focus_unit?.title || "Sem unidade prioritaria explicita agora.")}</p>
          </section>
          <section class="adaptive-unit-section">
            <span class="eyebrow">Lab recomendado</span>
            <p>${escapeHtml(snapshot.mission.recommended_lab?.title || "Sem lab obrigatorio neste momento.")}</p>
          </section>
        </div>
        <div class="button-group adaptive-unit-actions">
          <a class="button" href="${resolveUrl(snapshot.mission.primary_button.href)}">${escapeHtml(
            snapshot.mission.primary_button.label,
          )}</a>
          <a class="button secondary" href="${resolveUrl(snapshot.mission.secondary_button.href)}">${escapeHtml(
            snapshot.mission.secondary_button.label,
          )}</a>
          ${missionSources
            .map(
              (button) => `
                <a class="button ghost" href="${resolveUrl(button.href)}">${escapeHtml(button.label)}</a>
              `,
            )
            .join("")}
        </div>
      `;
    }

    renderCards(
      "analytics-session-prescriptions",
      buildAnalyticsSessionCards(analyticsGuide, snapshot),
      (item) => `
        <article class="workflow-card">
          <span class="status-badge status-done">${escapeHtml(item.badge)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.description)}</p>
          <ul class="summary-list">
            ${(item.blocks || []).map((block) => `<li>${escapeHtml(block)}</li>`).join("")}
          </ul>
          ${renderButtonList(
            item.button
              ? [
                  {
                    label: item.button.label,
                    href: item.button.href,
                    variant: item.button.variant || "secondary",
                  },
                ]
              : [],
          )}
        </article>
      `,
    );
  }

  document.getElementById("analytics-refresh")?.addEventListener("click", () => {
    renderSnapshot("Leitura recalculada com o estado local mais recente.");
  });

  document.getElementById("analytics-reset")?.addEventListener("click", () => {
    try {
      window.localStorage.removeItem(STUDY_ANALYTICS_STORAGE_KEY);
    } catch (_error) {
      // Ignore storage cleanup failures.
    }
    renderSnapshot("Analytics local limpo. O sistema vai recomecar a medir a partir desta sessao.");
  });

  renderSnapshot();
}

function renderTrilha(trilhaGuide, studyUnits, learningPathTemplates, adaptivePathRules, vendorSources) {
  renderCards(
    "trilha-orientation",
    trilhaGuide.orientation || [],
    (item) => `
      <article class="metric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="metric-value">${escapeHtml(item.body)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  const configurationTips = document.getElementById("trilha-configuration-tips");
  if (configurationTips) {
    configurationTips.innerHTML = (trilhaGuide.configuration_tips || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  const planChecks = document.getElementById("trilha-plan-checks");
  if (planChecks) {
    planChecks.innerHTML = (trilhaGuide.plan_checks || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  renderCards(
    "trilha-route-roles",
    trilhaGuide.route_roles || [],
    (item) => `
      <article class="artifact-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );

  const executionRules = document.getElementById("trilha-execution-rules");
  if (executionRules) {
    executionRules.innerHTML = (adaptivePathRules.execution_rules || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  const form = document.getElementById("trilha-form");
  if (!form) {
    return;
  }

  const defaults = adaptivePathRules.defaults || {};
  const persistedPreferences = loadAdaptivePathPreferences(defaults);
  const hoursPerDay = document.getElementById("trilha-hours-per-day");
  const daysPerWeek = document.getElementById("trilha-days-per-week");
  const level = document.getElementById("trilha-level");
  const focus = document.getElementById("trilha-focus");
  const goal = document.getElementById("trilha-goal");
  const feedback = document.getElementById("trilha-feedback");
  const pageContent = document.getElementById("content");
  const sourceLookup = buildSourceLookup(vendorSources);
  const resumeState = ensureResumeState();
  let activeUnitId = resumeState?.trilha?.active_unit_id || resumeState?.study?.unit_id || null;
  let currentPlan = null;

  renderMissionControlSurface("trilha", buildLearningMissionSnapshot(null, studyUnits));

  fillSelectOptions(hoursPerDay, adaptivePathRules.hours_per_day_options || []);
  fillSelectOptions(daysPerWeek, adaptivePathRules.days_per_week_options || []);
  fillSelectOptions(level, learningPathTemplates.level_profiles || [], "id", "label");
  fillSelectOptions(focus, learningPathTemplates.focus_profiles || [], "id", "label");
  fillSelectOptions(goal, learningPathTemplates.templates || [], "id", "label");

  function readPreferences() {
    return {
      hours_per_day: Number(hoursPerDay?.value || defaults.hours_per_day || 3),
      days_per_week: Number(daysPerWeek?.value || defaults.days_per_week || 5),
      level: level?.value || defaults.level || "intermediate",
      focus: focus?.value || defaults.focus || "rag",
      goal: goal?.value || defaults.goal || "specialist_general",
    };
  }

  function applyPreferences(preferences) {
    if (hoursPerDay) {
      hoursPerDay.value = String(preferences.hours_per_day || defaults.hours_per_day || 3);
    }
    if (daysPerWeek) {
      daysPerWeek.value = String(preferences.days_per_week || defaults.days_per_week || 5);
    }
    if (level) {
      level.value = preferences.level || defaults.level || "intermediate";
    }
    if (focus) {
      focus.value = preferences.focus || defaults.focus || "rag";
    }
    if (goal) {
      goal.value = preferences.goal || defaults.goal || "specialist_general";
    }
  }

  function resolvePlanUnit(plan, unitId) {
    return plan.scaledUnits.find((unit) => unit.id === unitId) || plan.scaledUnits[0] || null;
  }

  function resolveNextPlanUnit(plan, unitId) {
    const currentIndex = plan.scaledUnits.findIndex((unit) => unit.id === unitId);
    if (currentIndex >= 0 && currentIndex + 1 < plan.scaledUnits.length) {
      return plan.scaledUnits[currentIndex + 1];
    }

    return null;
  }

  function renderUnitExplorer(plan) {
    const nav = document.getElementById("trilha-unit-nav");
    const focusPanel = document.getElementById("trilha-unit-focus");
    const criteriaPanel = document.getElementById("trilha-unit-criteria");

    if (!nav || !focusPanel || !criteriaPanel) {
      return;
    }

    const currentUnit = resolvePlanUnit(plan, activeUnitId || plan.firstSession?.unit_id);
    if (!currentUnit) {
      nav.innerHTML = "";
      focusPanel.innerHTML = '<div class="empty-note">Nenhuma unidade disponivel.</div>';
      criteriaPanel.innerHTML = "";
      return;
    }

    activeUnitId = currentUnit.id;
    const nextUnit = resolveNextPlanUnit(plan, currentUnit.id);
    const unitSessions = plan.sessions.filter((session) => session.unit_id === currentUnit.id);
    const firstUnitSession = unitSessions[0];
    const lastUnitSession = unitSessions[unitSessions.length - 1];

    persistResumePatch({
      study: {
        page_id: "trilha",
        href: "/trilha/",
        label: "Trilha",
        summary: currentUnit.summary,
        unit_id: currentUnit.id,
        unit_title: currentUnit.title,
        cue: nextUnit
          ? `Continue por ${currentUnit.title} e depois avance para ${nextUnit.title}.`
          : `Continue por ${currentUnit.title} e feche este ciclo no Roadmap.`,
      },
      trilha: {
        active_unit_id: currentUnit.id,
        unit_title: currentUnit.title,
        portal_href: currentUnit.portal_href || "/trilha/",
        preferences: plan.preferences,
      },
    });

    nav.innerHTML = plan.scaledUnits
      .map(
        (unit) => `
          <button
            type="button"
            class="chip chip-button ${unit.id === currentUnit.id ? "active" : ""}"
            data-unit-focus="${escapeHtml(unit.id)}"
          >
            ${escapeHtml(unit.title)}
          </button>
        `,
      )
      .join("");

    focusPanel.innerHTML = `
      <div class="adaptive-unit-header">
        <div>
          <span class="status-badge status-done">${escapeHtml(titleCase(currentUnit.domain))}</span>
          <h3>${escapeHtml(currentUnit.title)}</h3>
          <p class="card-copy">${escapeHtml(currentUnit.summary)}</p>
        </div>
        <div class="adaptive-unit-metrics">
          <article>
            <span class="label">Horas</span>
            <strong>${escapeHtml(formatNumber(currentUnit.allocated_hours, 1))}h</strong>
          </article>
          <article>
            <span class="label">Sessoes</span>
            <strong>${escapeHtml(String(unitSessions.length))}</strong>
          </article>
          <article>
            <span class="label">Janela</span>
            <strong>Dia ${escapeHtml(String(firstUnitSession?.calendar_day || 1))} a ${escapeHtml(String(lastUnitSession?.calendar_day || 1))}</strong>
          </article>
        </div>
      </div>
      <div class="adaptive-unit-grid">
        <section class="adaptive-unit-section">
          <span class="eyebrow">Conceito</span>
          <p>${escapeHtml(currentUnit.concept || currentUnit.summary)}</p>
        </section>
        <section class="adaptive-unit-section">
          <span class="eyebrow">Exercicio</span>
          <p>${escapeHtml(currentUnit.exercise)}</p>
        </section>
        <section class="adaptive-unit-section">
          <span class="eyebrow">Entregavel</span>
          <p>${escapeHtml(currentUnit.deliverable)}</p>
        </section>
        <section class="adaptive-unit-section">
          <span class="eyebrow">Sinal de dominio</span>
          <p>${escapeHtml(currentUnit.mastery)}</p>
        </section>
      </div>
      <section class="adaptive-unit-section">
        <span class="eyebrow">Evidencias esperadas</span>
        <ul class="summary-list">
          ${(currentUnit.evidence_examples || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
      <div class="button-group adaptive-unit-actions">
        <a class="button" href="${resolveUrl(currentUnit.portal_href || "/")}">${escapeHtml(currentUnit.portal_label || "Abrir rota")}</a>
        ${
          nextUnit
            ? `<button class="button secondary" type="button" data-unit-focus="${escapeHtml(nextUnit.id)}">Focar proximo bloco</button>`
            : `<a class="button secondary" href="${resolveUrl("/roadmap/")}">Fechar trilha no Roadmap</a>`
        }
        ${buildFlagToggleButton("unit", {
          id: currentUnit.id,
          title: currentUnit.title,
          summary: currentUnit.summary,
          href: "/trilha/",
          route_label: "Trilha",
          domain: currentUnit.domain,
        })}
        ${buildSourceButtons(sourceLookup, currentUnit.official_resource_ids, 2)
          .map(
            (button) => `
              <a class="button ghost" href="${resolveUrl(button.href)}">${escapeHtml(button.label)}</a>
            `,
          )
          .join("")}
      </div>
    `;

    criteriaPanel.innerHTML = `
      <article class="study-card compact-card">
        <h3>${escapeHtml(currentUnit.title)}</h3>
        <p class="card-copy">Esta unidade esta pronta quando os pontos abaixo ja deixaram de ser teoria.</p>
        <ul class="summary-list">
          ${(currentUnit.completion_criteria || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </article>
    `;
  }

  function renderPlan(plan, message = "") {
    currentPlan = plan;
    renderCards(
      "trilha-plan-summary",
      [
        {
          badge: "Ritmo semanal",
          status_class: "status-done",
          title: `${formatNumber(plan.weeklyHours, 1)}h por semana`,
          body: plan.sessionProfile?.label || "Sessao padrao",
          note: plan.sessionProfile?.study_split || "",
        },
        {
          badge: "Horizonte",
          status_class: plan.paceMessage?.status_class || "status-done",
          title: `${plan.totalCalendarDays} dias corridos`,
          body: `${plan.totalWeeks} semanas / ${plan.totalStudySessions} sessoes`,
          note: plan.paceMessage?.summary || "",
        },
        {
          badge: "Carga total",
          status_class: "status-done",
          title: `${formatNumber(plan.totalHours, 1)}h planejadas`,
          body: plan.template.label,
          note: plan.focusProfile.summary,
        },
        {
          badge: "Nivel",
          status_class: "status-done",
          title: plan.levelProfile.label,
          body: plan.focusProfile.label,
          note: plan.template.outcomes?.[0] || "",
        },
      ],
      (item) => `
        <article class="metric-card">
          <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="metric-value">${escapeHtml(item.body)}</p>
          <p class="metric-note">${escapeHtml(item.note)}</p>
        </article>
      `,
    );

    const planTitle = document.getElementById("trilha-plan-title");
    if (planTitle) {
      planTitle.textContent = plan.paceMessage?.title || "Trilha gerada";
    }

    const planStory = document.getElementById("trilha-plan-story");
    if (planStory) {
      planStory.textContent =
        `Com ${plan.preferences.hours_per_day}h por dia em ${plan.preferences.days_per_week} dias por semana, ` +
        `a trilha prioriza ${plan.focusProfile.label.toLowerCase()} dentro do objetivo ${plan.template.label.toLowerCase()} ` +
        `e fecha em ${plan.totalCalendarDays} dias corridos. ${plan.levelProfile.summary}`;
    }

    renderCards(
      "trilha-next-actions",
      [
        plan.firstSession
          ? {
              badge: "Estudar agora",
              status_class: "status-done",
              title: plan.firstSession.unit_title,
              description: `Dia ${plan.firstSession.calendar_day} | ${formatNumber(plan.firstSession.hours, 1)}h`,
              note: plan.firstSession.exercise,
              buttons: [
                {
                  label: plan.firstSession.portal_label || "Abrir rota",
                  href: plan.firstSession.portal_href || "/",
                },
                ...buildSourceButtons(sourceLookup, plan.firstSession.official_resource_ids, 1),
              ],
              unit_id: plan.firstSession.unit_id,
            }
          : null,
        plan.nextDistinctSession
          ? {
              badge: "Proximo bloco",
              status_class: "status-in-progress",
              title: plan.nextDistinctSession.unit_title,
              description: `Semana ${plan.nextDistinctSession.week_number} | Dia ${plan.nextDistinctSession.calendar_day}`,
              note: plan.nextDistinctSession.deliverable,
              buttons: [
                {
                  label: plan.nextDistinctSession.portal_label || "Abrir rota",
                  href: plan.nextDistinctSession.portal_href || "/",
                  variant: "secondary",
                },
                ...buildSourceButtons(sourceLookup, plan.nextDistinctSession.official_resource_ids, 1),
              ],
              unit_id: plan.nextDistinctSession.unit_id,
            }
          : null,
        {
          badge: "Checkpoint semanal",
          status_class: "status-done",
          title: "Atualizar Progresso",
          description: "Marque dominio por unidade, revise pendencias e replaneje o restante da trilha.",
          note: "Use esta rota no fechamento de cada semana ou quando o ritmo real mudar.",
          buttons: [
            {
              label: "Abrir Progresso",
              href: "/progresso/",
              variant: "secondary",
            },
          ],
          unit_id: plan.firstSession?.unit_id || plan.nextDistinctSession?.unit_id || plan.scaledUnits[0]?.id || "",
        },
      ].filter(Boolean),
      (item) => `
        <article class="workflow-card">
          <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.description)}</p>
          <p class="metric-note">${escapeHtml(item.note)}</p>
          ${renderButtonList(item.buttons || [])}
          <div class="button-group">
            <button class="button ghost" type="button" data-unit-focus="${escapeHtml(item.unit_id)}">Focar unidade</button>
          </div>
        </article>
      `,
    );

    const visibleWeeks = (plan.weeks || []).slice(0, adaptivePathRules.generation_rules?.max_visible_weeks || 8);
    const hasHiddenWeeks = (plan.weeks || []).length > visibleWeeks.length;
    renderCards(
      "trilha-week-plan",
      [
        ...visibleWeeks,
        ...(hasHiddenWeeks
          ? [
              {
                week_number: `+${plan.weeks.length - visibleWeeks.length}`,
                calendar_label: "Continuidade",
                hours: 0,
                session_count: 0,
                units: ["A trilha continua com as semanas restantes no mesmo racional."],
                deliverables: ["Mantenha a retro semanal e siga pelo proximo bloco visivel."],
                source_buttons: [],
                primary_href: "/roadmap/",
                primary_label: "Fechar ciclo no Roadmap",
                continuation: true,
              },
            ]
          : []),
      ],
      (week) => `
        <article class="phase-card ${week.continuation ? "adaptive-continuation-card" : ""}">
          <span class="status-badge ${week.continuation ? "status-next" : "status-done"}">${escapeHtml(
            week.continuation ? "Continuacao" : `Semana ${week.week_number}`,
          )}</span>
          <p class="timeline-kicker">${escapeHtml(week.calendar_label)}</p>
          <h3>${escapeHtml(week.units?.[0] || "Semana planejada")}</h3>
          <p class="timeline-copy">${week.continuation ? "A fila completa ja foi calculada; este card evita poluir a leitura visual." : `${formatNumber(week.hours, 1)}h em ${week.session_count} sessoes`}</p>
          <ul class="summary-list">
            ${(week.deliverables || []).map((deliverable) => `<li>${escapeHtml(deliverable)}</li>`).join("")}
          </ul>
          ${renderButtonList(
            week.continuation
              ? [
                  {
                    label: week.primary_label,
                    href: week.primary_href,
                    variant: "secondary",
                  },
                ]
              : [
                  {
                    label: week.primary_label,
                    href: week.primary_href,
                    variant: "secondary",
                  },
                  ...(week.source_buttons || []),
                ],
          )}
        </article>
      `,
    );

    const visibleSessions = (plan.sessions || []).slice(0, adaptivePathRules.generation_rules?.max_visible_sessions || 12);
    renderCards(
      "trilha-session-queue",
      visibleSessions,
      (session) => `
        <article class="study-card compact-card">
          <span class="status-badge status-done">Dia ${escapeHtml(session.calendar_day)}</span>
          <h3>${escapeHtml(session.unit_title)}</h3>
          <p class="card-copy">Semana ${escapeHtml(session.week_number)} | Sessao ${escapeHtml(session.study_session)} | ${escapeHtml(formatNumber(session.hours, 1))}h</p>
          <p class="metric-note">${escapeHtml(session.exercise)}</p>
          ${renderButtonList([
            {
              label: session.portal_label || "Abrir rota",
              href: session.portal_href || "/",
              variant: "secondary",
            },
          ])}
          <div class="button-group">
            <button class="button ghost" type="button" data-unit-focus="${escapeHtml(session.unit_id)}">Ver unidade</button>
          </div>
        </article>
      `,
    );

    renderUnitExplorer(plan);
    renderAdaptiveDomainMix(plan);

    renderCards(
      "trilha-materials",
      plan.materialCards || [],
      (item) => `
        <article class="artifact-card compact-card">
          <span class="label">${escapeHtml(item.vendor)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.summary)}</p>
          ${renderButtonList(item.buttons || [])}
        </article>
      `,
    );

    if (feedback) {
      feedback.textContent = message;
      if (message) {
        window.clearTimeout(window.__adaptivePathFeedbackTimer);
        window.__adaptivePathFeedbackTimer = window.setTimeout(() => {
          feedback.textContent = "";
        }, 2200);
      }
    }

    renderMissionControlSurface("trilha", buildLearningMissionSnapshot(null, studyUnits));
  }

  function syncPlan(message = "") {
    const nextPreferences = readPreferences();
    persistAdaptivePathPreferences(nextPreferences);
    trackStudyAnalyticsEvent("adaptive_path_update", {
      page_id: "trilha",
      preferences: nextPreferences,
    });
    renderPlan(
      buildAdaptivePlan(studyUnits, learningPathTemplates, adaptivePathRules, vendorSources, nextPreferences),
      message,
    );
  }

  applyPreferences(persistedPreferences);

  if (pageContent && pageContent.dataset.unitFocusBound !== "true") {
    pageContent.addEventListener("click", (event) => {
      const flagButton = event.target.closest("[data-flag-toggle]");
      if (flagButton) {
        const result = toggleStudyFlag(flagButton.getAttribute("data-flag-toggle"), {
          id: flagButton.getAttribute("data-flag-id"),
          title: flagButton.getAttribute("data-flag-title"),
          summary: flagButton.getAttribute("data-flag-summary"),
          href: flagButton.getAttribute("data-flag-href"),
          route_label: flagButton.getAttribute("data-flag-route-label"),
          domain: flagButton.getAttribute("data-flag-domain"),
        });
        trackStudyAnalyticsEvent("flag_toggle", {
          page_id: "trilha",
          state: result.active ? "open" : "closed",
        });
        if (currentPlan) {
          renderUnitExplorer(currentPlan);
          renderMissionControlSurface("trilha", buildLearningMissionSnapshot(null, studyUnits));
        }
        return;
      }

      const button = event.target.closest("[data-unit-focus]");
      if (!button || !currentPlan) {
        return;
      }

      activeUnitId = button.getAttribute("data-unit-focus");
      const trackedUnit = resolvePlanUnit(currentPlan, activeUnitId);
      if (trackedUnit) {
        trackStudyAnalyticsEvent("unit_focus", {
          page_id: "trilha",
          unit_id: trackedUnit.id,
          title: trackedUnit.title,
          domain: trackedUnit.domain,
        });
      }
      renderUnitExplorer(currentPlan);
    });
    pageContent.dataset.unitFocusBound = "true";
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    syncPlan("Trilha atualizada.");
  });

  [hoursPerDay, daysPerWeek, level, focus, goal].forEach((element) => {
    element?.addEventListener("change", () => syncPlan("Configuracao atualizada."));
  });

  const resetButton = document.getElementById("trilha-reset");
  resetButton?.addEventListener("click", () => {
    applyPreferences(defaults);
    syncPlan("Configuracao restaurada.");
  });

  syncPlan();
}

function renderProgress(progressGuide, studyUnits, learningPathTemplates, adaptivePathRules, vendorSources) {
  renderCards(
    "progress-orientation",
    progressGuide.orientation || [],
    (item) => `
      <article class="metric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="metric-value">${escapeHtml(item.body)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  const studySteps = document.getElementById("progress-study-steps");
  if (studySteps) {
    studySteps.innerHTML = (progressGuide.study_steps || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  const checkpointRules = document.getElementById("progress-checkpoint-rules");
  if (checkpointRules) {
    checkpointRules.innerHTML = (progressGuide.checkpoint_rules || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  const replanningRules = document.getElementById("progress-replanning-rules");
  if (replanningRules) {
    replanningRules.innerHTML = (progressGuide.replanning_rules || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  renderCards(
    "progress-route-sequence",
    progressGuide.route_sequence || [],
    (item) => `
      <article class="artifact-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );

  renderCards(
    "progress-status-legend",
    progressGuide.status_model || [],
    (item) => `
      <article class="study-card compact-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.label)}</span>
        <p class="card-copy">${escapeHtml(item.summary)}</p>
      </article>
    `,
  );

  const form = document.getElementById("progress-replan-form");
  if (!form) {
    return;
  }

  const defaults = adaptivePathRules.defaults || {};
  const savedAdaptivePreferences = loadAdaptivePathPreferences(defaults);
  let progressState = loadStudyProgressState();
  const resumeState = ensureResumeState();
  let activeUnitId = resumeState?.progresso?.active_unit_id || resumeState?.study?.unit_id || null;
  let currentSnapshot = null;

  const hoursPerDay = document.getElementById("progress-hours-per-day");
  const daysPerWeek = document.getElementById("progress-days-per-week");
  const level = document.getElementById("progress-level");
  const focus = document.getElementById("progress-focus");
  const goal = document.getElementById("progress-goal");
  const feedback = document.getElementById("progress-feedback");
  const pageContent = document.getElementById("content");
  const sourceLookup = buildSourceLookup(vendorSources);
  const statusLookup = buildProgressStatusLookup(progressGuide);

  renderMissionControlSurface("progresso", buildLearningMissionSnapshot(null, studyUnits));

  fillSelectOptions(hoursPerDay, adaptivePathRules.hours_per_day_options || []);
  fillSelectOptions(daysPerWeek, adaptivePathRules.days_per_week_options || []);
  fillSelectOptions(level, learningPathTemplates.level_profiles || [], "id", "label");
  fillSelectOptions(focus, learningPathTemplates.focus_profiles || [], "id", "label");
  fillSelectOptions(goal, learningPathTemplates.templates || [], "id", "label");

  function readPreferences() {
    return {
      hours_per_day: Number(hoursPerDay?.value || defaults.hours_per_day || 3),
      days_per_week: Number(daysPerWeek?.value || defaults.days_per_week || 5),
      level: level?.value || defaults.level || "intermediate",
      focus: focus?.value || defaults.focus || "rag",
      goal: goal?.value || defaults.goal || "specialist_general",
    };
  }

  function applyPreferences(preferences) {
    if (hoursPerDay) {
      hoursPerDay.value = String(preferences.hours_per_day || defaults.hours_per_day || 3);
    }
    if (daysPerWeek) {
      daysPerWeek.value = String(preferences.days_per_week || defaults.days_per_week || 5);
    }
    if (level) {
      level.value = preferences.level || defaults.level || "intermediate";
    }
    if (focus) {
      focus.value = preferences.focus || defaults.focus || "rag";
    }
    if (goal) {
      goal.value = preferences.goal || defaults.goal || "specialist_general";
    }
  }

  function resolveActiveUnit(snapshot) {
    return (
      snapshot.planUnits.find((unit) => unit.id === activeUnitId) ||
      snapshot.nextCheckpointUnit ||
      snapshot.nextPriorityUnit ||
      snapshot.planUnits[0] ||
      null
    );
  }

  function renderProgressBoard(snapshot) {
    renderCards(
      "progress-unit-board",
      snapshot.planUnits || [],
      (unit) => `
        <article class="workflow-card progress-unit-card ${unit.id === activeUnitId ? "active" : ""}">
          <span class="status-badge ${escapeHtml(unit.progress_status.status_class)}">${escapeHtml(unit.progress_status.label)}</span>
          <h3>${escapeHtml(unit.title)}</h3>
          <p class="card-copy">${escapeHtml(unit.summary)}</p>
          <ul class="summary-list">
            <li><strong>Horas:</strong> ${escapeHtml(formatNumber(unit.allocated_hours, 1))}h</li>
            <li><strong>Sessoes:</strong> ${escapeHtml(String(unit.session_count || 0))}</li>
            <li><strong>Ultima atualizacao:</strong> ${escapeHtml(formatShortDate(unit.progress_record.updated_on))}</li>
          </ul>
          <div class="button-group">
            <button class="button secondary" type="button" data-progress-unit-focus="${escapeHtml(unit.id)}">Focar unidade</button>
          </div>
        </article>
      `,
    );
  }

  function renderProgressUnit(snapshot) {
    const focusPanel = document.getElementById("progress-unit-focus");
    if (!focusPanel) {
      return;
    }

    const currentUnit = resolveActiveUnit(snapshot);
    if (!currentUnit) {
      focusPanel.innerHTML = '<div class="empty-note">Nenhuma unidade disponivel no plano atual.</div>';
      return;
    }

    activeUnitId = currentUnit.id;
    const nextUnit =
      snapshot.planUnits.find(
        (unit) => unit.id !== currentUnit.id && unit.progress_status.id !== "mastered",
      ) || null;

    persistResumePatch({
      study: {
        page_id: "progresso",
        href: "/progresso/",
        label: "Progresso",
        summary: currentUnit.summary,
        unit_id: currentUnit.id,
        unit_title: currentUnit.title,
        cue: nextUnit
          ? `Retome o checkpoint de ${currentUnit.title} e depois avance para ${nextUnit.title}.`
          : `Retome ${currentUnit.title} e feche o ciclo atual no Roadmap quando concluir.`,
      },
      progresso: {
        active_unit_id: currentUnit.id,
        unit_title: currentUnit.title,
        status_id: currentUnit.progress_status.id,
        status_label: currentUnit.progress_status.label,
      },
    });

    focusPanel.innerHTML = `
      <div class="adaptive-unit-header">
        <div>
          <span class="status-badge ${escapeHtml(currentUnit.progress_status.status_class)}">${escapeHtml(currentUnit.progress_status.label)}</span>
          <h3>${escapeHtml(currentUnit.title)}</h3>
          <p class="card-copy">${escapeHtml(currentUnit.summary)}</p>
        </div>
        <div class="adaptive-unit-metrics">
          <article>
            <span class="label">Horas planejadas</span>
            <strong>${escapeHtml(formatNumber(currentUnit.allocated_hours, 1))}h</strong>
          </article>
          <article>
            <span class="label">Equivalente concluido</span>
            <strong>${escapeHtml(formatNumber(currentUnit.equivalent_hours, 1))}h</strong>
          </article>
          <article>
            <span class="label">Ultima atualizacao</span>
            <strong>${escapeHtml(formatShortDate(currentUnit.progress_record.updated_on))}</strong>
          </article>
        </div>
      </div>
      <div class="adaptive-unit-grid">
        <section class="adaptive-unit-section">
          <span class="eyebrow">Conceito</span>
          <p>${escapeHtml(currentUnit.concept || currentUnit.summary)}</p>
        </section>
        <section class="adaptive-unit-section">
          <span class="eyebrow">Exercicio</span>
          <p>${escapeHtml(currentUnit.exercise)}</p>
        </section>
        <section class="adaptive-unit-section">
          <span class="eyebrow">Entregavel</span>
          <p>${escapeHtml(currentUnit.deliverable)}</p>
        </section>
        <section class="adaptive-unit-section">
          <span class="eyebrow">Sinal de dominio</span>
          <p>${escapeHtml(currentUnit.mastery)}</p>
        </section>
      </div>
      <section class="adaptive-unit-section">
        <span class="eyebrow">Evidencias esperadas</span>
        <ul class="summary-list">
          ${(currentUnit.evidence_examples || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
      <section class="adaptive-unit-section">
        <span class="eyebrow">Criterio de conclusao</span>
        <ul class="summary-list">
          ${(currentUnit.completion_criteria || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
      <section class="adaptive-unit-section">
        <span class="eyebrow">Atualizar status</span>
        <div class="progress-status-row">
          ${(progressGuide.status_model || [])
            .map(
              (statusItem) => `
                <button
                  class="progress-status-button ${statusItem.id === currentUnit.progress_status.id ? "active" : ""}"
                  type="button"
                  data-progress-status="${escapeHtml(statusItem.id)}"
                  data-progress-unit="${escapeHtml(currentUnit.id)}"
                >
                  <span>${escapeHtml(statusItem.label)}</span>
                  <small>${escapeHtml(statusItem.summary)}</small>
                </button>
              `,
            )
            .join("")}
        </div>
      </section>
      <div class="button-group adaptive-unit-actions">
        <a class="button" href="${resolveUrl(currentUnit.portal_href || "/")}">${escapeHtml(currentUnit.portal_label || "Abrir rota")}</a>
        ${
          nextUnit
            ? `<button class="button secondary" type="button" data-progress-unit-focus="${escapeHtml(nextUnit.id)}">Focar proximo pendente</button>`
            : `<a class="button secondary" href="${resolveUrl("/roadmap/")}">Fechar ciclo no Roadmap</a>`
        }
        ${buildFlagToggleButton("unit", {
          id: currentUnit.id,
          title: currentUnit.title,
          summary: currentUnit.summary,
          href: "/progresso/",
          route_label: "Progresso",
          domain: currentUnit.domain,
        })}
        ${buildSourceButtons(sourceLookup, currentUnit.official_resource_ids, 2)
          .map(
            (button) => `
              <a class="button ghost" href="${resolveUrl(button.href)}">${escapeHtml(button.label)}</a>
            `,
          )
          .join("")}
      </div>
    `;
  }

  function renderMilestones(snapshot) {
    renderCards(
      "progress-milestones",
      snapshot.milestones || [],
      (item) => `
        <article class="phase-card ${item.unlocked ? "progress-milestone-card-active" : ""}">
          <span class="status-badge ${item.unlocked ? "status-done" : "status-next"}">${escapeHtml(item.label)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="timeline-copy">${escapeHtml(item.description)}</p>
          <p class="metric-note">${item.unlocked ? "Este marco ja foi destravado pelo seu progresso atual." : `Destrava em ${escapeHtml(formatPercent(item.threshold))} de unidades dominadas.`}</p>
        </article>
      `,
    );
  }

  function renderRemainingPlan(snapshot) {
    const remainingPlan = snapshot.remainingPlan;
    if (!remainingPlan || !remainingPlan.weeks?.length) {
      renderCards(
        "progress-remaining-weeks",
        [
          {
            week_number: "Fim",
            calendar_label: "Trilha fechada",
            hours: 0,
            session_count: 0,
            deliverables: ["Use Senior, Roadmap e o capstone para continuar iterando com dados reais."],
            primary_href: "/roadmap/",
            primary_label: "Abrir Roadmap",
          },
        ],
        (week) => `
          <article class="phase-card adaptive-continuation-card">
            <span class="status-badge status-done">${escapeHtml(week.week_number)}</span>
            <p class="timeline-kicker">${escapeHtml(week.calendar_label)}</p>
            <h3>Trilha concluida com checkpoints</h3>
            <p class="timeline-copy">O plano adaptativo atual nao tem mais semanas pendentes.</p>
            <ul class="summary-list">
              ${(week.deliverables || []).map((deliverable) => `<li>${escapeHtml(deliverable)}</li>`).join("")}
            </ul>
            ${renderButtonList([
              {
                label: week.primary_label,
                href: week.primary_href,
                variant: "secondary",
              },
            ])}
          </article>
        `,
      );
      return;
    }

    const visibleWeeks = (remainingPlan.weeks || []).slice(0, adaptivePathRules.generation_rules?.max_visible_weeks || 8);
    const hasHiddenWeeks = (remainingPlan.weeks || []).length > visibleWeeks.length;
    renderCards(
      "progress-remaining-weeks",
      [
        ...visibleWeeks,
        ...(hasHiddenWeeks
          ? [
              {
                week_number: `+${remainingPlan.weeks.length - visibleWeeks.length}`,
                calendar_label: "Continuidade",
                hours: 0,
                session_count: 0,
                deliverables: ["As semanas restantes seguem o mesmo racional do plano recalculado."],
                primary_href: "/trilha/",
                primary_label: "Ver trilha completa",
                continuation: true,
              },
            ]
          : []),
      ],
      (week) => `
        <article class="phase-card ${week.continuation ? "adaptive-continuation-card" : ""}">
          <span class="status-badge ${week.continuation ? "status-next" : "status-done"}">${escapeHtml(
            week.continuation ? "Continuacao" : `Semana ${week.week_number}`,
          )}</span>
          <p class="timeline-kicker">${escapeHtml(week.calendar_label)}</p>
          <h3>${escapeHtml(week.units?.[0] || "Semana planejada")}</h3>
          <p class="timeline-copy">${week.continuation ? "A leitura completa continua disponivel na Trilha." : `${formatNumber(week.hours, 1)}h em ${week.session_count} sessoes`}</p>
          <ul class="summary-list">
            ${(week.deliverables || []).map((deliverable) => `<li>${escapeHtml(deliverable)}</li>`).join("")}
          </ul>
          ${renderButtonList([
            {
              label: week.primary_label,
              href: week.primary_href,
              variant: "secondary",
            },
            ...(!week.continuation ? week.source_buttons || [] : []),
          ])}
        </article>
      `,
    );
  }

  function renderSnapshot(snapshot, message = "") {
    currentSnapshot = snapshot;
    activeUnitId = resolveActiveUnit(snapshot)?.id || activeUnitId;

    renderCards(
      "progress-summary",
      [
        {
          badge: "Dominio",
          status_class: "status-done",
          title: `${snapshot.masteredUnits.length}/${snapshot.totalUnits} unidades`,
          body: formatPercent(snapshot.coverageRatio),
          note: "Percentual de unidades ja marcadas como dominadas.",
        },
        {
          badge: "Horas equivalentes",
          status_class: snapshot.pace.status_class,
          title: `${formatNumber(snapshot.completedEquivalentHours, 1)}h concluidas`,
          body: `${formatNumber(snapshot.expectedEquivalentHours, 1)}h esperadas`,
          note: "Equivalencia calculada pelo status atual de cada unidade.",
        },
        {
          badge: "Pendencias",
          status_class: snapshot.checkpointUnits.length ? "status-in-progress" : "status-done",
          title: `${snapshot.checkpointUnits.length} em checkpoint`,
          body: `${snapshot.blockedUnits.length} bloqueadas`,
          note: "Checkpoint e bloqueio viram fila explicita de correcao.",
        },
        {
          badge: "Plano restante",
          status_class: snapshot.remainingPlan ? "status-done" : "status-next",
          title: snapshot.remainingPlan ? `${formatNumber(snapshot.remainingPlan.totalHours, 1)}h restantes` : "Sem horas restantes",
          body: snapshot.remainingPlan
            ? `${snapshot.remainingPlan.totalCalendarDays} dias corridos`
            : "Trilha atual fechada",
          note: snapshot.remainingPlan
            ? `${snapshot.remainingPlan.totalWeeks} semanas / ${snapshot.remainingPlan.totalStudySessions} sessoes`
            : "Use o Roadmap para abrir o proximo ciclo.",
        },
      ],
      (item) => `
        <article class="metric-card">
          <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="metric-value">${escapeHtml(item.body)}</p>
          <p class="metric-note">${escapeHtml(item.note)}</p>
        </article>
      `,
    );

    const paceTitle = document.getElementById("progress-pace-title");
    if (paceTitle) {
      paceTitle.textContent = snapshot.pace.title;
    }

    const paceStory = document.getElementById("progress-pace-story");
    if (paceStory) {
      paceStory.textContent =
        `Desde ${formatShortDate(progressState.started_on)}, voce acumulou ${formatNumber(snapshot.completedEquivalentHours, 1)}h equivalentes de estudo ` +
        `contra ${formatNumber(snapshot.expectedEquivalentHours, 1)}h previstas para o ritmo salvo. ${snapshot.pace.summary}`;
    }

    const replanTitle = document.getElementById("progress-replan-title");
    if (replanTitle) {
      replanTitle.textContent = snapshot.remainingPlan
        ? `Restam ${formatNumber(snapshot.remainingPlan.totalHours, 1)}h neste recorte`
        : "Nada pendente na trilha atual";
    }

    const replanStory = document.getElementById("progress-replan-story");
    if (replanStory) {
      replanStory.textContent = snapshot.remainingPlan
        ? `O plano restante fecha em ${snapshot.remainingPlan.totalCalendarDays} dias corridos, priorizando ${snapshot.remainingPlan.focusProfile.label.toLowerCase()} dentro de ${snapshot.remainingPlan.template.label.toLowerCase()}.`
        : "A trilha atual foi marcada como dominada. O proximo passo agora e consolidar capstone, retro e refinamentos reais.";
    }

    renderCards(
      "progress-replan-summary",
      [
        {
          badge: "Ritmo salvo",
          status_class: "status-done",
          title: `${snapshot.preferences.hours_per_day}h x ${snapshot.preferences.days_per_week}d`,
          body: `${formatNumber((snapshot.preferences.hours_per_day || 0) * (snapshot.preferences.days_per_week || 0), 1)}h por semana`,
          note: "Estas preferencias continuam sincronizadas com a Trilha.",
        },
        {
          badge: "Proximo bloco",
          status_class: snapshot.nextPriorityUnit ? "status-in-progress" : "status-done",
          title: snapshot.nextPriorityUnit?.title || "Sem pendencias abertas",
          body: snapshot.nextPriorityUnit?.portal_label || "Fechar ciclo atual",
          note: snapshot.nextPriorityUnit?.exercise || "O restante da energia pode ir para experimentos e capstone.",
        },
        {
          badge: "Checkpoint prioritario",
          status_class: snapshot.nextCheckpointUnit ? "status-in-progress" : "status-done",
          title: snapshot.nextCheckpointUnit?.title || "Nenhum checkpoint pendente",
          body: snapshot.nextCheckpointUnit?.progress_status?.label || "Tudo limpo",
          note: snapshot.nextCheckpointUnit?.deliverable || "Sem fila de revisao pendente.",
        },
        {
          badge: "Ultima atualizacao",
          status_class: "status-done",
          title: formatShortDate(progressState.updated_on),
          body: `${snapshot.elapsedCalendarDays} dias desde o inicio`,
          note: "Revisar esta pagina no fim de cada semana ajuda a manter o plano vivo.",
        },
      ],
      (item) => `
        <article class="metric-card">
          <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="metric-value">${escapeHtml(item.body)}</p>
          <p class="metric-note">${escapeHtml(item.note)}</p>
        </article>
      `,
    );

    renderProgressBoard(snapshot);
    renderProgressUnit(snapshot);
    renderMilestones(snapshot);
    renderRemainingPlan(snapshot);
    renderMissionControlSurface("progresso", buildLearningMissionSnapshot(null, studyUnits));

    if (feedback) {
      feedback.textContent = message;
      if (message) {
        window.clearTimeout(window.__progressFeedbackTimer);
        window.__progressFeedbackTimer = window.setTimeout(() => {
          feedback.textContent = "";
        }, 2400);
      }
    }
  }

  function syncProgress(message = "") {
    const nextPreferences = readPreferences();
    persistAdaptivePathPreferences(nextPreferences);
    trackStudyAnalyticsEvent("adaptive_path_update", {
      page_id: "progresso",
      preferences: nextPreferences,
    });
    renderSnapshot(
      buildProgressSnapshot(
        progressGuide,
        studyUnits,
        learningPathTemplates,
        adaptivePathRules,
        vendorSources,
        nextPreferences,
        progressState,
      ),
      message,
    );
  }

  applyPreferences(savedAdaptivePreferences);

  if (pageContent && pageContent.dataset.progressBound !== "true") {
    pageContent.addEventListener("click", (event) => {
      const flagButton = event.target.closest("[data-flag-toggle]");
      if (flagButton) {
        const result = toggleStudyFlag(flagButton.getAttribute("data-flag-toggle"), {
          id: flagButton.getAttribute("data-flag-id"),
          title: flagButton.getAttribute("data-flag-title"),
          summary: flagButton.getAttribute("data-flag-summary"),
          href: flagButton.getAttribute("data-flag-href"),
          route_label: flagButton.getAttribute("data-flag-route-label"),
          domain: flagButton.getAttribute("data-flag-domain"),
        });
        trackStudyAnalyticsEvent("flag_toggle", {
          page_id: "progresso",
          state: result.active ? "open" : "closed",
        });
        if (currentSnapshot) {
          renderSnapshot(currentSnapshot, result.active ? "Flag adicionada." : "Flag removida.");
        }
        return;
      }

      const focusButton = event.target.closest("[data-progress-unit-focus]");
      if (focusButton) {
        activeUnitId = focusButton.getAttribute("data-progress-unit-focus");
        const trackedUnit = currentSnapshot?.planUnits?.find((unit) => unit.id === activeUnitId);
        if (trackedUnit) {
          trackStudyAnalyticsEvent("unit_focus", {
            page_id: "progresso",
            unit_id: trackedUnit.id,
            title: trackedUnit.title,
            domain: trackedUnit.domain,
          });
        }
        if (currentSnapshot) {
          renderSnapshot(currentSnapshot);
        }
        return;
      }

      const statusButton = event.target.closest("[data-progress-status]");
      if (!statusButton) {
        return;
      }

      const unitId = statusButton.getAttribute("data-progress-unit");
      const statusId = statusButton.getAttribute("data-progress-status");
      if (!unitId || !statusLookup.has(statusId)) {
        return;
      }

      progressState = updateProgressRecord(progressState, unitId, statusId);
      persistStudyProgressState(progressState);
      const trackedUnit = currentSnapshot?.planUnits?.find((unit) => unit.id === unitId);
      if (trackedUnit) {
        trackStudyAnalyticsEvent("progress_status", {
          page_id: "progresso",
          unit_id: trackedUnit.id,
          title: trackedUnit.title,
          domain: trackedUnit.domain,
          status_id: statusId,
          recent_lab_window_hours: 72,
        });
      }
      activeUnitId = unitId;
      syncProgress("Progresso atualizado.");
    });

    pageContent.dataset.progressBound = "true";
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    syncProgress("Plano restante recalculado.");
  });

  [hoursPerDay, daysPerWeek, level, focus, goal].forEach((element) => {
    element?.addEventListener("change", () => syncProgress("Configuracao de replanejamento atualizada."));
  });

  const resetButton = document.getElementById("progress-reset");
  resetButton?.addEventListener("click", () => {
    applyPreferences(loadAdaptivePathPreferences(defaults));
    syncProgress("Configuracao salva reaplicada.");
  });

  syncProgress();
}

function renderPromptLibrary(containerId, examples, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  if (!examples || examples.length === 0) {
    container.innerHTML = '<div class="empty-note">Nenhum exemplo disponivel nesta camada.</div>';
    return;
  }

  container.innerHTML = examples
    .map(
      (item) => `
        <article class="prompt-example-card" id="prompt-example-${escapeHtml(item.id)}">
          <div class="prompt-example-header">
            <div class="prompt-example-meta">
              <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.level_label)}</span>
              <span class="label">${escapeHtml(item.family)}</span>
              ${
                item.product_tier
                  ? `<span class="label subtle-label">${escapeHtml(item.product_tier)}</span>`
                  : ""
              }
            </div>
            <div class="prompt-example-actions">
              <button
                class="favorite-button ${isPromptFavorite("examples", item.id, options.favorites) ? "active" : ""}"
                type="button"
                data-favorite-example="${escapeHtml(item.id)}"
                aria-pressed="${isPromptFavorite("examples", item.id, options.favorites)}"
              >
                ${isPromptFavorite("examples", item.id, options.favorites) ? "Favorito" : "Salvar"}
              </button>
            </div>
            <h3>${escapeHtml(item.title)}</h3>
            <p class="card-copy">${escapeHtml(item.objective)}</p>
            ${renderTagList([item.use_case, ...(item.tags || [])])}
          </div>
          <div class="prompt-example-layout">
            <div class="data-panel prompt-formula-panel">
              <pre class="prompt-skeleton">${escapeHtml(item.prompt)}</pre>
            </div>
            <aside class="evidence-panel prompt-side-panel">
              <span class="eyebrow">Quando usar</span>
              <ul class="resource-list">
                ${(item.when_use || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
              </ul>
              <div class="prompt-decision-block">
                <strong>Quando nao usar</strong>
                <ul class="resource-list">
                  ${(item.when_not_use || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
                </ul>
              </div>
              <div class="prompt-decision-block">
                <strong>Erro comum</strong>
                <p>${escapeHtml(item.common_error)}</p>
              </div>
              ${renderButtonList(item.source_buttons || [])}
            </aside>
          </div>
          <div class="cards-grid cards-grid-3 prompt-block-grid">
            ${(item.blocks || [])
              .map(
                (block) => `
                  <article class="study-card compact-card">
                    <span class="label">${escapeHtml(block.label)}</span>
                    <p class="prompt-block-excerpt">${escapeHtml(block.excerpt)}</p>
                    <p class="card-copy">${escapeHtml(block.why)}</p>
                  </article>
                `,
              )
              .join("")}
          </div>
        </article>
      `,
    )
    .join("");

  container.querySelectorAll("[data-favorite-example]").forEach((button) => {
    button.addEventListener("click", () => {
      const exampleId = button.getAttribute("data-favorite-example");
      togglePromptFavorite("examples", exampleId);
    });
  });
}

function toCleanLines(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatPromptSection(title, value) {
  const content = String(value || "").trim();
  if (!content) {
    return null;
  }

  return `${title}:\n${content}`;
}

function formatPromptBulletSection(title, value) {
  const lines = toCleanLines(value).map((line) =>
    /^[-*]|\d+\./.test(line) || line.startsWith("{") || line.startsWith("<") ? line : `- ${line}`,
  );

  if (lines.length === 0) {
    return null;
  }

  return `${title}:\n${lines.join("\n")}`;
}

function computePromptBuilderEscalation(flags) {
  const actions = [];

  if (flags.requires_schema) {
    actions.push({
      label: "Schema",
      reason: "A saida precisa ser previsivel e pronta para integracao.",
    });
  }

  if (flags.requires_citations) {
    actions.push({
      label: "RAG",
      reason: "A resposta precisa de fonte verificavel ou base documental citavel.",
    });
  }

  if (flags.requires_tools) {
    actions.push({
      label: "Tools",
      reason: "A tarefa depende de busca, calculo, consulta externa ou acao real.",
    });
  }

  if (flags.high_risk) {
    actions.push({
      label: "Workflow",
      reason: "Existe risco alto e a tarefa pede validacao humana ou governanca adicional.",
    });
  }

  return actions;
}

function buildPromptBuilderPrompt(template, mode, values, flags) {
  const escalation = computePromptBuilderEscalation(flags);
  const sections = [
    formatPromptSection("Papel", values.role),
    formatPromptSection("Objetivo", values.objective),
    formatPromptSection("Contexto", values.context),
    formatPromptBulletSection("Restricoes", values.constraints),
    formatPromptBulletSection("Criterio de aceite", values.acceptance),
    formatPromptSection("Formato de saida", values.outputFormat),
    formatPromptSection("Exemplos ou referencias opcionais", values.examples),
    formatPromptSection("Fallback quando faltar contexto", values.fallback),
    escalation.length > 0
      ? formatPromptBulletSection(
          "Escalada recomendada antes de responder",
          escalation.map((item) => `${item.label}: ${item.reason}`).join("\n"),
        )
      : null,
    formatPromptSection(
      mode.id === "study" ? "Regra final de revisao" : "Regra final de execucao",
      mode.closing_instruction,
    ),
  ].filter(Boolean);

  return sections.join("\n\n");
}

function computePromptBuilderDiagnostics(template, mode, values, flags) {
  const requiredBlocks = [
    { key: "role", label: "Papel" },
    { key: "objective", label: "Objetivo" },
    { key: "context", label: "Contexto" },
    { key: "acceptance", label: "Criterio de aceite" },
    { key: "outputFormat", label: "Formato de saida" },
  ];

  const completedBlocks = requiredBlocks.filter((item) => String(values[item.key] || "").trim()).length;
  const completenessRatio = completedBlocks / requiredBlocks.length;
  const firstMissing = requiredBlocks.find((item) => !String(values[item.key] || "").trim());
  const escalation = computePromptBuilderEscalation(flags);

  const readiness =
    completenessRatio === 1 ? "Pronto para testar" : completenessRatio >= 0.6 ? "Quase pronto" : "Ainda generico";
  const readinessClass =
    completenessRatio === 1 ? "status-done" : completenessRatio >= 0.6 ? "status-in-progress" : "status-risk";

  return [
    {
      badge: "Prontidao",
      status_class: readinessClass,
      title: readiness,
      value: `${completedBlocks}/${requiredBlocks.length}`,
      note: firstMissing ? `Falta reforcar: ${firstMissing.label}.` : "Todos os blocos criticos estao preenchidos.",
    },
    {
      badge: "Escalada",
      status_class: escalation.length > 0 ? "status-in-progress" : "status-done",
      title: escalation.length > 0 ? escalation.map((item) => item.label).join(" + ") : "Prompt puro ainda basta",
      value: escalation.length > 0 ? String(escalation.length) : "0",
      note:
        escalation.length > 0
          ? escalation[0].reason
          : "Sem sinais fortes de schema, RAG, tools ou workflow no estado atual.",
    },
    {
      badge: "Modo",
      status_class: mode.status_class || "status-done",
      title: mode.label,
      value: template.level_label,
      note: mode.summary,
    },
    {
      badge: "Template",
      status_class: template.status_class || "status-done",
      title: template.title,
      value: template.best_for,
      note: template.summary,
    },
  ];
}

function buildPromptBuilderState(template, mode, values, flags) {
  const escalation = computePromptBuilderEscalation(flags);
  const prompt = buildPromptBuilderPrompt(template, mode, values, flags);
  const diagnostics = computePromptBuilderDiagnostics(template, mode, values, flags);

  return {
    template,
    mode,
    values,
    flags,
    escalation,
    prompt,
    diagnostics,
  };
}

function publishPromptBuilderState(state) {
  window.__promptBuilderState = state;
  document.dispatchEvent(
    new CustomEvent("prompt-builder:updated", {
      detail: state,
    }),
  );
}

function formatXmlSection(tag, value) {
  const content = String(value || "").trim();
  if (!content) {
    return null;
  }

  return `<${tag}>\n${content}\n</${tag}>`;
}

function uniqueNotes(items) {
  return [...new Set((items || []).map((item) => String(item || "").trim()).filter(Boolean))];
}

function collectProviderOverlayNotes(provider, state) {
  const notes = [];
  const providerNotes = provider?.notes || {};

  if (providerNotes.default) {
    notes.push(providerNotes.default);
  }

  if (state?.mode?.id === "study" && providerNotes.mode_study) {
    notes.push(providerNotes.mode_study);
  }

  if (state?.mode?.id === "operation" && providerNotes.mode_operation) {
    notes.push(providerNotes.mode_operation);
  }

  if (state?.flags?.requires_schema && providerNotes.requires_schema) {
    notes.push(providerNotes.requires_schema);
  }

  if (state?.flags?.requires_citations && providerNotes.requires_citations) {
    notes.push(providerNotes.requires_citations);
  }

  if (state?.flags?.requires_tools && providerNotes.requires_tools) {
    notes.push(providerNotes.requires_tools);
  }

  if (state?.flags?.high_risk && providerNotes.high_risk) {
    notes.push(providerNotes.high_risk);
  }

  const templateNote = provider?.template_bias?.[state?.template?.id];
  if (templateNote) {
    notes.push(templateNote);
  }

  return uniqueNotes(notes);
}

function buildOpenAiOverlayPrompt(provider, state, notes) {
  const values = state.values || {};
  const escalation = state.escalation || [];

  return [
    formatPromptBulletSection(
      "SYSTEM PRIORITIES",
      [
        `Role: ${values.role || "Defina um papel claro antes de usar esta variante."}`,
        notes[0],
        notes[1],
      ]
        .filter(Boolean)
        .join("\n"),
    ),
    formatPromptSection("TASK", values.objective),
    formatPromptSection("WORKING CONTEXT", values.context),
    formatPromptBulletSection("CONSTRAINTS", values.constraints),
    formatPromptBulletSection("COMPLETION CRITERIA", values.acceptance),
    formatPromptSection("OUTPUT CONTRACT", values.outputFormat),
    formatPromptSection("REFERENCE EXAMPLES", values.examples),
    formatPromptSection(
      "IF CONTEXT IS INSUFFICIENT",
      values.fallback || "State exactly what is missing before continuing.",
    ),
    state.flags?.requires_citations
      ? formatPromptBulletSection(
          "GROUNDING RULES",
          "Support each critical claim with the source or quote that justifies it.\nIf the context cannot support a claim, say that the source is missing.",
        )
      : null,
    state.flags?.requires_tools
      ? formatPromptBulletSection(
          "TOOL RULES",
          "Use the required tool step before finalizing.\nSummarize what was verified through tools before the final answer.",
        )
      : null,
    state.flags?.requires_schema
      ? formatPromptSection(
          "STRUCTURED OUTPUT",
          "Return the final answer using the required schema, with no extra prose outside the contract.",
        )
      : null,
    state.flags?.high_risk
      ? formatPromptSection(
          "HUMAN CHECK",
          "Before any irreversible or sensitive action, summarize the risk and ask for confirmation.",
        )
      : null,
    escalation.length > 0
      ? formatPromptBulletSection(
          "ESCALATION BEFORE EXECUTION",
          escalation.map((item) => `${item.label}: ${item.reason}`).join("\n"),
        )
      : null,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildAnthropicOverlayPrompt(provider, state, notes) {
  const values = state.values || {};
  const instructionLines = [
    `Role: ${values.role || "Defina um papel claro antes de usar esta variante."}`,
    `Task: ${values.objective || "Defina um objetivo observavel."}`,
    notes[0],
    notes[1],
  ]
    .filter(Boolean)
    .join("\n");

  return [
    formatXmlSection("context", values.context),
    formatXmlSection("examples", values.examples),
    formatXmlSection("instructions", instructionLines),
    formatXmlSection("constraints", toCleanLines(values.constraints).join("\n")),
    formatXmlSection("acceptance_criteria", toCleanLines(values.acceptance).join("\n")),
    formatXmlSection("output_format", values.outputFormat),
    state.flags?.requires_citations
      ? formatXmlSection(
          "quote_first_policy",
          "First extract the most relevant quotes from the context. Then answer using only what those quotes support.",
        )
      : null,
    state.flags?.requires_tools
      ? formatXmlSection(
          "tool_policy",
          "If a tool or lookup is required, state the dependency clearly and use the tool step before the final answer.",
        )
      : null,
    state.flags?.requires_schema
      ? formatXmlSection(
          "structured_output_policy",
          "Treat the requested format as a hard contract and do not add text outside the agreed structure.",
        )
      : null,
    state.flags?.high_risk
      ? formatXmlSection(
          "human_review_gate",
          "If the task has financial, legal or irreversible impact, stop and ask for human validation before the action step.",
        )
      : null,
    formatXmlSection(
      "fallback",
      values.fallback || "If the context is not sufficient, say exactly what is missing before answering.",
    ),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildGoogleOverlayPrompt(provider, state, notes) {
  const values = state.values || {};
  const requirementLines = [
    values.acceptance,
    notes[0],
    notes[1],
  ]
    .filter(Boolean)
    .join("\n");

  return [
    formatPromptSection(
      "SYSTEM INSTRUCTION",
      `${values.role || "Defina um papel claro antes de usar esta variante."} Follow the response contract exactly and do not guess when the context is not enough.`,
    ),
    formatPromptSection("TASK", values.objective),
    formatPromptSection("CONTEXT", values.context),
    formatPromptBulletSection("RESPONSE REQUIREMENTS", requirementLines),
    formatPromptBulletSection("CONSTRAINTS", values.constraints),
    formatPromptSection("OUTPUT FORMAT", values.outputFormat),
    formatPromptSection("FEW-SHOT OR HINTS", values.examples),
    state.flags?.requires_citations
      ? formatPromptBulletSection(
          "GROUNDING PLAN",
          "Use grounding or retrieved sources before finalizing the answer.\nIf the current context cannot support the answer, ask for the missing source instead of guessing.",
        )
      : null,
    state.flags?.requires_schema
      ? formatPromptSection(
          "CONTROLLED OUTPUT",
          "Respect the required structure exactly. If a value is missing, return null or state the gap according to the contract.",
        )
      : null,
    state.flags?.requires_tools
      ? formatPromptSection(
          "TOOL OR SEARCH STEP",
          "If external lookup, search or execution is required, do that before the final answer and mention what was checked.",
        )
      : null,
    state.flags?.high_risk
      ? formatPromptSection(
          "RISK GATE",
          "If the task has sensitive impact, do not guess or overcommit. Stop and request the missing confirmation before acting.",
        )
      : null,
    formatPromptSection(
      "WHEN CONTEXT IS NOT ENOUGH",
      values.fallback || "State what is missing and stop before guessing.",
    ),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildXaiOverlayPrompt(provider, state, notes) {
  const values = state.values || {};
  const developerRules = [
    `Role: ${values.role || "Defina um papel claro antes de usar esta variante."}`,
    `Goal: ${values.objective || "Defina um objetivo observavel."}`,
    notes[0],
    notes[1],
  ]
    .filter(Boolean)
    .join("\n");

  return [
    formatPromptSection("DEVELOPER MESSAGE", developerRules),
    formatPromptSection("USER CONTEXT", values.context),
    formatPromptBulletSection("RULES", values.constraints),
    formatPromptBulletSection("SUCCESS CHECKS", values.acceptance),
    formatPromptSection("RESPONSE FORMAT", values.outputFormat),
    formatPromptSection("REFERENCE SNIPPETS", values.examples),
    state.flags?.requires_schema
      ? formatPromptSection(
          "STRUCTURED OUTPUT HANDOFF",
          "Use json_schema or structured outputs with strict contract instead of relying only on prose compliance.",
        )
      : null,
    state.flags?.requires_tools
      ? formatPromptBulletSection(
          "TOOL SURFACE",
          "Use only approved tools.\nKeep the allowed tool surface narrow.\nTreat approval and side effects as application responsibilities.",
        )
      : null,
    state.flags?.requires_citations
      ? formatPromptSection(
          "GROUNDING NOTE",
          "If the answer depends on current or external information, use search or retrieval before finalizing the answer.",
        )
      : null,
    state.flags?.high_risk
      ? formatPromptSection(
          "HUMAN GOVERNANCE",
          "Do not execute sensitive or irreversible decisions without a human checkpoint in the surrounding application.",
        )
      : null,
    formatPromptSection(
      "FALLBACK",
      values.fallback || "If the task cannot be completed safely, state what is missing or which tool is required.",
    ),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildProviderOverlayPrompt(provider, state, notes) {
  if (!provider || !state) {
    return "Use o builder acima para gerar um prompt base e depois compare as adaptacoes por fornecedor.";
  }

  const builders = {
    openai: buildOpenAiOverlayPrompt,
    anthropic: buildAnthropicOverlayPrompt,
    google: buildGoogleOverlayPrompt,
    xai: buildXaiOverlayPrompt,
  };

  const builder = builders[provider.id] || buildOpenAiOverlayPrompt;
  return builder(provider, state, notes);
}

function computeProviderOverlayAdjustments(provider, state, notes) {
  const shifts = Array.isArray(provider?.shift_cards) ? provider.shift_cards : [];
  const escalation = Array.isArray(state?.escalation) ? state.escalation : [];
  const escalationLabel =
    escalation.length > 0 ? escalation.map((item) => item.label).join(" + ") : "Prompt puro ainda basta";

  return [
    {
      kicker: "Mudanca principal",
      title: shifts[0]?.title || "Contrato mais claro",
      description: notes[0] || provider?.summary || "",
    },
    {
      kicker: "Quando isso importa",
      title: shifts[1]?.title || "Ajuste operacional",
      description: notes[1] || provider?.template_bias?.[state?.template?.id] || provider?.summary || "",
    },
    {
      kicker: "Template atual",
      title: state?.template?.title || "Template nao selecionado",
      description: provider?.template_bias?.[state?.template?.id] || state?.template?.best_for || provider?.summary || "",
    },
    {
      kicker: "Escalada agora",
      title: escalationLabel,
      description:
        escalation.length > 0
          ? escalation.map((item) => `${item.label}: ${item.reason}`).join(" ")
          : "Sem sinais fortes de schema, RAG, tools ou workflow no estado atual.",
    },
  ];
}

function computeProviderOverlaySignals(provider, state, notes) {
  const escalation = Array.isArray(state?.escalation) ? state.escalation : [];

  return [
    {
      badge: "Modelo",
      status_class: provider?.status_class || "status-done",
      title: provider?.model_label || provider?.label || "Fornecedor",
      value: state?.mode?.label || "Modo nao definido",
      note: provider?.summary || "",
    },
    {
      badge: "Ajuste principal",
      status_class: "status-in-progress",
      title: provider?.shift_cards?.[0]?.title || "Contrato mais forte",
      value: state?.template?.level_label || "Template",
      note: notes[0] || provider?.summary || "",
    },
    {
      badge: "Escalada",
      status_class: escalation.length > 0 ? "status-in-progress" : "status-done",
      title: escalation.length > 0 ? escalation.map((item) => item.label).join(" + ") : "Prompt puro",
      value: escalation.length > 0 ? String(escalation.length) : "0",
      note:
        escalation.length > 0
          ? escalation.map((item) => item.reason).join(" ")
          : "Sem sinais fortes de schema, RAG, tools ou workflow no estado atual.",
    },
    {
      badge: "Template",
      status_class: state?.template?.status_class || "status-done",
      title: state?.template?.title || "Template nao definido",
      value: provider?.label || "Fornecedor",
      note: provider?.template_bias?.[state?.template?.id] || state?.template?.summary || "",
    },
  ];
}

function renderPromptProviderOverlays(promptProviderOverlays) {
  if (!promptProviderOverlays) {
    return;
  }

  renderCards(
    "provider-overlays-overview",
    promptProviderOverlays.overview || [],
    (item) => `
      <article class="metric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="metric-value">${escapeHtml(item.body)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  renderCards(
    "provider-overlay-radar",
    promptProviderOverlays.radar || [],
    (item) => `
      <article class="artifact-card compact-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );

  const providers = Array.isArray(promptProviderOverlays.providers) ? promptProviderOverlays.providers : [];
  if (providers.length === 0) {
    return;
  }

  const overlayElements = {
    switcher: document.getElementById("provider-overlay-switcher"),
    eyebrow: document.getElementById("provider-overlay-eyebrow"),
    title: document.getElementById("provider-overlay-title"),
    summary: document.getElementById("provider-overlay-summary"),
    previewTitle: document.getElementById("provider-overlay-preview-title"),
    previewNote: document.getElementById("provider-overlay-preview-note"),
    model: document.getElementById("provider-overlay-model"),
    mode: document.getElementById("provider-overlay-mode"),
    principles: document.getElementById("provider-overlay-principles"),
    adjustments: document.getElementById("provider-overlay-adjustments"),
    output: document.getElementById("provider-overlay-output"),
    signals: document.getElementById("provider-overlay-signals"),
    officials: document.getElementById("provider-overlay-officials"),
  };

  let activeProviderId = providers[0].id;

  function getActiveProvider() {
    return providers.find((item) => item.id === activeProviderId) || providers[0];
  }

  function renderProviderSwitcher() {
    if (!overlayElements.switcher) {
      return;
    }

    overlayElements.switcher.innerHTML = providers
      .map(
        (provider) => `
          <button
            class="builder-chip ${provider.id === activeProviderId ? "active" : ""}"
            type="button"
            data-provider-id="${escapeHtml(provider.id)}"
          >
            <span>
              <strong>${escapeHtml(provider.label)}</strong>
              <small>${escapeHtml(provider.model_label)}</small>
            </span>
          </button>
        `,
      )
      .join("");

    overlayElements.switcher.querySelectorAll("[data-provider-id]").forEach((button) => {
      button.addEventListener("click", () => {
        activeProviderId = button.getAttribute("data-provider-id");
        renderProviderSwitcher();
        renderProviderState(window.__promptBuilderState || null);
      });
    });
  }

  function renderProviderState(state) {
    const provider = getActiveProvider();
    const notes = collectProviderOverlayNotes(provider, state);

    if (overlayElements.eyebrow) {
      overlayElements.eyebrow.textContent = provider.label;
    }

    if (overlayElements.title) {
      overlayElements.title.textContent = provider.model_label;
    }

    if (overlayElements.summary) {
      overlayElements.summary.textContent = provider.summary;
    }

    if (overlayElements.previewTitle) {
      overlayElements.previewTitle.textContent = state?.template?.title
        ? `${state.template.title} adaptado para ${provider.label}`
        : `Versao ${provider.label} do prompt atual`;
    }

    if (overlayElements.previewNote) {
      overlayElements.previewNote.textContent =
        notes[0] || "Escolha um fornecedor para ver o que muda no mesmo prompt.";
    }

    if (overlayElements.model) {
      overlayElements.model.textContent = provider.model_label;
      overlayElements.model.className = `status-badge ${provider.status_class || "status-done"}`;
    }

    if (overlayElements.mode) {
      overlayElements.mode.textContent = state?.mode?.label || "Sem modo";
      overlayElements.mode.className = `status-badge ${state?.mode?.status_class || "status-next"}`;
    }

    renderCards(
      "provider-overlay-principles",
      provider.principles || [],
      (item) => `
        <article class="study-card compact-card">
          <span class="label">${escapeHtml(item.kicker)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.description)}</p>
        </article>
      `,
    );

    renderCards(
      "provider-overlay-adjustments",
      computeProviderOverlayAdjustments(provider, state, notes),
      (item) => `
        <article class="study-card compact-card provider-adjustment-card">
          <span class="label">${escapeHtml(item.kicker)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.description)}</p>
        </article>
      `,
    );

    if (overlayElements.output) {
      overlayElements.output.textContent = buildProviderOverlayPrompt(provider, state, notes);
    }

    renderCards(
      "provider-overlay-signals",
      computeProviderOverlaySignals(provider, state, notes),
      (item) => `
        <article class="metric-card builder-diagnostic-card">
          <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="builder-diagnostic-value">${escapeHtml(item.value)}</p>
          <p class="metric-note">${escapeHtml(item.note)}</p>
        </article>
      `,
    );

    renderCards(
      "provider-overlay-officials",
      (provider.official_buttons || []).map((button) => ({
        title: button.label,
        summary: provider.summary,
        buttons: [button],
      })),
      (item) => `
        <article class="artifact-card compact-card">
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.summary)}</p>
          ${renderButtonList(item.buttons || [])}
        </article>
      `,
    );
  }

  renderProviderSwitcher();
  renderProviderState(window.__promptBuilderState || null);
  document.addEventListener("prompt-builder:updated", (event) => {
    renderProviderState(event.detail || window.__promptBuilderState || null);
  });
}

function normalizePromptValue(value) {
  return String(value || "").trim();
}

function countPromptLines(value) {
  return normalizePromptValue(value)
    .split(/\n+/)
    .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
    .filter(Boolean).length;
}

function hasPromptPattern(text, pattern) {
  return pattern.test(normalizePromptValue(text));
}

function computePromptQualityMetric(metric, state) {
  const values = state?.values || {};
  const flags = state?.flags || {};
  const escalation = Array.isArray(state?.escalation) ? state.escalation : [];
  const role = normalizePromptValue(values.role);
  const objective = normalizePromptValue(values.objective);
  const context = normalizePromptValue(values.context);
  const constraints = normalizePromptValue(values.constraints);
  const acceptance = normalizePromptValue(values.acceptance);
  const outputFormat = normalizePromptValue(values.outputFormat);
  const examples = normalizePromptValue(values.examples);
  const fallback = normalizePromptValue(values.fallback);
  const constraintsLines = countPromptLines(constraints);
  const acceptanceLines = countPromptLines(acceptance);
  const outputLines = countPromptLines(outputFormat);
  const contextLength = context.length;
  const objectiveLength = objective.length;
  const fallbackGuard =
    Boolean(fallback) ||
    hasPromptPattern([constraints, acceptance, outputFormat].join("\n"), /falt|insuf|inconclus|null|missing|nao bast/i);
  const structuredOutput = hasPromptPattern(outputFormat, /json|schema|^\s*\{|^\s*\d+\.\s|^\s*modo:|^\s*categoria:|^\s*status:/im);
  const evidenceLanguage = hasPromptPattern(
    [constraints, acceptance, outputFormat, fallback].join("\n"),
    /cit|fonte|evid|trecho|ground|retrieve|search/i,
  );
  const decisionLanguage = hasPromptPattern(outputFormat, /resumo|status|risco|proxima acao|categoria|json|modo/i);

  let score = 0;
  let note = "";

  switch (metric.id) {
    case "clarity":
      score += role ? 22 : 0;
      score += objective ? 28 : 0;
      score += objectiveLength >= 70 ? 20 : objectiveLength >= 28 ? 12 : 0;
      score += outputFormat ? 18 : 0;
      score += acceptance ? 12 : 0;
      note = role && objective
        ? "Papel e objetivo estao visiveis. O principal agora e manter a formulacao observavel."
        : "Sem papel e objetivo claros, o prompt ainda deixa espaco demais para interpretacao.";
      break;
    case "control":
      score += constraintsLines > 0 ? 22 : 0;
      score += acceptanceLines > 0 ? 24 : 0;
      score += outputLines > 0 ? 24 : 0;
      score += structuredOutput ? 16 : 0;
      score += flags.requires_schema && structuredOutput ? 14 : !flags.requires_schema ? 8 : 0;
      note = acceptanceLines > 0 && outputLines > 0
        ? "O prompt ja mostra criterio e contrato de saida, que sao os maiores estabilizadores de resposta."
        : "A resposta ainda depende demais da boa vontade do modelo porque falta contrato explicito.";
      break;
    case "context_fidelity":
      score += contextLength >= 240 ? 35 : contextLength >= 80 ? 24 : contextLength >= 24 ? 12 : 0;
      score += fallbackGuard ? 16 : 0;
      score += evidenceLanguage ? 16 : 0;
      score += flags.requires_citations ? (contextLength >= 80 ? 17 : 6) : 11;
      score += escalation.some((item) => item.label === "RAG") ? 16 : 0;
      note = contextLength >= 80
        ? "Existe material suficiente para orientar a resposta. O ponto critico e manter a honestidade quando a base nao bastar."
        : "O contexto ainda esta curto para tarefas mais exigentes. Reforce fatos, dados ou fontes que mudam a decisao.";
      break;
    case "ambiguity_robustness":
      score += fallbackGuard ? 34 : 0;
      score += examples ? 14 : 0;
      score += hasPromptPattern([constraints, acceptance, fallback].join("\n"), /falt|insuf|inconclus|null|esclare/i) ? 20 : 0;
      score += context ? 12 : 0;
      score += flags.high_risk && escalation.some((item) => item.label === "Workflow") ? 20 : flags.high_risk ? 6 : 12;
      note = fallbackGuard
        ? "O prompt ja reduz improviso quando falta base. Agora vale testar casos limites de verdade."
        : "Sem fallback e regra para insuficiencia, o modelo tende a improvisar quando o input vier fraco.";
      break;
    case "output_quality":
      score += outputLines > 0 ? 28 : 0;
      score += acceptanceLines > 0 ? 18 : 0;
      score += decisionLanguage ? 18 : 0;
      score += structuredOutput ? 18 : 0;
      score += state?.mode?.id === "operation" ? 10 : 8;
      score += flags.high_risk ? 8 : 10;
      note = decisionLanguage || structuredOutput
        ? "A saida ja aponta para reutilizacao, revisao ou acao. Esse e o teste pragmatico mais importante."
        : "A resposta ainda corre risco de sair correta em tese, mas pouco util para o trabalho seguinte.";
      break;
    default:
      score = 0;
      note = metric.description || "";
      break;
  }

  const finalScore = Math.max(0, Math.min(100, score));
  const statusClass =
    finalScore >= 85 ? "status-done" : finalScore >= 65 ? "status-in-progress" : "status-risk";
  const verdict =
    finalScore >= 85 ? "Forte" : finalScore >= 65 ? "Bom" : finalScore >= 45 ? "Em ajuste" : "Fraco";

  return {
    ...metric,
    score: finalScore,
    score_label: `${finalScore}/100`,
    verdict,
    status_class: statusClass,
    note,
  };
}

function computePromptQualityAudit(promptQualityLab, state) {
  const safeState = state || {
    template: null,
    mode: null,
    values: {},
    flags: {},
    escalation: [],
    diagnostics: [],
  };
  const metrics = (promptQualityLab?.rubric || []).map((metric) => computePromptQualityMetric(metric, safeState));
  const overallScore =
    metrics.length > 0
      ? Math.round(metrics.reduce((total, metric) => total + metric.score, 0) / metrics.length)
      : 0;
  const overallStatus =
    overallScore >= 85 ? "status-done" : overallScore >= 65 ? "status-in-progress" : "status-risk";
  const overallVerdict =
    overallScore >= 85
      ? "Prompt forte"
      : overallScore >= 65
        ? "Prompt bom com margem"
        : overallScore >= 45
          ? "Prompt em ajuste"
          : "Prompt ainda fragil";

  const suggestions = [];
  const lowMetrics = [...metrics].sort((left, right) => left.score - right.score);

  lowMetrics.forEach((metric) => {
    if (metric.score >= 72) {
      return;
    }

    const titles = {
      clarity: "Reescreva objetivo e papel",
      control: "Fortalezca criterio e contrato de saida",
      context_fidelity: "Reforce contexto e origem confiavel",
      ambiguity_robustness: "Defina fallback e regra para insuficiencia",
      output_quality: "Transforme a saida em algo reutilizavel",
    };

    suggestions.push({
      title: titles[metric.id] || metric.title,
      description: metric.improve_hint || metric.note,
      status_class: metric.status_class,
    });
  });

  if (safeState.flags?.requires_citations) {
    suggestions.push({
      title: "Se precisa de fonte, trate retrieval como parte da tarefa",
      description: "Quando a resposta precisa ser verificavel, o ganho real pode vir de RAG, grounding ou busca, nao so de um prompt mais bonito.",
      status_class: "status-in-progress",
    });
  }

  if (safeState.flags?.high_risk) {
    suggestions.push({
      title: "Escalone risco alto para governanca humana",
      description: "Se a decisao e sensivel, use o prompt como parte do workflow e nao como autoridade final isolada.",
      status_class: "status-in-progress",
    });
  }

  const recommendations = suggestions
    .filter((item, index, collection) => collection.findIndex((entry) => entry.title === item.title) === index)
    .slice(0, 4)
    .map((item, index) => ({
      badge: `Prioridade ${index + 1}`,
      ...item,
    }));

  const stressTests = [
    {
      badge: "Teste",
      status_class: metrics.find((item) => item.id === "ambiguity_robustness")?.status_class || "status-risk",
      title: "Input ambiguo",
      value:
        metrics.find((item) => item.id === "ambiguity_robustness")?.score >= 70 ? "Resiste bem" : "Precisa reforco",
      note:
        metrics.find((item) => item.id === "ambiguity_robustness")?.score >= 70
          ? "Existe fallback ou regra explicita para quando o contexto nao sustenta resposta firme."
          : "Inclua fallback, status inconclusivo ou criterio para dizer quando o modelo deve parar e pedir base melhor.",
    },
    {
      badge: "Teste",
      status_class: metrics.find((item) => item.id === "context_fidelity")?.status_class || "status-risk",
      title: "Contexto insuficiente",
      value:
        metrics.find((item) => item.id === "context_fidelity")?.score >= 70 ? "Controlado" : "Risco de chute",
      note:
        safeState.flags?.requires_citations
          ? "Como voce marcou necessidade de citacao, valide se retrieval ou grounding entram antes da resposta final."
          : "Se o contexto for curto demais, o prompt deve dizer o que falta em vez de compensar no improviso.",
    },
    {
      badge: "Teste",
      status_class: metrics.find((item) => item.id === "control")?.status_class || "status-risk",
      title: "Saida integravel",
      value:
        safeState.flags?.requires_schema || hasPromptPattern(safeState.values?.outputFormat, /json|^\s*\{|^\s*\d+\.\s/im)
          ? "Bem encaminhada"
          : "Atencao",
      note:
        safeState.flags?.requires_schema
          ? "O prompt ja sinaliza necessidade de contrato. O proximo passo e endurecer schema e validacao."
          : "Se a resposta alimentar outra etapa, explicite melhor formato, campos e comportamento para dados ausentes.",
    },
    {
      badge: "Teste",
      status_class: safeState.flags?.high_risk ? "status-in-progress" : "status-done",
      title: "Risco sensivel",
      value: safeState.flags?.high_risk ? "Exige governanca" : "Baixo risco",
      note:
        safeState.flags?.high_risk
          ? "Este caso pede checkpoint humano, logs ou workflow governado antes de promover o prompt para operacao."
          : "Sem risco alto marcado, o foco principal continua sendo clareza, controle e utilidade da saida.",
    },
  ];

  return {
    metrics,
    overallScore,
    overallStatus,
    overallVerdict,
    recommendations,
    stressTests,
  };
}

function findPromptQualityChecklist(checklists, state) {
  const templateId = state?.template?.id;
  return (
    checklists.find((item) => Array.isArray(item.template_ids) && item.template_ids.includes(templateId)) ||
    checklists[0] ||
    null
  );
}

function renderPromptQualityLab(promptQualityLab) {
  if (!promptQualityLab) {
    return;
  }

  renderCards(
    "prompt-quality-overview",
    promptQualityLab.overview || [],
    (item) => `
      <article class="metric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="metric-value">${escapeHtml(item.body)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  renderCards(
    "prompt-quality-rubric",
    promptQualityLab.rubric || [],
    (item) => `
      <article class="study-card compact-card quality-rubric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          ${(item.questions || []).map((question) => `<li>${escapeHtml(question)}</li>`).join("")}
        </ul>
        <p class="metric-note">${escapeHtml(item.improve_hint)}</p>
        ${renderButtonList(item.official_buttons || [])}
      </article>
    `,
  );

  renderCards(
    "prompt-quality-loop",
    promptQualityLab.iteration_loop || [],
    (item) => `
      <article class="study-card compact-card quality-loop-card">
        <span class="label">${escapeHtml(item.kicker)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
      </article>
    `,
  );

  const qualityElements = {
    title: document.getElementById("prompt-quality-title"),
    summary: document.getElementById("prompt-quality-summary"),
    scoreBadge: document.getElementById("prompt-quality-score-badge"),
    focusBadge: document.getElementById("prompt-quality-focus-badge"),
    checklistTitle: document.getElementById("prompt-quality-checklist-title"),
    checklistSummary: document.getElementById("prompt-quality-checklist-summary"),
    checklistItems: document.getElementById("prompt-quality-checklist-items"),
    checklistRedFlags: document.getElementById("prompt-quality-checklist-red-flags"),
    checklistExit: document.getElementById("prompt-quality-checklist-exit"),
    exampleSwitcher: document.getElementById("prompt-quality-example-switcher"),
    exampleKicker: document.getElementById("prompt-quality-example-kicker"),
    exampleTitle: document.getElementById("prompt-quality-example-title"),
    exampleSummary: document.getElementById("prompt-quality-example-summary"),
    beforeTitle: document.getElementById("prompt-quality-before-title"),
    beforeOutput: document.getElementById("prompt-quality-before-output"),
    afterTitle: document.getElementById("prompt-quality-after-title"),
    afterOutput: document.getElementById("prompt-quality-after-output"),
    impactTitle: document.getElementById("prompt-quality-example-impact-title"),
    impactNote: document.getElementById("prompt-quality-example-impact-note"),
  };

  const examples = Array.isArray(promptQualityLab.before_after) ? promptQualityLab.before_after : [];
  const checklists = Array.isArray(promptQualityLab.checklists) ? promptQualityLab.checklists : [];
  let activeExampleId = examples[0]?.id || null;

  function renderExampleSwitcher() {
    if (!qualityElements.exampleSwitcher) {
      return;
    }

    qualityElements.exampleSwitcher.innerHTML = examples
      .map(
        (item) => `
          <button
            class="builder-chip ${item.id === activeExampleId ? "active" : ""}"
            type="button"
            data-quality-example="${escapeHtml(item.id)}"
          >
            <span>
              <strong>${escapeHtml(item.title)}</strong>
              <small>${escapeHtml(item.label)}</small>
            </span>
          </button>
        `,
      )
      .join("");

    qualityElements.exampleSwitcher.querySelectorAll("[data-quality-example]").forEach((button) => {
      button.addEventListener("click", () => {
        activeExampleId = button.getAttribute("data-quality-example");
        renderExampleSwitcher();
        renderExample();
      });
    });
  }

  function renderExample() {
    const example = examples.find((item) => item.id === activeExampleId) || examples[0];
    if (!example) {
      return;
    }

    if (qualityElements.exampleKicker) {
      qualityElements.exampleKicker.textContent = example.label;
    }

    if (qualityElements.exampleTitle) {
      qualityElements.exampleTitle.textContent = example.title;
    }

    if (qualityElements.exampleSummary) {
      qualityElements.exampleSummary.textContent = example.summary;
    }

    if (qualityElements.beforeTitle) {
      qualityElements.beforeTitle.textContent = example.before_title;
    }

    if (qualityElements.beforeOutput) {
      qualityElements.beforeOutput.textContent = example.before_prompt;
    }

    if (qualityElements.afterTitle) {
      qualityElements.afterTitle.textContent = example.after_title;
    }

    if (qualityElements.afterOutput) {
      qualityElements.afterOutput.textContent = example.after_prompt;
    }

    if (qualityElements.impactTitle) {
      qualityElements.impactTitle.textContent = example.impact_title;
    }

    if (qualityElements.impactNote) {
      qualityElements.impactNote.textContent = example.impact_note;
    }

    renderCards(
      "prompt-quality-example-improvements",
      example.improvements || [],
      (item) => `
        <article class="study-card compact-card">
          <span class="label">${escapeHtml(item.kicker)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.description)}</p>
        </article>
      `,
    );

    renderCards(
      "prompt-quality-example-officials",
      (example.official_buttons || []).map((button) => ({
        title: button.label,
        summary: example.summary,
        buttons: [button],
      })),
      (item) => `
        <article class="artifact-card compact-card">
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.summary)}</p>
          ${renderButtonList(item.buttons || [])}
        </article>
      `,
    );
  }

  function renderChecklist(state) {
    const recommendedChecklist = findPromptQualityChecklist(checklists, state);

    renderCards(
      "prompt-quality-checklists",
      checklists.map((item) => ({
        ...item,
        recommended: recommendedChecklist?.id === item.id,
      })),
      (item) => `
        <article class="study-card compact-card quality-checklist-card ${item.recommended ? "recommended" : ""}">
          <span class="status-badge ${item.recommended ? "status-done" : "status-in-progress"}">
            ${escapeHtml(item.recommended ? "Recomendado agora" : "Checklist")}
          </span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.summary)}</p>
          <ul class="summary-list">
            ${(item.checks || []).slice(0, 3).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
          </ul>
        </article>
      `,
    );

    if (!recommendedChecklist) {
      return;
    }

    if (qualityElements.checklistTitle) {
      qualityElements.checklistTitle.textContent = recommendedChecklist.title;
    }

    if (qualityElements.checklistSummary) {
      qualityElements.checklistSummary.textContent = recommendedChecklist.summary;
    }

    if (qualityElements.checklistItems) {
      qualityElements.checklistItems.innerHTML = (recommendedChecklist.checks || [])
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("");
    }

    if (qualityElements.checklistRedFlags) {
      qualityElements.checklistRedFlags.innerHTML = (recommendedChecklist.red_flags || [])
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("");
    }

    if (qualityElements.checklistExit) {
      qualityElements.checklistExit.textContent = recommendedChecklist.exit_rule || "";
    }
  }

  function renderLiveAudit(state) {
    const audit = computePromptQualityAudit(promptQualityLab, state);
    const weakestMetric = [...audit.metrics].sort((left, right) => left.score - right.score)[0];

    if (qualityElements.title) {
      qualityElements.title.textContent = state?.template?.title
        ? `Rubrica do template ${state.template.title}`
        : "Rubrica do prompt atual";
    }

    if (qualityElements.summary) {
      qualityElements.summary.textContent =
        weakestMetric?.score < 72
          ? `O gargalo principal agora esta em ${weakestMetric.title.toLowerCase()}. Ajuste esse bloco antes de polir o resto.`
          : "O prompt atual ja passa bem pela rubrica. Agora vale validar em casos normais e casos limite.";
    }

    if (qualityElements.scoreBadge) {
      qualityElements.scoreBadge.textContent = `${audit.overallScore}/100`;
      qualityElements.scoreBadge.className = `status-badge ${audit.overallStatus}`;
    }

    if (qualityElements.focusBadge) {
      qualityElements.focusBadge.textContent = audit.overallVerdict;
      qualityElements.focusBadge.className = `status-badge ${audit.overallStatus}`;
    }

    renderCards(
      "prompt-quality-scores",
      audit.metrics,
      (item) => `
        <article class="metric-card quality-score-card">
          <div class="quality-score-header">
            <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
            <strong>${escapeHtml(item.score_label)}</strong>
          </div>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="metric-note">${escapeHtml(item.description)}</p>
          <div class="quality-score-rail" aria-hidden="true">
            <span class="quality-score-fill ${escapeHtml(item.status_class)}" style="width: ${escapeHtml(String(item.score))}%"></span>
          </div>
          <p class="builder-diagnostic-value">${escapeHtml(item.verdict)}</p>
          <p class="metric-note">${escapeHtml(item.note)}</p>
        </article>
      `,
    );

    renderCards(
      "prompt-quality-recommendations",
      audit.recommendations,
      (item) => `
        <article class="study-card compact-card quality-recommendation-card">
          <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.description)}</p>
        </article>
      `,
    );

    renderCards(
      "prompt-quality-stress-tests",
      audit.stressTests,
      (item) => `
        <article class="metric-card builder-diagnostic-card">
          <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="builder-diagnostic-value">${escapeHtml(item.value)}</p>
          <p class="metric-note">${escapeHtml(item.note)}</p>
        </article>
      `,
    );

    renderChecklist(state);
  }

  renderExampleSwitcher();
  renderExample();
  renderLiveAudit(window.__promptBuilderState || null);
  document.addEventListener("prompt-builder:updated", (event) => {
    renderLiveAudit(event.detail || window.__promptBuilderState || null);
  });
}

function renderPromptProductization(promptLibrary, promptBuilder, promptProductization, onTrackChange) {
  if (!promptProductization) {
    if (typeof onTrackChange === "function") {
      onTrackChange(null);
    }
    return;
  }

  renderCards(
    "prompt-product-overview",
    promptProductization.overview || [],
    (item) => `
      <article class="metric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="metric-value">${escapeHtml(item.body)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  renderCards(
    "prompt-product-access",
    promptProductization.access_layers || [],
    (item) => `
      <article class="study-card compact-card product-access-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          ${(item.points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
      </article>
    `,
  );

  renderCards(
    "prompt-product-future-modules",
    promptProductization.future_modules || [],
    (item) => `
      <article class="study-card compact-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
      </article>
    `,
  );

  renderCards(
    "prompt-product-principles",
    promptProductization.product_principles || [],
    (item) => `
      <article class="study-card compact-card">
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
      </article>
    `,
  );

  renderCards(
    "prompt-product-packs",
    promptProductization.premium_packs || [],
    (item) => `
      <article class="study-card compact-card product-pack-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
      </article>
    `,
  );

  const workspaceRules = document.getElementById("prompt-workspace-rules");
  if (workspaceRules) {
    workspaceRules.innerHTML = (promptProductization.workspace_rules || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  const tracks = Array.isArray(promptProductization.tracks) ? promptProductization.tracks : [];
  const templates = Array.isArray(promptBuilder?.templates) ? promptBuilder.templates : [];
  const examples = Array.isArray(promptLibrary?.examples) ? promptLibrary.examples : [];
  const templatesById = new Map(templates.map((item) => [item.id, item]));
  const examplesById = new Map(examples.map((item) => [item.id, item]));
  const switcher = document.getElementById("prompt-product-track-switcher");
  const workspaceTitle = document.getElementById("prompt-workspace-title");
  const workspaceSummary = document.getElementById("prompt-workspace-summary");
  let activeTrackId = new URLSearchParams(window.location.search).get("track") || tracks[0]?.id || "all";

  if (!tracks.find((item) => item.id === activeTrackId)) {
    activeTrackId = tracks[0]?.id || "all";
  }

  function getActiveTrack() {
    return tracks.find((item) => item.id === activeTrackId) || tracks[0] || null;
  }

  function renderTrackSwitcher() {
    if (!switcher) {
      return;
    }

    switcher.innerHTML = tracks
      .map(
        (track) => `
          <button
            class="builder-chip ${track.id === activeTrackId ? "active" : ""}"
            type="button"
            data-product-track="${escapeHtml(track.id)}"
          >
            <span>
              <strong>${escapeHtml(track.label)}</strong>
              <small>${escapeHtml(track.tier)}</small>
            </span>
          </button>
        `,
      )
      .join("");

    switcher.querySelectorAll("[data-product-track]").forEach((button) => {
      button.addEventListener("click", () => {
        activeTrackId = button.getAttribute("data-product-track");
        syncProductizationState();
      });
    });
  }

  function renderTracks() {
    renderCards(
      "prompt-product-tracks",
      tracks.map((item) => ({
        ...item,
        active: item.id === activeTrackId,
      })),
      (item) => `
        <article class="study-card compact-card product-track-card ${item.active ? "active" : ""}">
          <span class="status-badge ${item.active ? "status-done" : escapeHtml(item.status_class)}">${escapeHtml(item.tier)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.summary)}</p>
          <ul class="summary-list">
            <li><strong>Persona:</strong> ${escapeHtml(item.persona)}</li>
            <li><strong>Carga sugerida:</strong> ${escapeHtml(item.hours)}</li>
            <li><strong>Templates:</strong> ${escapeHtml(String((item.template_ids || []).length))}</li>
            <li><strong>Exemplos:</strong> ${escapeHtml(String((item.example_ids || []).length))}</li>
          </ul>
          ${renderTagList(item.deliverables || [])}
        </article>
      `,
    );
  }

  function buildFavoriteCards(activeTrack, favorites) {
    const activeTemplateIds = new Set(activeTrack?.template_ids || []);
    const activeExampleIds = new Set(activeTrack?.example_ids || []);
    const favoriteTemplates = (favorites.templates || [])
      .map((id) => templatesById.get(id))
      .filter(Boolean)
      .sort((left, right) => Number(activeTemplateIds.has(right.id)) - Number(activeTemplateIds.has(left.id)));
    const favoriteExamples = (favorites.examples || [])
      .map((id) => examplesById.get(id))
      .filter(Boolean)
      .sort((left, right) => Number(activeExampleIds.has(right.id)) - Number(activeExampleIds.has(left.id)));

    const cards = [
      ...favoriteTemplates.map((item) => ({
        kind: "template",
        id: item.id,
        title: item.title,
        description: item.summary,
        detail: item.best_for,
        active: activeTemplateIds.has(item.id),
      })),
      ...favoriteExamples.map((item) => ({
        kind: "example",
        id: item.id,
        title: item.title,
        description: item.objective,
        detail: item.use_case,
        active: activeExampleIds.has(item.id),
      })),
    ];

    return cards;
  }

  function renderWorkspace() {
    const favorites = ensurePromptFavorites();
    const activeTrack = getActiveTrack();
    const favoriteCards = buildFavoriteCards(activeTrack, favorites);

    if (workspaceTitle) {
      workspaceTitle.textContent = activeTrack ? `Workspace da trilha ${activeTrack.title}` : "Favoritos e trilha ativa";
    }

    if (workspaceSummary) {
      workspaceSummary.textContent = activeTrack
        ? `${activeTrack.summary} Esta trilha conecta ${activeTrack.template_ids?.length || 0} templates e ${activeTrack.example_ids?.length || 0} exemplos.`
        : "Salve templates e exemplos para montar sua biblioteca pessoal de estudo.";
    }

    renderCards(
      "prompt-favorites-summary",
      [
        {
          badge: "Trilha ativa",
          status_class: activeTrack?.status_class || "status-done",
          title: activeTrack?.label || "Sem trilha",
          value: activeTrack?.tier || "Livre agora",
          note: activeTrack?.persona || "Biblioteca geral do Prompt Studio.",
        },
        {
          badge: "Templates salvos",
          status_class: favorites.templates?.length ? "status-done" : "status-in-progress",
          title: String(favorites.templates?.length || 0),
          value: "Templates",
          note: "Use favoritos para montar seu acervo pessoal sem perder a curadoria do portal.",
        },
        {
          badge: "Exemplos salvos",
          status_class: favorites.examples?.length ? "status-done" : "status-in-progress",
          title: String(favorites.examples?.length || 0),
          value: "Exemplos",
          note: "Exemplos salvos ajudam a revisar antes/depois, blocos e casos de uso com menos ruido.",
        },
      ],
      (item) => `
        <article class="metric-card builder-diagnostic-card">
          <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="builder-diagnostic-value">${escapeHtml(item.value)}</p>
          <p class="metric-note">${escapeHtml(item.note)}</p>
        </article>
      `,
    );

    const favoritesContainer = document.getElementById("prompt-favorites-list");
    if (!favoritesContainer) {
      return;
    }

    if (favoriteCards.length === 0) {
      favoritesContainer.innerHTML =
        '<div class="empty-note">Nenhum favorito salvo ainda. Use "Salvar template" ou "Salvar" nos exemplos para montar seu workspace.</div>';
      return;
    }

    favoritesContainer.innerHTML = favoriteCards
      .map(
        (item) => `
          <article class="artifact-card compact-card workspace-favorite-card ${item.active ? "active" : ""}">
            <span class="status-badge ${item.active ? "status-done" : "status-in-progress"}">
              ${escapeHtml(item.kind === "template" ? "Template salvo" : "Exemplo salvo")}
            </span>
            <h3>${escapeHtml(item.title)}</h3>
            <p class="card-copy">${escapeHtml(item.description)}</p>
            <p class="metric-note">${escapeHtml(item.detail)}</p>
            <div class="button-group">
              ${
                item.kind === "template"
                  ? `<button class="button secondary" type="button" data-open-template="${escapeHtml(item.id)}">Abrir no builder</button>`
                  : `<button class="button secondary" type="button" data-open-example="${escapeHtml(item.id)}">Abrir exemplo</button>`
              }
              <button class="button secondary" type="button" data-remove-favorite="${escapeHtml(item.kind)}" data-favorite-id="${escapeHtml(item.id)}">Remover</button>
            </div>
          </article>
        `,
      )
      .join("");

    favoritesContainer.querySelectorAll("[data-open-template]").forEach((button) => {
      button.addEventListener("click", () => {
        document.dispatchEvent(
          new CustomEvent("prompt-builder:select-template", {
            detail: {
              templateId: button.getAttribute("data-open-template"),
            },
          }),
        );
      });
    });

    favoritesContainer.querySelectorAll("[data-open-example]").forEach((button) => {
      button.addEventListener("click", () => {
        const exampleId = button.getAttribute("data-open-example");
        window.location.hash = `prompt-example-${exampleId}`;
      });
    });

    favoritesContainer.querySelectorAll("[data-remove-favorite]").forEach((button) => {
      button.addEventListener("click", () => {
        const kind = button.getAttribute("data-remove-favorite") === "template" ? "templates" : "examples";
        togglePromptFavorite(kind, button.getAttribute("data-favorite-id"));
      });
    });
  }

  function syncProductizationState() {
    const activeTrack = getActiveTrack();
    setQueryParam("track", activeTrack?.id || "all");
    renderTrackSwitcher();
    renderTracks();
    renderWorkspace();
    if (typeof onTrackChange === "function") {
      onTrackChange(activeTrack);
    }
  }

  document.addEventListener("prompt-favorites:updated", () => {
    renderWorkspace();
    if (typeof onTrackChange === "function") {
      onTrackChange(getActiveTrack());
    }
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== FAVORITES_STORAGE_KEY) {
      return;
    }

    window.__promptFavorites = loadPromptFavorites();
    renderWorkspace();
    if (typeof onTrackChange === "function") {
      onTrackChange(getActiveTrack());
    }
  });

  syncProductizationState();
}

function renderPromptBuilder(promptBuilder) {
  if (!promptBuilder) {
    return;
  }

  renderCards(
    "prompt-builder-overview",
    promptBuilder.overview || [],
    (item) => `
      <article class="metric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="metric-value">${escapeHtml(item.body)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  renderCards(
    "prompt-builder-guides",
    promptBuilder.field_guides || [],
    (item) => `
      <article class="study-card compact-card">
        <span class="label">${escapeHtml(item.kicker)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <p class="metric-note">${escapeHtml(item.example)}</p>
      </article>
    `,
  );

  renderCards(
    "prompt-builder-escalations",
    promptBuilder.escalation_notes || [],
    (item) => `
      <article class="study-card compact-card builder-escalation-card">
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
      </article>
    `,
  );

  const templates = Array.isArray(promptBuilder.templates) ? promptBuilder.templates : [];
  const modes = Array.isArray(promptBuilder.modes) ? promptBuilder.modes : [];

  if (templates.length === 0 || modes.length === 0) {
    return;
  }

  const builderElements = {
    modeGroup: document.getElementById("prompt-builder-modes"),
    templateGroup: document.getElementById("prompt-builder-templates"),
    flags: document.getElementById("prompt-builder-flags"),
    title: document.getElementById("prompt-builder-title"),
    summary: document.getElementById("prompt-builder-summary"),
    level: document.getElementById("prompt-builder-level"),
    modeBadge: document.getElementById("prompt-builder-mode-badge"),
    output: document.getElementById("prompt-builder-output"),
    diagnostics: document.getElementById("prompt-builder-diagnostics"),
    officials: document.getElementById("prompt-builder-officials"),
    feedback: document.getElementById("prompt-builder-feedback"),
    copyButton: document.getElementById("prompt-builder-copy"),
    resetButton: document.getElementById("prompt-builder-reset"),
    saveButton: document.getElementById("prompt-builder-save-template"),
    inputs: {
      role: document.getElementById("builder-role"),
      objective: document.getElementById("builder-objective"),
      context: document.getElementById("builder-context"),
      constraints: document.getElementById("builder-constraints"),
      acceptance: document.getElementById("builder-acceptance"),
      outputFormat: document.getElementById("builder-output-format"),
      examples: document.getElementById("builder-examples"),
      fallback: document.getElementById("builder-fallback"),
    },
  };

  let activeTemplateId = templates[0].id;
  let activeModeId = templates[0].recommended_mode || modes[0].id;
  let feedbackTimer = null;

  function getActiveTemplate() {
    return templates.find((item) => item.id === activeTemplateId) || templates[0];
  }

  function getActiveMode() {
    return modes.find((item) => item.id === activeModeId) || modes[0];
  }

  function setFieldValue(fieldKey, value) {
    const element = builderElements.inputs[fieldKey];
    if (!element) {
      return;
    }

    element.value = value || "";
  }

  function readBuilderValues() {
    return Object.fromEntries(
      Object.entries(builderElements.inputs).map(([key, element]) => [key, element ? element.value : ""]),
    );
  }

  function readBuilderFlags() {
    return Object.fromEntries(
      (promptBuilder.toggles || []).map((item) => [
        item.id,
        Boolean(document.getElementById(`builder-flag-${item.id}`)?.checked),
      ]),
    );
  }

  function renderModes() {
    if (!builderElements.modeGroup) {
      return;
    }

    builderElements.modeGroup.innerHTML = modes
      .map(
        (mode) => `
          <button
            class="builder-chip ${mode.id === activeModeId ? "active" : ""}"
            type="button"
            data-builder-mode="${escapeHtml(mode.id)}"
          >
            <span>
              <strong>${escapeHtml(mode.label)}</strong>
              <small>${escapeHtml(mode.summary)}</small>
            </span>
          </button>
        `,
      )
      .join("");

    builderElements.modeGroup.querySelectorAll("[data-builder-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        activeModeId = button.getAttribute("data-builder-mode");
        renderModes();
        updateBuilderPreview();
      });
    });
  }

  function renderTemplates() {
    if (!builderElements.templateGroup) {
      return;
    }

    builderElements.templateGroup.innerHTML = templates
      .map(
        (template) => `
          <button
            class="builder-chip ${template.id === activeTemplateId ? "active" : ""}"
            type="button"
            data-builder-template="${escapeHtml(template.id)}"
          >
            <span>
              <strong>${escapeHtml(template.title)}</strong>
              <small>${escapeHtml(template.best_for)}</small>
            </span>
          </button>
        `,
      )
      .join("");

    builderElements.templateGroup.querySelectorAll("[data-builder-template]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextTemplate = templates.find((item) => item.id === button.getAttribute("data-builder-template"));
        if (!nextTemplate) {
          return;
        }

        applyTemplateDefaults(nextTemplate, false);
      });
    });
  }

  function renderFlags(template) {
    if (!builderElements.flags) {
      return;
    }

    builderElements.flags.innerHTML = (promptBuilder.toggles || [])
      .map((toggle) => {
        const checked = template.default_flags?.[toggle.id] ? "checked" : "";
        return `
          <label class="builder-flag">
            <input type="checkbox" id="builder-flag-${escapeHtml(toggle.id)}" ${checked} />
            <span>
              <strong>${escapeHtml(toggle.label)}</strong>
              <small>${escapeHtml(toggle.description)}</small>
            </span>
          </label>
        `;
      })
      .join("");

    builderElements.flags.querySelectorAll("input[type='checkbox']").forEach((element) => {
      element.addEventListener("change", updateBuilderPreview);
    });
  }

  function renderOfficials(template) {
    renderCards(
      "prompt-builder-officials",
      (template.official_buttons || []).map((button) => ({
        title: button.label,
        summary: template.best_for,
        buttons: [button],
      })),
      (item) => `
        <article class="artifact-card compact-card">
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.summary)}</p>
          ${renderButtonList(item.buttons)}
        </article>
      `,
    );
  }

  function updateBuilderPreview() {
    const template = getActiveTemplate();
    const mode = getActiveMode();
    const values = readBuilderValues();
    const flags = readBuilderFlags();
    const builderState = buildPromptBuilderState(template, mode, values, flags);

    if (builderElements.title) {
      builderElements.title.textContent = template.title;
    }

    if (builderElements.summary) {
      builderElements.summary.textContent = template.summary;
    }

    if (builderElements.level) {
      builderElements.level.textContent = template.level_label;
      builderElements.level.className = `status-badge ${template.status_class || "status-done"}`;
    }

    if (builderElements.modeBadge) {
      builderElements.modeBadge.textContent = mode.label;
      builderElements.modeBadge.className = `status-badge ${mode.status_class || "status-done"}`;
    }

    if (builderElements.output) {
      builderElements.output.textContent = builderState.prompt;
    }

    renderCards(
      "prompt-builder-diagnostics",
      builderState.diagnostics,
      (item) => `
        <article class="metric-card builder-diagnostic-card">
          <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="builder-diagnostic-value">${escapeHtml(item.value)}</p>
          <p class="metric-note">${escapeHtml(item.note)}</p>
        </article>
      `,
    );

    renderOfficials(template);
    renderSaveButton(template);
    publishPromptBuilderState(builderState);
  }

  function renderSaveButton(template) {
    if (!builderElements.saveButton) {
      return;
    }

    const favorite = isPromptFavorite("templates", template.id);
    builderElements.saveButton.textContent = favorite ? "Template salvo" : "Salvar template";
    builderElements.saveButton.classList.toggle("active", favorite);
    builderElements.saveButton.setAttribute("aria-pressed", favorite ? "true" : "false");
  }

  function applyTemplateDefaults(template, preserveMode = false) {
    activeTemplateId = template.id;

    if (!preserveMode) {
      activeModeId = template.recommended_mode || modes[0].id;
    }

    setFieldValue("role", template.defaults?.role);
    setFieldValue("objective", template.defaults?.objective);
    setFieldValue("context", template.defaults?.context);
    setFieldValue("constraints", template.defaults?.constraints);
    setFieldValue("acceptance", template.defaults?.acceptance);
    setFieldValue("outputFormat", template.defaults?.output_format);
    setFieldValue("examples", template.defaults?.examples);
    setFieldValue("fallback", template.defaults?.fallback);

    renderModes();
    renderTemplates();
    renderFlags(template);
    updateBuilderPreview();
  }

  Object.values(builderElements.inputs).forEach((element) => {
    if (!element) {
      return;
    }

    element.addEventListener("input", updateBuilderPreview);
  });

  if (builderElements.copyButton) {
    builderElements.copyButton.addEventListener("click", async () => {
      if (!builderElements.output?.textContent) {
        return;
      }

      try {
        await navigator.clipboard.writeText(builderElements.output.textContent);
        if (builderElements.feedback) {
          builderElements.feedback.textContent = "Prompt copiado.";
        }
      } catch (_error) {
        if (builderElements.feedback) {
          builderElements.feedback.textContent = "Nao foi possivel copiar automaticamente.";
        }
      }

      if (feedbackTimer) {
        window.clearTimeout(feedbackTimer);
      }

      feedbackTimer = window.setTimeout(() => {
        if (builderElements.feedback) {
          builderElements.feedback.textContent = "";
        }
      }, 2400);
    });
  }

  if (builderElements.resetButton) {
    builderElements.resetButton.addEventListener("click", () => {
      applyTemplateDefaults(getActiveTemplate(), true);
      if (builderElements.feedback) {
        builderElements.feedback.textContent = "Template resetado.";
        if (feedbackTimer) {
          window.clearTimeout(feedbackTimer);
        }
        feedbackTimer = window.setTimeout(() => {
          builderElements.feedback.textContent = "";
        }, 2400);
      }
    });
  }

  if (builderElements.saveButton) {
    builderElements.saveButton.addEventListener("click", () => {
      const template = getActiveTemplate();
      togglePromptFavorite("templates", template.id);

      if (builderElements.feedback) {
        builderElements.feedback.textContent = isPromptFavorite("templates", template.id)
          ? "Template salvo no workspace."
          : "Template removido do workspace.";
        if (feedbackTimer) {
          window.clearTimeout(feedbackTimer);
        }
        feedbackTimer = window.setTimeout(() => {
          builderElements.feedback.textContent = "";
        }, 2400);
      }

      renderSaveButton(template);
    });
  }

  document.addEventListener("prompt-builder:select-template", (event) => {
    const templateId = event.detail?.templateId;
    const nextTemplate = templates.find((item) => item.id === templateId);
    if (!nextTemplate) {
      return;
    }

    applyTemplateDefaults(nextTemplate, false);
    if (window.location.hash !== "#builder") {
      window.location.hash = "builder";
    }
  });

  document.addEventListener("prompt-favorites:updated", () => {
    renderSaveButton(getActiveTemplate());
  });

  applyTemplateDefaults(getActiveTemplate());
}

function renderPrompts(
  promptsGuide,
  promptLibrary,
  promptBuilder,
  promptProviderOverlays,
  promptQualityLab,
  promptProductization,
) {
  renderCards(
    "prompts-orientation",
    promptsGuide.orientation || [],
    (item) => `
      <article class="metric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="metric-value">${escapeHtml(item.body)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  renderCards(
    "prompts-levels",
    promptsGuide.maturity_levels || [],
    (item) => `
      <article class="study-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          ${(item.points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
      </article>
    `,
  );

  renderCards(
    "prompt-library-overview",
    promptLibrary?.overview || [],
    (item) => `
      <article class="metric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="metric-value">${escapeHtml(item.body)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  renderPromptBuilder(promptBuilder);
  renderPromptProviderOverlays(promptProviderOverlays);
  renderPromptQualityLab(promptQualityLab);

  function renderPromptCatalog(activeTrack) {
    const promptExamples = Array.isArray(promptLibrary?.examples) ? promptLibrary.examples : [];
    const trackExampleIds =
      activeTrack && activeTrack.id !== "all" ? new Set(activeTrack.example_ids || []) : null;
    const filteredExamples = trackExampleIds
      ? promptExamples.filter((item) => trackExampleIds.has(item.id))
      : promptExamples;
    const favorites = ensurePromptFavorites();

    renderCards(
      "prompt-library-level-summaries",
      promptsGuide.maturity_levels || [],
      (item) => `
        <article class="study-card compact-card">
          <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.description)}</p>
        </article>
      `,
    );

    const promptLibraryRules = document.getElementById("prompt-library-rules");
    if (promptLibraryRules) {
      promptLibraryRules.innerHTML = (promptLibrary?.study_rules || [])
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("");
    }

    renderPromptLibrary(
      "prompt-basic-library",
      filteredExamples.filter((item) => item.level === "basic"),
      { favorites },
    );
    renderPromptLibrary(
      "prompt-intermediate-library",
      filteredExamples.filter((item) => item.level === "intermediate"),
      { favorites },
    );
    renderPromptLibrary(
      "prompt-advanced-library",
      filteredExamples.filter((item) => item.level === "advanced"),
      { favorites },
    );
  }

  renderPromptProductization(promptLibrary, promptBuilder, promptProductization, renderPromptCatalog);

  renderCards(
    "prompts-anatomy",
    promptsGuide.anatomy || [],
    (item) => `
      <article class="study-card">
        <span class="label">${escapeHtml(item.kicker)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
        <ul class="summary-list">
          ${(item.points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
      </article>
    `,
  );

  const promptAlone = document.getElementById("prompts-prompt-alone");
  if (promptAlone) {
    promptAlone.innerHTML = (promptsGuide.prompt_alone || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  const promptUpgrade = document.getElementById("prompts-prompt-upgrade");
  if (promptUpgrade) {
    promptUpgrade.innerHTML = (promptsGuide.prompt_upgrade || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  const promptSkeleton = document.getElementById("prompt-skeleton");
  if (promptSkeleton) {
    promptSkeleton.textContent = promptsGuide.formula?.skeleton || "";
  }

  renderCards(
    "prompts-formula-notes",
    promptsGuide.formula?.notes || [],
    (item) => `
      <article class="study-card compact-card">
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
      </article>
    `,
  );

  renderCards(
    "prompts-official-materials",
    promptsGuide.official_materials || [],
    (item) => `
      <article class="artifact-card">
        <span class="status-badge status-in-progress">${escapeHtml(item.category)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.summary)}</p>
        ${renderButtonList(item.buttons || [])}
      </article>
    `,
  );

  renderCards(
    "prompts-anti-patterns",
    promptsGuide.anti_patterns || [],
    (item) => `
      <article class="study-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
      </article>
    `,
  );

  const phaseBoundary = document.getElementById("prompts-phase-boundary");
  if (phaseBoundary) {
    phaseBoundary.innerHTML = (promptsGuide.phase_boundary || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  renderCards(
    "prompts-next-steps",
    promptsGuide.next_steps || [],
    (item) => `
      <article class="study-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
      </article>
    `,
  );
}

function renderRoadmap(portal, roadmapGuide, releaseManifest) {
  renderRouteWorkspace("roadmap-execution-workspace", {
    ...(roadmapGuide.execution_workspace || {}),
    metrics: [
      {
        label: "Ciclos publicados",
        value: String((roadmapGuide.portal_release_history || []).length),
        note: "Linha do tempo completa, do shell inicial ao refino atual.",
      },
      {
        label: "Fases base",
        value: String((portal.roadmap_phases || []).length),
        note: "Portal principal fechado em sete fases estruturais.",
      },
      {
        label: "Alvos de QA",
        value: String((releaseManifest.qa_targets || []).length),
        note: "Rotas e contratos obrigatorios para cada release confiavel.",
      },
      {
        label: "Proxima frente",
        value: "Capstone",
        note: "Depois do refresh tecnico, o foco sobe para demonstracao final e packs de produto.",
      },
    ],
  });

  renderCards(
    "roadmap-orientation",
    roadmapGuide.orientation || [],
    (item) => `
      <article class="metric-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.badge)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="metric-value">${escapeHtml(item.body)}</p>
        <p class="metric-note">${escapeHtml(item.note)}</p>
      </article>
    `,
  );

  renderCards(
    "roadmap-phases",
    portal.roadmap_phases,
    (item) => `
      <article class="phase-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.status_label)}</span>
        <p class="timeline-kicker">${escapeHtml(item.window)}</p>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="timeline-copy">${escapeHtml(item.goal)}</p>
        <ul class="summary-list">
          ${item.deliverables.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
      </article>
    `,
  );

  renderCards(
    "roadmap-day-tracks",
    roadmapGuide.day_tracks || [],
    (item) => `
      <article class="phase-card">
        <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.status_label)}</span>
        <p class="timeline-kicker">${escapeHtml(item.window)}</p>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="timeline-copy">${escapeHtml(item.description)}</p>
      </article>
    `,
  );

  renderCards(
    "roadmap-maturity",
    portal.maturity_map,
    (item) => `
      <article class="study-card">
        <span class="label">${escapeHtml(item.stage)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
      </article>
    `,
  );

  const nextPhase = document.getElementById("roadmap-next-phase");
  if (nextPhase) {
    nextPhase.textContent = portal.site.next_phase_summary;
  }

  const phaseRules = document.getElementById("roadmap-phase-rules");
  if (phaseRules) {
    phaseRules.innerHTML = (roadmapGuide.phase_rules || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  renderCards(
    "roadmap-release-history",
    roadmapGuide.portal_release_history || [],
    (item) => `
      <article class="artifact-card">
        <span class="status-badge status-done">${escapeHtml(item.phase)}</span>
        <h3>${escapeHtml(item.focus)}</h3>
        <div class="button-group">
          <a class="button secondary" href="${resolveUrl(item.preview_url)}">Preview</a>
          <a class="button secondary" href="${resolveUrl(item.production_url)}">Producao</a>
        </div>
      </article>
    `,
  );

  renderCards(
    "roadmap-release-checks",
    releaseManifest.release_checks || [],
    (item) => `
      <article class="study-card compact-card">
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.description)}</p>
      </article>
    `,
  );

  const qaTargets = document.getElementById("roadmap-qa-targets");
  if (qaTargets) {
    qaTargets.innerHTML = (releaseManifest.qa_targets || [])
      .map((item) => `<li><code>${escapeHtml(item)}</code></li>`)
      .join("");
  }
}

function renderArtifacts(portal, artifacts) {
  renderCards(
    "artifact-catalog",
    artifacts.featured_artifacts,
    (item) => `
      <article class="artifact-card" id="${escapeHtml(item.id)}">
        <span class="status-badge status-done">${escapeHtml(item.category)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="card-copy">${escapeHtml(item.summary)}</p>
        <p class="metric-note">${escapeHtml(item.study_tip)}</p>
        ${renderTagList(item.tags)}
        ${renderButtonList(item.buttons)}
      </article>
    `,
  );

  renderCards(
    "artifact-llm-watchlist",
    artifacts.llm_watchlist,
    (item) => `
      <article class="artifact-card">
        <span class="status-badge status-in-progress">${escapeHtml(item.vendor)} / ${escapeHtml(item.region)}</span>
        <h3>${escapeHtml(item.model)}</h3>
        <p class="card-copy">${escapeHtml(item.summary)}</p>
        <p class="metric-note">Fonte: ${escapeHtml(item.source_label)}</p>
        <div class="button-group">
          <a class="button secondary" href="${item.source_url}">Abrir fonte oficial</a>
        </div>
      </article>
    `,
  );
}

async function init() {
  const content = document.getElementById("content");
  if (content) {
    content.setAttribute("aria-busy", "true");
  }

  try {
    const data = await loadPageData();
    const {
      portal,
      overview,
      artifacts,
      freshnessStatus,
      vendorSources,
      vendorUpdates,
      domainMap,
      promptsGuide,
      promptLibrary,
      promptBuilder,
      promptProviderOverlays,
      promptQualityLab,
      promptProductization,
        matrixGuide,
        matrixArtifact,
        guideGuide,
        todayGuide,
        labsGuide,
        analyticsGuide,
      analyticsRules,
      launchGuide,
      journeyGuide,
      trilhaGuide,
      progressGuide,
      studyUnits,
      learningPathTemplates,
      adaptivePathRules,
      workflowsGuide,
      ragGuide,
      seniorGuide,
      roadmapGuide,
      releaseManifest,
    } = data;

    renderShell(portal, freshnessStatus);
    setupStudyAnalytics();

      const renderers = {
        home: () =>
          renderHome(portal, overview, artifacts, freshnessStatus, vendorUpdates, vendorSources, domainMap, studyUnits),
        hoje: () =>
          renderToday(
            todayGuide,
            analyticsGuide,
            analyticsRules,
            studyUnits,
            learningPathTemplates,
            adaptivePathRules,
            labsGuide,
            progressGuide,
            vendorSources,
          ),
        guia: () => renderGuide(guideGuide, vendorSources),
      labs: () => renderLabs(labsGuide, vendorSources),
      analytics: () =>
        renderAnalytics(
          analyticsGuide,
          analyticsRules,
          studyUnits,
          learningPathTemplates,
          adaptivePathRules,
          labsGuide,
          progressGuide,
          vendorSources,
        ),
      lancamentos: () =>
        renderLaunches(
          portal,
          launchGuide,
          analyticsRules,
          studyUnits,
          learningPathTemplates,
          adaptivePathRules,
          labsGuide,
          progressGuide,
          freshnessStatus,
        ),
      jornada: () => renderJourney(journeyGuide),
      trilha: () => renderTrilha(trilhaGuide, studyUnits, learningPathTemplates, adaptivePathRules, vendorSources),
      progresso: () => renderProgress(progressGuide, studyUnits, learningPathTemplates, adaptivePathRules, vendorSources),
      prompts: () =>
        renderPrompts(
          promptsGuide,
          promptLibrary,
          promptBuilder,
          promptProviderOverlays,
          promptQualityLab,
          promptProductization,
        ),
      matriz: () => renderMatrix(portal, overview, artifacts, matrixGuide, matrixArtifact),
      workflows: () => renderWorkflows(portal, overview, workflowsGuide),
      rag: () => renderRag(portal, ragGuide, releaseManifest),
      senior: () => renderSenior(seniorGuide),
      roadmap: () => renderRoadmap(portal, roadmapGuide, releaseManifest),
      artefatos: () => renderArtifacts(portal, artifacts),
    };

    const renderer = renderers[pageId];
    if (renderer) {
      renderer();
    }

    setupNavigationPrefetch(portal);
  } catch (error) {
    if (content) {
      content.innerHTML = `
        <section class="page-hero compact">
          <div class="hero-copy">
            <span class="eyebrow">Falha de carregamento</span>
            <h1>O portal nao conseguiu montar os dados da pagina.</h1>
            <p class="lead">${escapeHtml(error.message)}</p>
          </div>
        </section>
      `;
    }
  } finally {
    if (content) {
      content.setAttribute("aria-busy", "false");
    }
  }
}

init();

