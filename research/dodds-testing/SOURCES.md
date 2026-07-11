<!-- markdownlint-disable MD026 MD034 -->

# Kent C. Dodds frontend testing source index

Research-only inventory of Kent C. Dodds's own writing on frontend/UI testing and testing strategy. This is source material, not an agent-skill draft.

## Method and scope

- Discovery used Kent's blog topic list (`testing`), blog search, the site's complete blog list (213 posts), `sitemap.xml`, web search restricted to `kentcdodds.com`, and links/“related reading” sections in the articles themselves.
- Canonical URLs below are the canonical `https://kentcdodds.com/blog/...` pages.
- Dates are the single date visibly displayed by the current page. The pages do not separately label publication and update dates, so this index does not infer an unshown update date.
- **Core** means the article materially defines Kent's durable frontend testing strategy or recommended practice. **Supplementary** means background, a narrower technique, a worked example, historical context, or duplicated guidance.
- Course sales pages, talks, tweets, third-party summaries, and Testing Library documentation were used only as discovery leads and are not counted as articles.

## Core sources

### 1. The Testing Trophy and Testing Classifications

- Canonical URL: https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
- Date shown: June 3, 2021
- Classification: **Core**
- Relevance: Kent's clearest retrospective explanation of the Testing Trophy, defining unit, integration, and E2E relative to a codebase and framing test allocation as confidence returned for time invested.

### 2. Static vs Unit vs Integration vs E2E Testing for Frontend Apps

- Canonical URL: https://kentcdodds.com/blog/static-vs-unit-vs-integration-vs-e2e-tests
- Date shown: June 3, 2021
- Classification: **Core**
- Relevance: The most concrete, code-backed expression of the Trophy for frontend apps, including what to mock at each level and why integration tests usually offer the best trade-off.

### 3. Write tests. Not too many. Mostly integration.

- Canonical URL: https://kentcdodds.com/blog/write-tests
- Date shown: July 13, 2019
- Classification: **Core**
- Relevance: Establishes the “mostly integration” strategy, warns against 100% coverage as a goal, and argues that reducing mocks increases confidence in collaborations.

### 4. How to know what to test

- Canonical URL: https://kentcdodds.com/blog/how-to-know-what-to-test
- Date shown: April 13, 2019
- Classification: **Core**
- Relevance: Converts the confidence goal into a prioritization method: identify valuable use cases, begin with a critical happy-path E2E test, then cover edge cases with integration and focused unit tests.

### 5. Testing Implementation Details

- Canonical URL: https://kentcdodds.com/blog/testing-implementation-details
- Date shown: August 17, 2020
- Classification: **Core**
- Relevance: Defines implementation details through false positives and false negatives and demonstrates why tests should interact only through developer-facing inputs and user-observable output.

### 6. Avoid the Test User

- Canonical URL: https://kentcdodds.com/blog/avoid-the-test-user
- Date shown: May 24, 2019
- Classification: **Core**
- Relevance: Supplies the conceptual model behind implementation-detail-free tests: UI code has developer and end users, and tests should not create a third artificial consumer.

### 7. Making your UI tests resilient to change

- Canonical URL: https://kentcdodds.com/blog/making-your-ui-tests-resilient-to-change
- Date shown: October 7, 2019
- Classification: **Core**
- Relevance: Connects resilient UI tests to user-facing selectors, preferring role/label/text queries and treating `data-testid` as a legitimate fallback rather than a first choice.

### 8. Common mistakes with React Testing Library

- Canonical URL: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
- Date shown: May 4, 2020
- Classification: **Core**
- Relevance: The practical checklist for modern Testing Library usage: `screen`, role-first querying, `user-event`, appropriate `get`/`query`/`find` semantics, restrained `waitFor`, and no redundant `act` or cleanup.

### 9. Stop mocking fetch

- Canonical URL: https://kentcdodds.com/blog/stop-mocking-fetch
- Date shown: June 3, 2020
- Classification: **Core**
- Relevance: Replaces mocked `fetch` functions or API-client modules with request-level interception via MSW so tests exercise production networking code while retaining speed, isolation, and controllable responses.

### 10. Test Isolation with React

- Canonical URL: https://kentcdodds.com/blog/test-isolation-with-react
- Date shown: July 2, 2018
- Classification: **Core**
- Relevance: Shows why every test needs independent rendered state and teardown, avoiding order dependence and preserving single-test debugging and refactoring.

### 11. Write fewer, longer tests

- Canonical URL: https://kentcdodds.com/blog/write-fewer-longer-tests
- Date shown: August 26, 2019
- Classification: **Core**
- Relevance: Argues for one arrange phase followed by as many actions and assertions as a user workflow requires, rather than fragmenting behavior into dependent micro-tests.

### 12. Avoid Nesting when you're Testing

- Canonical URL: https://kentcdodds.com/blog/avoid-nesting-when-youre-testing
- Date shown: July 29, 2019
- Classification: **Core**
- Relevance: Explains how nested `describe`/`beforeEach` structures and shared mutable variables hide setup and increase maintenance cost, favoring explicit isolated tests and small helpers.

### 13. Common Testing Mistakes

- Canonical URL: https://kentcdodds.com/blog/common-testing-mistakes
- Date shown: November 12, 2018
- Classification: **Core**
- Relevance: Consolidates three strategic failure modes—implementation-detail tests, 100% coverage targets, and repeated E2E setup—while preserving isolated users through direct API setup.

### 14. How to add testing to an existing project

- Canonical URL: https://kentcdodds.com/blog/how-to-add-testing-to-an-existing-project
- Date shown: October 28, 2019
- Classification: **Core**
- Relevance: Gives an incremental adoption path: static tools, one important E2E flow, one simple unit test to establish tooling, then broader tests and team education.

### 15. When I follow TDD

- Canonical URL: https://kentcdodds.com/blog/when-i-follow-tdd
- Date shown: June 29, 2020
- Classification: **Core**
- Relevance: Treats TDD as situational—especially useful for bug reproduction, pure functions, and well-defined UIs—but a poor fit while product shape remains exploratory.

### 16. Why I Never Use Shallow Rendering

- Canonical URL: https://kentcdodds.com/blog/why-i-never-use-shallow-rendering
- Date shown: July 23, 2018
- Classification: **Core**
- Relevance: Makes the confidence case against Enzyme shallow rendering: it exposes implementation structure, can fail on refactors, and can pass while real user behavior is broken.

### 17. UI Testing Myths

- Canonical URL: https://kentcdodds.com/blog/ui-testing-myths
- Date shown: November 8, 2018
- Classification: **Core**
- Relevance: Rebuts claims that UI tests are inherently brittle or E2E tests inherently unusable, attributing those problems to implementation-detail selectors and repeated journeys such as login in every test.

## Supplementary sources

### 18. The Merits of Mocking

- Canonical URL: https://kentcdodds.com/blog/the-merits-of-mocking
- Date shown: November 5, 2018
- Classification: **Supplementary**
- Relevance: Explains the confidence cost of replacing real collaborators and gives Kent's then-current boundary: mock network and animation in UI tests, but minimize mocks elsewhere and in E2E.

### 19. Make Your Test Fail

- Canonical URL: https://kentcdodds.com/blog/make-your-test-fail
- Date shown: February 24, 2020
- Classification: **Supplementary**
- Relevance: Recommends deliberately breaking the targeted behavior to prove that a passing test is causally connected to the requirement rather than passing for an accidental reason.

### 20. Fix the "not wrapped in act(...)" warning

- Canonical URL: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning
- Date shown: February 3, 2020
- Classification: **Supplementary**
- Relevance: Treats React's `act` warning as evidence of an unobserved update and recommends waiting for visible async outcomes through Testing Library before reaching for manual `act`.

### 21. How to test custom React hooks

- Canonical URL: https://kentcdodds.com/blog/how-to-test-custom-react-hooks
- Date shown: March 22, 2020
- Classification: **Supplementary**
- Relevance: Prefers testing a hook through realistic component use, while reserving `renderHook` for generic or sufficiently complex hooks where a dedicated harness improves clarity.

### 22. AHA Testing 💡

- Canonical URL: https://kentcdodds.com/blog/aha-testing
- Date shown: April 7, 2019
- Classification: **Supplementary**
- Relevance: Applies “Avoid Hasty Abstraction” to test code, tolerating useful duplication until repeated setup or nuanced cases justify a focused test object factory.

### 23. Should I write a test or fix a bug?

- Canonical URL: https://kentcdodds.com/blog/should-i-write-a-test-or-fix-a-bug
- Date shown: June 15, 2020
- Classification: **Supplementary**
- Relevance: Frames tests as one investment among competing product priorities and recommends comparing present and delayed costs rather than applying an absolute “always test” rule.

### 24. Effective Snapshot Testing

- Canonical URL: https://kentcdodds.com/blog/effective-snapshot-testing
- Date shown: October 30, 2017
- Classification: **Supplementary**
- Relevance: Allows snapshots where output is reviewable and stable, but warns that large snapshots are rarely examined and should be reduced with focused cases, inline snapshots, or serializers.

### 25. Introducing the react-testing-library 🐐

- Canonical URL: https://kentcdodds.com/blog/introducing-the-react-testing-library
- Date shown: April 2, 2018
- Classification: **Supplementary**
- Relevance: Historical primary source for Testing Library's design: return real DOM nodes, query as users do, and intentionally omit APIs that encourage tests of component internals.

### 26. React Hooks: What's going to happen to my tests?

- Canonical URL: https://kentcdodds.com/blog/react-hooks-whats-going-to-happen-to-my-tests
- Date shown: December 24, 2018
- Classification: **Supplementary**
- Relevance: Uses the class-to-hooks transition as a refactoring test: behavior-focused tests survive, while tests coupled to instances, state, or Enzyme APIs require replacement.

### 27. 5 Tips to Help You Avoid React Hooks Pitfalls

- Canonical URL: https://kentcdodds.com/blog/react-hooks-pitfalls
- Date shown: August 5, 2019
- Classification: **Supplementary**
- Relevance: Its testing section reinforces that class-versus-hook implementation should be invisible to a test that drives rendered behavior.

### 28. Testing ⚛️ components using render props

- Canonical URL: https://kentcdodds.com/blog/testing-components-using-render-props
- Date shown: January 8, 2018
- Classification: **Supplementary**
- Relevance: A legacy-pattern worked example whose durable advice is to test the render-prop primitive thoroughly and test consuming components at a higher integration level.

### 29. React is an implementation detail

- Canonical URL: https://kentcdodds.com/blog/react-is-an-implementation-detail
- Date shown: October 20, 2018
- Classification: **Supplementary**
- Relevance: Generalizes DOM Testing Library's behavior-first approach beyond React, arguing that framework choice itself should usually be invisible to UI tests.

### 30. But really, what is a JavaScript test?

- Canonical URL: https://kentcdodds.com/blog/but-really-what-is-a-javascript-test
- Date shown: January 1, 2018
- Classification: **Supplementary**
- Relevance: Builds a minimal test and assertion framework from first principles, useful background for understanding what runners and assertion libraries automate.

### 31. But really, what is a JavaScript mock?

- Canonical URL: https://kentcdodds.com/blog/but-really-what-is-a-javascript-mock
- Date shown: March 19, 2018
- Classification: **Supplementary**
- Relevance: Explains mocks as controlled module replacement and call observation, providing mechanics that contextualize the later strategic advice to mock less and at better boundaries.

### 32. Demystifying Testing

- Canonical URL: https://kentcdodds.com/blog/demystifying-testing
- Date shown: October 11, 2018
- Classification: **Supplementary**
- Relevance: Reduces testing abstractions to plain JavaScript functions and failures so beginners can reason about runners, assertions, and test classifications without tool mystique.

### 33. Why you've been bad about testing

- Canonical URL: https://kentcdodds.com/blog/why-youve-been-bad-about-testing
- Date shown: October 15, 2018
- Classification: **Supplementary**
- Relevance: Gives a manual-to-automated workflow for critical untested behavior: choose risky code, identify its users, list manual verification steps, then automate them.

### 34. Confidently Shipping Code

- Canonical URL: https://kentcdodds.com/blog/confidently-shipping-code
- Date shown: October 8, 2018
- Classification: **Supplementary**
- Relevance: States Kent's underlying motivation for tests as durable, automated confidence that lets future maintainers change code without reconstructing all prior context.

### 35. The time I messed up

- Canonical URL: https://kentcdodds.com/blog/the-time-i-messed-up
- Date shown: October 22, 2018
- Classification: **Supplementary**
- Relevance: A TDD cautionary example showing that red-green without the refactor step can rapidly produce tested but unmaintainable code.

### 36. Improve test error messages of your abstractions

- Canonical URL: https://kentcdodds.com/blog/improve-test-error-messages-of-your-abstractions
- Date shown: May 18, 2020
- Classification: **Supplementary**
- Relevance: Shows how test helpers can preserve useful call-site stack traces, relevant when thoughtful abstractions otherwise obscure failure locations.

### 37. How I built a modern website in 2021

- Canonical URL: https://kentcdodds.com/blog/how-i-built-a-modern-website-in-2021
- Date shown: September 29, 2021
- Classification: **Supplementary**
- Relevance: Provides operational evidence of Kent's strategy in a real application: Testing Library and Jest for components, Cypress for E2E, MSW for external HTTP, and parallelized CI.

## Duplication, evolution, and superseded details

### Durable ideas repeated across sources

- **Confidence over test count or coverage:** introduced in *Confidently Shipping Code*, made actionable in *Write tests*, *How to know what to test*, and the two 2021 Trophy articles.
- **Resemble real use:** the guiding principle recurs in *Avoid the Test User*, *Testing Implementation Details*, *Making your UI tests resilient to change*, and Testing Library-specific posts.
- **Integration-heavy, minimal mocking:** *Write tests* gives the strategy; *Static vs Unit vs Integration vs E2E* supplies examples; *The Testing Trophy and Testing Classifications* clarifies terminology.
- **Isolation without repeated journeys:** *Test Isolation with React* addresses state isolation, while *Common Testing Mistakes* and *UI Testing Myths* explain why isolated E2E users do not require replaying registration/login through the UI in every test.
- **Readable, maintainable test code:** *Avoid Nesting*, *Write fewer, longer tests*, and *AHA Testing* are complementary treatments of the same maintainability problem.

### Prefer these later or more specific sources

- Prefer the two June 2021 articles over the older *Write tests* when exact test classifications or Trophy scope matter; the older article remains the concise source of the “mostly integration” thesis.
- Prefer *Common mistakes with React Testing Library* over API examples in *Introducing the react-testing-library*: later recommendations include `screen`, role-first queries, `user-event`, auto-cleanup, and modern async-query semantics.
- Prefer *Stop mocking fetch* over *The Merits of Mocking* for network boundaries. The 2018 article says Kent mocked the module responsible for network calls; the 2020 article explicitly replaces that with MSW request interception.
- Prefer *How to test custom React hooks* over hook-testing snippets in *React Hooks: What's going to happen to my tests?*; the dedicated article reflects the later `renderHook` path and more clearly prioritizes real-world component use.
- Prefer *Testing Implementation Details* as the canonical explanation; *Avoid the Test User*, *React is an implementation detail*, *React Hooks: What's going to happen to my tests?*, and the hook-pitfalls section largely restate or apply it.
- Prefer *Common Testing Mistakes* for the consolidated strategic warning; *UI Testing Myths* is a shorter promotional-era restatement with less detailed evidence.

### Historically useful but technically dated

- Enzyme, shallow rendering, class component instances, lifecycle APIs, render props, Flow, older Jest setup, and early `react-testing-library` import/API examples are historical context, not current setup guidance.
- `userEvent.click(...)` and similar calls are synchronous in several older snippets; current `@testing-library/user-event` usage commonly creates a user with `userEvent.setup()` and awaits interactions. The durable advice is to model user behavior, not copy old syntax.
- MSW examples use the older `rest` API and older setup syntax. Preserve the request-level interception principle, but consult current MSW documentation for code.
- Cypress is Kent's E2E tool in these sources, but the strategic advice—few critical full-stack journeys, minimal mocking, and fast API-level setup for prerequisites—is tool-independent.
- The site exposes one visible article date and does not label a separate “updated” date; code samples may therefore be older than the current ecosystem even when the prose remains sound.

## Coverage notes

- Indexed articles: **37** (17 core, 20 supplementary).
- The blog's testing topic and search are useful discovery surfaces but do not alone capture every relevant post; linked articles and the complete blog list surfaced adjacent items such as the Hooks, render-props, snapshot, and real-site implementation posts.
- Deliberately excluded from the count: *Why your team needs TestingJavaScript.com* (primarily a purchase-justification letter), broad course announcements, talks, podcasts, and articles with only incidental mentions of tests.
