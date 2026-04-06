'use client';

interface ShareButtonProps {
  text: string;
}

export default function ShareButton({ text }: ShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert('コピーしました！');
    }
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleShare}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg className="w-4 h-4 mr-1 inline-block" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 2v10M6 6l4-4 4 4M4 14v2a2 2 0 002 2h8a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> シェア
      </button>
      <button
        onClick={handleTwitter}
        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        𝕏 ポスト
      </button>
    </div>
  );
}
