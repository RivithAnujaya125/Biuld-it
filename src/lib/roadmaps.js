import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

/**
 * Writes a roadmap to /users/{userId}/roadmaps/{auto-id} with createdAt timestamp
 * @param {string} userId - Firebase Auth user UID
 * @param {object} roadmapData - Roadmap specification data
 * @returns {Promise<string>} The created document ID
 */
export async function saveRoadmap(userId, roadmapData) {
  if (!userId) {
    throw new Error('User ID is required to save roadmap.')
  }

  const roadmapsRef = collection(db, 'users', userId, 'roadmaps')
  const docRef = await addDoc(roadmapsRef, {
    ...roadmapData,
    createdAt: serverTimestamp(),
  })

  return docRef.id
}

/**
 * Reads all roadmaps under /users/{userId}/roadmaps, ordered by createdAt descending
 * @param {string} userId - Firebase Auth user UID
 * @returns {Promise<Array>} Array of roadmap objects with document IDs
 */
export async function getUserRoadmaps(userId) {
  if (!userId) {
    throw new Error('User ID is required to fetch roadmaps.')
  }

  const roadmapsRef = collection(db, 'users', userId, 'roadmaps')
  const q = query(roadmapsRef, orderBy('createdAt', 'desc'))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}
