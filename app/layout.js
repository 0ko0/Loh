import './globals.css';

export const metadata = {
  title: 'Lurix Hub',
  description: 'Lurix Hub Official',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#050608] text-white antialiased overflow-x-hidden selection:bg-[#6E96FF]/30 selection:text-[#6E96FF]">
        {children}
      </body>
    </html>
  );
}
