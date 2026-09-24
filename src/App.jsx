import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import HeroLogin from './components/HeroLogin'
import InputForm from './components/InputForm'
import LoadingState from './components/LoadingState'
import ResultsScreen from './components/ResultsScreen'
import DashboardPlaceholder from './components/DashboardPlaceholder'
import { generateRoadmap } from './lib/gemini'
import { AuthProvider, useAuth } from './context/AuthContext'
import { saveRoadmap } from './lib/roadmaps'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

function AppContent() {
  const [view, setView] = useState('hero') // 'hero' | 'input' | 'loading' | 'results' | 'dashboard'
  const [inputs, setInputs] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const smootherRef = useRef(null)
  const { user } = useAuth()

  // Support hash routing (#dashboard, #generator, #home, etc.)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'dashboard') {
        setView('dashboard')
      } else if (hash === 'generator' || hash === 'input') {
        setView('input')
      } else if (hash === 'home' || hash === 'hero') {
        setView('hero')
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  // Create the smoother once, on mount.
  useLayoutEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1.2,
      effects: true,
    })
    return () => smootherRef.current?.kill()
  }, [])

  // Resync smoother & ScrollTrigger when view changes
  useLayoutEffect(() => {
    smootherRef.current?.scrollTo(0, false)
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [view])

  const handleGenerate = async (formInputs) => {
    setInputs(formInputs)
    setView('loading')
    setError(null)
    try {
      const data = await generateRoadmap(formInputs)
      const fullResult = { ...data, timeframe_label: formInputs.timeFrame }
      setResult(fullResult)
      setView('results')

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
      setView('input')
    }
  }

  const handleRegenerate = () => inputs && handleGenerate(inputs)
  const handleAdjust = () => setView('input')

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">
        {view === 'hero' && (
          <HeroLogin
            onProceed={() => setView('input')}
            onNavigate={(targetView) => setView(targetView)}
          />
        )}
        {view === 'input' && (
          <InputForm
            onGenerate={handleGenerate}
            onOpenDashboard={() => setView('dashboard')}
            onBackToHero={() => setView('hero')}
          />
        )}
        {view === 'loading' && inputs && <LoadingState inputs={inputs} />}
        {view === 'results' && result && (
          <ResultsScreen
            result={result}
            onRegenerate={handleRegenerate}
            onAdjust={handleAdjust}
            onOpenDashboard={() => setView('dashboard')}
            onBackToHero={() => setView('hero')}
          />
        )}
        {view === 'dashboard' && (
          <DashboardPlaceholder
            onBack={() => setView('input')}
            onBackToHero={() => setView('hero')}
          />
        )}
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
