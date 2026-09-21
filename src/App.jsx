import { useState, useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import InputForm from './components/InputForm'
import LoadingState from './components/LoadingState'
import ResultsScreen from './components/ResultsScreen'
import { generateRoadmap } from './lib/gemini'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

export default function App() {
  const [view, setView] = useState('input') // 'input' | 'loading' | 'results'
  const [inputs, setInputs] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const smootherRef = useRef(null)

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

  // Screen content height changes whenever the view switches (input vs.
  // results are very different heights) — resync so ScrollTrigger offsets
  // and the smoother's scroll bounds stay correct, and jump back to top.
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
      setResult({ ...data, timeframe_label: formInputs.timeFrame })
      setView('results')
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
        {view === 'input' && <InputForm onGenerate={handleGenerate} />}
        {view === 'loading' && inputs && <LoadingState inputs={inputs} />}
        {view === 'results' && result && (
          <ResultsScreen result={result} onRegenerate={handleRegenerate} onAdjust={handleAdjust} />
        )}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-950 border border-red-700 text-red-200 text-sm px-4 py-3 rounded-md max-w-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
