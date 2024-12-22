import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";

type LambdaProps = {
  memorySize?: number;
};

export class TsLambdaExampleStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: cdk.StageProps & { lambda: LambdaProps }
  ) {
    super(scope, id, props);

    const { lambda } = props;
    const { memorySize = 256 } = lambda;

    const functionProps: NodejsFunctionProps = {
      entry: "src/index.ts", // ファイルの場所
      handler: "handler", // エクスポートした関数名
      runtime: Runtime.NODEJS_20_X, // ランタイム
      memorySize, // メモリサイズ
    };
    new NodejsFunction(this, "ExampleLambdaFunction", functionProps);
  }
}
