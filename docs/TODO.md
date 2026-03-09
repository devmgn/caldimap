# TODO: Vercel Cron + Blob Scraper

## 堅牢性

- [ ] スクレイプ結果の0件ガード — fetchStores/fetchSalesが0件の場合、Blobの既存データを上書きしない
- [ ] fetchStores/fetchSalesのHTTPエラーハンドリング — res.okチェックを追加

## テスト

- [ ] scraper.tsのユニットテスト — parseDateRange, parseServiceIcons, buildStoresData（外部fetchはモック）
- [ ] blob.tsのユニットテスト — getStoresData, putStoresData（@vercel/blobをモック）
- [ ] /api/scrape route.tsのユニットテスト — 認証チェック(401)、環境変数未設定(500)、正常系

## 機能改善

- [ ] 住所変更時の再ジオコーディング — キャッシュ時にIDだけでなく住所も比較し、変更があれば再ジオコーディング

## Storybook

- [ ] SaleFilterストーリー — セール有り/無し/複数セールのバリエーション
- [ ] StoreMarkerストーリー — active/upcoming/noneの各セールステータス

## 設定

- [ ] maxDuration設定 — route.tsにroute segment configでmaxDurationを設定（Hobbyプラン上限60s）
