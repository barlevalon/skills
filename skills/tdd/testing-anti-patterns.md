# Testing Anti-Patterns

Load this when writing/changing tests, adding mocks, or creating test utilities.

## Core rule

Tests verify real behavior. Mocks are support equipment, not the subject.

```text
Test what the system does, not what the mock says happened.
```

## 1. Testing mock behavior

Bad:

```typescript
test('renders sidebar', () => {
  render(<Page />);
  expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
});
```

Why bad:
- Proves mock exists, not real behavior.
- Test can pass while product behavior is broken.
- Couples test to test setup.

Better:

```typescript
test('shows navigation', () => {
  render(<Page />);
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});
```

Gate:

```text
Before asserting on mock output:
  Am I testing user/system behavior, or mock existence?
  If mock existence: delete assertion or use real component.
```

## 2. Test-only production methods

Bad:

```typescript
class Session {
  async destroy() { // only used by tests
    await workspaceManager.destroyWorkspace(this.id);
  }
}
```

Why bad:
- Pollutes production API.
- Suggests lifecycle semantics that production may not own.
- Creates dangerous operations only tests needed.

Better:

```typescript
// test-utils/session.ts
export async function cleanupSession(session: Session) {
  const workspace = session.getWorkspaceInfo();
  if (workspace) await workspaceManager.destroyWorkspace(workspace.id);
}
```

Gate:

```text
Before adding production method:
  Is this only used by tests?
  If yes: put it in test utilities.
  Does this class own this resource lifecycle?
  If no: wrong place.
```

## 3. Mocking without understanding dependencies

Bad:

```typescript
vi.mock('ToolCatalog', () => ({
  discoverAndCacheTools: vi.fn().mockResolvedValue(undefined),
}));

await addServer(config);
await addServer(config); // duplicate check silently broken by mock
```

Why bad:
- Mock removed side effect test depended on.
- Test no longer exercises real behavior.
- Failure/pass result becomes misleading.

Better:
- Run with real dependency first if cheap/safe.
- Identify slow/external boundary.
- Mock that lower boundary only.
- Preserve side effects required by behavior under test.

Gate:

```text
Before mocking:
  What side effects does real dependency have?
  Does this test rely on any of them?
  Can I mock a lower/slower boundary instead?
  If unsure: don't mock yet.
```

## 4. Incomplete mocks

Bad:

```typescript
const response = {
  status: 'success',
  data: { userId: '123' },
};
```

If real response includes metadata or nested fields downstream code uses, this mock lies.

Better:

```typescript
const response = {
  status: 'success',
  data: { userId: '123', name: 'Alice' },
  metadata: { requestId: 'req-1', timestamp: 1234567890 },
};
```

Gate:

```text
Before mock response:
  Check real schema/docs/fixture.
  Include all fields system may consume.
  Prefer builders/fixtures from captured real shapes.
```

## 5. Over-mocking internals

Bad:

```typescript
test('checkout calls paymentService.process', async () => {
  await checkout(cart);
  expect(paymentService.process).toHaveBeenCalledWith(cart.total);
});
```

Why bad:
- Tests implementation path, not outcome.
- Breaks on harmless refactor.

Better:

```typescript
test('checkout confirms paid order', async () => {
  const result = await checkout(cart, fakePaymentGateway.approves());
  expect(result.status).toBe('confirmed');
});
```

Use fakes/stubs at true system boundaries; assert observable result.

## 6. Integration tests as afterthought

Bad:

```text
Implementation complete. Ready for testing.
```

Testing is part of implementation. Completion requires tests that can fail and pass.

Better:

```text
RED: failing behavior test
GREEN: implementation
REFACTOR: cleanup while green
DONE: relevant tests pass
```

## Mock complexity warning signs

- Mock setup longer than test logic.
- Test asserts calls on multiple mocks.
- Removing mock makes test meaningless.
- Mock missing methods/fields real component has.
- Test fails when mock changes but behavior did not.
- Mock created "to be safe".

Prefer real components, focused fakes, or test fixtures when possible.

## Quick reference

| Anti-pattern | Fix |
|---|---|
| Assert `*-mock` exists | Assert real user/system-visible behavior |
| Test-only production method | Move to test utility |
| Mock high-level dependency | Mock external/slow lower boundary |
| Partial response mock | Use complete schema fixture/builder |
| Internal call-count assertions | Assert public result/effect |
| Tests after implementation | Start next behavior with RED |

## Bottom line

If TDD produces a test that mostly validates mocks, stop. The design or seam is wrong. Test real behavior through the smallest public interface that can express it.
