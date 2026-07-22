import { useCallback, useEffect, useState } from 'react'

export type StarsState =
  | { status: 'loading'; stars: number; fromSnapshot: true }
  | { status: 'ready'; stars: number; fromSnapshot: boolean }
  | { status: 'error'; stars: number; fromSnapshot: true; message: string }

async function fetchRepoStars(repo: string): Promise<number> {
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

export function useGitHubStars(repo: string, snapshot: number) {
  const [state, setState] = useState<StarsState>({
    status: 'loading',
    stars: snapshot,
    fromSnapshot: true,
  })
  const [nonce, setNonce] = useState(0)

  const retry = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading', stars: snapshot, fromSnapshot: true })

    fetchRepoStars(repo)
      .then((stars) => {
        if (!cancelled) {
          setState({ status: 'ready', stars, fromSnapshot: false })
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            status: 'error',
            stars: snapshot,
            fromSnapshot: true,
            message: err instanceof Error ? err.message : '获取失败',
          })
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
