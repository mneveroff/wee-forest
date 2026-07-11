# Issue tracker: Linear

Issues and PRDs for this repository live in the `WeeForest` Linear project. Use the Linear MCP tools for all operations.

## Conventions

- Create or update issues with `save_issue`. New issues must use the `NeverOff Dev` team and be assigned to the `WeeForest` project.
- Read an issue with `get_issue` and its discussion with `list_comments`.
- Find issues with `list_issues`, filtered to the WeeForest project and any relevant state or label.
- Add discussion with `save_comment`.
- Apply or remove labels with `save_issue`. Its `labels` field replaces the complete label set, so preserve unrelated existing labels.
- Move issues between workflow states with `save_issue`; use the triage labels defined in `triage-labels.md` for triage state.

## When a skill says "publish to the issue tracker"

Create a Linear issue in the WeeForest project.

## When a skill says "fetch the relevant ticket"

Use `get_issue`, then `list_comments`, with the supplied Linear issue identifier.
