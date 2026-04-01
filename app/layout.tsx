import type { Metadata } from 'next';
import './globals.css';
import OrbBackground from '@/components/OrbBackground';

export const metadata: Metadata = {
  title: '一筆書きダンジョン - One Stroke Dungeon',
  description: 'NxNグリッドのダンジョンを一筆書きで全マス踏破し、モンスターを倒しながら階層を進むパズルRPG',
  openGraph: {
    title: '一筆書きダンジョン',
    description: '全マスを一筆で踏破してダンジョンを攻略せよ！',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#0D1117" />
      </head>
      <body className="min-h-dvh">
        <OrbBackground />
        <div style={{ position: "relative", zIndex: 1 }}>
          <main className="mx-auto max-w-md min-h-dvh flex flex-col">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
