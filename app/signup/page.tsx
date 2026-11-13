'use client';

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../_providers/api";

export default function SignUp() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [values, setValues] = useState({
        username: "",
        email: "",
        password: "",
    });

    const handleValues = (event: ChangeEvent<HTMLInputElement>) => {
        setValues({ ...values, [event.target.name]: event.target.value });
    };

    const signup = async () => {
        if (!values.username || !values.email || !values.password) {
            alert("Бүх талбарыг бөглөнө үү!");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/user/sign-up`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: values.email,
                    username: values.username,
                    password: values.password,
                }),   
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Бүртгүүлэхэд алдаа гарлаа");
                return;
            }

            alert("Амжилттай бүртгүүллээ! 🎉");
            
            router.push("/login");

        } catch (error) {
            console.error("Signup error:", error);
            alert("Сервертэй холбогдоход алдаа гарлаа.");
        } finally { setLoading(false); }
    }
   
    return (
        <div className="p-8 max-w-md mx-auto bg-white text-black border rounded-xl shadow-lg my-16">
            <h1 className="text-2xl font-bold mb-6 text-center">Бүртгүүлэх</h1>
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void signup(); }}>
                <input
                    type="text"
                    placeholder="Хэрэглэгчийн нэр"
                    name="username" required
                    value={values.username}
                    onChange={handleValues}
                    className="w-full border p-3 rounded-lg border-gray-300 focus:outline-blue-500"
                />
                <input
                    type="email"
                    placeholder="И-мэйл хаяг"
                    name="email" required
                    value={values.email}
                    onChange={handleValues}
                    className="w-full border p-3 rounded-lg border-gray-300 focus:outline-blue-500"
                />
                <input
                    type="password"
                    placeholder="Нууц үг"
                    name="password" required minLength={6}
                    value={values.password}
                    onChange={handleValues}
                    className="w-full border p-3 rounded-lg border-gray-300 focus:outline-blue-500"
                />
                <button 
                    type="submit" disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
                >
                    Бүртгүүлэх
                </button>
            </form>
        </div>
    );
}