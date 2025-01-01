import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";

export class DynamoDB extends Construct {
  public readonly table: cdk.aws_dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // DynamoDB
    this.table = new cdk.aws_dynamodb.Table(this, "TodoTable", {
      tableName: "TodoTable",
      partitionKey: {
        name: "id",
        type: cdk.aws_dynamodb.AttributeType.NUMBER,
      },
      deletionProtection: false,
    });
  }
}
