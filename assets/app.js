const DATA_PATHS = {
  overview: "/data/overview.json",
  portal: "/data/portal.json",
  artifacts: "/data/artifacts.json",
  promptsGuide: "/data/prompts_page.json",
  promptLibrary: "/data/prompt_library.json",
  matrixGuide: "/data/matrix_page.json",
  matrixArtifact: "/artifacts/files/model_matrix.json",
  journeyGuide: "/data/journey_page.json",
  workflowsGuide: "/data/workflows_page.json",
  ragGuide: "/data/rag_page.json",
  roadmapGuide: "/data/roadmap_page.json",
  releaseManifest: "/data/release_manifest.json",
};

const PAGE_DATA_KEYS = {
  home: ["overview", "artifacts"],
  jornada: ["journeyGuide"],
  prompts: ["promptsGuide", "promptLibrary"],
  matriz: ["overview", "artifacts", "matrixGuide", "matrixArtifact"],
  workflows: ["overview", "workflowsGuide"],
  rag: ["ragGuide"],
  roadmap: ["roadmapGuide", "releaseManifest"],
  artefatos: ["artifacts"],
};

const PREFETCH_ROUTE_MAP = {
  home: ["/jornada/", "/prompts/", "/matriz/"],
  jornada: ["/prompts/", "/matriz/", "/rag/"],
  prompts: ["/matriz/", "/rag/", "/artefatos/"],
  matriz: ["/prompts/", "/rag/", "/workflows/"],
  rag: ["/workflows/", "/artefatos/", "/roadmap/"],
  workflows: ["/roadmap/", "/artefatos/", "/matriz/"],
  roadmap: ["/jornada/", "/prompts/", "/artefatos/"],
  artefatos: ["/prompts/", "/matriz/", "/jornada/"],
};

const SESSION_CACHE_PREFIX = "ai-po-os::";
const SESSION_CACHE_TTL_MS = 1000 * 60 * 15;
const memoryCache = new Map();
const prefetchedRoutes = new Set();
const SITE_BASE_PATH = detectSiteBasePath();

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

function renderShell(portal) {
  const page = portal.pages[pageId] || portal.pages.home;
  const sidebar = document.getElementById("sidebar");
  const topbar = document.getElementById("topbar");
  const footer = document.getElementById("portal-footer");

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
        <button class="mobile-nav-toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="sidebar">
          Menu
        </button>
        <a class="button ghost" href="${resolveUrl(portal.site.deploy_url)}">Producao</a>
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

function renderHome(portal, overview, artifacts) {
  const phaseFocus = document.getElementById("phase-focus");
  const phaseSummary = document.getElementById("phase-summary");

  if (phaseFocus) {
    phaseFocus.textContent = `${portal.site.phase_label} - ${portal.site.phase_focus}`;
  }

  if (phaseSummary) {
    phaseSummary.textContent = portal.site.phase_summary;
  }

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

function renderPromptLibrary(containerId, examples) {
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
        <article class="prompt-example-card">
          <div class="prompt-example-header">
            <div class="prompt-example-meta">
              <span class="status-badge ${escapeHtml(item.status_class)}">${escapeHtml(item.level_label)}</span>
              <span class="label">${escapeHtml(item.family)}</span>
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
}

function renderPrompts(promptsGuide, promptLibrary) {
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

  const promptExamples = Array.isArray(promptLibrary?.examples) ? promptLibrary.examples : [];
  renderPromptLibrary(
    "prompt-basic-library",
    promptExamples.filter((item) => item.level === "basic"),
  );
  renderPromptLibrary(
    "prompt-intermediate-library",
    promptExamples.filter((item) => item.level === "intermediate"),
  );
  renderPromptLibrary(
    "prompt-advanced-library",
    promptExamples.filter((item) => item.level === "advanced"),
  );

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
      promptsGuide,
      promptLibrary,
      matrixGuide,
      matrixArtifact,
      journeyGuide,
      workflowsGuide,
      ragGuide,
      roadmapGuide,
      releaseManifest,
    } = data;

    renderShell(portal);

    const renderers = {
      home: () => renderHome(portal, overview, artifacts),
      jornada: () => renderJourney(journeyGuide),
      prompts: () => renderPrompts(promptsGuide, promptLibrary),
      matriz: () => renderMatrix(portal, overview, artifacts, matrixGuide, matrixArtifact),
      workflows: () => renderWorkflows(portal, overview, workflowsGuide),
      rag: () => renderRag(portal, ragGuide, releaseManifest),
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
