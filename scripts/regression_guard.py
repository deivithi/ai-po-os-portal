#!/usr/bin/env python3
"""Trava de CI: PR de correção (título ou commit começando com fix/bug/corrige/hotfix)
precisa mexer em pelo menos um arquivo de teste. Transforma em checagem a regra
"todo bug corrigido ganha um teste de regressão que falhava antes da correção".

Uso no CI:  python3 scripts/regression_guard.py --base origin/main --title "$PR_TITLE"
Uso local:  python3 regression_guard.py --base main
Pular com motivo: incluir [sem-teste: motivo] no título ou no corpo do commit.
Sai 0 quando não é correção, quando tem teste, ou quando há [sem-teste: ...]."""
import argparse, re, subprocess, sys

FIX = re.compile(r'^\s*(fix|bug|bugfix|hotfix|corrige|correção|correcao)\b', re.I)
TEST = re.compile(r'(^|/)(tests?|__tests__|spec|e2e)/|[._-](test|spec)\.[a-z]+$|^test_.*\.py$|/test_[^/]*\.py$', re.I)
SKIP = re.compile(r'\[sem-teste:\s*[^\]]{3,}\]', re.I)

def git(*a):
    return subprocess.run(['git', *a], capture_output=True, text=True, check=True).stdout

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--base', default='origin/main')
    p.add_argument('--title', default='')
    a = p.parse_args()
    msgs = git('log', '--format=%B%x00', f'{a.base}..HEAD').split('\x00')
    subjects = [m.strip().splitlines()[0] for m in msgs if m.strip()]
    texts = [a.title] + msgs
    if any(SKIP.search(t) for t in texts):
        print('regression guard: pulado com [sem-teste: ...]'); return 0
    if not (FIX.match(a.title) or any(FIX.match(s) for s in subjects)):
        print('regression guard: não é correção, nada a checar'); return 0
    files = [f for f in git('diff', '--name-only', f'{a.base}...HEAD').splitlines() if f]
    tests = [f for f in files if TEST.search(f)]
    if tests:
        print(f'regression guard: OK, {len(tests)} arquivo(s) de teste no diff: {", ".join(tests[:5])}'); return 0
    print('regression guard: FALHOU. Correção sem teste de regressão.')
    print(f'  {len(files)} arquivo(s) mudaram e nenhum é teste.')
    print('  Escreva o teste que falhava antes da correção, ou ponha [sem-teste: motivo] no título.')
    return 1

if __name__ == '__main__':
    sys.exit(main())
