import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HeroLogin from './components/HeroLogin'
import HomePage from './pages/HomePage'
import InputForm from './components/InputForm'
import LoadingState from './components/LoadingState'
import ResultsScreen from './components/ResultsScreen'
import Dashboard from './components/Dashboard'
import { generateRoadmap } from './lib/gemini'
import { AuthProvider, useAuth } from './context/AuthContext'
import { saveRoadmap } from './lib/roadmaps'
import { isReducedMotion } from './lib/motion'

gsap.registerPlugin(ScrollTrigger)

function AppContent() {
  // 'hero' = login gate | 'home' = Figma Welcome homepage (post-login)
  const [view, setView] = useState('hero') // 'hero' | 'home' | 'input' | 'loading' | 'results' | 'dashboard'
  const [inputs, setInputs] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const viewContainerRef = useRef(null)
  const isTransitioningRef = useRef(false)
  const { user } = useAuth()

  // Smooth GSAP screen transition helper (150ms fade-out -> 200ms fade-in)
  const transitionTo = (nextView, updateFn) => {
    if (isReducedMotion()) {
      if (updateFn) updateFn()
      setView(nextView)
      return
    }

    const container = viewContainerRef.current
    if (!container || isTransitioningRef.current) {
      if (updateFn) updateFn()
      setView(nextView)
      return
    }

    isTransitioningRef.current = true
    // Outgoing screen fades out (150ms)
    gsap.to(container, {
      opacity: 0,
      duration: 0.15,
      ease: 'power2.in',
      onComplete: () => {
        if (updateFn) updateFn()
        setView(nextView)
        window.scrollTo(0, 0)
        requestAnimationFrame(() => {
          // Incoming screen fades in (200ms)
          gsap.fromTo(
            container,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.2,
              ease: 'power2.out',
              onComplete: () => {
                isTransitioningRef.current = false
                ScrollTrigger.refresh()
              },
            }
          )
        })
      },
    })
  }

  // Support hash routing (#dashboard, #generator, #home, etc.)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'dashboard') {
        transitionTo('dashboard')
      } else if (hash === 'generator' || hash === 'input') {
        transitionTo('input')
      } else if (hash === 'home') {
        transitionTo('home')
      } else if (hash === 'hero') {
        transitionTo('hero')
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  // Resync ScrollTrigger when view changes (ScrollSmoother removed:
  // Club Green plugin requires a paid license and breaks `npm run dev`).
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [view])

  const handleGenerate = (formInputs) => {
    setInputs(formInputs)
    setError(null)
    transitionTo('loading')

    ;(async () => {
      try {
        const data = await generateRoadmap(formInputs)
        const fullResult = {
          ...data,
          timeframe_label: formInputs.timeFrame,
          // persist the 3 additive wizard inputs so saved roadmaps in the
          // dashboard can show scoping context (weekly hours etc.)
          growthFocus: formInputs.growthFocus,
          projectPurpose: formInputs.projectPurpose,
          weeklyHours: formInputs.weeklyHours,
        }
        setResult(fullResult)
        transitionTo('results')

        // If a user is signed in, automatically save the generated roadmap to Firestore
        if (user?.uid) {
          try {
            await saveRoadmap(user.uid, fullResult)
          } catch (saveErr) {
            console.error('Silent error saving roadmap to Firestore:', saveErr)
          }
        }
      } catch (err) {
        console.error(err)
        setError(err.message)
        transitionTo('input')
      }
    })()
  }

  const handleRegenerate = () => inputs && handleGenerate(inputs)
  const handleAdjust = () => transitionTo('input')

  // ScrollSmoother wrapper removed with the Club plugin — keep a plain
  // container so the fixed-position CSS in index.css no longer traps scroll.
  return (
    <div className="min-h-screen bg-bg">
      <div>
        <div ref={viewContainerRef} className="w-full">
          {view === 'hero' && (
            <HeroLogin
              onProceed={() => transitionTo('home')}
              onNavigate={(targetView) => transitionTo(targetView)}
            />
          )}
          {view === 'home' && (
            <HomePage
              user={user}
              onOpenDashboard={() => transitionTo('dashboard')}
              onGenerate={() => transitionTo('input')}
              onHome={() => transitionTo('hero')}
            />
          )}
          {view === 'input' && (
            <InputForm
              onGenerate={handleGenerate}
              onOpenDashboard={() => transitionTo('dashboard')}
              onBackToHero={() => transitionTo('home')}
            />
          )}
          {view === 'loading' && inputs && <LoadingState inputs={inputs} />}
          {view === 'results' && result && (
            <ResultsScreen
              result={result}
              onRegenerate={handleRegenerate}
              onAdjust={handleAdjust}
              onOpenDashboard={() => transitionTo('dashboard')}
              onBackToHero={() => transitionTo('home')}
            />
          )}
          {view === 'dashboard' && (
            <Dashboard
              onNewRoadmap={() => transitionTo('input')}
              onSelectRoadmap={(selectedRoadmap) => {
                setResult(selectedRoadmap)
                transitionTo('results')
              }}
              onHome={() => transitionTo('home')}
            />
          )}
        </div>
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-950 border border-red-700 text-red-200 text-sm px-4 py-3 rounded-md max-w-sm z-50">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

