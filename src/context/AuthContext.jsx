import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, githubProvider } from '../lib/firebase'

const AuthContext = createContext({
  user: null,
  loading: true,
  signInWithGithub: async () => {},
  signOut: async () => {},
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

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGithub, signOut, devBypass, setDevBypass }}>
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

