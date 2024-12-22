import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";

export class TsLambdaExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const functionProps: NodejsFunctionProps = {
      functionName: "ExampleLambdaFunction", // 関数名
      entry: "src/index.ts", // ファイルの場所
      handler: "handler", // エクスポートした関数名
      runtime: Runtime.NODEJS_20_X, // ランタイム
    };
    new NodejsFunction(this, "ExampleLambdaFunction", functionProps);
  }
}
