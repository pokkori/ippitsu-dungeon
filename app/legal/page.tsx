import Link from "next/link";
export default function LegalPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0D1117] to-[#1a1a2e] p-6">
      <div className="max-w-2xl mx-auto backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-6">特定商取引法に基づく表記</h1>
        <table className="w-full text-gray-300 text-sm">
          <tbody>
            <tr className="border-b border-white/10"><td className="py-3 pr-4 font-medium text-white w-36">販売業者</td><td className="py-3">ポッコリラボ</td></tr>
            <tr className="border-b border-white/10"><td className="py-3 pr-4 font-medium text-white">運営責任者</td><td className="py-3">代表 新美</td></tr>
            <tr className="border-b border-white/10"><td className="py-3 pr-4 font-medium text-white">所在地</td><td className="py-3">〒475-0077 愛知県半田市元山町</td></tr>
            <tr className="border-b border-white/10"><td className="py-3 pr-4 font-medium text-white">お問い合わせ</td><td className="py-3">X(Twitter): @levona_design へのDM</td></tr>
            <tr className="border-b border-white/10"><td className="py-3 pr-4 font-medium text-white">価格</td><td className="py-3">無料（基本機能）</td></tr>
            <tr className="border-b border-white/10"><td className="py-3 pr-4 font-medium text-white">返品・解約</td><td className="py-3">デジタルコンテンツのため返品不可</td></tr>
          </tbody>
        </table>
        <div className="mt-8">
          <Link href="/" className="text-yellow-400 hover:underline text-sm">← トップへ戻る</Link>
        </div>
      </div>
    </main>
  );
}
