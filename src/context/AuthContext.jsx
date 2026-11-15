import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile,
  reload as fbReload,
} from 'firebase/auth'
import { auth, githubProvider } from '../lib/firebase'

const AuthContext = createContext({
  user: null,
  loading: true,
  signInWithGithub: async () => {},
  signOut: async () => {},
  updateDisplayName: async () => {},
  // Dev bypass flag so the Figma Welcome homepage can be previewed
  // without completing Firebase GitHub OAuth.
  devBypass: false,
  setDevBypass: () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [devBypass, setDevBypass] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signInWithGithub = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider)
      return result.user
    } catch (error) {
      console.error('Error signing in with GitHub:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      setDevBypass(false)
      await fbSignOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  // Persist a new display name to the Firebase user profile so every
  // consumer of `user` (dashboard header, greetings) picks it up.
  const updateDisplayName = async (displayName) => {
    const current = auth.currentUser
    if (!current) {
      throw new Error('You are signed out. Sign in to update your profile.')
    }
    const clean = String(displayName ?? '').trim()
    if (!clean) {
      throw new Error('Display name cannot be empty.')
    }
    await fbUpdateProfile(current, { displayName: clean.slice(0, 100) })
    await fbReload(current)
    const fresh = auth.currentUser
    // updateProfile mutates in place without firing onAuthStateChanged,
    // so publish a new object identity (prototype preserved so methods
    // like getIdToken keep working) to trigger a re-render.
    setUser(Object.assign(Object.create(Object.getPrototypeOf(fresh)), fresh))
    return fresh
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGithub, signOut, updateDisplayName, devBypass, setDevBypass }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext

