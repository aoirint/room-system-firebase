# room-system-firebase
このリポジトリは、以下の構成になっています。

- Microsoft TeamsからのOutgoing Webhookを受け取りRealtime Databaseに保存するCloud Functions（Node.js 8）
- Realtime Databaseのルール

## 設定
Microsoft Teams Outgoing Webhookのシークレットを設定します。
`SECRET_KEY`の部分を置き換えてください。

```bash
firebase functions:config:set bell.secret=SECRET_KEY
```

## デプロイ
事前に`./functions`内で`npm install`しておいてください。

```bash
firebase deploy
```
