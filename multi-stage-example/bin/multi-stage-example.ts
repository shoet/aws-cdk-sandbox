#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { MultiStageExampleStack } from "../lib/multi-stage-example-stack";
import * as dotenv from "dotenv";

const app = new cdk.App();

console.log("DOTENV_PATH", process.env.DOTENV_PATH);
console.log("NODE_ENV", process.env.NODE_ENV);

dotenv.config({ path: process.env.DOTENV_PATH });
console.log("process.env.CIDR", process.env.CIDR);

const stage = process.env.STAGE;
if (!stage) {
  throw new Error("Missing environment variable STAGE");
}

new MultiStageExampleStack(app, `MultiStageExampleStack-${stage}`, {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */
  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
