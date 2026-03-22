from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import UTC, datetime
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
VENDOR_SOURCES_PATH = DATA_DIR / "vendor_sources.json"
FRESHNESS_STATUS_PATH = DATA_DIR / "freshness_status.json"
RADAR_HEALTH_PATH = DATA_DIR / "radar_health.json"
TIMEOUT_SECONDS = 20
STALE_REVIEW_DAYS = 7
USER_AGENT = "ai-po-os-radar/1.0 (+https://deivithi.github.io/ai-po-os-portal/)"


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def iso_now() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def parse_iso_date(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        normalized = value.replace("Z", "+00:00")
        return datetime.fromisoformat(normalized)
    except ValueError:
        return None


def parse_http_datetime(value: str | None) -> str | None:
    if not value:
        return None
    try:
        parsed = parsedate_to_datetime(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=UTC)
        return parsed.astimezone(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    except (TypeError, ValueError):
        return None


def fetch_headers(url: str) -> dict[str, Any]:
    def do_request(method: str) -> dict[str, Any]:
        request = Request(url, method=method, headers={"User-Agent": USER_AGENT})
        with urlopen(request, timeout=TIMEOUT_SECONDS) as response:
            headers = response.headers
            return {
                "status_code": response.status,
                "final_url": response.geturl(),
                "etag": headers.get("ETag"),
                "last_modified": parse_http_datetime(headers.get("Last-Modified")),
            }

    try:
        return do_request("HEAD")
    except HTTPError as error:
        fallback_request = Request(url, method="GET", headers={"User-Agent": USER_AGENT})
        try:
            with urlopen(fallback_request, timeout=TIMEOUT_SECONDS) as response:
                headers = response.headers
                return {
                    "status_code": response.status,
                    "final_url": response.geturl(),
                    "etag": headers.get("ETag"),
                    "last_modified": parse_http_datetime(headers.get("Last-Modified")),
                    "note": f"Fallback GET usado porque HEAD retornou HTTP {error.code}.",
                }
        except Exception as fallback_error:  # noqa: BLE001
            return {
                "status_code": error.code,
                "final_url": url,
                "etag": error.headers.get("ETag"),
                "last_modified": parse_http_datetime(error.headers.get("Last-Modified")),
                "error": str(fallback_error or f"HTTP {error.code}"),
            }
    except URLError as error:
        fallback_request = Request(url, method="GET", headers={"User-Agent": USER_AGENT})
        try:
            with urlopen(fallback_request, timeout=TIMEOUT_SECONDS) as response:
                headers = response.headers
                return {
                    "status_code": response.status,
                    "final_url": response.geturl(),
                    "etag": headers.get("ETag"),
                    "last_modified": parse_http_datetime(headers.get("Last-Modified")),
                    "note": "Fallback GET usado porque HEAD falhou.",
                }
        except Exception as fallback_error:  # noqa: BLE001
            return {
                "status_code": None,
                "final_url": url,
                "etag": None,
                "last_modified": None,
                "error": str(fallback_error or error),
            }


@dataclass
class PageFreshness:
    title: str
    status_label: str
    checked_on: str | None
    status_class: str

    @property
    def age_days(self) -> int | None:
        checked = parse_iso_date(self.checked_on)
        if checked is None:
            return None
        now = datetime.now(UTC)
        return (now.date() - checked.date()).days

    @property
    def due_review(self) -> bool:
        age = self.age_days
        return age is not None and age > STALE_REVIEW_DAYS


def build_page_freshness(freshness_status: dict[str, Any]) -> list[PageFreshness]:
    pages = []
    for item in freshness_status.get("pages", []):
        pages.append(
            PageFreshness(
                title=item.get("title", ""),
                status_label=item.get("status_label", ""),
                checked_on=item.get("checked_on"),
                status_class=item.get("status_class", "status-next"),
            )
        )
    return pages


def main() -> int:
    vendor_sources = read_json(VENDOR_SOURCES_PATH)
    freshness_status = read_json(FRESHNESS_STATUS_PATH)
    previous_health = read_json(RADAR_HEALTH_PATH) if RADAR_HEALTH_PATH.exists() else {}
    previous_by_id = {item.get("id"): item for item in previous_health.get("sources", [])}
    checked_at = iso_now()

    source_entries: list[dict[str, Any]] = []
    changed_sources = 0
    healthy_sources = 0

    for source in vendor_sources.get("sources", []):
        current = fetch_headers(source["url"])
        previous = previous_by_id.get(source["id"], {})
        change_hints = []

        if previous.get("etag") and current.get("etag") and previous.get("etag") != current.get("etag"):
            change_hints.append("etag_changed")
        if (
            previous.get("last_modified")
            and current.get("last_modified")
            and previous.get("last_modified") != current.get("last_modified")
        ):
            change_hints.append("last_modified_changed")

        if change_hints:
            changed_sources += 1

        available = current.get("status_code") is not None and int(current["status_code"]) < 400
        if available:
            healthy_sources += 1

        source_entries.append(
            {
                "id": source["id"],
                "vendor": source["vendor"],
                "title": source["title"],
                "scope": source.get("scope"),
                "url": source["url"],
                "checked_at": checked_at,
                "status_code": current.get("status_code"),
                "available": available,
                "final_url": current.get("final_url"),
                "etag": current.get("etag"),
                "last_modified": current.get("last_modified"),
                "change_hints": change_hints,
                "monitoring_note": current.get("note") or current.get("error") or "Fonte acessivel.",
            }
        )

    page_freshness = build_page_freshness(freshness_status)
    pages_due_review = [page for page in page_freshness if page.due_review]
    verified_today = [page for page in page_freshness if page.status_label.lower().startswith("verificado")]

    payload = {
        "generated_at": checked_at,
        "automation_mode": "monitoring_only",
        "editorial_note": "Esta automacao monitora disponibilidade, cabecalhos e sinais tecnicos das fontes. Ela nao reescreve conclusoes semanticas do portal sem revisao editorial humana.",
        "summary": {
            "total_sources": len(source_entries),
            "healthy_sources": healthy_sources,
            "failing_sources": len(source_entries) - healthy_sources,
            "sources_with_change_hints": changed_sources,
            "verified_pages": len(verified_today),
            "pages_due_review": len(pages_due_review),
            "stale_review_days": STALE_REVIEW_DAYS,
        },
        "pages_due_review": [
            {
                "title": page.title,
                "status_label": page.status_label,
                "checked_on": page.checked_on,
                "age_days": page.age_days,
            }
            for page in pages_due_review
        ],
        "sources": source_entries,
    }

    write_json(RADAR_HEALTH_PATH, payload)
    print(f"Radar health atualizado em {RADAR_HEALTH_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
