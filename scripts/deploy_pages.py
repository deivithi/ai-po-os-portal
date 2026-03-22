#!/usr/bin/env python3
"""Deploy a GitHub Pages artifact using the official Pages REST API.

This replaces the GitHub-maintained JavaScript actions that still emit
Node 20 deprecation annotations on runners. The workflow continues to use
official GitHub Actions for checkout/upload, but performs the deployment
request through the documented API endpoints.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request


TEMPORARY_ERROR_STATUS = {
    "unknown_status": "Nao foi possivel obter o status do deploy.",
    "not_found": "Deploy do Pages nao encontrado.",
    "deployment_attempt_error": "Falha temporaria no deploy do Pages; novo status sera consultado automaticamente.",
}

FINAL_ERROR_STATUS = {
    "deployment_failed": "Deploy do Pages falhou. Tente novamente mais tarde.",
    "deployment_perms_error": "Deploy do Pages falhou por permissao de arquivo no artefato.",
    "deployment_content_failed": "Artefato invalido para o Pages. Verifique links simbolicos, hard links e tamanho.",
    "deployment_cancelled": "Deploy do Pages cancelado.",
    "deployment_lost": "Deploy do Pages nao reportou status final.",
}

DEFAULT_TIMEOUT_MS = 600_000
DEFAULT_POLL_INTERVAL_MS = 5_000
DEFAULT_MAX_ERRORS = 10


def _json_request(method: str, url: str, headers: dict[str, str], payload: dict | None = None) -> tuple[int, dict]:
    body = None
    effective_headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10",
        **headers,
    }
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        effective_headers["Content-Type"] = "application/json"

    request = urllib.request.Request(url=url, data=body, headers=effective_headers, method=method)
    try:
        with urllib.request.urlopen(request) as response:
            raw = response.read().decode("utf-8")
            return response.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as error:
        raw = error.read().decode("utf-8", errors="replace")
        try:
            parsed = json.loads(raw) if raw else {}
        except json.JSONDecodeError:
            parsed = {"message": raw}
        message = parsed.get("message") or raw or str(error)
        raise RuntimeError(f"HTTP {error.code} em {url}: {message}") from error


def _get_required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Variavel obrigatoria ausente: {name}")
    return value


def _get_oidc_token() -> str:
    request_url = _get_required_env("ACTIONS_ID_TOKEN_REQUEST_URL")
    request_token = _get_required_env("ACTIONS_ID_TOKEN_REQUEST_TOKEN")
    _, payload = _json_request(
        "GET",
        request_url,
        {
            "Authorization": f"Bearer {request_token}",
        },
    )
    token = payload.get("value")
    if not token:
        raise RuntimeError("Resposta do OIDC sem campo 'value'.")
    return token


def _write_github_output(name: str, value: str) -> None:
    output_file = os.getenv("GITHUB_OUTPUT")
    if not output_file:
        return
    with open(output_file, "a", encoding="utf-8") as handle:
        handle.write(f"{name}={value}\n")


def _cancel_deployment(api_url: str, repository: str, github_token: str, deployment_id: str) -> None:
    _json_request(
        "POST",
        f"{api_url}/repos/{repository}/pages/deployments/{deployment_id}/cancel",
        {"Authorization": f"Bearer {github_token}"},
    )


def deploy(args: argparse.Namespace) -> int:
    github_token = args.github_token or _get_required_env("GITHUB_TOKEN")
    repository = args.repository or _get_required_env("GITHUB_REPOSITORY")
    build_version = args.build_version or _get_required_env("GITHUB_SHA")
    api_url = (args.api_url or os.getenv("GITHUB_API_URL") or "https://api.github.com").rstrip("/")

    oidc_token = _get_oidc_token()
    payload = {
        "artifact_id": int(args.artifact_id),
        "pages_build_version": build_version,
        "oidc_token": oidc_token,
    }

    print(f"[deploy_pages] Criando deploy do Pages para {repository} com artifact_id={args.artifact_id}")
    _, created = _json_request(
        "POST",
        f"{api_url}/repos/{repository}/pages/deployments",
        {"Authorization": f"Bearer {github_token}"},
        payload,
    )

    deployment_id = str(created.get("id") or created.get("status_url", "").rstrip("/").split("/")[-1])
    if not deployment_id:
        raise RuntimeError("A API de Pages nao retornou um deployment id utilizavel.")

    page_url = created.get("page_url") or created.get("preview_url") or ""
    if page_url:
        print(f"[deploy_pages] URL publicada: {page_url}")
        _write_github_output("page_url", page_url)

    deadline = time.time() + max(1, args.timeout_ms) / 1000
    poll_interval = max(1, args.poll_interval_ms) / 1000
    errors = 0

    while True:
        if time.time() >= deadline:
            print("[deploy_pages] Timeout atingido; cancelando deploy.", file=sys.stderr)
            try:
                _cancel_deployment(api_url, repository, github_token, deployment_id)
            except Exception as cancel_error:  # noqa: BLE001
                print(f"[deploy_pages] Falha ao cancelar deploy apos timeout: {cancel_error}", file=sys.stderr)
            raise RuntimeError("Timeout atingido durante o deploy do GitHub Pages.")

        time.sleep(poll_interval)

        try:
            _, status_payload = _json_request(
                "GET",
                f"{api_url}/repos/{repository}/pages/deployments/{deployment_id}",
                {"Authorization": f"Bearer {github_token}"},
            )
        except Exception as status_error:  # noqa: BLE001
            errors += 1
            print(
                f"[deploy_pages] Erro ao consultar status ({errors}/{args.max_errors}): {status_error}",
                file=sys.stderr,
            )
            if errors >= args.max_errors:
                try:
                    _cancel_deployment(api_url, repository, github_token, deployment_id)
                except Exception as cancel_error:  # noqa: BLE001
                    print(
                        f"[deploy_pages] Falha ao cancelar deploy apos erros de polling: {cancel_error}",
                        file=sys.stderr,
                    )
                raise RuntimeError("Quantidade maxima de erros ao consultar o status do Pages foi atingida.")
            continue

        errors = 0
        status = status_payload.get("status", "unknown_status")
        if status == "succeed":
            print("[deploy_pages] Deploy concluido com sucesso.")
            return 0
        if status in FINAL_ERROR_STATUS:
            raise RuntimeError(FINAL_ERROR_STATUS[status])
        if status in TEMPORARY_ERROR_STATUS:
            print(f"[deploy_pages] {TEMPORARY_ERROR_STATUS[status]}")
            continue

        print(f"[deploy_pages] Status atual: {status}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Faz deploy de um artifact no GitHub Pages via API oficial.")
    parser.add_argument("--artifact-id", required=True, help="ID do artifact retornado por actions/upload-artifact.")
    parser.add_argument("--repository", help="Repositorio no formato owner/repo. Default: GITHUB_REPOSITORY.")
    parser.add_argument("--github-token", help="Token GitHub com pages:write. Default: GITHUB_TOKEN.")
    parser.add_argument("--build-version", help="SHA/version do build. Default: GITHUB_SHA.")
    parser.add_argument("--api-url", help="Base da API do GitHub. Default: GITHUB_API_URL ou https://api.github.com.")
    parser.add_argument("--timeout-ms", type=int, default=DEFAULT_TIMEOUT_MS, help="Timeout maximo para o deploy.")
    parser.add_argument(
        "--poll-interval-ms",
        type=int,
        default=DEFAULT_POLL_INTERVAL_MS,
        help="Intervalo entre leituras de status do deploy.",
    )
    parser.add_argument(
        "--max-errors",
        type=int,
        default=DEFAULT_MAX_ERRORS,
        help="Numero maximo de falhas de polling antes de cancelar o deploy.",
    )
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        return deploy(args)
    except Exception as error:  # noqa: BLE001
        print(f"[deploy_pages] Falha: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
