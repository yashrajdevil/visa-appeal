import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface User {
  id: string; // Firebase UID
  email: string;
  name?: string;
}

interface CustomerAuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Timeout protection for infinite loading state
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 10000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      clearTimeout(timeout);
      if (firebaseUser) {
        setLoading(true); // Indicate we are processing user details
        
        // Add a fallback timeout in case getDoc hangs indefinitely
        const hangingTimeout = setTimeout(() => {
          setLoading(false);
        }, 8000);

        try {
          // Sync user with Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          
          let userData: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'User'
          };

          if (!userDoc.exists()) {
            try {
              // Create new user record
              await setDoc(userRef, {
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || '',
                createdAt: Date.now(),
                updatedAt: Date.now()
              }, { merge: true });
            } catch (err) {
              console.error("Failed to create user record in firestore", err);
              // Still allow user to be considered logged in locally
            }
          } else {
            const data = userDoc.data();
            if (data) {
               userData = {
                 id: firebaseUser.uid,
                 email: data.email || firebaseUser.email,
                 name: data.name || firebaseUser.displayName || 'User'
               };
            }
          }
          setUser(userData);
        } catch (error) {
           console.error("Error fetching user document:", error);
           // Fallback to simple user object if firestore fails
           setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'User'
           });
        } finally {
           clearTimeout(hangingTimeout);
           setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch(err) {
      setLoading(false);
      throw err;
    }
  };

  const signInWithFacebook = async () => {
    setLoading(true);
    try {
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
    } catch(err) {
      setLoading(false);
      throw err;
    }
  };
  
  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };
  
  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(result.user, { displayName: name });
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
    } catch(err) {
      setLoading(false);
      throw err;
    }
  };

  return (
    <CustomerAuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithFacebook, signInWithEmail, signUpWithEmail, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
