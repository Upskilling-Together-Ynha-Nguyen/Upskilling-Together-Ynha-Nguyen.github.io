import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'ABC Tutoring | A little support. A lot of possibility.',description:'Find a friendly K–12 tutor for math, science, and reading. Book online or in person without an account.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
