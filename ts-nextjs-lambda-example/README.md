# Next.js を LambdaFunctionsURL でデプロイするサンプル

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
```
