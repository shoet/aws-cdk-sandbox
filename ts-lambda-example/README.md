# TypeScript で Lambda をデプロイするサンプル

```
mkdir ts-lambda-example
cd ts-lambda-example
cdk init app --language typescript

cdk deploy
```

```
$ cdk list

...
prod/TsLambdaExample (prod-TsLambdaExample)
prod/TsLambdaExample/LambdaStack (prod-TsLambdaExampleLambdaStackD705CA94)
dev/TsLambdaExample (dev-TsLambdaExample)
dev/TsLambdaExample/LambdaStack (dev-TsLambdaExampleLambdaStackD705CA94)

$ STAGE=dev cdk deploy "dev/**"
$ STAGE=prod cdk deploy "prod/**"

$ make deploy STAGE=dev
$ make deploy STAGE=prod
```
