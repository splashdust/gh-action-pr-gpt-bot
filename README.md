# GitHub PR GPT-Bot Action

This GitHub action generates a summary for pull requests using the OpenAI API. It uses the `text-davinci-003` model to create a concise summary of the changes in a pull request and posts it as a comment on the pull request.

## Usage

Add the following to your workflow configuration file in `.github/workflows` (e.g., `pull_request_summary.yml`):

```yaml
name: Pull Request Summary

on:
  pull_request:
    types:
      - opened

jobs:
  generate_summary:
    runs-on: ubuntu-latest

    steps:
      - name: Check out repository
        uses: actions/checkout@v2

      - name: Generate pull request summary
        uses: splashdust/gh-action-pr-gpt-bot@1.0.0-beta.4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          openaiApiKey: ${{ secrets.OPENAI_API_KEY }}
          openaiOrgID: ${{ secrets.OPENAI_ORG_ID }}
```

### Inputs

| Name           | Description            | Required |
| -------------- | ---------------------- | -------- |
| `token`        | GitHub token           | Yes      |
| `openaiApiKey` | OpenAI API key         | Yes      |
| `openaiOrgId`  | OpenAI Organization ID | Yes      |

### Secrets

The action requires the following secrets:

- `OPENAI_API_KEY`: Your OpenAI API key. You can obtain one by signing up for an API key at [https://beta.openai.com/signup](https://beta.openai.com/signup).

- `OPENAI_ORG_ID`: Your OpenAI Organization ID.

## Contributing

If you would like to contribute to this project, please feel free to open an issue or create a pull request.
