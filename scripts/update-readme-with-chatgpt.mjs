import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const README_PATH = path.resolve(process.cwd(), 'README.md')
const PACKAGE_JSON_PATH = path.resolve(process.cwd(), 'package.json')
const GITHUB_API_URL = 'https://api.github.com'
const README_REPOSITORY_PATH = 'README.md'
const DEFAULT_BASE_BRANCH = 'main'
const DEFAULT_UPDATE_BRANCH_PREFIX = 'docs-readme-update'

class GitHubApiError extends Error {
  constructor({ status, endpoint, responseText }) {
    super(`GitHub API request failed (${status}) for ${endpoint}: ${responseText}`)
    this.name = 'GitHubApiError'
    this.status = status
    this.endpoint = endpoint
    this.responseText = responseText
  }
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

async function githubRequest({ token, endpoint, method = 'GET', body, allowNotFound = false }) {
  const response = await fetch(`${GITHUB_API_URL}${endpoint}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (allowNotFound && response.status === 404) {
    return null
  }

  const responseText = await response.text()

  if (!response.ok) {
    throw new GitHubApiError({
      status: response.status,
      endpoint,
      responseText,
    })
  }

  if (!responseText) {
    return null
  }

  return JSON.parse(responseText)
}

function getBaseBranch() {
  return process.env.README_UPDATE_BASE_BRANCH || process.env.GITHUB_BASE_BRANCH || DEFAULT_BASE_BRANCH
}

function parseGitHubErrorBody(responseText) {
  try {
    return JSON.parse(responseText)
  } catch {
    return null
  }
}

function isPullRequestPermissionError(error) {
  if (!(error instanceof GitHubApiError)) {
    return false
  }

  if (error.status !== 403 || !error.endpoint.endsWith('/pulls')) {
    return false
  }

  const body = parseGitHubErrorBody(error.responseText)

  if (typeof body?.message !== 'string') {
    return true
  }

  return [
    'Resource not accessible by integration',
    'GitHub Actions is not permitted to create or approve pull requests.',
  ].includes(body.message)
}

function buildCompareUrl({ repository, baseBranch, branchName }) {
  return `https://github.com/${repository}/compare/${encodeURIComponent(baseBranch)}...${encodeURIComponent(branchName)}?expand=1`
}

function normalizeText(value) {
  return value.trim()
}

function sanitizeBranchSegment(value) {
  const sanitized = value.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')
  return sanitized || DEFAULT_UPDATE_BRANCH_PREFIX
}

function buildDocsUpdateBranchName(latestMergedPr) {
  const prefix = sanitizeBranchSegment(
    process.env.README_UPDATE_BRANCH_PREFIX || DEFAULT_UPDATE_BRANCH_PREFIX,
  )

  return `${prefix}-pr-${latestMergedPr.number}`
}

function encodeFileContent(content) {
  return Buffer.from(content, 'utf8').toString('base64')
}

function decodeFileContent(content) {
  return Buffer.from(content.replace(/\n/g, ''), 'base64').toString('utf8')
}

function buildPullRequestTitle(latestMergedPr) {
  return `docs: update README for #${latestMergedPr.number}`
}

function buildPullRequestBody(latestMergedPr) {
  return [
    'Automated README update generated from the latest merged pull request.',
    '',
    `Source PR: #${latestMergedPr.number} - ${latestMergedPr.title}`,
    `Merged at: ${latestMergedPr.mergedAt}`,
    `Author: @${latestMergedPr.author}`,
    `Source URL: ${latestMergedPr.url}`,
    '',
    'Review the generated README content before merging.',
  ].join('\n')
}

async function getReadmeFileAtRef({ token, repository, ref }) {
  const file = await githubRequest({
    token,
    endpoint: `/repos/${repository}/contents/${README_REPOSITORY_PATH}?ref=${encodeURIComponent(ref)}`,
  })

  return {
    sha: file.sha,
    content: decodeFileContent(file.content),
  }
}

async function ensureBranchExists({ token, repository, baseBranch, branchName }) {
  const existingRef = await githubRequest({
    token,
    endpoint: `/repos/${repository}/git/ref/heads/${branchName}`,
    allowNotFound: true,
  })

  if (existingRef) {
    return existingRef
  }

  const baseRef = await githubRequest({
    token,
    endpoint: `/repos/${repository}/git/ref/heads/${baseBranch}`,
  })

  return githubRequest({
    token,
    endpoint: `/repos/${repository}/git/refs`,
    method: 'POST',
    body: {
      ref: `refs/heads/${branchName}`,
      sha: baseRef.object.sha,
    },
  })
}

async function findOpenReadmePullRequest({ token, repository, baseBranch, branchName }) {
  const [owner] = repository.split('/')
  const pullRequests = await githubRequest({
    token,
    endpoint:
      `/repos/${repository}/pulls?state=open&base=${encodeURIComponent(baseBranch)}` +
      `&head=${encodeURIComponent(`${owner}:${branchName}`)}&per_page=100`,
  })

  return Array.isArray(pullRequests) ? pullRequests[0] ?? null : null
}

async function updateReadmeOnBranch({ token, repository, branchName, content, latestMergedPr }) {
  const existingReadme = await getReadmeFileAtRef({
    token,
    repository,
    ref: branchName,
  })

  if (normalizeText(existingReadme.content) === normalizeText(content)) {
    return { updated: false }
  }

  await githubRequest({
    token,
    endpoint: `/repos/${repository}/contents/${README_REPOSITORY_PATH}`,
    method: 'PUT',
    body: {
      message: `docs: refresh README for #${latestMergedPr.number}`,
      content: encodeFileContent(content),
      branch: branchName,
      sha: existingReadme.sha,
    },
  })

  return { updated: true }
}

async function createReadmePullRequest({ token, repository, baseBranch, branchName, latestMergedPr }) {
  return githubRequest({
    token,
    endpoint: `/repos/${repository}/pulls`,
    method: 'POST',
    body: {
      title: buildPullRequestTitle(latestMergedPr),
      body: buildPullRequestBody(latestMergedPr),
      head: branchName,
      base: baseBranch,
    },
  })
}

async function createReadmePullRequestWithFallback({
  token,
  repository,
  baseBranch,
  branchName,
  latestMergedPr,
}) {
  try {
    const pullRequest = await createReadmePullRequest({
      token,
      repository,
      baseBranch,
      branchName,
      latestMergedPr,
    })

    return {
      created: true,
      pullRequest,
    }
  } catch (error) {
    if (!isPullRequestPermissionError(error)) {
      throw error
    }

    return {
      created: false,
      compareUrl: buildCompareUrl({ repository, baseBranch, branchName }),
      reason:
        'GitHub can update repository contents but cannot open pull requests with the current token or Actions policy. Review the branch manually using the compare URL.',
    }
  }
}

function pickLatestMergedPr(pullRequests) {
  if (!Array.isArray(pullRequests)) return null

  const merged = pullRequests.filter((pr) => Boolean(pr?.merged_at))
  if (merged.length === 0) return null

  merged.sort((a, b) => {
    const aTime = new Date(a.merged_at).getTime()
    const bTime = new Date(b.merged_at).getTime()
    return bTime - aTime
  })

  return merged[0]
}

async function getLatestMergedPrContext() {
  const token = requireEnv('GITHUB_TOKEN')
  const repository = requireEnv('GITHUB_REPOSITORY')
  const baseBranch = getBaseBranch()

  const prs = await githubRequest({
    token,
    endpoint: `/repos/${repository}/pulls?state=closed&base=${encodeURIComponent(baseBranch)}&per_page=100`,
  })

  const latestPr = pickLatestMergedPr(prs)
  if (!latestPr) {
    throw new Error(`No merged pull request found for base branch ${baseBranch}`)
  }

  const files = await githubRequest({
    token,
    endpoint: `/repos/${repository}/pulls/${latestPr.number}/files?per_page=100`,
  })

  const changedFiles = Array.isArray(files)
    ? files.map((file) => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
      }))
    : []

  return {
    number: latestPr.number,
    title: latestPr.title,
    body: latestPr.body ?? '',
    mergedAt: latestPr.merged_at,
    author: latestPr.user?.login ?? 'unknown',
    url: latestPr.html_url,
    changedFiles,
  }
}

async function getProjectContext() {
  const [readme, packageJsonRaw] = await Promise.all([
    fs.readFile(README_PATH, 'utf8'),
    fs.readFile(PACKAGE_JSON_PATH, 'utf8'),
  ])

  let packageJson = {}
  try {
    packageJson = JSON.parse(packageJsonRaw)
  } catch {
    packageJson = {}
  }

  return {
    readme,
    packageName: packageJson.name ?? 'project',
    scripts: packageJson.scripts ?? {},
    dependencies: packageJson.dependencies ?? {},
    devDependencies: packageJson.devDependencies ?? {},
  }
}

function extractTextFromResponsesApi(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim().length > 0) {
    return data.output_text.trim()
  }

  if (Array.isArray(data?.output)) {
    const chunks = []
    for (const item of data.output) {
      if (!Array.isArray(item?.content)) continue
      for (const contentItem of item.content) {
        if (contentItem?.type === 'output_text' && typeof contentItem.text === 'string') {
          chunks.push(contentItem.text)
        }
      }
    }

    const joined = chunks.join('\n').trim()
    if (joined.length > 0) return joined
  }

  return ''
}

async function generateUpdatedReadme({ apiKey, model, context, latestMergedPr }) {
  const systemPrompt = [
    'You are a technical writer for a JavaScript repository.',
    'Update the existing README documentation in clear Markdown.',
    'Keep content practical and concise.',
    'Do not invent commands that are not present in package.json scripts.',
    'Use the merged PR context to reflect latest changes in documentation.',
    'Preserve the existing README structure and content unless a targeted update is required.',
    'In the Latest Update section, keep existing PR entries instead of replacing them wholesale.',
    'Add a new subsection for the latest merged PR, placing it before older entries.',
    'If the latest merged PR clearly replaces or updates a feature that is already documented in an existing subsection, update that matching subsection instead of adding a duplicate one.',
    'Limit edits to the relevant section and any directly affected references elsewhere in the README.',
    'Output only the final Markdown for README.md with no extra commentary.',
  ].join(' ')

  const userPrompt = [
    'Update README.md based on this repository data.',
    `Project name: ${context.packageName}`,
    `Available scripts: ${JSON.stringify(context.scripts)}`,
    `Dependencies: ${JSON.stringify(context.dependencies)}`,
    `Dev dependencies: ${JSON.stringify(context.devDependencies)}`,
    `Latest merged PR number: #${latestMergedPr.number}`,
    `Latest merged PR title: ${latestMergedPr.title}`,
    `Latest merged PR mergedAt: ${latestMergedPr.mergedAt}`,
    `Latest merged PR author: ${latestMergedPr.author}`,
    `Latest merged PR url: ${latestMergedPr.url}`,
    'Latest merged PR description follows between markers.',
    '---PR_BODY_START---',
    latestMergedPr.body,
    '---PR_BODY_END---',
    `Latest merged PR changed files summary: ${JSON.stringify(latestMergedPr.changedFiles)}`,
    'Current README content follows between markers.',
    '---README_START---',
    context.readme,
    '---README_END---',
    'Requirements:',
    '- Preserve the existing README content and structure unless a specific part needs to change.',
    '- Keep a Getting Started section.',
    '- Include exactly the script commands that exist in package.json.',
    '- Keep Markdown valid and readable.',
    '- Keep links when useful.',
    '- Document changes relevant to the latest merged PR.',
    '- In the Latest Update section, keep older PR subsections and add the newest one first.',
    '- If the latest merged PR replaces or updates an already documented feature, update that existing subsection instead of creating a second subsection for the same feature.',
  ].join('\n')

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: systemPrompt }],
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: userPrompt }],
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`OpenAI API request failed (${response.status}): ${errorBody}`)
  }

  const data = await response.json()
  const markdown = extractTextFromResponsesApi(data)

  if (!markdown) {
    throw new Error('OpenAI API response did not contain Markdown text')
  }

  return markdown.endsWith('\n') ? markdown : `${markdown}\n`
}

async function main() {
  const token = requireEnv('GITHUB_TOKEN')
  const repository = requireEnv('GITHUB_REPOSITORY')
  const apiKey = requireEnv('OPENAI_API_KEY')
  const model = process.env.OPENAI_MODEL || 'gpt-5.4'
  const dryRun = (process.env.README_UPDATE_DRY_RUN || '').toLowerCase() === 'true'
  const baseBranch = getBaseBranch()

  const latestMergedPr = await getLatestMergedPrContext()
  const context = await getProjectContext()
  const updated = await generateUpdatedReadme({
    apiKey,
    model,
    context,
    latestMergedPr,
  })

  const branchName = buildDocsUpdateBranchName(latestMergedPr)
  const baseReadme = await getReadmeFileAtRef({
    token,
    repository,
    ref: baseBranch,
  })
  const existingPullRequest = await findOpenReadmePullRequest({
    token,
    repository,
    baseBranch,
    branchName,
  })

  if (normalizeText(updated) === normalizeText(baseReadme.content)) {
    console.log(`Generated README already matches ${baseBranch}. No pull request created.`)

    if (existingPullRequest) {
      console.log(`Existing pull request may no longer have a diff: ${existingPullRequest.html_url}`)
    }

    return
  }

  if (dryRun) {
    console.log('README_UPDATE_DRY_RUN=true, generated content preview:')
    console.log(updated)
    console.log(`Would push branch: ${branchName}`)
    console.log(`Would target base branch: ${baseBranch}`)
    return
  }

  await ensureBranchExists({
    token,
    repository,
    baseBranch,
    branchName,
  })

  const readmeUpdate = await updateReadmeOnBranch({
    token,
    repository,
    branchName,
    content: updated,
    latestMergedPr,
  })

  if (!readmeUpdate.updated && !existingPullRequest) {
    const pullRequestResult = await createReadmePullRequestWithFallback({
      token,
      repository,
      baseBranch,
      branchName,
      latestMergedPr,
    })

    console.log(`README.md was already up to date on branch ${branchName}.`)

    if (pullRequestResult.created) {
      console.log(`Created pull request for review: ${pullRequestResult.pullRequest.html_url}`)
    } else {
      console.log(pullRequestResult.reason)
      console.log(`Open this compare view to create the PR manually: ${pullRequestResult.compareUrl}`)
    }

    return
  }

  if (existingPullRequest) {
    if (readmeUpdate.updated) {
      console.log(`Updated README.md on branch ${branchName}.`)
    } else {
      console.log(`README.md already matched branch ${branchName}.`)
    }

    console.log(`Updated existing pull request for review: ${existingPullRequest.html_url}`)
    return
  }

  const pullRequestResult = await createReadmePullRequestWithFallback({
    token,
    repository,
    baseBranch,
    branchName,
    latestMergedPr,
  })

  if (readmeUpdate.updated) {
    console.log(`Updated README.md on branch ${branchName}.`)
  }

  if (pullRequestResult.created) {
    console.log(`Created pull request for review: ${pullRequestResult.pullRequest.html_url}`)
    return
  }

  console.log(pullRequestResult.reason)
  console.log(`Open this compare view to create the PR manually: ${pullRequestResult.compareUrl}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})