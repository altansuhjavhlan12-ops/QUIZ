'use client';

import { useState } from "react";
import Link from "next/link";
import { useUser } from "../_providers/userContext";
import { useRouter } from "next/navigation";
import { API_URL } from "../_providers/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useUser();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMessage("");

    if (!email || !password) {
      alert("И-мэйл болон нууц үгээ бүрэн оруулна уу!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // 1. Токенийг localStorage-д хадгалах
        login(data.token);

        router.push("/"); // Үндсэн хуудас руу шилжих
      } else {
        setErrorMessage(data.message || "Нэвтрэх нэр эсвэл нууц үг буруу байна!");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Сервертэй холбогдоход алдаа гарлаа!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-white text-black border border-gray-200 rounded-xl shadow-lg my-16">
      <h1 className="text-2xl font-bold mb-6 text-center">Системд Нэвтрэх</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">
            И-мэйл хаяг:
          </label>
          <input
            type="email"
            autoComplete="email"
            placeholder="example@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded-lg border-gray-300 focus:outline-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">
            Нууц үг:
          </label>
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3 rounded-lg border-gray-300 focus:outline-blue-500"
            required
          />
        </div>

        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-sm text-blue-600">
          {showPassword ? "Нууц үг нуух" : "Нууц үг харах"}
        </button>
        {errorMessage && <p role="alert" className="text-sm text-red-600">{errorMessage}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 mt-2"
        >
          {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">Бүртгэлгүй бол <Link href="/signup" className="text-blue-600 underline">бүртгүүлэх</Link>.</p>
    </div>
  );
}
