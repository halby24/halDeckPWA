# halDeskPWA

ジェネリックオレオレStreamDeck

## 依存ライブラリなど

- Node.js 20

## 環境構築

1. プロジェクトをクローンする。
1. プロジェクトルートでnpm install (pnpm i) する。
1. mkcertなどでSSL証明書を作成してcertsディレクトリに配置する。
1. スマホにサーバー証明書を登録する。
1. /.env.exampleと/src/deckconfig.toml.exampleをそれぞれ/.envと/src/deckconfig.tomlにコピーする。
1. /.envと/src/deckconfig.tomlをいい感じに設定する。

## 使い方

1. プロジェクトルートでnpm run devしてサーバーを起動する。
1. スマホからアクセスしてホーム画面に登録する。
1. アプリっぽく使える。

## deckconfig.tomlについて

- volume
  - modeはほとんどの場合'system'でよい。
  - 'totalmixfx'にするとRME TotalMix FXのボリュームを操作できる。この場合TotalMixFXでOSCを有効にし、ポート設定などをしておく必要がある。
- desktop.switch
  - nameにSwitch対象の仮想デスクトップの名前を設定する
  - bodyはボタンの本文
- app
  - nameにアプリ名(hoge.exeのhogeの部分)を設定する
  - bodyはボタンの本文
  - modeはopenまたはlaunchを設定する。openはすでに起動している場合はそのウィンドウをアクティブにする。
