---
name: tdd
description: Test-driven development with red-green-refactor loop. Use when user wants to build features or fix bugs using TDD, mentions "red-green-refactor", wants integration tests, or asks for test-first development.
metadata:
  inspirations:
    - https://github.com/obra/superpowers/tree/main/skills/test-driven-development
---

# Test-Driven Development

## Core principle

Behavior change earns trust only when a test failed first for the right reason, then passed because of the implementation.

Tests should verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't.

Good tests are integration-style: they exercise real code paths through public APIs. They describe _what_ the system does, not _how_ it does it. A good test reads like a specification: "user can checkout with valid cart" tells you exactly what capability exists. These tests survive refactors because they don't care about internal structure.

Bad tests are coupled to implementation. They mock internal collaborators, test private methods, assert call counts, or verify through external means instead of the public interface. Warning sign: the test breaks after a refactor even though behavior stayed the same.

See [tests.md](tests.md), [mocking.md](mocking.md), and [testing-anti-patterns.md](testing-anti-patterns.md).

## Iron rule

```text
No owned production behavior change without a failing test first.
```

Meaning:
- Write one test for one behavior.
- Run it and watch it fail.
- Confirm the failure proves the missing behavior, not a typo/setup bug.
- Write the smallest production change that makes it pass.
- Refactor only after green.

If implementation code already exists before a test:
- Do not delete user work without permission.
- Treat it as a spike/reference, not validated implementation.
- Prefer setting it aside, writing the failing test, then implementing from the test.
- If preserving existing code is necessary, add a regression/characterization test first, then change behavior with a new failing test.

## Anti-pattern: horizontal slices

Do not write all tests first, then all implementation. That is horizontal slicing.

Wrong:

```text
RED:   test1, test2, test3, test4
GREEN: impl1, impl2, impl3, impl4
```

Right:

```text
RED -> GREEN -> REFACTOR: behavior 1
RED -> GREEN -> REFACTOR: behavior 2
RED -> GREEN -> REFACTOR: behavior 3
```

Why: bulk tests encode imagined design, outrun feedback, and often test shapes instead of behavior.

## Workflow

### 1. Plan behavior

Before writing code:

- [ ] Confirm public interface changes with user when non-obvious.
- [ ] Identify the public seam under test: the interface where behavior is observed without reaching inside.
- [ ] Confirm non-obvious or newly introduced seams with the user before writing tests.
- [ ] List behaviors to test, not implementation steps.
- [ ] Prioritize critical paths and complex logic; do not chase fake completeness.
- [ ] Identify opportunities for [deep modules](deep-modules.md).
- [ ] Design interfaces for [testability](interface-design.md).
- [ ] Pick the first tracer-bullet behavior.

Ask: "What public behavior must exist? Which behavior matters first?"

### 2. RED: one failing test

Write one minimal test for one observable behavior.

Requirements:
- Uses a confirmed public seam only.
- Uses public interface only.
- Name describes behavior.
- Tests real code where practical.
- Mocks only at system boundaries or unavoidable seams.
- Fails before implementation.

Run the narrowest useful command, for example:

```bash
npm test path/to/test.test.ts
```

Verify the failure:
- Test fails, not errors from setup/typos.
- Failure reason matches missing behavior.
- If it passes immediately, the test is wrong or behavior already exists. Fix test or choose next missing behavior.

### 3. GREEN: minimal implementation

Write only enough code to pass current test.

Do not:
- Add speculative features.
- Refactor unrelated code.
- Add future options.
- Broaden scope because it is "easy while here".

Run:

```bash
npm test path/to/test.test.ts
```

Then run relevant surrounding tests. Output should be clean: no new warnings, flakes, or hidden errors.

### 4. REFACTOR: clean while green

Refactor only after tests pass. If no refactor is useful, say so briefly and continue.

Look for [refactor candidates](refactoring.md):
- duplication
- poor names
- shallow modules
- confusing boundaries
- complexity that can move behind a small interface

Rules:
- Behavior and expectations do not change.
- Tests stay green after each refactor step.
- Test refactors may rename, dedupe, extract fixtures/builders, or improve failure messages.
- If an assertion changes expected behavior, stop: that is a new RED cycle.

### 5. Repeat vertically

Pick next behavior based on what the last cycle taught you. One behavior at a time.

## Per-cycle checklist

```text
[ ] Test describes observable behavior, not implementation
[ ] Test uses a confirmed public seam
[ ] Test uses public interface only
[ ] Test failed before implementation
[ ] Failure reason was correct
[ ] Code is minimal for this test
[ ] No speculative behavior added
[ ] Relevant tests pass cleanly
[ ] Refactor considered only while green
```

## Commit gates

For auditable work, commit phases separately when practical:

- RED commit: test-only or minimal scaffold plus failing assertion. Body records failing command and reason.
- GREEN commit: minimal implementation. Body records passing targeted test and refactor considered.
- REFACTOR commit: no behavior or expectation change. Body states what changed and what stayed unchanged.

Do not include AI attribution in commits.

## CLI contract testing

For CLI tools, command surface is the product contract. Prefer outside-in tests at the lowest reliable level:

1. CLI contract tests: execute root/subcommands with fake providers or fixtures; assert stdout, stderr, exit behavior, JSON shape.
2. Unit tests: parsing, comparison, classification, context selection, error classification.
3. Provider integration tests: filesystem fixtures and fake external services; no network/auth.
4. Live smoke tests: opt-in only; assert shape/invariants, not volatile exact output.

## Manual QA regression rule

Manual QA is discovery, not validation backbone. When it finds a behavior gap:

1. Write the lowest-level RED regression test that reproduces it.
2. Verify failure evidence.
3. Implement GREEN.
4. Rerun automated tests.
5. Rerun manual QA only after tests pass.

If output/copy/CLI shape changed, add or update a CLI contract test.

## Rationalization traps

| Claim | Response |
|---|---|
| "Too simple to test" | Simple behavior still regresses. Add the small test. |
| "I'll test after" | Passing-after tests do not prove the test can fail. |
| "I manually checked it" | Manual checks are not repeatable regression tests. |
| "Need to explore first" | Fine. Spike, then set aside and start TDD. |
| "Test is hard" | Interface may be hard to use. Simplify seam/design. |
| "Mocking makes it easy" | Maybe testing mock behavior. Read anti-patterns. |
| "One big test covers it" | Prefer one behavior per test unless end-to-end contract needs more. |
| "Refactor needs failing test" | Pure refactor starts green and stays green; behavior change needs RED. |

## Red flags: stop and correct

- Production behavior changed before failing test.
- Test passes immediately but claimed as RED.
- Failure reason not inspected.
- Test name describes implementation.
- Test asserts private calls, call order, or internal collaborators.
- Test is tautological: expected value recomputes the implementation instead of coming from an independent literal, spec, or worked example.
- Mock setup dominates test logic.
- New method exists only for tests.
- Fixing test during GREEN because implementation disagrees.
- Horizontal batch of tests before any implementation.

## When stuck

| Problem | Move |
|---|---|
| Don't know how to test | Write wished-for public API and first assertion. |
| Test setup huge | Extract fixture/helper; if still huge, simplify design. |
| Must mock everything | Code likely too coupled. Introduce dependency injection/seam. |
| Existing code has no tests | Add characterization test for current behavior, then RED for change. |
| Bug is unclear | Reproduce manually/logs first, then encode smallest failing regression. |

## Verification before done

- [ ] New/changed behavior has tests.
- [ ] Each new behavior test was observed failing for correct reason.
- [ ] All relevant tests pass.
- [ ] Tests verify public behavior.
- [ ] Tests exercise confirmed public seams.
- [ ] Expected values come from independent literals, specs, or worked examples.
- [ ] Mocks are boundary-only or justified.
- [ ] No test-only production APIs added.
- [ ] Manual QA discoveries became regression tests.
