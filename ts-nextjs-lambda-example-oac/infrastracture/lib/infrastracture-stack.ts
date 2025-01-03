import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { CloudFront } from "./CloudFront";
import { LambdaFunctionStack } from "./lambda-function-stack";

export class MainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambda = new LambdaFunctionStack(this, "LambdaFunctionStack");
    new CloudFront(this, "CloudFront", lambda.function, lambda.functionUrl);
  }
}
