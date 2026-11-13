"use client";
import Link from "next/link";
import { useUser } from "./userContext";
export default function Navigation() {
  const { user, ready, logout } = useUser();
  return <nav className="flex flex-wrap items-center justify-center gap-5 border-b p-4">
    {ready && (user ? <><Link href="/create-card">Quiz үүсгэх</Link><span>{user.username}</span><button onClick={logout}>Гарах</button></> : <><Link href="/login">Нэвтрэх</Link><Link href="/signup">Бүртгүүлэх</Link></>)}
  </nav>;
}
