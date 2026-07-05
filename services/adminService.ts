import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const ADMIN_CONFIG_DOC = 'adminConfig';
const CONFIG_COLLECTION = 'config';

export const getAdminPassword = async (): Promise<string> => {
  const docRef = doc(db, CONFIG_COLLECTION, ADMIN_CONFIG_DOC);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().password || 'admin123';
  }
  return 'admin123';
};

export const updateAdminPassword = async (newPassword: string): Promise<void> => {
  const docRef = doc(db, CONFIG_COLLECTION, ADMIN_CONFIG_DOC);
  await setDoc(docRef, { password: newPassword }, { merge: true });
};
