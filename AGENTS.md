Cursor Rule for 8hours (macOS Native App)

# アナログ調ポモロードタイマー（9時間固定モデル）実装仕様書 (AGENT.md)

本書は、Macの最前面に透過で常駐する、アナログ調の9時間固定タイマーおよびTODO管理機能を備えたデスクトップアプリケーションの実装仕様書です。Tauri と React (Vite) を用いた実装方法、およびデザイン再現のための具体的な構造を網羅しています。

## 前提条件

- 回答は必ず日本語でしてください。
- コードの変更をする際、変更量が200行を超える可能性が高い場合は、事前にユーザーに確認をとるようにしてください。
- 何か大きい変更を加える場合、まず何をするのかTODOと計画を立てた上で、ユーザーに提案して確認をとってください。

---

## 1. アプリケーション概要と基本仕様

### 1.1 基本要件
- **動作環境**: macOS (デスクトップ常駐型アプリ)
- **ウィンドウ仕様**: 
  - 常に最前面表示 (`alwaysOnTop: true`)
  - タイトルバー・外枠非表示 (`decorations: false`)
  - 背景の完全透過 (`transparent: true`)
  - アプリ外周部のドラッグ移動対応
- **コア機能**:
  - **9時間固定アナログ調タイマー**: 最大9時間を管理。時間が減るにつれて黄色のインジケータ（円弧）が減少。中央にデジタル残時間を同期表示。
  - **コントローラー**: 画面左側に飛び出たインデックス型の「RESET」ボタンと「PAUSE / START」ボタン。
  - **TODOリスト**: タイマー下部にシームレスに結合された、丸みを帯びた立体的なカプセル形状のタスク管理（未完了：ピンク / 完了：灰色）。

---

## 2. 技術スタック

- **デスクトップ環境**: Tauri v2
- **フロントエンド**: React (TypeScript / Vite)
- **スタイリング**: CSS (conic-gradient, WebkitAppRegion によるドラッグ制御)
- **状態管理**: React Hooks (`useState`, `useEffect`)
- **通知**: `@tauri-apps/plugin-notification`
- **単体テスト**: Vitest, React Testing Library, MSW
- **E2Eテスト**: Playwright
- **ドキュメント整形**: Prettier (保存時に整形する)

---

## 3. Tauri 設定ファイルの構成

タイトルバーの非表示、最前面固定、背景の完全透過を実現するため、`src-tauri/tauri.conf.json` の `window` セクションを以下のように定義します。

```json
{
 "productName": "8hours",
 "version": "1.0.0",
 "identifier": "com.eighthours.app",
 "app": {
 "windows": [
 {
 "title": "8hours",
 "width": 219,
 "height": 366,
 "resizable": false,
 "fullscreen": false,
 "decorations": false,
 "transparent": true,
 "alwaysOnTop": true
 }
 ]
 }
}
```
