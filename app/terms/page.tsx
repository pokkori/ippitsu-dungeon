import Link from "next/link";
export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0D1117] to-[#1a1a2e] p-6">
      <div className="max-w-2xl mx-auto backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-6">利用規約</h1>
        <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
          <section>
            <h2 className="font-bold text-base text-white mb-2">第1条（適用）</h2>
            <p>本規約は、ポッコリラボが提供する「一筆書きダンジョン」（以下「本サービス」）の利用に関して適用されます。</p>
          </section>
          <section>
            <h2 className="font-bold text-base text-white mb-2">第2条（利用条件）</h2>
            <p>本サービスは無料でご利用いただけます。利用にあたって登録は不要です。</p>
          </section>
          <section>
            <h2 className="font-bold text-base text-white mb-2">第3条（禁止事項）</h2>
            <p>法令または公序良俗に違反する行為、本サービスの運営を妨害する行為、不正なアクセスを試みる行為を禁止します。</p>
          </section>
          <section>
            <h2 className="font-bold text-base text-white mb-2">第4条（免責事項）</h2>
            <p>当社は本サービスの内容について、正確性・完全性・有用性を保証しません。本サービスの利用によって生じた損害について、当社は一切の責任を負いません。</p>
          </section>
          <section>
            <h2 className="font-bold text-base text-white mb-2">第5条（変更）</h2>
            <p>当社は必要に応じて本規約を変更することがあります。</p>
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
