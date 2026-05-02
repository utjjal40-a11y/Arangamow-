import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { StudentResult } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const RESULTS_COL = 'results';
const HISTORY_COL = 'history';

export const firebaseService = {
  subscribeResults: (callback: (results: StudentResult[]) => void) => {
    const q = query(collection(db, RESULTS_COL), orderBy('updatedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map(doc => doc.data() as StudentResult);
      callback(results);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, RESULTS_COL);
    });
  },

  subscribeHistory: (callback: (history: StudentResult[]) => void) => {
    const q = query(collection(db, HISTORY_COL), orderBy('updatedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => doc.data() as StudentResult);
      callback(history);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, HISTORY_COL);
    });
  },

  saveResult: async (result: StudentResult) => {
    try {
      await setDoc(doc(db, RESULTS_COL, result.id), result);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${RESULTS_COL}/${result.id}`);
    }
  },

  updateResult: async (result: StudentResult) => {
    try {
      await setDoc(doc(db, RESULTS_COL, result.id), result);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${RESULTS_COL}/${result.id}`);
    }
  },

  deleteResult: async (id: string) => {
    try {
      await deleteDoc(doc(db, RESULTS_COL, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${RESULTS_COL}/${id}`);
    }
  },

  addHistory: async (result: StudentResult) => {
    try {
      // Use a new ID for history entries to keep multiple versions
      const historyId = `h_${Date.now()}_${result.id}`;
      await setDoc(doc(db, HISTORY_COL, historyId), result);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${HISTORY_COL}/${result.id}`);
    }
  }
};
