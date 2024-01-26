# halDeskPWA

## 概要

ジェネリックオレオレStreamDeck

## 依存ライブラリなど

- Node.js 20

## 環境構築

1. プロジェクトをクローンする。
2. プロジェクトルートでnpm install (pnpm i) する。
3. mkcertなどでSSL証明書を作成して

## 使い方

1. プロジェクトルートでnpm run devしてサーバーを起動する。
1. スマホからアクセスしてホーム画面に登録する。
1. アプリっぽく使える。

## deckconfig.tomlについて

- desktop.switch
  - nameにSwitch対象の仮想デスクトップの名前を設定する
  - bodyはボタンの本文
- app
  - nameにアプリ名(hoge.exeのhogeの部分)を設定する
  - bodyはボタンの本文
  - modeはopenまたはlaunchを設定する。openはすでに起動している場合はそのウィンドウをアクティブにする。