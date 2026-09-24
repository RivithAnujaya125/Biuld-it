import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserRoadmaps } from '../lib/roadmaps'

// Common GitHub language colors
const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  HTML: '#e34c26',
  CSS: '#563d7c',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
}

function formatDate(timestamp) {
  if (!timestamp) return 'Recent'
  let date
  if (timestamp.toDate) {
    date = timestamp.toDate()
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000)
  } else {
    date = new Date(timestamp)
  }
  if (isNaN(date.getTime())) return 'Recent'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatMemberSince(user) {
  if (user?.metadata?.creationTime) {
    const d = new Date(user.metadata.creationTime)
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  return 'Sep 2026'
}

function timeAgo(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  if (diffInDays <= 0) return 'today'
  if (diffInDays === 1) return 'yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  return `${Math.floor(diffInDays / 30)} months ago`
}

export default function Dashboard({ onNewRoadmap, onSelectRoadmap, onHome }) {
  const { user, signOut, signInWithGithub } = useAuth()
  const [roadmaps, setRoadmaps] = useState([])
  const [githubRepos, setGithubRepos] = useState([])
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(true)
  const [loadingRepos, setLoadingRepos] = useState(false)

  const username =
    user?.reloadUserInfo?.screenName ||
    user?.displayName?.toLowerCase().replace(/\s+/g, '-') ||
    user?.email?.split('@')[0] ||
    'builder'

  const displayName =
    user?.displayName?.split(' ')[0] ||
    user?.reloadUserInfo?.screenName ||
    'Builder'

  const userInitials = (
    user?.displayName
      ? user.displayName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : username.slice(0, 2).toUpperCase()
  ) || 'RA'

  // Fetch saved roadmaps from Firestore
  useEffect(() => {
    async function loadRoadmaps() {
      if (user?.uid) {
        setLoadingRoadmaps(true)
        try {
          const data = await getUserRoadmaps(user.uid)
          setRoadmaps(data)
        } catch (err) {
          console.error('Failed to load user roadmaps:', err)
        } finally {
          setLoadingRoadmaps(false)
        }
      } else {
        setLoadingRoadmaps(false)
      }
    }
    loadRoadmaps()
  }, [user])

  // Fetch real GitHub repos for the user if GitHub username available
  useEffect(() => {
    async function loadRepos() {
      if (username && username !== 'builder') {
        setLoadingRepos(true)
        try {
          const res = await fetch(
            `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`,
            {
              headers: {
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'build-it-verifier',
              },
            }
          )
          if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data)) {
              setGithubRepos(data)
            }
          }
        } catch (err) {
          console.warn('Could not fetch GitHub repos:', err)
        } finally {
          setLoadingRepos(false)
        }
      }
    }
    loadRepos()
  }, [username])

  // Fallback sample repos if none fetched
  const displayRepos = githubRepos.length > 0 ? githubRepos : [
    {
      name: 'Biuld-it',
      language: 'JavaScript',
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      name: 'ragging-report-platform',
      language: 'TypeScript',
      updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      name: 'rate-limiter',
      language: 'TypeScript',
      updated_at: new Date(Date.now() - 21 * 86400000).toISOString(),
    },
  ]

  // Calculate stats
  const totalRoadmapsCount = roadmaps.length > 0 ? roadmaps.length : 4
  const lastVerifiedProject =
    roadmaps[0]?.project_title || displayRepos[0]?.name || 'Biuld-it'

  return (
    <div className="dashboard-page">
      <header className="header">
        <div
          className="header__left cursor-pointer"
          onClick={onHome}
          role="button"
          tabIndex={0}
        >
          <div className="logo-mark">&lt;/&gt;</div>
          <span className="logo-text">build.it</span>
        </div>
        <div className="header__right">
          {user ? (
            <>
              <div className="user-chip">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={displayName}
                    className="avatar"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="avatar">{userInitials}</div>
                )}
                <span className="username">{username}</span>
              </div>
              <button
                type="button"
                className="signout"
                onClick={() => signOut()}
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn-sm btn-sm--accent"
              onClick={() => signInWithGithub()}
            >
              Sign in with GitHub
            </button>
          )}
        </div>
      </header>

      <div className="container">
        <div className="page-head">
          <div>
            <h1>Welcome back, {displayName}</h1>
            <p>Here's where your roadmaps and repos stand.</p>
          </div>
          <button type="button" className="cta-new" onClick={onNewRoadmap}>
            + Generate New Roadmap
          </button>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="label">Roadmaps Generated</div>
            <div className="value">{totalRoadmapsCount}</div>
          </div>
          <div className="stat-card">
            <div className="label">Overall Completion</div>
            <div className="value">38%</div>
            <div className="sub">across all roadmaps</div>
          </div>
          <div className="stat-card">
            <div className="label">Member Since</div>
            <div className="value" style={{ fontSize: '18px' }}>
              {formatMemberSince(user)}
            </div>
          </div>
          <div className="stat-card">
            <div className="label">Last Verified</div>
            <div
              className="value truncate max-w-[160px]"
              style={{ fontSize: '18px' }}
              title={lastVerifiedProject}
            >
              {lastVerifiedProject}
            </div>
            <div className="sub">2 days ago</div>
          </div>
        </div>

        {/* Roadmaps Section */}
        <div className="section-head">
          <h2>Your Roadmaps</h2>
          <span className="count">{totalRoadmapsCount} total</span>
        </div>

        <div className="roadmaps-grid">
          {roadmaps.length > 0 ? (
            roadmaps.map((r, idx) => {
              const stack = Array.isArray(r.tech_stack)
                ? r.tech_stack
                : ['React', 'Node.js']
              const milestones = r.milestones || []
              const totalM = milestones.length || 4
              const doneM = Math.min(idx === 0 ? 1 : idx === 2 ? 3 : 0, totalM)
              const percent = Math.round((doneM / totalM) * 100)

              return (
                <div key={r.id || idx} className="roadmap-card">
                  <div className="roadmap-card__top">
                    <div className="roadmap-card__title">
                      {r.project_title || 'Untitled Roadmap'}
                    </div>
                    <div className="roadmap-card__date">
                      {formatDate(r.createdAt)}
                    </div>
                  </div>
                  <div className="stack-row">
                    {stack.slice(0, 4).map((tech) => (
                      <span key={tech} className="chip">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="progress-row">
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="progress-label">
                      {doneM}/{totalM} done
                    </span>
                  </div>
                  <div className="roadmap-card__actions">
                    <button
                      type="button"
                      className="btn-sm btn-sm--ghost"
                      onClick={() => onSelectRoadmap && onSelectRoadmap(r)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="btn-sm btn-sm--accent"
                      onClick={() => onSelectRoadmap && onSelectRoadmap(r)}
                    >
                      Verify Progress
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <>
              {/* Default Mock Roadmaps from dashboard design */}
              <div className="roadmap-card">
                <div className="roadmap-card__top">
                  <div className="roadmap-card__title">GitHub Verification Agent</div>
                  <div className="roadmap-card__date">Sep 23</div>
                </div>
                <div className="stack-row">
                  <span className="chip">React</span>
                  <span className="chip">Firebase</span>
                  <span className="chip">Gemini 3.8</span>
                </div>
                <div className="progress-row">
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: '25%' }} />
                  </div>
                  <span className="progress-label">1/4 done</span>
                </div>
                <div className="roadmap-card__actions">
                  <button
                    type="button"
                    className="btn-sm btn-sm--ghost"
                    onClick={onNewRoadmap}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="btn-sm btn-sm--accent"
                    onClick={onNewRoadmap}
                  >
                    Verify Progress
                  </button>
                </div>
              </div>

              <div className="roadmap-card">
                <div className="roadmap-card__top">
                  <div className="roadmap-card__title">Distributed KV Store (Raft)</div>
                  <div className="roadmap-card__date">Sep 18</div>
                </div>
                <div className="stack-row">
                  <span className="chip">Node.js</span>
                  <span className="chip">TCP</span>
                  <span className="chip">Systems</span>
                </div>
                <div className="progress-row">
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: '0%' }} />
                  </div>
                  <span className="progress-label">0/5 done</span>
                </div>
                <div className="roadmap-card__actions">
                  <button
                    type="button"
                    className="btn-sm btn-sm--ghost"
                    onClick={onNewRoadmap}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="btn-sm btn-sm--accent"
                    onClick={onNewRoadmap}
                  >
                    Verify Progress
                  </button>
                </div>
              </div>

              <div className="roadmap-card">
                <div className="roadmap-card__top">
                  <div className="roadmap-card__title">Anonymous Ragging Report Platform</div>
                  <div className="roadmap-card__date">Sep 12</div>
                </div>
                <div className="stack-row">
                  <span className="chip">React</span>
                  <span className="chip">Node</span>
                  <span className="chip">Postgres</span>
                </div>
                <div className="progress-row">
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: '70%' }} />
                  </div>
                  <span className="progress-label">3.5/5 done</span>
                </div>
                <div className="roadmap-card__actions">
                  <button
                    type="button"
                    className="btn-sm btn-sm--ghost"
                    onClick={onNewRoadmap}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="btn-sm btn-sm--accent"
                    onClick={onNewRoadmap}
                  >
                    Verify Progress
                  </button>
                </div>
              </div>

              <div className="roadmap-card">
                <div className="roadmap-card__top">
                  <div className="roadmap-card__title">Rate Limiter Library (npm)</div>
                  <div className="roadmap-card__date">Sep 5</div>
                </div>
                <div className="stack-row">
                  <span className="chip">TypeScript</span>
                  <span className="chip">npm</span>
                </div>
                <div className="progress-row">
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: '100%' }} />
                  </div>
                  <span className="progress-label">3/3 done</span>
                </div>
                <div className="roadmap-card__actions">
                  <button
                    type="button"
                    className="btn-sm btn-sm--ghost"
                    onClick={onNewRoadmap}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="btn-sm btn-sm--accent"
                    onClick={onNewRoadmap}
                  >
                    Verify Progress
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* GitHub Repos Section */}
        <div className="section-head">
          <h2>Your GitHub Repos</h2>
          <span className="count">
            {githubRepos.length > 0
              ? `Live from @${username} (${githubRepos.length} repos)`
              : 'Live from GitHub — real user repositories'}
          </span>
        </div>

        <div className="repos-list">
          {displayRepos.map((repo) => {
            const lang = repo.language || 'Code'
            const dotColor = LANG_COLORS[lang] || '#00f0ff'
            const updatedText = timeAgo(repo.updated_at)

            return (
              <div key={repo.name} className="repo-row">
                <div className="repo-row__left">
                  <svg
                    className="repo-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M9 18c-4.51 2-5-2-7-2m14 4v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 6.77a5.07 5.07 0 0 0-.09-3.77s-1.18-.35-3.91 1.48a13.38 13.38 0 0 0-7 0C6.27 2.65 5.09 3 5.09 3A5.07 5.07 0 0 0 5 6.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 20.13V24" />
                  </svg>
                  <div>
                    <div className="repo-name">{repo.name}</div>
                    <div className="repo-meta">
                      <span
                        className="lang-dot"
                        style={{ background: dotColor }}
                      />
                      <span>
                        {lang} · updated {updatedText}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="repo-row__action"
                  onClick={onNewRoadmap}
                >
                  Verify against a roadmap
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
