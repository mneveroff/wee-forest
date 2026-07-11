# Kent C. Dodds frontend testing practices

Research date: 2026-07-11. Scope: Kent C. Dodds's own writing on `kentcdodds.com`; Testing Library documentation is used only in the final corroboration section. This is evidence gathering, not an agent-skill draft.

## Executive synthesis

Kent's durable rule is: **test supported use cases through the same observable surfaces that users use**. For frontend code, that normally means rendered DOM, accessible names and roles, realistic interactions, visible state changes, and requests crossing the network boundary. Tests should survive internal refactors because they should not know component instances, state, hook choice, CSS selectors, or client-module call details.

The strongest operational consequences are:

1. Prefer integration-style component/page tests that render real providers and production code, mocking mainly network boundaries and impractical animation.
2. Query by accessible role and name first; use labels for form controls and visible text where appropriate. Treat a failed accessible query as product feedback, not merely a selector problem.
3. Drive behavior with `user-event`, then wait for a specific user-observable result. Use `findBy*` for appearance, `waitForElementToBeRemoved` for disappearance, and `waitFor` for a specific non-DOM assertion.
4. Intercept HTTP with MSW instead of mocking `fetch` or an API-client module. Keep normal handlers shared, override errors per test, and reset handlers after each test.
5. Keep each test self-contained and isolated. Prefer local setup/test-object factories and a custom render with real providers over nested `describe`/`beforeEach` state.
6. Test components and ordinary extracted hooks through behavior. Reach for `renderHook` mainly for reusable hooks whose API is itself the thing being supported.
7. Treat `act` warnings as evidence of an unobserved update or an unfinished test, not noise to suppress.
8. Prefer explicit assertions. If snapshots are justified, keep them small, intentional, reviewable, and focused on meaningful differences.

## Evidence by topic

### 1. Guiding principle and test scope

#### Use-case principle

- “The more your tests resemble the way your software is used, the more confidence they can give you.” Tests should work with actual DOM nodes and avoid component instances and internal implementation details.  
  Source: [Introducing the react-testing-library](https://kentcdodds.com/blog/introducing-the-react-testing-library) (2018-04-02).
- Think less about code branches and more about supported use cases. Code coverage can reveal gaps, but “use case coverage” is the goal. Test observable effects for end users and developer users, not lifecycle methods, handlers, or internal state.  
  Source: [How to know what to test](https://kentcdodds.com/blog/how-to-know-what-to-test) (2019-04-13).
- Internal state names, methods, component classes, and shallow-render output make a test a third consumer of implementation. Tests that interact with rendered output survive class-to-hook and other behavior-preserving refactors.  
  Sources: [Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details) (2020-08-17); [Why I never use shallow rendering](https://kentcdodds.com/blog/why-i-never-use-shallow-rendering).
- Integration tests generally offer the best confidence/cost trade-off. Kent's example renders the app with its providers, mocks as little as practical, and reserves E2E for a smaller set of critical paths.  
  Sources: [Static vs Unit vs Integration vs E2E Testing for Frontend Apps](https://kentcdodds.com/blog/static-vs-unit-vs-integration-vs-e2e-tests); [The Testing Trophy and Testing Classifications](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) (2021-06-03).

#### Actionable interpretation

- Write test names as user/developer use cases.
- Assert DOM, callback, request, navigation, storage, or subscription effects.
- Do not assert component state, call private methods, shallow-render, or locate framework component names.
- Choose the cheapest test level that faithfully exercises the use case; do not force every case through E2E or every behavior into an isolated unit.

### 2. Query priority and accessibility

#### Query principle

- Query the DOM the way users discover controls. Kent's later priority is `*ByRole` with an accessible `name` for most elements, then other semantic queries such as labels and visible text. Role queries use implicit semantics, handle split text, and expose available roles in useful failures.  
  Source: [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library) (2020-05-04).
- Avoid `container.querySelector`, class selectors, and component selectors: they reduce confidence, readability, and refactor resilience. Prefer `screen` for document queries and debugging.  
  Sources: [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library); [Making your UI tests resilient to change](https://kentcdodds.com/blog/making-your-ui-tests-resilient-to-change).
- Native semantic HTML supplies implicit roles. Do not add redundant or incorrect `role`/ARIA merely to satisfy a test; use ARIA only when native HTML cannot express the interaction, following established accessibility patterns.  
  Source: [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library).
- Query actual default-locale text rather than inventing test-only selectors everywhere. A meaningful copy change can be a legitimate behavior change worth surfacing.  
  Source: [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library).

#### Query semantics

- `getBy*`: element should exist now; preserves rich failure output.
- `findBy*`: element should appear asynchronously.
- `queryBy*`: primarily for asserting absence; using it for presence loses useful errors.
- Prefer jest-dom's semantic matchers because they express intent and provide better diagnostics than raw DOM-property assertions.

### 3. User interactions

#### Interaction principle

- Prefer `@testing-library/user-event` to low-level `fireEvent` where possible. A user action is a sequence of browser events and constraints, not a single synthetic `change`.  
  Sources: [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library); [How to know what to test](https://kentcdodds.com/blog/how-to-know-what-to-test).
- Interact through the rendered UI rather than assigning values, invoking handlers, or manipulating component instances. Test keyboard reachability of forms as a real accessibility check.  
  Sources: [Introducing the react-testing-library](https://kentcdodds.com/blog/introducing-the-react-testing-library); [Please stop building inaccessible forms (and how to fix them)](https://kentcdodds.com/blog/please-stop-building-inaccessible-forms-and-how-to-fix-them) (2019-02-04).

#### Current application

- Create a `user` instance inside each test (or a per-test setup helper), and await interactions.
- Use `fireEvent` only when deliberately testing a low-level event that `user-event` cannot model.
- Assert the resulting behavior, not the incidental list of events dispatched.

### 4. Async tests

#### Async principle

- Wait for the UI state a user would observe, not arbitrary time, promise flushing, or an empty event-loop tick.  
  Sources: [Introducing the react-testing-library](https://kentcdodds.com/blog/introducing-the-react-testing-library); [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library).
- Use `findBy*` when an element will appear; it is simpler than wrapping `getBy*` in `waitFor` and gives better errors. Use `waitForElementToBeRemoved` for disappearance. Use `waitFor` for one specific assertion that must eventually pass.  
  Sources: [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library); [Fix the “not wrapped in act(...)” warning](https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning).
- Keep side effects out of `waitFor`; its callback may run repeatedly. Do the interaction once, then wait. Avoid empty callbacks and preferably keep one assertion in the retrying callback so failures are fast and clear.  
  Source: [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library).
- Await async utilities. Missing `await` can produce false positives or let updates leak into later tests.  
  Source: [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library).

### 5. Mocking, network boundaries, and MSW

#### Boundary principle

- Every mock severs part of the production connection and spends confidence. Mock only where the cost or externality warrants it. Kent's UI unit/integration boundary is normally the network; E2E should mock as little as practical.  
  Sources: [The merits of mocking](https://kentcdodds.com/blog/the-merits-of-mocking); [Static vs Unit vs Integration vs E2E Testing for Frontend Apps](https://kentcdodds.com/blog/static-vs-unit-vs-integration-vs-e2e-tests).
- Do not mock an API-client module if the test can cheaply exercise it. That hides request construction and client/server contract bugs. Mocking `fetch` directly is better than mocking the client but still duplicates response mechanics and backend behavior.  
  Source: [Stop mocking fetch](https://kentcdodds.com/blog/stop-mocking-fetch) (2020-06-03).
- MSW intercepts at the request boundary while production request code remains real. Shared handlers can support tests and local development; an incorrectly constructed request fails to match, increasing confidence.  
  Source: [Stop mocking fetch](https://kentcdodds.com/blog/stop-mocking-fetch).

#### Setup pattern

- Put normal/happy-path handlers in shared server setup.
- Start the server once, reset runtime handlers after each test, and close it after the suite.
- Override a handler inside a test for a colocated error or edge case.
- Prefer failing on unhandled requests so accidental real network traffic and route mismatches are visible.
- Keep deterministic test data where the assertion depends on exact output; use builders to make relevant differences obvious.

### 6. Test setup, utilities, and isolation

#### Isolation principle

- Each test must run alone and in any order. Shared rendered components or mutable values couple tests and make skipping/refactoring unsafe. React Testing Library's automatic unmount supports isolation.  
  Source: [Test Isolation with React](https://kentcdodds.com/blog/test-isolation-with-react).
- Deep `describe`/`beforeEach` nesting encourages hidden mutable state and forces readers to reconstruct setup across scopes. Prefer visually self-contained tests and ordinary setup functions/test-object factories.  
  Sources: [Avoid Nesting when you're Testing](https://kentcdodds.com/blog/avoid-nesting-when-youre-testing) (2019-07-29); [AHA Testing](https://kentcdodds.com/blog/aha-testing).
- Do not split one coherent workflow into many dependent micro-tests merely to keep each test short. Fewer, longer use-case tests can reduce repeated setup, cross-test async leakage, and `act` warnings. Multiple assertions are appropriate when they describe one behavior.  
  Source: [Write fewer, longer tests](https://kentcdodds.com/blog/write-fewer-longer-tests).
- A project `test-utils` module may provide a custom `render` that installs the real providers and accepts meaningful options such as an initial route. Re-export standard Testing Library utilities so tests have one import surface.  
  Source: [Static vs Unit vs Integration vs E2E Testing for Frontend Apps](https://kentcdodds.com/blog/static-vs-unit-vs-integration-vs-e2e-tests).
- Avoid hasty abstraction: duplicate a little until the repeated intent is clear, then extract focused setup that highlights what differs among cases.  
  Source: [AHA Testing](https://kentcdodds.com/blog/aha-testing).

### 7. Forms

#### Form principle

- Properly associate every control with a label, preferably native `<label for>` plus matching `id`, with `aria-labelledby`, wrapping label, or `aria-label` as context-dependent alternatives. A visually adjacent label is not programmatically associated.  
  Source: [Please stop building inaccessible forms (and how to fix them)](https://kentcdodds.com/blog/please-stop-building-inaccessible-forms-and-how-to-fix-them).
- Exercise forms as a user does: locate controls by role/name or associated label, type, submit through a submit control, and assert visible success/error state or another observable effect.  
  Sources: [Introducing the react-testing-library](https://kentcdodds.com/blog/introducing-the-react-testing-library); [Making your UI tests resilient to change](https://kentcdodds.com/blog/making-your-ui-tests-resilient-to-change).
- Keyboard-only use is an important manual and automated check. Labels also enlarge the clickable target for checkboxes and mobile users.  
  Source: [Please stop building inaccessible forms (and how to fix them)](https://kentcdodds.com/blog/please-stop-building-inaccessible-forms-and-how-to-fix-them).

### 8. Components and hooks

#### Component and hook principle

- Test components through public props/context and rendered behavior. Useful developer-user cases include rerendering with new props/context and observing subscription changes; do not inspect lifecycle methods, handlers, or internal state.  
  Sources: [How to know what to test](https://kentcdodds.com/blog/how-to-know-what-to-test); [Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details).
- A one-off hook extracted to organize a component should ordinarily be covered by the component test. For a reusable/public hook, first consider a small realistic example component because it most closely represents actual use.  
  Source: [How to test custom React hooks](https://kentcdodds.com/blog/how-to-test-custom-react-hooks) (2020-03-22).
- Use `renderHook` when realistic example components become cumbersome or the reusable hook's direct API, rerendering, unmounting, or async behavior is the supported contract. Do not mock React's built-in hooks.  
  Source: [How to test custom React hooks](https://kentcdodds.com/blog/how-to-test-custom-react-hooks).

### 9. Snapshots

#### Snapshot principle

- A snapshot is an assertion, but generated output often fails to state authorial intent. Large snapshots are rarely reviewed carefully and normalize blind regeneration. Prefer explicit assertions whenever they communicate the requirement better.  
  Sources: [Effective Snapshot Testing](https://kentcdodds.com/blog/effective-snapshot-testing) (2017-10-30); [Make your test fail](https://kentcdodds.com/blog/make-your-test-fail).
- Snapshots are strongest for focused, naturally serializable output such as transformation before/after results and exact developer-facing errors. Keep them to a few dozen lines at most and use serializers to remove irrelevant variation.  
  Source: [Effective Snapshot Testing](https://kentcdodds.com/blog/effective-snapshot-testing).
- Whole shallow-rendered component snapshots are dominated by implementation details and churn on refactors. If the requirement is a before/after change, a focused diff snapshot can make intent clearer than two full snapshots.  
  Sources: [Why I never use shallow rendering](https://kentcdodds.com/blog/why-i-never-use-shallow-rendering); [Effective Snapshot Testing](https://kentcdodds.com/blog/effective-snapshot-testing).

### 10. `act` warnings

#### `act` principle

- An `act` warning means React observed an update the test did not account for. It can reveal a real missing assertion, such as never waiting for a saving indicator to disappear.  
  Source: [Fix the “not wrapped in act(...)” warning](https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning).
- Rendering, Testing Library interactions, and Testing Library async utilities already coordinate with `act`; wrapping them again is normally useless. First ask what update is still occurring after the test ends and wait for its user-visible completion.  
  Sources: [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library); [Write fewer, longer tests](https://kentcdodds.com/blog/write-fewer-longer-tests).
- Direct `act` remains appropriate when the test itself invokes a hook result, advances fake timers, resolves a controlled promise, or triggers another state update outside React's call stack and no user-facing Testing Library helper covers it.  
  Sources: [Fix the “not wrapped in act(...)” warning](https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning); [How to test custom React hooks](https://kentcdodds.com/blog/how-to-test-custom-react-hooks).

### 11. Test IDs

#### Test ID principle

- `data-testid` is an escape hatch when a reliable role, accessible name, label, visible text, alt text, or other user-facing selector is not practical. Before adding one, check whether the product is missing correct semantics.  
  Sources: [Introducing the react-testing-library](https://kentcdodds.com/blog/introducing-the-react-testing-library); [Making your UI tests resilient to change](https://kentcdodds.com/blog/making-your-ui-tests-resilient-to-change); [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library).
- A test ID is preferable to styling classes or structural selectors when no semantic selector exists because it explicitly identifies test metadata and is stable across styling changes. Shipping it is usually harmless.  
  Source: [Making your UI tests resilient to change](https://kentcdodds.com/blog/making-your-ui-tests-resilient-to-change).

## Durable guidance versus version-specific details

| Status | Guidance |
| --- | --- |
| Durable | Test use cases and observable behavior; avoid implementation details. |
| Durable | Prefer accessible role/name and properly labelled controls; use semantic HTML before ARIA. |
| Durable | Simulate realistic user actions and await observable completion. |
| Durable | Mock at external boundaries, with MSW preserving real request code. |
| Durable | Keep tests isolated and setup explicit; use custom render for real providers. |
| Durable | Treat ordinary hooks as component behavior and reusable hooks as public APIs. |
| Durable | Treat `act` warnings as missing test synchronization/coverage. |
| Durable | Keep snapshots small and intentional; test IDs are a last resort. |
| Version-specific | Exact package imports, matcher setup, `user-event` invocation, MSW handler syntax, renderer internals, and named async helpers. Check installed major versions. |

## Advice in older posts that is now outdated or superseded

1. **Direct, synchronous `userEvent.click/type` calls:** older Kent examples call `userEvent.click(...)` or `userEvent.type(...)` without setup or `await`. Current practice is `const user = userEvent.setup()` inside the test and `await user.click/type(...)`. The principle—prefer realistic user interactions—remains valid.
2. **Direct input mutation:** the hook article includes `input.value = 'two'`. That bypasses how users type and can bypass framework event handling. Use awaited `user.type`, `user.clear`, or another appropriate interaction.
3. **`wait`/empty-tick waiting:** the 2018 introduction describes a `wait` helper and deprecated `flushPromises`. Kent's 2020 correction is to wait for a specific result with `findBy*`, `waitFor`, or `waitForElementToBeRemoved`; generic tick-flushing is brittle.
4. **`getByText` as the default button query:** early examples click buttons with `getByText`. Kent's later guidance elevates `getByRole('button', {name: ...})`, which tests semantics and accessible name.
5. **Manual `cleanup`:** no longer needed in supported test frameworks because React Testing Library performs automatic cleanup. Kent explicitly marks manual cleanup as a common mistake.
6. **`@testing-library/jest-dom/extend-expect`:** old snippets use this historical subpath. Modern setups normally import `@testing-library/jest-dom` (or the runner-specific entry point) once in the test setup file.
7. **Old React renderer internals:** the 2018 explanation mentions `ReactDOM.render`, `ReactDOM.unmountComponentAtNode`, `react-dom/test-utils`, and class lifecycle examples. These describe then-current implementation, not a practice to copy with modern React.
8. **Old MSW v1 syntax:** `rest.get/post`, `(req, res, ctx)`, `ctx.json`, and `req.body` in the 2020 article are version-specific. Current MSW major versions use different handler/response APIs. Preserve the boundary and lifecycle pattern, but follow the installed MSW version's API.
9. **Nested-label selector caveat:** the 2019 form article says `getByLabelText` requires a `selector` when the input is nested in the label. That limitation does not describe current Testing Library behavior; the accessibility recommendation remains sound.
10. **Snapshot tooling examples:** `jest-glamor-react`, Enzyme rendering, CommonJS setup, and `snapshot-diff` syntax are historical examples. The durable advice is small, focused, deterministic snapshots—not those packages.
11. **Framework-specific globals:** `jest.fn`, `jest.spyOn`, `setupFilesAfterEnv`, and Jest reset options are examples, not requirements. Apply the isolation and setup principles using the repository's runner.

## Testing Library corroboration (first-party, not primary evidence)

These pages corroborate current API details only; the principles above are grounded in Kent's writing.

- [Testing Library introduction](https://testing-library.com/docs/) restates that queries should resemble how users find DOM nodes.
- [About queries / priority](https://testing-library.com/docs/queries/about/) documents the semantic query priority and `get`/`query`/`find` behavior.
- [user-event introduction](https://testing-library.com/docs/user-event/intro/) recommends `userEvent.setup()` inside the test and awaited instance methods.
- [Async methods](https://testing-library.com/docs/dom-testing-library/api-async/) documents `findBy`, `waitFor`, and `waitForElementToBeRemoved`.

## Source inventory

### Kent primary sources: 20 unique articles

1. [Introducing the react-testing-library](https://kentcdodds.com/blog/introducing-the-react-testing-library)
2. [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
3. [Making your UI tests resilient to change](https://kentcdodds.com/blog/making-your-ui-tests-resilient-to-change)
4. [Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details)
5. [Why I never use shallow rendering](https://kentcdodds.com/blog/why-i-never-use-shallow-rendering)
6. [How to know what to test](https://kentcdodds.com/blog/how-to-know-what-to-test)
7. [Static vs Unit vs Integration vs E2E Testing for Frontend Apps](https://kentcdodds.com/blog/static-vs-unit-vs-integration-vs-e2e-tests)
8. [The Testing Trophy and Testing Classifications](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
9. [The merits of mocking](https://kentcdodds.com/blog/the-merits-of-mocking)
10. [Stop mocking fetch](https://kentcdodds.com/blog/stop-mocking-fetch)
11. [Test Isolation with React](https://kentcdodds.com/blog/test-isolation-with-react)
12. [Avoid Nesting when you're Testing](https://kentcdodds.com/blog/avoid-nesting-when-youre-testing)
13. [AHA Testing](https://kentcdodds.com/blog/aha-testing)
14. [Write fewer, longer tests](https://kentcdodds.com/blog/write-fewer-longer-tests)
15. [Please stop building inaccessible forms (and how to fix them)](https://kentcdodds.com/blog/please-stop-building-inaccessible-forms-and-how-to-fix-them)
16. [How to test custom React hooks](https://kentcdodds.com/blog/how-to-test-custom-react-hooks)
17. [Effective Snapshot Testing](https://kentcdodds.com/blog/effective-snapshot-testing)
18. [Make your test fail](https://kentcdodds.com/blog/make-your-test-fail)
19. [Fix the “not wrapped in act(...)” warning](https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning)
20. [React Hooks: What's going to happen to my tests?](https://kentcdodds.com/blog/react-hooks-whats-going-to-happen-to-my-tests)

### Corroborating first-party Testing Library pages: 4

Total sources: **24**.
