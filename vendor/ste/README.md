# Optional English structural linter

`scripts/ste-lint.py` is an unmodified vendored file from
[danyuchn/asd-ste100-skill](https://github.com/danyuchn/asd-ste100-skill), commit
`3944283c183eea13fe5bd902b572da3b4de8bf44` (retrieved 2026-10-16).
It is copyright (c) 2026 Dustin Yuchen Teng, licensed under the [MIT License](LICENSE).
See [upstream.json](upstream.json) for source paths and SHA-256 hashes.

This is a source subset, not the complete upstream skill. The script's references
to `SKILL.md` describe its upstream contract. The integrated guidance is
[clear writing](../../references/clear-writing.md), which treats all lint findings
as review prompts. It does not require strict STE or a zero-finding score.

Requirements: Python 3.8 or later, standard library only. The surrounding test
runner uses Node.js 20 or later. No pip packages or network calls are required.

```sh
python3 vendor/ste/scripts/ste-lint.py --selftest
python3 vendor/ste/scripts/ste-lint.py --json path/to/english-copy.md
node --test tests/ste.test.mjs
```

Normal lint reads only the files named on the command line or standard input.
It reports to standard output and does not change the input files. The built-in
`--selftest` creates two files in a temporary directory, then removes the directory.
The reviewed script contains no network or subprocess operations.

The tool uses English-specific heuristics. Do not run it as a Chinese writing
check. It cannot establish meaning preservation, truth, or reader understanding.
Its word groups can produce false positives when similar terms name different
technical actions. Its exit code reports upstream structural rules, not the
quality of an explanation. No official ASD-STE100 dictionary is bundled, and
this tool does not certify compliance with that standard.
