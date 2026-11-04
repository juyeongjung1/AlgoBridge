# 回帰テスト

プロジェクトのルートで実行します。テストはアプリの入力・採点・コード生成・実行結果を読み込みます。テスト専用のサーバーは不要です。

## 判定・入力・出力・Javaの検証

Node.jsとJDK 17以上が必要です。`java`と`javac`にPATHを通してください。

```powershell
node tests/problem-regression.cjs
```

全30問、宣言順・別解・誤配置・入力範囲・トレースを検証し、生成したJavaの実行結果を独立した期待値と比較します。JavaのソースとclassはOSの一時ディレクトリへ出力します。失敗時は終了コード1になります。

## ブラウザの検証

Microsoft Edgeと、Node.jsから読み込めるPlaywrightが必要です。

```powershell
node tests/browser-regression.cjs
```

Playwrightがプロジェクト外にある場合は、その`node_modules`ディレクトリを環境変数`AUDIT_MODULES`に指定できます。

全問の模範配置、表示、コード対応、分岐幅、保存、取り消し、入れ子ドラッグ、講師モード等を検証します。新規ブラウザ環境を使うため、普段の正解履歴には触れません。図の検証画像はOSの一時ディレクトリへ保存します。

これらの開発用ランタイムは、通常のアプリ利用には不要です。
