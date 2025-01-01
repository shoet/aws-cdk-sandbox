import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { VPCStack, DynamoDB, ECS, S3Stack } from "./constructs";

export class NetworkStack extends cdk.Stack {
  public readonly vpcStack: VPCStack;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpcStack = new VPCStack(this, "VPCStack");
  }
}

export class ServiceStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    vpc: cdk.aws_ec2.Vpc,
    ddb: DynamoDB
  ) {
    super(scope, id);

    new ECS(this, "BackendService", vpc, ddb.table);
  }
}

export class DatabaseStack extends cdk.Stack {
  public readonly ddb: DynamoDB;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.ddb = new DynamoDB(this, "Database");
  }
}

export class InfrastractureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const database = new DatabaseStack(this, "Database");
    const network = new NetworkStack(this, "Network");
    const service = new ServiceStack(
      this,
      "Service",
      network.vpcStack.vpc,
      database.ddb
    );
    new S3Stack(this, "WebBucket");
  }
}
