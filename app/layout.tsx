import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "./_providers/userContext";
import Navigation from "./_providers/navigation";

export const metadata: Metadata = {
  title: "Flashcard",
  description: "Монгол, англи үг цээжлэх дасгал",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="mn"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col"><UserProvider><Navigation />{children}</UserProvider></body>
    </html>
  );
}
