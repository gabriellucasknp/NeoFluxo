import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './errorHandler';

/**
 * Serviço de integração direta com Cloud Firestore no NeoFluxo.
 * Todos os acessos capturam exceções e acionam o handleFirestoreError
 * conforme preconizado na especificação de segurança ABAC.
 */

export const firestoreService = {
  // =========================================================================
  // PROJETOS (US-04 & US-06)
  // =========================================================================
  async getProjects(filterProjetistaId?: string) {
    const colPath = 'projects';
    try {
      let q = collection(db, colPath);
      let queryRef: any = q;
      if (filterProjetistaId) {
        queryRef = query(q, where('projetistaId', '==', filterProjetistaId));
      }
      const snapshot = await getDocs(queryRef);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Record<string, any>),
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, colPath);
    }
  },

  async getProjectById(projectId: string) {
    const docPath = `projects/${projectId}`;
    try {
      const snap = await getDoc(doc(db, 'projects', projectId));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, docPath);
    }
  },

  async saveProject(projectId: string, data: any) {
    const docPath = `projects/${projectId}`;
    try {
      await setDoc(doc(db, 'projects', projectId), {
        ...data,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  async deleteProject(projectId: string) {
    const docPath = `projects/${projectId}`;
    try {
      await deleteDoc(doc(db, 'projects', projectId));
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  },

  // =========================================================================
  // ATESTADOS DIGITAIS (US-07)
  // =========================================================================
  async getCertificateByCode(code: string) {
    const colPath = 'certificates';
    try {
      const q = query(collection(db, colPath), where('code', '==', code), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return { id: d.id, ...d.data() };
      }
      // Try search by uniqueIdentifier
      const q2 = query(collection(db, colPath), where('uniqueIdentifier', '==', code), limit(1));
      const snap2 = await getDocs(q2);
      if (!snap2.empty) {
        const d2 = snap2.docs[0];
        return { id: d2.id, ...d2.data() };
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, colPath);
    }
  },

  async saveCertificate(certificateId: string, certData: any) {
    const docPath = `certificates/${certificateId}`;
    try {
      await setDoc(doc(db, 'certificates', certificateId), {
        ...certData,
        createdAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  },

  // =========================================================================
  // USUÁRIOS (US-01 / US-03)
  // =========================================================================
  async getUser(userId: string) {
    const docPath = `users/${userId}`;
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, docPath);
    }
  },

  async saveUser(userId: string, userData: any) {
    const docPath = `users/${userId}`;
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  // =========================================================================
  // CATÁLOGO DE TRANSFORMADORES & FATORES DE DEMANDA
  // =========================================================================
  async getTransformers() {
    const colPath = 'transformers';
    try {
      const snap = await getDocs(collection(db, colPath));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, colPath);
    }
  },

  async getDemandFactors() {
    const colPath = 'demandFactors';
    try {
      const snap = await getDocs(collection(db, colPath));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, colPath);
    }
  },
};
