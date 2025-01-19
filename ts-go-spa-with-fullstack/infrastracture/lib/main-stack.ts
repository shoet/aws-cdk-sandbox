import * as dotenv from "dotenv";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ECS, VPC, RDS, ACM, Route53, S3 } from "./constructs";
import { EnvironmentZodType } from "./constructs/types";
import { BastionEC2 } from "./constructs/EC2";

export class InfraStack extends cdk.Stack {
  public readonly vpc: VPC;
  public readonly rds: RDS;
  public readonly acm: ACM;
  public readonly route53: Route53;

  constructor(
    scope: Construct,
    id: string,
    props: cdk.StackProps & {
      route53Props: {
        domainName: string;
        hostedZoneId: string;
        hostedZoneName: string;
      };
      bastionKeypairName?: string;
      acmCertificateArn: string;
    }
  ) {
    super(scope, id, props);

    // create network
    this.vpc = new VPC(this, "Network");

    // create database
    this.rds = new RDS(this, "Database", {
      vpc: this.vpc.vpc,
    });

    // create bastion instance
    if (props.bastionKeypairName) {
      const bastion = new BastionEC2(this, "BastionEC2", {
        vpc: this.vpc.vpc,
        instanceKeyPairName: props.bastionKeypairName,
      });

      this.rds.instance.connections.allowFrom(
        bastion.instance,
        cdk.aws_ec2.Port.tcp(3306)
      );
    }

    // lookup acm certificate
    this.acm = new ACM(this, "ACM", {
      certificateArn: props.acmCertificateArn,
    });

    // lookup route53 hosted zone
    this.route53 = new Route53(this, "Route53", {
      ...props.route53Props,
    });
  }
}

export class BackendStack extends cdk.Stack {
  public readonly service: ECS;
  public readonly backendDomain: string;

  constructor(
    scope: Construct,
    id: string,
    props: cdk.StackProps & {
      vpc: VPC;
      rds: RDS;
      route53: Route53;
      acm: ACM;
      domainName: string;
    }
  ) {
    super(scope, id);

    this.service = new ECS(this, "BackendService", {
      vpc: props.vpc.vpc,
      rds: props.rds.instance,
      rdsSecretsID: props.rds.crednetialsSecretArn,
      route53HostZone: props.route53.hostedZone,
      acmCertificate: props.acm.certificate,
      domainName: props.domainName,
      rdsConnectionPort: props.rds.instanceConnectionPort,
    });

    this.service.taskDefinition.taskRole.addToPrincipalPolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ["secretsmanager:GetSecretValue"],
        resources: [props.rds.crednetialsSecretArn],
      })
    );

    this.service.fargateService.connections.allowTo(
      props.rds.instance,
      cdk.aws_ec2.Port.tcp(props.rds.instanceConnectionPort)
    );

    this.backendDomain = props.domainName;
  }
}

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id);

    new S3(this, "WebBucket");
  }
}

export class MainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    dotenv.config({ path: "../.env" });
    const parsedEnv = EnvironmentZodType.safeParse(process.env);
    if (!parsedEnv.success) {
      console.error("Invalid environment variables", parsedEnv.error.format());
      process.exit(1);
    }

    const infrastractureStack = new InfraStack(this, "InfraStack", {
      route53Props: {
        domainName: parsedEnv.data.BACKEND_DOMAIN_NAME,
        hostedZoneId: parsedEnv.data.ROUTE53_HOSTED_ZONE_ID,
        hostedZoneName: parsedEnv.data.ROUTE53_HOSTED_ZONE_NAME,
      },
      bastionKeypairName: parsedEnv.data.BASTION_INSTANCE_KEY_PAIR,
      acmCertificateArn: parsedEnv.data.ACM_CERTIFICATE_ARN,
    });

    const backendStack = new BackendStack(this, "BackendStack", {
      domainName: parsedEnv.data.BACKEND_DOMAIN_NAME,
      vpc: infrastractureStack.vpc,
      rds: infrastractureStack.rds,
      acm: infrastractureStack.acm,
      route53: infrastractureStack.route53,
    });

    const frontendStack = new FrontendStack(this, "FrontendStack", {});
  }
}
