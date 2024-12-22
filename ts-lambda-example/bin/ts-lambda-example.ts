#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { TsLambdaExampleStack } from "../lib/ts-lambda-example-stack";

const stages = ["dev", "prod"];
const stage = process.env.STAGE || "dev";

if (!stages.includes(stage)) {
  throw new Error("Invalid STAGE");
}

const app = new cdk.App();

const stageConfig = app.node.tryGetContext(stage);

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    new TsLambdaExampleStack(this, `LambdaStack`, {
      ...props,
      lambda: stageConfig.lambda,
    });
  }
}

export class AppStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    new AppStack(this, `TsLambdaExample`, props);
  }
}

for (const stage of stages) {
  new AppStage(app, stage);
}
