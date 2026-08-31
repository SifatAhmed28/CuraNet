import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "../utils/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("curanet_token");
    if (token) {
      api.auth
        .me()
        .then((res) => setUser(res.user))
        .catch(() => {
          localStorage.removeItem("curanet_token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    localStorage.setItem("curanet_token", res.token);
    setUser(res.user);
    return res;
  };

  const register = async (data) => {
    const res = await api.auth.register(data);
    localStorage.setItem("curanet_token", res.token);
    setUser(res.user);
    return res;
  };

  const loginWithGoogle = async (optionalRole = "patient") => {
    try {
      // 1. Firebase Google popup sign in
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const idToken = await fbUser.getIdToken();

      const payload = {
        name: fbUser.displayName || "Google User",
        email: fbUser.email,
        avatarUrl: fbUser.photoURL,
        role: typeof optionalRole === "string" ? optionalRole : "patient",
        firebaseUid: fbUser.uid,
        idToken,
      };

      // 2. Synchronize with backend
      const res = await api.auth.google(payload);
      localStorage.setItem("curanet_token", res.token);
      setUser(res.user);
      return res;
    } catch (firebaseErr) {
      // Fallback demo sign-in if Firebase popup is blocked in sandbox environment
      if (typeof optionalRole === "object" && optionalRole?.email) {
        const res = await api.auth.google(optionalRole);
        localStorage.setItem("curanet_token", res.token);
        setUser(res.user);
        return res;
      }
      throw firebaseErr;
    }
  };

  const sendVerification = async () => {
    const res = await api.auth.sendVerification();
    return res;
  };

  const verifyAccount = async (code) => {
    const res = await api.auth.confirmVerification(code);
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      /* silent */
    }
    localStorage.removeItem("curanet_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        sendVerification,
        verifyAccount,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
