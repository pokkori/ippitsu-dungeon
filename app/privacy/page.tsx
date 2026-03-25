import Link from "next/link";
export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0D1117] to-[#1a1a2e] p-6">
      <div className="max-w-2xl mx-auto backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-6">プライバシーポリシー</h1>
        <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
          <section>
            <h2 className="font-bold text-base text-white mb-2">1. 収集する情報</h2>
            <p>本アプリはゲームの進行状況（最高到達階層、スコア等）をお使いのブラウザのlocalStorageに保存します。この情報は端末内にのみ保存され、外部サーバーには送信されません。</p>
          </section>
          <section>
            <h2 className="font-bold text-base text-white mb-2">2. 個人情報の取得</h2>
            <p>本アプリは個人情報（氏名、メールアドレス等）を一切収集しません。アカウント登録は不要です。</p>
          </section>
          <section>
            <h2 className="font-bold text-base text-white mb-2">3. アクセス解析</h2>
            <p>本サイトではサービス改善のためアクセス解析ツールを使用することがあります。これらのツールはCookieを使用することがありますが、個人を特定する情報は収集しません。</p>
          </section>
          <section>
            <h2 className="font-bold text-base text-white mb-2">4. お問い合わせ</h2>
            <p>プライバシーに関するお問い合わせは X(Twitter): @levona_design へのDMにてお願いいたします。</p>
          </section>
          <section>
            <h2 className="font-bold text-base text-white mb-2">5. 改定</h2>
            <p>本ポリシーは必要に応じて改定することがあります。</p>
            <p className="mt-1 text-gray-500">制定日: 2026年3月 / 運営: ポッコリラボ</p>
          </section>
        </div>
        <div className="mt-8">
          <Link href="/" className="text-yellow-400 hover:underline text-sm">← トップへ戻る</Link>
        </div>
      </div>
    </main>
  );
}
