import type { Metadata } from 'next';
import { Fredoka, Nunito, Comfortaa } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import './globals.css';

const fredoka = Fredoka({
  subsets: ['latin', 'latin-ext', 'hebrew'],
  variable: '--font-fredoka',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-nunito',
  display: 'swap',
});

const comfortaa = Comfortaa({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-comfortaa',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Evan's Story Studio",
  description:
    'A magical bedtime story generator with beautiful illustrations',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      data-theme="mystical"
      data-mode="dark"
      className={`${fredoka.variable} ${nunito.variable} ${comfortaa.variable}`}
    >
      <body className="min-h-screen bg-bg-primary text-text-primary antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
