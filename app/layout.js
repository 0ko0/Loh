import './globals.css';

export const metadata = {
  title: 'Lurix Hub',
  description: 'you gay',
  viewport: 'width=device-[#width], initial-scale=1, maximum-scale=1, user-scalable=no',
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