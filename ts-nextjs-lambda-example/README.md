# Next.js を LambdaFunctionsURL でデプロイするサンプル

### 初期構築

```
$ mkdir ts-nextjs-lambda-example
$ cd ts-nextjs-lambda-example

# インフラ用のディレクトリを作成
$ mkdir infrastracture
$ cd infrastracture
$ cdk init app --language typescript

# Next.jsプロジェクトの作成
$ cd ts-nextjs-lambda-example
$ mkdir application
$ cd application
$ npx create-next-app@latest --ts .
$ npm run dev
```

### Next.js アプリの準備

- Standalone モード有効
- Dockerfile 作成
- LambdaWebAdapter のインポート

### CDK でデプロイ

- Lambda を Docker イメージでデプロイ
- FunctionURLs でデプロイ

### (オプション) ResponseStreaming の設定

- Suspense
- Mode を ResponseStreaming にする

