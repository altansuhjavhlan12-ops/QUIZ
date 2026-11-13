'use client';

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { API_URL } from "../_providers/api";
import { useUser } from "../_providers/userContext";

type Word = {
  _id: string;
  mnWord: string;
  enWord: string;
};

type Card = {
  _id: string;
  user: string;
  name: string;
  description?: string;
  words?: Word[];
  createdAt: string;
  updatedAt: string;
};

export default function Page() {
  const { user, ready, logout } = useUser();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checking = useRef(false);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const [cards, setCards] = useState<Card[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const deleting = useRef(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  
  // Дасгал ажиллах төлөвүүд
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputAnswer, setInputAnswer] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Backend-ээс картуудыг татаж авах
  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    const fetchCards = async () => {
      try {
        const res = await fetch(`${API_URL}/flashcard/get-card`, { headers: { Authorization: `Bearer ${user.token}` }, signal: controller.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Картууд татахад алдаа гарлаа");
        if (data.success) {
          setCards(data.data);
        }
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Сервертэй холбогдож чадсангүй");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchCards();
    return () => controller.abort();
  }, [user]);

  const handleDeleteCard = async (card: Card) => {
    if (!user || deleting.current) return;
    if (!window.confirm(`“${card.name}” Quiz болон бүх үгийг устгах уу?`)) return;
    deleting.current = true;
    setDeletingId(card._id);
    setDeleteError("");
    try {
      const res = await fetch(`${API_URL}/flashcard/delete-card/${card._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Quiz устгахад алдаа гарлаа");
      setCards((previous) => previous.filter((item) => item._id !== card._id));
    } catch (error) {
      setDeleteError(error instanceof TypeError ? "Сервертэй холбогдож чадсангүй. Дахин оролдоно уу." : error instanceof Error ? error.message : "Quiz устгахад алдаа гарлаа");
    } finally {
      deleting.current = false;
      setDeletingId(null);
    }
  };

  // Карт сонгож дасгалыг эхлүүлэх
  const handleSelectCard = (card: Card) => {
    checking.current = false;
    setSelectedCard(card);
    setCurrentIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setIsFinished(false);
    setFeedback(null);
    setInputAnswer('');
  };

  // Хариулт шалгах функц
  const handleCheckAnswer = () => {
    if (checking.current || !inputAnswer.trim()) return;
    if (!selectedCard?.words || selectedCard.words.length === 0) return;

    checking.current = true;
    const currentWord = selectedCard.words[currentIndex];
    const isCorrect = inputAnswer.trim().toLowerCase() === currentWord.enWord.trim().toLowerCase();

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      setFeedback('Зөв байна! ✅');
    } else {
      setWrongCount((prev) => prev + 1);
      setFeedback(`Буруу байна! ❌ Зөв хариулт: ${currentWord.enWord}`);
    }

    // 1.5 секундийн дараа дараагийн үг рүү шилжих
    timer.current = setTimeout(() => {
      checking.current = false;
      setFeedback(null);
      setInputAnswer('');
      if (currentIndex + 1 < selectedCard.words!.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 1500);
  };

  const back = () => { if (timer.current) clearTimeout(timer.current); checking.current = false; setSelectedCard(null); };
  if (!ready) return <p className="p-8">Уншиж байна...</p>;
  if (!user) return <p className="p-8"><Link href="/login">Quiz-үүдээ харахын тулд нэвтэрнэ үү</Link></p>;
  if (loading) return <p className="p-8">Картуудыг татаж байна...</p>;
  if (error) return <p role="alert" className="p-8">{error} <button onClick={logout}>Дахин нэвтрэх</button></p>;
  // 1. Хэрэв карт сонгоогүй бол картуудын жагсаалтыг харуулна
  if (!selectedCard) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Дасгал хийх Quiz-ээ сонгоно уу</h1>
        {deleteError && <p role="alert" className="mb-4 text-red-500">{deleteError}</p>}
        {cards.length === 0 ? (
          <p className="text-center text-gray-500">Одоогоор карт олдсонгүй...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card) => (
              <div
                key={card._id}
                className="border rounded-xl shadow hover:border-blue-500 transition bg-white text-black overflow-hidden"
              >
                <button type="button" onClick={() => handleSelectCard(card)} className="block w-full p-4 text-left cursor-pointer focus-visible:outline-blue-500">
                <h3 className="font-bold text-lg">{card.name}</h3>
                <p className="text-sm text-gray-600">{card.description || 'Тайлбаргүй'}</p>
                <p className="text-xs text-blue-500 mt-2">
                  Нийт үг: {card.words?.length || 0}
                </p>
                </button>
                <div className="px-4 pb-4">
                  <button
                    type="button"
                    onClick={() => handleDeleteCard(card)}
                    disabled={deletingId !== null}
                    aria-label={`${card.name} Quiz устгах`}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === card._id ? "Устгаж байна..." : "Устгах"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const words = selectedCard.words || [];

  // 2. Хэрэв карт дотор үг байхгүй бол
  if (words.length === 0) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <p className="text-red-500 font-bold mb-4">Энэ Quiz-д үг байхгүй байна!</p>
        <button
          onClick={back}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Буцах
        </button>
      </div>
    );
  }

  // 3. Дасгал дууссан үед нийт дүнг харуулах
  if (isFinished) {
    return (
      <div className="p-8 text-center max-w-md mx-auto border rounded-xl shadow-lg my-10 bg-white text-black">
        <h1 className="text-2xl font-bold mb-4">Дасгал дууслаа! 🎉</h1>
        <p className="text-green-600 font-semibold text-lg">Зөв хариулсан: {correctCount}</p>
        <p className="text-red-600 font-semibold text-lg">Буруу хариулсан: {wrongCount}</p>
        <p className="mt-4 font-bold text-xl">
          Нийт оновч: {Math.round((correctCount / words.length) * 100)}%
        </p>
        <button
          onClick={back}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
        >
          Өөр карт сонгох
        </button>
      </div>
    );
  }

  // 4. Үг цээжлэх үндсэн хэсэг
  return (
    <div className="p-8 max-w-md mx-auto text-center border rounded-xl shadow-lg my-10 bg-white text-black">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={back}
          className="text-xs text-gray-500 hover:underline"
        >
          ← Буцах
        </button>
        <h2 className="text-sm font-bold text-gray-400">
          Үг #{currentIndex + 1} / {words.length}
        </h2>
      </div>

      <p className="text-3xl font-extrabold my-6 text-blue-600">
        {words[currentIndex].mnWord}
      </p>

      <input
        disabled={feedback !== null}
        type="text"
        value={inputAnswer}
        onChange={(e) => setInputAnswer(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleCheckAnswer()}
        placeholder="Англи орчуулгыг бичнэ үү..."
        className="border p-3 w-full rounded-lg mb-4 text-black border-gray-300 focus:outline-blue-500"
      />

      <button
        disabled={feedback !== null || !inputAnswer.trim()}
        onClick={handleCheckAnswer}
        className="bg-blue-600 text-white px-4 py-3 rounded-lg w-full hover:bg-blue-700 font-bold transition"
      >
        Шалгах
      </button>

      {feedback && (
        <p className="mt-4 font-bold text-lg animate-pulse">{feedback}</p>
      )}
    </div>
  );
}
