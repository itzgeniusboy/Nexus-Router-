import { type User } from 'firebase/auth';
import { 
  doc, 
  collection, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { UnifiedAccount } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Ensure User Profile exists in Firestore
export async function syncUserProfile(user: User): Promise<void> {
  const path = `users/${user.uid}`;
  try {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Developer',
      photoURL: user.photoURL || '',
      lastLoginAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Save an API Key to the user's Firestore vault
export async function saveApiKeyToVault(userId: string, account: UnifiedAccount): Promise<void> {
  const path = `users/${userId}/api_vault/${account.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'api_vault', account.id), {
      keyId: account.id,
      accountId: account.id,
      accountEmail: account.email,
      provider: account.provider,
      providerName: account.provider,
      apiKey: account.apiKey || '',
      status: account.status || 'valid',
      quotaTier: 'Free Tier',
      extractedAt: account.addedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete an API Key from user's Firestore vault
export async function deleteApiKeyFromVault(userId: string, keyId: string): Promise<void> {
  const path = `users/${userId}/api_vault/${keyId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'api_vault', keyId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Real-time subscription to user's keys in Firestore
export function subscribeToUserVault(
  userId: string, 
  onUpdate: (accounts: UnifiedAccount[]) => void
): () => void {
  const path = `users/${userId}/api_vault`;
  try {
    const vaultRef = collection(db, 'users', userId, 'api_vault');
    const unsubscribe = onSnapshot(
      vaultRef,
      (snapshot) => {
        const list: UnifiedAccount[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: data.keyId || docSnap.id,
            email: data.accountEmail || data.label || 'Saved Key',
            provider: data.provider || 'google_ai',
            apiKey: data.apiKey || '',
            dailyQuota: 1500,
            quotaUsedToday: 0,
            lastResetDate: new Date().toISOString().split('T')[0],
            status: data.status === 'invalid' ? 'revoked' : 'active',
            addedAt: data.extractedAt || new Date().toISOString(),
          });
        });
        onUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}
