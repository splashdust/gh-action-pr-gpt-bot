import { Configuration, OpenAIApi } from "openai";
import { Octokit } from "@octokit/rest";

import { fetchPullRequestDetails } from "./fetchPullRequestDetails.mjs";

const oaConfig = new Configuration({
  organization: process.env.OPENAI_ORG_ID,
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(oaConfig);

const token = process.env.GITHUB_TOKEN;
const {
  repository_owner: owner,
  event: {
    number: pullRequestNumber,
    pull_request: {
      base: {
        repo: { name: repoName },
      },
    },
  },
} = JSON.parse(process.env.GITHUB_CONTEXT);

(async () => {
  const pullRequestDetails = await fetchPullRequestDetails(
    token,
    owner,
    repoName,
    pullRequestNumber
  );

  if (pullRequestDetails) {
    const prompt = createPrompt(pullRequestDetails);
    const summary = await generateSummary(prompt);

    console.log("Summary:", summary);

    createPullRequestComment(
      token,
      owner,
      repoName,
      pullRequestNumber,
      `Hey there, thank you for opening a pull request! I've created a short summary of what I think this PR changes:\n\n${summary}`
    );
  }
})();

/**
 * Call OpenAI API to generate a summary
 * @param {*} prompt
 * @returns A summary of the pull request based on the provided prompt
 */
async function generateSummary(prompt) {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 700, // Adjust the number of tokens based on the desired length of the summary
      n: 1,
      stop: null,
      temperature: 0.7,
    });

    const summary = response.data.choices[0].text;
    return summary;
  } catch (error) {
    console.error("Error generating summary:", error.response.data);
    return null;
  }
}

/**
 * Summarizes the given diff by keeping only lines that start with "@@", "+" (excluding "++"), or "-" (excluding "--").
 * By keeping only lines that start with "@@", "+", or "-", the summarized diff retains information about the changes
 * in the actual content of the files, such as additions, deletions, and context lines around the changes.
 *
 * @param {string} diff - The raw diff string to summarize.
 * @returns {string} The summarized diff as a string.
 */
function summarizeDiff(diff) {
  const lines = diff.split("\n");
  const summaryLines = lines.filter((line) => {
    return (
      line.startsWith("@@") ||
      (line.startsWith("+") && !line.startsWith("++")) ||
      (line.startsWith("-") && !line.startsWith("--"))
    );
  });

  return summaryLines.join("\n");
}

/**
 * Creates a prompt for the OpenAI API based on the given pull request details.
 * @param {*} pullRequestDetails - The details of the pull request to create a prompt for.
 * @returns {string} The prompt for the OpenAI API.
 */
function createPrompt(pullRequestDetails) {
  const { title, description, commits, diff } = pullRequestDetails;

  const summarizedDiff = summarizeDiff(diff);
  const commitMessages = commits.map((commit) => commit.message).join("\n");
  const prompt = `Please summarize the changes in the following pull request. Base the summary on the provided diff and title.\n\nTitle: ${title}\nDiff:\n${summarizedDiff}\n`;

  return prompt;
}

/**
 * Adds a comment to the pull request with the given summary.
 * @param {*} token - The GitHub token to use for the API call.
 * @param {*} owner - The owner of the repository.
 * @param {*} repo - The name of the repository.
 * @param {*} pullRequestNumber - The number of the pull request.
 * @param {*} body - The summary to add as a comment to the pull request.
 * @returns
 */
async function createPullRequestComment(
  token,
  owner,
  repo,
  pullRequestNumber,
  body
) {
  const octokit = new Octokit({ auth: token });

  try {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pullRequestNumber,
      body,
    });
  } catch (error) {
    console.error("Error creating pull request comment:", error);
  }
}
