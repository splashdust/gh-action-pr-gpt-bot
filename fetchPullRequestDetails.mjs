import { graphql } from "@octokit/graphql";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit();

export const fetchPullRequestDetails = async (
  token,
  owner,
  repo,
  pullRequestNumber
) => {
  const graphqlOctokit = graphql.defaults({
    headers: {
      authorization: `token ${token}`,
    },
  });

  const query = `
    query GetPullRequestDetails($owner: String!, $repo: String!, $pullRequestNumber: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $pullRequestNumber) {
          title
          body
          commits(last: 100) {
            nodes {
              commit {
                oid
                message
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await graphqlOctokit(query, {
      owner,
      repo,
      pullRequestNumber,
    });
    const pullRequest = response.repository.pullRequest;

    const { data: diff } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pullRequestNumber,
      headers: {
        accept: "application/vnd.github.VERSION.diff",
        authorization: `token ${token}`,
      },
    });

    return {
      title: pullRequest.title,
      description: pullRequest.body,
      commits: pullRequest.commits.nodes.map((node) => node.commit),
      diff,
    };
  } catch (error) {
    console.error("Error fetching pull request details:", error);
    return null;
  }
};
