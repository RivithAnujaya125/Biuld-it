import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

/**
 * Extra profile fields that don't fit in the Firebase Auth user record
 * (e.g. phone) live on the user document at /users/{userId}.
 * Display name itself is stored in Firebase Auth — see
 * updateDisplayName in context/AuthContext.jsx.
 */

export async function getUserProfile(userId) {
  if (!userId) {
    throw new Error('User ID is required to load profile.')
  }
  const snap = await getDoc(doc(db, 'users', userId))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    phone: typeof data.phone === 'string' ? data.phone : '',
    updatedAt: data.updatedAt ?? null,
  }
}

export async function saveUserProfile(userId, { phone }) {
  if (!userId) {
    throw new Error('User ID is required to save profile.')
  }
  const cleanPhone = String(phone ?? '').trim().slice(0, 30)
  if (cleanPhone && !/^[+()\-.\s\d]{7,30}$/.test(cleanPhone)) {
    throw new Error('Enter a valid phone number, or leave it blank.')
  }
  await setDoc(
    doc(db, 'users', userId),
    { phone: cleanPhone, updatedAt: serverTimestamp() },
    { merge: true }
  )
  return cleanPhone
}
