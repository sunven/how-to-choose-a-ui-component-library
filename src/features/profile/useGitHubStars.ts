import { useCallback, useEffect, useState } from 'react'

export type StarsState =
  | { status: 'loading'; stars: number }
  | { status: 'ready'; stars: number }
  | { status: 'error'; stars: number }

/** One request per repo per session; retries clear failed entries. */
const starRequests = new Map<string, Promise<number>>()

async function requestRepoStars(repo: string): Promise<number> {
  const res = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  })
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}`)
  }
  const data = (await res.json()) as { stargazers_count?: number }
  if (typeof data.stargazers_count !== 'number') {
    throw new Error('Missing stargazers_count')
  }
  return data.stargazers_count
}

function fetchRepoStars(repo: string): Promise<number> {
  const cached = starRequests.get(repo)
  if (cached) return cached

  const request = requestRepoStars(repo).catch((reason: unknown) => {
    starRequests.delete(repo)
    throw reason
  })
  starRequests.set(repo, request)
  return request
}

export function useGitHubStars(repo: string, snapshot: number) {
  const [state, setState] = useState<StarsState>({
    status: 'loading',
    stars: snapshot,
  })
  const [nonce, setNonce] = useState(0)

  const retry = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading', stars: snapshot })

    fetchRepoStars(repo)
      .then((stars) => {
        if (!cancelled) {
          setState({ status: 'ready', stars })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: 'error', stars: snapshot })
        }
      })

    return () => {
      cancelled = true
    }
  }, [repo, snapshot, nonce])

  return { state, retry }
}

export function formatStars(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}k`
  }
  return String(n)
}
