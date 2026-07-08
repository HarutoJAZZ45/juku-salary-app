import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
  type DocumentReference,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const DELETE_BATCH_SIZE = 450;

const deleteReferencesInBatches = async (references: DocumentReference[]): Promise<void> => {
  for (let offset = 0; offset < references.length; offset += DELETE_BATCH_SIZE) {
    const batch = writeBatch(db);
    references.slice(offset, offset + DELETE_BATCH_SIZE).forEach(reference => {
      batch.delete(reference);
    });
    await batch.commit();
  }
};

export const deleteAccountFirestoreData = async (uid: string): Promise<void> => {
  if (!uid) throw new Error('User ID is required.');

  const follows = collection(db, 'follows');
  const [asFollower, asTarget] = await Promise.all([
    getDocs(query(follows, where('followerUid', '==', uid))),
    getDocs(query(follows, where('targetUid', '==', uid))),
  ]);

  const followReferences = new Map<string, DocumentReference>();
  [...asFollower.docs, ...asTarget.docs].forEach(snapshot => {
    followReferences.set(snapshot.ref.path, snapshot.ref);
  });

  await deleteReferencesInBatches([...followReferences.values()]);

  await Promise.all([
    deleteDoc(doc(db, 'publicProfiles', uid)),
    deleteDoc(doc(db, 'rankings', uid)),
    deleteDoc(doc(db, 'users', uid)),
  ]);
};
