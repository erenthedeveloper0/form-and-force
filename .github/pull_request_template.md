## What and why

<!-- What does this change, and why is it needed? Link the issue if there is one. -->

## Checks

Mark each one: Passed / Failed / Partially completed / Blocked (why) / Not run.

- `python3 tooling/validate_repository.py`:
- `python3 -m unittest discover -s tests -v`:
- `python3 tooling/package_skill.py`:
- `python3 tooling/sync_docs.py --check`:
- `python3 site/build.py --check`:
- Browser tests with `FF_PLAYWRIGHT_DIR` set (needed if a rendered tool or the brand's rasters changed):
- `claude plugin validate --strict .` (optional):
- Paid model evaluations (optional, never required):

## Not done or not verified

<!-- List anything incomplete, untested, or inferred rather than observed. "Nothing" is a valid answer only if true. -->
