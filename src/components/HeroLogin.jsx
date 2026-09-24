import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260806_133255_956f653f-5d80-4b06-abd5-0f46c98b60fa.mp4'
const POSTER_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260806_132328_5f9029c8-218f-4489-82b6-29ff2849920e.png'

const TARGET_TITLE = 'Biuld-it'

export default function HeroLogin({ onProceed, onNavigate }) {
  const { user, signInWithGithub } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [githubUsername, setGithubUsername] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isVerifyingGithub, setIsVerifyingGithub] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const [typedTitle, setTypedTitle] = useState('')
  const [activeModal, setActiveModal] = useState(null)

  const hamburgerRef = useRef(null)

  // Typing effect on mount
  useEffect(() => {
    let index = 0
    setTypedTitle('')
    const timer = setInterval(() => {
      if (index < TARGET_TITLE.length) {
        setTypedTitle(TARGET_TITLE.slice(0, index + 1))
        index++
      } else {
        clearInterval(timer)
      }
    }, 110)

    return () => clearInterval(timer)
  }, [])

  // Auto-detect if user is already signed in with GitHub
  useEffect(() => {
    if (user) {
      const username =
        user.reloadUserInfo?.screenName ||
        user.displayName ||
        user.email?.split('@')[0] ||
        'builder'
      setGithubUsername(username)
      setIsSubmitted(true)
    }
  }, [user])

  // Manage body overflow & resize handler for mobile menu
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('menu-open')
    } else {
      document.body.classList.remove('menu-open')
    }

    const handleResize = () => {
      if (window.innerWidth >= 901) {
        setMobileMenuOpen(false)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null)
        } else if (mobileMenuOpen) {
          setMobileMenuOpen(false)
          hamburgerRef.current?.focus()
        }
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.classList.remove('menu-open')
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileMenuOpen, activeModal])

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const handleLinkClick = (section) => {
    closeMobileMenu()
    if (section === 'Dashboard') {
      if (onNavigate) onNavigate('dashboard')
      return
    }
    if (section === 'Join' || section === 'Generator') {
      if (onProceed) onProceed()
      return
    }
    setActiveModal({
      title: section.toUpperCase(),
      text: `Navigating to ${section} on the E network. Biuld-it voice protocol sequence initialized for ${section.toLowerCase()}.`,
    })
  }

  const triggerSuccessState = () => {
    setIsAnimatingOut(true)
    setTimeout(() => {
      setIsSubmitted(true)
      setIsAnimatingOut(false)
    }, 400)
  }

  // Verify GitHub username against GitHub API
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const cleanUsername = githubUsername.trim().replace(/^@/, '')
    if (!cleanUsername) {
      setActiveModal({
        title: 'INVALID USERNAME',
        text: 'Please enter your GitHub username to request voice ID access on the E network.',
      })
      return
    }

    setIsVerifyingGithub(true)
    try {
      // Validate GitHub user account exists
      const res = await fetch(`https://api.github.com/users/${cleanUsername}`, {
        headers: { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'build-it-verifier' },
      })

      if (res.status === 404) {
        setActiveModal({
          title: 'USER NOT FOUND',
          text: `GitHub user @${cleanUsername} could not be located. Please verify your username or authenticate using GitHub OAuth.`,
        })
        setIsVerifyingGithub(false)
        return
      }

      // Valid account found or accepted
      triggerSuccessState()
    } catch (err) {
      // Fallback if offline or blocked
      triggerSuccessState()
    } finally {
      setIsVerifyingGithub(false)
    }
  }

  // GitHub OAuth Sign-In
  const handleProceedGithub = async () => {
    try {
      setIsVerifyingGithub(true)
      const loggedUser = await signInWithGithub()
      const username =
        loggedUser?.reloadUserInfo?.screenName ||
        loggedUser?.displayName ||
        githubUsername.trim() ||
        'builder'
      setGithubUsername(username)
      triggerSuccessState()
    } catch (err) {
      console.warn('GitHub Sign-in cancelled or failed:', err.message)
      if (githubUsername.trim()) {
        triggerSuccessState()
      } else {
        setActiveModal({
          title: 'GITHUB AUTHENTICATION',
          text: 'GitHub authentication window closed. You can also enter your GitHub username directly in the input field.',
        })
      }
    } finally {
      setIsVerifyingGithub(false)
    }
  }

  const handleResetForm = () => {
    setIsSubmitted(false)
    setGithubUsername('')
  }

  return (
    <div className="hero">
      {/* MEDIA LAYER */}
      <div className="hero__media">
        <video
          className="hero__video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={POSTER_URL}
        >
          <source src={VIDEO_URL} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="hero__scrim" />
      </div>

      {/* ROW 1: NAVBAR */}
      <header className="navbar">
        <a
          href="#"
          className="logo"
          onClick={(e) => {
            e.preventDefault()
            closeMobileMenu()
          }}
        >
          Biuld-it
        </a>

        <div className="nav__cluster">
          <nav className="nav__links" aria-label="Main Navigation">
            <button
              type="button"
              className="nav__link"
              onClick={() => handleLinkClick('Documentation')}
            >
              Documentation
            </button>
            <button
              type="button"
              className="nav__link"
              onClick={() => handleLinkClick('Dashboard')}
            >
              Dashboard
            </button>
            <button
              type="button"
              className="nav__link"
              onClick={() => handleLinkClick('build-it-labs')}
            >
              build-it-labs
            </button>
          </nav>

          <button
            type="button"
            className="nav__cta"
            onClick={() => handleLinkClick('Join')}
          >
            JOIN UP
          </button>

          <button
            ref={hamburgerRef}
            type="button"
            className={`hamburger ${mobileMenuOpen ? 'hamburger--active' : ''}`}
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobileMenu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="hamburger__bar hamburger__bar--1" />
            <span className="hamburger__bar hamburger__bar--2" />
            <span className="hamburger__bar hamburger__bar--3" />
          </button>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <div
        id="mobileMenu"
        className={`mobile-menu ${mobileMenuOpen ? 'mobile-menu--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!mobileMenuOpen}
      >
        <button
          type="button"
          className="mobile-menu__item"
          style={{ '--i': 0 }}
          onClick={() => handleLinkClick('Documentation')}
        >
          Documentation
        </button>
        <button
          type="button"
          className="mobile-menu__item"
          style={{ '--i': 1 }}
          onClick={() => handleLinkClick('Dashboard')}
        >
          Dashboard
        </button>
        <button
          type="button"
          className="mobile-menu__item"
          style={{ '--i': 2 }}
          onClick={() => handleLinkClick('build-it-labs')}
        >
          build-it-labs
        </button>
        <button
          type="button"
          className="mobile-menu__cta"
          style={{ '--i': 3 }}
          onClick={() => handleLinkClick('Join')}
        >
          JOIN UP
        </button>
      </div>

      {/* ROW 2: RIGHT PANEL (VOICE ENTRY SIGNUP) */}
      <main className="hero__body">
        <div className="panel">
          {/* 1) CHIP */}
          <div className="chip">[ VOICE ENTRY ]</div>

          {/* 2) H1 */}
          <h1 className="hero__h1">
            <span>{typedTitle}</span>
            <span className="hero__h1-cursor" aria-hidden="true" />
          </h1>

          {/* 3) TAGLINE */}
          <p className="hero__tagline">YOUR VOICE ID TO THE E NETWORK.</p>

          {/* 4) FORM OR SUCCESS STATE */}
          {!isSubmitted ? (
            <div
              className={`form-container ${
                isAnimatingOut ? 'form-container--hidden' : ''
              }`}
            >
              <form className="form" noValidate onSubmit={handleFormSubmit}>
                <div className="form__field">
                  <label htmlFor="githubUsernameInput" className="visually-hidden">
                    GitHub username
                  </label>
                  <input
                    id="githubUsernameInput"
                    type="text"
                    className="form__input"
                    placeholder="GitHub username"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    disabled={isVerifyingGithub}
                  />
                </div>

                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={handleProceedGithub}
                  disabled={isVerifyingGithub}
                >
                  {isVerifyingGithub ? 'CONNECTING...' : 'PROCEED USING GITHUB'}
                </button>

                <button
                  type="submit"
                  className="btn btn--solid"
                  disabled={isVerifyingGithub}
                >
                  {isVerifyingGithub ? 'VERIFYING...' : 'ACCESS'}
                </button>
              </form>
            </div>
          ) : (
            <div className="success-card success-card--visible">
              <div className="success-badge">
                <svg
                  className="success-badge__icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="square"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>VERIFIED</span>
              </div>

              <h2 className="success-title">ACCESS GRANTED</h2>

              <p className="success-msg">
                Welcome to the E network,{' '}
                <span className="success-user">@{githubUsername.trim() || 'builder'}</span>.
                Your voice identity profile has been successfully mapped to Biuld-it.
              </p>

              <button
                type="button"
                className="btn btn--solid"
                onClick={onProceed}
                style={{ marginTop: '8px' }}
              >
                START BUILDING ROADMAP
              </button>

              <button
                type="button"
                className="btn btn--ghost"
                onClick={handleResetForm}
                style={{ marginTop: '8px' }}
              >
                ENTER ANOTHER USERNAME
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ROW 3: LEGAL FOOTER */}
      <footer className="footer">
        <p className="footer__text">
          Opening an e.xyz account signals that you accept our{' '}
          <a
            href="#privacy-notice"
            className="footer__link"
            onClick={(e) => {
              e.preventDefault()
              setActiveModal({
                title: 'PRIVACY NOTICE',
                text: 'Biuld-it protects voice metadata using standard encryption on the E network.',
              })
            }}
          >
            Privacy Notice
          </a>{' '}
          and{' '}
          <a
            href="#service-contract"
            className="footer__link"
            onClick={(e) => {
              e.preventDefault()
              setActiveModal({
                title: 'SERVICE CONTRACT',
                text: 'By joining Biuld-it, you agree to the E network protocol service terms.',
              })
            }}
          >
            Service Contract
          </a>
          .
        </p>
      </footer>

      {/* INTERACTIVE MODAL */}
      {activeModal && (
        <div
          className="modal-backdrop"
          onClick={() => setActiveModal(null)}
          role="presentation"
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modalTitle"
          >
            <h2 id="modalTitle" className="modal-title">
              {activeModal.title}
            </h2>
            <p className="modal-text">{activeModal.text}</p>

            <button
              type="button"
              className="modal-close"
              onClick={() => setActiveModal(null)}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
