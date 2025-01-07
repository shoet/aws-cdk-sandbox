import * as dotenv from "dotenv";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { VPCStack, DynamoDB, ECS, S3Stack } from "./constructs";
import { EnvironmentZodType } from "./constructs/types";
import { ACM } from "./constructs/ACM";
import { Route53 } from "./constructs/Route53";
import { RDS } from "./constructs/RDS";
import { EC2 } from "./constructs/EC2";

export class NetworkStack extends cdk.Stack {
  public readonly vpcStack: VPCStack;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpcStack = new VPCStack(this, "VPCStack");
  }
}

export class Route53Stack extends cdk.Stack {
  public readonly route53: Route53;
  constructor(
    scope: Construct,
    id: string,
    props: cdk.StackProps & {
      domainName: string;
      hostedZoneId: string;
      hostedZoneName: string;
      service: ECS;
    }
  ) {
    super(scope, id, props);

    this.route53 = new Route53(this, "Route53", {
      domainName: props.domainName,
      hostedZoneId: props.hostedZoneId,
      loadBalancer: props.service.alb,
      hostedZoneName: props.hostedZoneName,
    });
  }
}

export class ServiceStack extends cdk.Stack {
  public readonly service: ECS;

  constructor(
    scope: Construct,
    id: string,
    vpc: cdk.aws_ec2.Vpc,
    ddb: DynamoDB,
    acm: ACM
  ) {
    super(scope, id);

    this.service = new ECS(
      this,
      "BackendService",
      vpc,
      ddb.table,
      acm.certificate
    );
  }
}

export class DatabaseStack extends cdk.Stack {
  public readonly ddb: DynamoDB;
  public readonly rds: RDS;

  constructor(
    scope: Construct,
    id: string,
    vpc: cdk.aws_ec2.Vpc,
    bastionKeypairName?: string,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    this.ddb = new DynamoDB(this, "Database");
    this.rds = new RDS(this, "RDS", {
      vpc: vpc,
    });

    if (bastionKeypairName) {
      const bastion = new EC2(this, "EC2", {
        vpc: vpc,
        instanceKeyPairName: bastionKeypairName,
      });

      this.rds.instance.connections.allowFrom(
        bastion.bastionInstance,
        cdk.aws_ec2.Port.tcp(3306)
      );
    }
  }
}

export class InfrastractureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    dotenv.config();
    const parsedEnv = EnvironmentZodType.safeParse(process.env);
    if (!parsedEnv.success) {
      console.error("Invalid environment variables", parsedEnv.error.format());
      process.exit(1);
    }

    const network = new NetworkStack(this, "Network");
    const database = new DatabaseStack(
      this,
      "Database",
      network.vpcStack.vpc,
      parsedEnv.data.BASTION_INSTANCE_KEY_PAIR
    );

    const acm = new ACM(this, "ACM", {
      certificateArn: parsedEnv.data.ACM_CERTIFICATE_ARN,
    });
    const service = new ServiceStack(
      this,
      "Service",
      network.vpcStack.vpc,
      database.ddb,
      acm
    );

    new Route53Stack(this, "Route53Stack", {
      hostedZoneId: parsedEnv.data.ROUTE53_HOSTED_ZONE_ID,
      hostedZoneName: parsedEnv.data.ROUTE53_HOSTED_ZONE_NAME,
      domainName: parsedEnv.data.DOMAIN_NAME,
      service: service.service,
    });

    new S3Stack(this, "WebBucket");
  }
}
