'use client';

import { useState } from "react";
import { useUser } from "../_providers/userContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "../_providers/api";

export default function CreateCardPage() {
  const { user, ready } = useUser();
  const router = useRouter();

  const [cardName, setCardName] = useState("");
  const [description, setDescription] = useState("");
  const [words, setWords] = useState([
    {
      mnWord: "",
      enWord: "",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const addWord = () => {
    setWords([
      ...words,
      {
        mnWord: "",
        enWord: "",
      },
    ]);
  };

  const handleWord = (value, wordIndex, field) => {
    const updatedWords = words.map((word, index) => {
      if (wordIndex === index) {
        return { ...word, [field]: value };
      }
      return word;
    });
    setWords(updatedWords);
  };

  const removeWord = (indexToRemove) => {
    if (words.length === 1) return;
    setWords(words.filter((_, index) => index !== indexToRemove));
  };

  const createFlashcard = async () => {
    if (!user || loading) return;
    if (!cardName.trim()) {
      alert("Картын нэрийг оруулна уу!");
      return;
    }

    const validWords = words.filter(
      (w) => w.mnWord.trim() !== "" && w.enWord.trim() !== ""
    );

    if (validWords.length !== words.length) {
      alert("Ядаж нэг бүтэн монгол болон англи үг оруулна уу!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/flashcard/create-card`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          name: cardName,
          description: description,
          words: validWords,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("Картыг амжилттай үүсгэлээ! 🎉");
        router.push("/");
      } else {
        alert(`Алдаа гарлаа: ${data.message || "Үүсгэж чадсангүй"}`);
      }
    } catch (error) {
      console.error("Create flashcard error:", error);
      alert("Сервертэй холбогдоход алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return <p className="p-8">Уншиж байна...</p>;
  if (!user) return <p className="p-8"><Link href="/login">Quiz үүсгэхийн тулд нэвтэрнэ үү</Link></p>;
  return (
    <div className="p-8 max-w-lg mx-auto bg-white text-black rounded-xl shadow-lg my-10 border border-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-center">Шинэ Quiz үүсгэх</h1>

      <div className="mb-6 space-y-3">
        <input
          type="text"
          placeholder="Quiz-ийн нэр (жишээ нь: IELTS Шинэ үгс)..."
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          className="w-full border p-3 rounded-lg border-gray-300 focus:outline-blue-500 font-medium"
        />
        <input
          type="text"
          placeholder="Тайлбар (Заавал бичих шаардлагагүй)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 text-sm rounded-lg border-gray-300 focus:outline-blue-500"
        />
      </div>

      <h2 className="font-semibold mb-2 text-gray-700">Үгсийн жагсаалт:</h2>
      <div className="space-y-3 mb-6">
        {words.map((word, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              placeholder="Монгол үг"
              value={word.mnWord}
              onChange={(e) => handleWord(e.target.value, index, "mnWord")}
              className="border p-2 w-1/2 rounded-lg border-gray-300 text-sm focus:outline-blue-500"
            />
            <input
              placeholder="Англи үг"
              value={word.enWord}
              onChange={(e) => handleWord(e.target.value, index, "enWord")}
              className="border p-2 w-1/2 rounded-lg border-gray-300 text-sm focus:outline-blue-500"
            />
            {words.length > 1 && (
              <button
                type="button"
                onClick={() => removeWord(index)}
                className="text-red-500 font-bold px-2 hover:bg-red-50 rounded"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={addWord}
          className="border border-blue-600 text-blue-600 font-semibold py-2 rounded-lg hover:bg-blue-50 transition"
        >
          + Үг нэмэх
        </button>

        <button
          type="button"
          onClick={createFlashcard}
          disabled={loading}
          className="bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? "Үүсгэж байна..." : "Флашкард үүсгэх"}
        </button>
      </div>
    </div>
  );
}