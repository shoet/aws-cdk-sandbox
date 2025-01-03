import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { LambdaFunctionStack } from "../lib/lambda-function-stack";

export class MainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new LambdaFunctionStack(this, "LambdaFunctionStack");
  }
}
