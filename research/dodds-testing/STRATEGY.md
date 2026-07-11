# Kent C. Dodds on testing strategy

Data-gathering notes from Kent C. Dodds's own articles. This is a synthesis of primary sources, not a proposed agent skill.

## Core objective: confidence, not test volume

- The purpose of testing is confidence that changes preserve the use cases people depend on. Tests are valuable when they save maintenance time, make changes safer, and provide peace of mind—not merely because a policy requires them.
- Evaluate the return on testing investment as **confidence gained per unit of time and maintenance cost**. Kent's concise formulation is: “Remember, it's all about getting a good return on your investment where ‘return’ is ‘confidence’ and ‘investment’ is ‘time.’”
- A passing suite is not automatically useful. A useful test would fail for a relevant product regression and normally continue to pass through behavior-preserving refactoring.
- Prioritize by consequence: ask, “What would be the worst thing to break in this app?” Cover critical happy paths first, then important edge cases and complex business logic.

Sources:

- [Confidently Shipping Code](https://kentcdodds.com/blog/confidently-shipping-code)
- [The Testing Trophy and Testing Classifications](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [How to know what to test](https://kentcdodds.com/blog/how-to-know-what-to-test)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-testing-mistakes)

## Confidence is not code coverage

- Code coverage says only that code ran during tests. It does not show that business requirements are satisfied, collaborators work together, or the application cannot enter a bad state.
- Coverage weights all lines equally even though product risk does not: an About page line and a checkout line contribute the same percentage.
- Use coverage as a secondary diagnostic after identifying critical use cases. Uncovered lines can prompt the question: “What use cases are these lines of code supporting?”
- Prefer **use-case coverage** as the mental model. There is no automatic report for it; it requires product and domain judgment.
- One hundred percent code coverage can still miss use cases. Conversely, pursuing 100% application coverage can produce low-value or implementation-coupled tests.
- Kent explicitly treats small, widely reused libraries differently: 100% coverage can be appropriate and inexpensive there. His “much beyond 70%” remark was illustrative, not evidence-based: “I made that number up... no science there.”

Sources:

- [How to know what to test](https://kentcdodds.com/blog/how-to-know-what-to-test) — “Test use cases, not code.”
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-testing-mistakes)
- [Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests)

## The Testing Trophy is an ROI heuristic

The four layers are:

1. **Static analysis** catches typos, type errors, and classes of invalid code while it is written.
2. **Unit tests** verify individual isolated units.
3. **Integration tests** verify multiple units working together.
4. **End-to-end tests** exercise the running application much as a user does.

The trophy's width indicates where Kent generally recommends spending effort for JavaScript applications, not a mandatory test-count ratio. Integration is widest because it commonly balances confidence against speed, cost, and diagnosability.

Moving upward generally runs more production code and increases the “confidence coefficient,” but also cost, duration, possible failure points, and diagnostic difficulty. Choose the smallest scope that can faithfully prove the use case:

- Let static analysis catch type-shaped errors.
- Unit-test pure functions and dense business-logic edge cases.
- Use integration tests for component/page workflows and collaborator behavior.
- Use E2E for critical cross-system paths and confidence unavailable lower down.

The governing quote is: “The more your tests resemble the way your software is used, the more confidence they can give you.”

Sources:

- [Static vs Unit vs Integration vs E2E Testing for Frontend Apps](https://kentcdodds.com/blog/static-vs-unit-vs-integration-vs-e2e-tests)
- [The Testing Trophy and Testing Classifications](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests)

## “Mostly integration” does not mean “integration instead of E2E”

- Integration tests receive most effort because they often provide strong confidence without running the whole stack.
- Kent still recommends E2E coverage of critical happy paths. His suggested starting sequence for an existing app is a few high-value E2E tests, followed by integration tests for omitted edge cases and unit tests for complex business logic.
- A single E2E test can provide substantially more confidence than a single unit test, but E2E is slower, less reliable, and harder to diagnose. Do not force every case through E2E setup.
- Integration and unit labels are deliberately loose. Kent's definitions are scoped to one codebase: a unit has no collaborators or mocks them; integration exercises multiple units together.
- His original trophy was developed from frontend/JavaScript experience and a monolithic-codebase perspective. He explicitly says he had not designed it for microservices or serverless systems.
- Rendering a full app is not required for an integration test. Conversely, a Testing Library test of one component may reasonably be called a unit test.

Sources:

- [The Testing Trophy and Testing Classifications](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [How to know what to test](https://kentcdodds.com/blog/how-to-know-what-to-test)
- [Static vs Unit vs Integration vs E2E Testing for Frontend Apps](https://kentcdodds.com/blog/static-vs-unit-vs-integration-vs-e2e-tests)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-testing-mistakes)

## Static analysis is part of the strategy, not a substitute for tests

- Type checking and linting cheaply prevent entire classes of defects and should form the trophy's base.
- Static tools cannot establish that business logic satisfies requirements.
- Do not spend dynamic-test effort proving constraints that TypeScript or ESLint already enforce well. Use each tool for the failure class it can catch most directly.
- Even strongly typed software still needs behavioral tests.

Sources:

- [Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests)
- [Static vs Unit vs Integration vs E2E Testing for Frontend Apps](https://kentcdodds.com/blog/static-vs-unit-vs-integration-vs-e2e-tests)

## Avoid implementation details

Kent defines implementation details as “things which users of your code will not typically use, see, or even know about.”

- Test public, observable contracts: user interactions and output for end users; props, return values, callbacks, or public APIs for developer users.
- Avoid assertions against private state, internal method names, component names, lifecycle methods, and wiring that users do not observe.
- Implementation-coupled tests create both:
  - **False negatives:** a behavior-preserving refactor breaks the test.
  - **False positives:** production behavior breaks while the internal assertion still passes.
- UI code commonly has two legitimate users: the end user and the developer consuming the component. Tests should not create a third “test user” whose private access requirements constrain production design.
- Translate a manual user workflow into automation: set up through the public interface, perform realistic actions, and assert observable effects.

Sources:

- [Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details)
- [Avoid the Test User](https://kentcdodds.com/blog/avoid-the-test-user)
- [How to know what to test](https://kentcdodds.com/blog/how-to-know-what-to-test)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-testing-mistakes)

## Mocking is a confidence-for-practicality trade

- “Mocking severs the real-world connection between what you're testing and what you're mocking.”
- Mock when reality is impractical, destructive, costly, nondeterministic, or too slow—for example charging a card, sending email, calling external services, or waiting for animations.
- Do not mock merely to shave milliseconds from a test. Excessive mocking converts integration behavior into assumptions and often requires more tests.
- Kent's UI integration practice is to run mostly production code while intercepting network requests and sometimes mocking animation. His current examples use service-level HTTP interception such as MSW.
- E2E should use as few mocks as practical, though test/fake downstream services may still replace real billing or similarly unsafe services.
- A mock-backed test cannot prove compatibility with the real dependency. Preserve some higher-level or contract confidence where that boundary matters.

Sources:

- [The Merits of Mocking](https://kentcdodds.com/blog/the-merits-of-mocking)
- [Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests)
- [Static vs Unit vs Integration vs E2E Testing for Frontend Apps](https://kentcdodds.com/blog/static-vs-unit-vs-integration-vs-e2e-tests)

## Isolation means independence, not repeated UI setup

- Every test should own fresh mutable state and pass when run alone, reordered, skipped, or after another test.
- Do not let one test's component instance, user, mock state, or asynchronous work become another test's precondition.
- Prefer self-contained setup functions/test object factories over shared mutable variables and deeply nested `beforeEach` hooks. This provides both technical and visual isolation.
- Isolation does **not** require replaying every expensive prerequisite through the UI. For E2E tests, create a fresh user through faster HTTP/API setup while retaining one E2E test for the actual registration/login flow.
- Repeating an already-proven UI flow in 99 dependent tests adds cost and flakiness without proportional confidence.

Sources:

- [Test Isolation with React](https://kentcdodds.com/blog/test-isolation-with-react)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-testing-mistakes)
- [Avoid Nesting when you're Testing](https://kentcdodds.com/blog/avoid-nesting-when-youre-testing)
- [AHA Testing](https://kentcdodds.com/blog/aha-testing)

## Useful test shape: workflows over assertion quotas

- Do not split one user workflow into dependent tests merely to obey “one assertion per test.”
- A test can use one arrange phase and as many actions and assertions as needed to establish confidence in that workflow.
- Fewer, longer workflow tests can be more isolated and readable than many tiny tests sharing fixtures and state.
- This is not an instruction to put an entire application in one test. Separate distinct use cases and edge cases when that improves diagnosis and maintenance.
- Tests are also documentation. A workflow-oriented test should explain what the software accomplishes, while mindful abstractions should make relevant input/output differences obvious.
- Avoid both no abstraction and premature/over-generalized abstraction. Extract setup when repetition reveals the right seam, not before.

Sources:

- [Write fewer, longer tests](https://kentcdodds.com/blog/write-fewer-longer-tests) — “Don't arbitrarily separate your assertions into individual test blocks.”
- [Test Isolation with React](https://kentcdodds.com/blog/test-isolation-with-react)
- [AHA Testing](https://kentcdodds.com/blog/aha-testing)
- [Avoid Nesting when you're Testing](https://kentcdodds.com/blog/avoid-nesting-when-youre-testing)

## Common oversimplifications to avoid

- **“Coverage does not matter.”** Incorrect. Coverage is useful for finding unexercised code after critical use cases are identified; the percentage is not the goal.
- **“Never target 100%.”** Too broad. Kent considers it reasonable for small, heavily reused libraries, while rejecting it as a blanket application mandate.
- **“Mostly integration means no unit tests.”** Incorrect. Pure functions and complex business-logic edge cases are strong unit-test candidates.
- **“Mostly integration means no E2E tests.”** Incorrect. Critical happy paths often deserve E2E first; integration fills edge cases economically.
- **“Higher is always better.”** Incorrect. E2E confidence can be wasted on a case that static analysis, a unit test, or an integration test proves more cheaply.
- **“The trophy defines universal categories.”** Incorrect. Kent calls the boundaries fuzzy, scopes his definitions to a codebase, and warns that classification debates can distract from useful tests.
- **“Never mock.”** Incorrect. Mocking is sometimes the only practical and safe option; recognize the confidence surrendered at the boundary.
- **“Isolation means exercising every prerequisite through the UI.”** Incorrect. Isolate data/state, but bypass already-covered setup through APIs.
- **“Never test internals under any circumstances.”** Too absolute. Kent acknowledges exceptional cases where mocking or implementation-detail testing is necessary; the default is to test the user-visible contract.
- **“One assertion per test.”** Not Kent's rule. One coherent workflow per test is closer to his guidance.
- **“Testing Library test equals integration test.”** Incorrect. Classification depends on what is exercised and mocked, not the library used.

## Primary-source index

1. [The Testing Trophy and Testing Classifications](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
2. [Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests)
3. [Static vs Unit vs Integration vs E2E Testing for Frontend Apps](https://kentcdodds.com/blog/static-vs-unit-vs-integration-vs-e2e-tests)
4. [Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details)
5. [How to know what to test](https://kentcdodds.com/blog/how-to-know-what-to-test)
6. [The Merits of Mocking](https://kentcdodds.com/blog/the-merits-of-mocking)
7. [Test Isolation with React](https://kentcdodds.com/blog/test-isolation-with-react)
8. [Write fewer, longer tests](https://kentcdodds.com/blog/write-fewer-longer-tests)
9. [Common Testing Mistakes](https://kentcdodds.com/blog/common-testing-mistakes)
10. [Avoid Nesting when you're Testing](https://kentcdodds.com/blog/avoid-nesting-when-youre-testing)
11. [Avoid the Test User](https://kentcdodds.com/blog/avoid-the-test-user)
12. [Confidently Shipping Code](https://kentcdodds.com/blog/confidently-shipping-code)
13. [AHA Testing](https://kentcdodds.com/blog/aha-testing)

Source count: **13 Kent-authored primary-source articles**.
