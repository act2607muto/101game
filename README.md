# 101（ワンオーワン）

トランプゲーム「101」のオンライン対戦版。各自のスマホで2〜6人対戦できます。

## 遊び方
1. `index.html` を開く（GitHub Pages で公開すると全員が同じURLで遊べます）
2. 1人が「部屋をつくる」→ 表示された4桁コードを共有
3. 他の人は「コードで参加する」からコードを入力
4. ホストが「ゲームを始める」

## GitHub Pages で公開
Settings → Pages → Source: `Deploy from a branch` → Branch: `main` / `(root)` → Save
数分後 `https://act2607muto.github.io/101game/` で遊べます。

## ファイル構成
- `index.html` … 画面とゲームのコード
- `js/dc-runtime.js` … 画面を描くための仕組み（Claude Design の書き出しに含まれていたもの。編集しない）
- `js/vendor/` … React 18.3.1
- `favicon.svg` / `og.png` … タブのアイコンと、リンクを共有したときの画像

フォントは Google Fonts から読み込みます。

## Firebase のデータ
- `rooms101/<ルームコード>/` … 部屋ごとのデータ
  - `host` … ホストのID
  - `state` … 全員が見る場の情報（手札と山札の中身は入れない）
  - `msgs` / `pres` / `hb` … 参加・操作の連絡、接続状況、ホストの生存確認
- `hands101/<ルームコード>/<プレイヤーID>` … ゲストそれぞれの手札（本人だけが読める）

## Firebase の設定
セキュリティルールは `database.rules.json` にあります。設定は次の順番で行ってください（順番を逆にすると、古いページが動かなくなります）。
1. この版を `main` に入れて、GitHub Pages に反映されたことを確認する
2. Firebase コンソール → Authentication → ログイン方法 →「匿名」を有効にする
3. Realtime Database → ルール に `database.rules.json` の中身を貼り付けて「公開」する

ルールを入れると、ほかの人の手札を読む・場の情報を書き換える・ホストを乗っ取る・他人の部屋を消す、といった操作が拒否されます。
