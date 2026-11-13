# Flashcard

Монгол, англи үгтэй багц үүсгэж, орчуулга бичиж дасгал хийх апп.

## Ажиллуулах

Node.js 22.13+ эсвэл 24 ашиглана.

Backend (`../flashcard-be`):

```sh
npm install
cp .env.example .env
# .env дотор MONGODB_URI болон JWT_SECRET тохируулна.
npm start
```

Одоо байгаа `.env` файлыг дарж хуулж болохгүй. Backend MongoDB-тэй холбогдсоны дараа 7878 порт дээр асна.

Frontend (энэ хавтас):

```sh
npm install
npm run dev
```

http://localhost:3000 нээнэ. API хаягийг өөрчлөх бол `.env.local` дотор `NEXT_PUBLIC_API_URL` тохируулна (`.env.example` харна уу).

Бүртгүүлэх → нэвтрэх → багц үүсгэх → Багцууд цэсээс дасгал хийх. Хэрэглэгч өөрийн багцуудыг харна. Нэвтрэх эрх 1 цагийн дараа дуусна.

## Шалгах

```sh
npm run lint
npm run build
```

Backend хавтсанд `npm test`: MongoDB-г орлуулсан API тест, бодит өгөгдөл өөрчлөхгүй.

Энэ орчинд Turbopack порт нээхэд алдаа гаргасан тул dev/build нь Webpack ашиглана.
