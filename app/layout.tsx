import type { Metadata } from 'next';
import { DM_Sans, Syne, DM_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const syne   = Syne({ subsets: ['latin'], variable: '--font-syne', weight: ['400','600','700','800'] });
const dmMono = DM_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400','500'] });

export const metadata: Metadata = {
  title: 'StandupLoop',
  description: 'Daily standup tracker for Teams',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${syne.variable} ${dmMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
