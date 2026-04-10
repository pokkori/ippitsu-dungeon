import type { Metadata } from 'next';
import './globals.css';
import OrbBackground from '@/components/OrbBackground';

export const metadata: Metadata = {
  metadataBase: new URL('https://ippitsu-dungeon.vercel.app'),
  title: '一筆書きダンジョン - One Stroke Dungeon',
  description: 'NxNグリッドのダンジョンを一筆書きで全マス踏破し、モンスターを倒しながら階層を進むパズルRPG',
  openGraph: {
    title: '一筆書きダンジョン',
    description: '全マスを一筆で踏破してダンジョンを攻略せよ！',
    type: 'website',
  },
};


const _faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "このゲームは無料で遊べますか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "はい、基本プレイは完全無料でお楽しみいただけます。ブラウザから即座にプレイ開始できます。"
      }
    },
    {
      "@type": "Question",
      "name": "スマートフォンでも遊べますか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "はい、スマートフォン・タブレット・PCすべてに対応しています。ブラウザからそのままプレイできます。"
      }
    },
    {
      "@type": "Question",
      "name": "アプリのダウンロードは必要ですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ダウンロード不要です。ブラウザを開いてアクセスするだけですぐに遊べます。"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(_faqLd) }}
        />

        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#0D1117" />
      </head>
      <body className="min-h-dvh">
        <OrbBackground theme="game" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <main className="mx-auto max-w-md min-h-dvh flex flex-col">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
