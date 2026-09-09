import type { Metadata } from "next";
import localFont from "next/font/local";
// CSS is handled by Next.js at build time and has no TypeScript module declaration.
// @ts-expect-error -- intentional side-effect import of a stylesheet
import "./globals.css";

// const geistSans = Geist({
//     variable: "--font-geist-sans",
//     subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//     variable: "--font-geist-mono",
//     subsets: ["latin"],
// });

// const montserrat = Montserrat({
//     subsets: ['latin'],
//     weight: ['400', '500', '600', '700'],
//     variable: '--font-montserrat',
// });

const montserrat = localFont({
    src: [
        { path: "../fonts/Montserrat-Regular.woff2", weight: "400", style: "normal" },
        { path: "../fonts/Montserrat-Medium.woff2", weight: "500", style: "normal" },
        { path: "../fonts/Montserrat-SemiBold.woff2", weight: "600", style: "normal" },
        { path: "../fonts/Montserrat-Bold.woff2", weight: "700", style: "normal" },
    ],
    variable: "--font-montserrat",
});

export const metadata: Metadata = {
    title: "Sistema Tickets - EMETRA",
    description: "Portal administrativo para la gestión de tickets del departamento de informática de EMETRA",
};


export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={montserrat.variable}>
                {children}
            </body>
        </html>
    );
}
