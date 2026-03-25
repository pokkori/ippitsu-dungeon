# このサービスの品質ルール（必読・省略不可）

## ★ 絶対禁止
- JSX/TSXの中に絵文字を書かない（全て禁止）
- SVGアイコンまたはテキストで代替すること

## ★ aria-label（QAゲート）
- 全てのButton/Link/inputに aria-label 必須

## ★ Streaming
- Claude API呼び出しは必ず ReadableStream で実装

## ★ グラスモーフィズム
- 主要カード: className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl"

## ★ タッチターゲット
- 全ボタン: min-h-[44px] min-w-[44px]

## ★ OGP
- og:imageは絶対URL（https://から始まる）

## ★ ビルド確認
- npm run build でエラーゼロを確認してからgit push

## ★ 法的ページ
- /legal（特商法）/ /privacy / /terms の3ページ必須

## ★ GEO対策
- public/llms.txt が存在するか確認
