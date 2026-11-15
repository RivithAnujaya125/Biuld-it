import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Github, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getUserProfile, saveUserProfile } from '../lib/profile'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'

/**
 * Editable profile form wired to the real backends:
 * - Display name -> Firebase Auth user profile (updateProfile), which is
 *   what the dashboard header, greetings, and avatar initials read.
 * - Phone -> Firestore user document (/users/{uid}).
 * - Email is managed by the GitHub OAuth provider and stays read-only.
 */
export default function ProfileSettings() {
  const { user, signInWithGithub, updateDisplayName } = useAuth()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  // Seed the form from Auth, then overlay the Firestore extras.
  useEffect(() => {
    setName(user?.displayName || '')
    setError(null)
    setSaved(false)
    if (!user?.uid) {
      setPhone('')
      return
    }
    let cancelled = false
    setLoadingProfile(true)
    getUserProfile(user.uid)
      .then((profile) => {
        if (!cancelled && profile) setPhone(profile.phone || '')
      })
      .catch((err) => {
        if (!cancelled) console.warn('Could not load profile extras:', err)
      })
      .finally(() => {
        if (!cancelled) setLoadingProfile(false)
      })
    return () => {
      cancelled = true
    }
  }, [user?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Sign in to view and edit your profile.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button size="sm" onClick={() => signInWithGithub()}>
            <Github className="h-4 w-4" />
            Sign in with GitHub
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const handleSave = async (e) => {
    e?.preventDefault()
    if (saving) return
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const cleanName = name.trim()
      if (!cleanName) {
        throw new Error('Display name cannot be empty.')
      }
      // 1. Firebase Auth profile — drives header, greetings, avatars.
      if (cleanName !== (user.displayName || '')) {
        await updateDisplayName(cleanName)
      }
      // 2. Firestore extras — survives across providers and devices.
      await saveUserProfile(user.uid, { phone })
      setSaved(true)
    } catch (err) {
      console.error('Profile save failed:', err)
      setError(err.message || 'Could not save your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex w-full items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Personal info</CardTitle>
          <CardDescription>
            Changes update your account everywhere in the app.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-name">Full name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name"
                maxLength={100}
                autoComplete="name"
              />
              <p className="font-mono text-[11px] text-textFaint">
                Shown in the header, greetings, and your avatar.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" value={user.email || 'Not set'} disabled readOnly />
              <p className="font-mono text-[11px] text-textFaint">
                Managed by GitHub sign-in and cannot be changed here.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-phone">Phone</Label>
              <Input
                id="profile-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional"
                maxLength={30}
                autoComplete="tel"
                disabled={loadingProfile}
              />
            </div>
            {error && (
              <p role="alert" className="flex items-start gap-2 rounded-md border border-red-800/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-400" />
                {error}
              </p>
            )}
            {saved && !error && (
              <p role="status" className="flex items-center gap-2 font-mono text-xs text-emerald-400">
                <CheckCircle2 size={14} />
                Profile saved — header and greeting updated.
              </p>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-end gap-2">
            <Button type="submit" size="sm" disabled={saving}>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
