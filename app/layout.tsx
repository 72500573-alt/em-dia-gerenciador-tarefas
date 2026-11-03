import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Em dia | Suas tarefas, com clareza',description:'Organize tarefas, prioridades e prazos em um só lugar.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) { return <html lang="pt-BR"><body>{children}</body></html>; }
