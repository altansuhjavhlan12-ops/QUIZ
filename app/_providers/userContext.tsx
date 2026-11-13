"use client";
import { createContext, useState, useEffect, useContext, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
export type User = { _id: string; email: string; username: string; exp: number; token: string };
type Context = { user: User | null; ready: boolean; login: (token: string) => void; logout: () => void };
const UserContext = createContext<Context | undefined>(undefined);
export function UserProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ user: User | null; ready: boolean }>({ user: null, ready: false });
  function logout() { localStorage.removeItem("token"); setSession({ user: null, ready: true }); }
  function login(token: string) {
    const decoded = jwtDecode<Omit<User, "token">>(token);
    if (!decoded._id || !decoded.exp || decoded.exp * 1000 <= Date.now()) throw new Error("Токены хугацаа дууссан байна");
    localStorage.setItem("token", token);
    setSession({ user: { ...decoded, token }, ready: true });
  }
  useEffect(() => {
    const token = localStorage.getItem("token");
    const restore = window.setTimeout(() => { try { if (token) login(token); else setSession({ user: null, ready: true }); } catch { logout(); } }, 0);
    return () => clearTimeout(restore);
  }, []);
  useEffect(() => {
    if (!session.user) return;
    const timer = window.setTimeout(logout, Math.max(0, session.user.exp * 1000 - Date.now()));
    return () => clearTimeout(timer);
  }, [session.user]);
  return <UserContext.Provider value={{ ...session, login, logout }}>{children}</UserContext.Provider>;
}
export function useUser() { const context = useContext(UserContext); if (!context) throw new Error("UserProvider шаардлагатай"); return context; }
