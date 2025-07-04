# Metabot リファクタリング概要

## 実施した主な改善点

### 1. API関連ユーティリティの統合
- **新規作成**: `lib/openaiClient.js` - OpenAI APIの統一クライアント
- axiosとfetchの混在を解消し、fetchに統一
- エラーハンドリングの一元化

### 2. オーディオ関連モジュールの統合  
- **新規作成**: `lib/audioManager.js` - オーディオ機能の基底クラス
- 録音、再生、ボタン作成機能を統合
- Web Audio APIの処理を整理

### 3. UIコンポーネントの共通化
- **新規作成**: `lib/uiComponents.js` - UIコンポーネントの統一管理
- Modal、ApiKeyModal、MicButtonクラスを実装
- ボタン作成処理の重複を解消

### 4. 設定管理の集約化
- **新規作成**: `lib/config.js` - アプリケーション設定の一元管理
- バージョン情報、API設定、UI設定などを集約

### 5. 煩雑な処理の整理と関数化
- **新規作成**: `lib/arScene.js` - AR/3Dシーン管理クラス
- **新規作成**: `lib/conversationManager.js` - 会話機能の管理クラス
- **新規作成**: `lib/utils.js` - 汎用ユーティリティ関数
- index.jsを完全に書き直し、クラスベースの構造に

### 6. 命名規則の統一
- ファイル名をcamelCaseに統一（DeviceOrientationControls.js → deviceOrientationControls.js）
- 関数名、変数名の一貫性を向上

### 7. コード品質の向上
- 不要なコメントアウトコードを削除
- 未使用の依存関係（axios）を削除
- エラーハンドリングの改善

## ファイル構成の変更

### 新規作成ファイル
- `lib/openaiClient.js` - OpenAI API統合クライアント
- `lib/audioManager.js` - オーディオ管理基底クラス
- `lib/uiComponents.js` - UIコンポーネント集
- `lib/arScene.js` - AR/3Dシーン管理
- `lib/conversationManager.js` - 会話フロー管理
- `lib/config.js` - 設定管理
- `lib/utils.js` - ユーティリティ関数

### 更新されたファイル
- `index.js` - メインアプリケーションロジック（完全書き直し）
- `lib/chatCompletions.js` - OpenAIClientを使用するよう更新
- `lib/transcribeAudio.js` - OpenAIClientを使用するよう更新
- `lib/textToSpeech.js` - OpenAIClientを使用するよう更新
- `lib/soundPlayer.js` - AudioManagerを継承するよう更新
- `lib/appendMp3button.js` - AudioManagerを使用するよう更新
- `lib/createMicButton.js` - UIComponentsを使用するよう更新

### リネームされたファイル
- `lib/DeviceOrientationControls.js` → `lib/deviceOrientationControls.js`

## 注意事項
- 既存の動作は保持されています
- APIの互換性は維持されています
- エラーハンドリングが強化されています