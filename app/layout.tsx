import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import { PortfolioProvider } from "@/lib/portfolio-context";
import AdminModal from "@/components/AdminModal";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mohammadrahil Nasardi | Data Science & Analytics | ML & GenAI Engineer",
  description: "Portfolio of Mohammadrahil Nasardi — B.E. CSE (AI&ML) student, Data Science & Analytics specialist, ML Engineer, and GenAI Developer.",
  openGraph: {
    title: "Mohammadrahil Nasardi | Data Science & Analytics Portfolio",
    description: "Data Science, Machine Learning, RAG, and Federated Learning systems portfolio.",
    url: "https://rahilnasardi.com",
    siteName: "Mohammadrahil Nasardi Portfolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mohammadrahil Nasardi | Data Science & AI Engineer",
    description: "Data Science, Machine Learning, and GenAI Portfolio.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <PortfolioProvider>
            <ScrollProgress />
            <Navbar />
            {children}
            <AdminModal />
          </PortfolioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

