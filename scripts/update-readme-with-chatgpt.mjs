import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const README_PATH = path.resolve(process.cwd(), 'README.md')
const PACKAGE_JSON_PATH = path.resolve(process.cwd(), 'package.json')
const GITHUB_API_URL = 'https://api.github.com'

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

async function githubRequest({ token, endpoint }) {
  const response = await fetch(`${GITHUB_API_URL}${endpoint}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`GitHub API request failed (${response.status}) for ${endpoint}: ${body}`)
  }

  return response.json()
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

  const prs = await githubRequest({
    token,
    endpoint: `/repos/${repository}/pulls?state=closed&base=main&per_page=100`,
  })

  const latestPr = pickLatestMergedPr(prs)
  if (!latestPr) {
    throw new Error('No merged pull request found for base branch main')
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
    'Rewrite and improve README documentation in clear Markdown.',
    'Keep content practical and concise.',
    'Do not invent commands that are not present in package.json scripts.',
    'Use the merged PR context to reflect latest changes in documentation.',
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
    '- Keep a Getting Started section.',
    '- Include exactly the script commands that exist in package.json.',
    '- Keep Markdown valid and readable.',
    '- Keep links when useful.',
    '- Document changes relevant to the latest merged PR.',
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
  const apiKey = requireEnv('OPENAI_API_KEY')
  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini'
  const dryRun = (process.env.README_UPDATE_DRY_RUN || '').toLowerCase() === 'true'

  const latestMergedPr = await getLatestMergedPrContext()
  const context = await getProjectContext()
  const updated = await generateUpdatedReadme({
    apiKey,
    model,
    context,
    latestMergedPr,
  })

  if (updated.trim() === context.readme.trim()) {
    console.log('README.md already up to date. No changes written.')
    return
  }

  if (dryRun) {
    console.log('README_UPDATE_DRY_RUN=true, generated content preview:')
    console.log(updated)
    return
  }

  await fs.writeFile(README_PATH, updated, 'utf8')
  console.log('README.md updated successfully.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})