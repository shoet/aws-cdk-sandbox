import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";

type Props = {
  vpc: cdk.aws_ec2.Vpc;
  rds: cdk.aws_rds.DatabaseInstance;
  rdsSecretsID: string;
  rdsConnectionPort: number;
  acmCertificate: cdk.aws_certificatemanager.ICertificate;
  domainName: string;
  route53HostZone: cdk.aws_route53.IHostedZone;
};

/**
 * ECSコンストラクタは、ECSクラスターにFargateサービスをデプロイし、ALBを構築します。
 * また、ALBに対してRoute53のAレコードを作成します。
 * RDSへの接続を許可します。
 *
 * @param scope
 * @param id
 * @param props Props
 *  - vpc: cdk.aws_ec2.vpc
 *  - rds: cdk.aws_rds.DatabaseInstance
 *  - rdsSecretsID: string
 *  - rdsConnectionPort: number
 *  - acmCertificate: cdk.aws_certificatemanager.ICertificate
 *  - domainName: string
 *  - route53HostZone: cdk.aws_route53.IHostedZone
 *  @returns ECS
 */
export class ECS extends Construct {
  public readonly alb: cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer;
  public readonly cluster: cdk.aws_ecs.Cluster;
  public readonly taskDefinition: cdk.aws_ecs.TaskDefinition;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    // ECS Cluster
    this.cluster = new cdk.aws_ecs.Cluster(this, "ECSCluster", {
      vpc: props.vpc,
    });

    // ECS TaskDefinition
    this.taskDefinition = new cdk.aws_ecs.TaskDefinition(
      this,
      "TaskDefinition",
      {
        compatibility: cdk.aws_ecs.Compatibility.FARGATE,
        memoryMiB: "512",
        cpu: "256",
      }
    );

    // ECS Container
    this.taskDefinition.addContainer("Backend", {
      image: cdk.aws_ecs.ContainerImage.fromDockerImageAsset(
        new cdk.aws_ecr_assets.DockerImageAsset(scope, "DockerImage", {
          directory: "../server-hono",
          platform: cdk.aws_ecr_assets.Platform.LINUX_AMD64,
          cacheDisabled: true,
        })
      ),
      logging: new cdk.aws_ecs.AwsLogDriver({
        streamPrefix: "ecs",
      }),
      healthCheck: {
        command: [
          "CMD-SHELL",
          "curl -f http://localhost:3000/health || exit 1",
        ], // CMD-SHELLを使用
      },
      portMappings: [
        {
          protocol: cdk.aws_ecs.Protocol.TCP,
          containerPort: 3000,
          hostPort: 3000,
        },
      ],
      environment: {
        DB_SECRETS_ID: props.rdsSecretsID,
      },
    });

    // ECS Fargate Service
    const fargateService = new cdk.aws_ecs.FargateService(
      this,
      "FargateService",
      {
        cluster: this.cluster,
        taskDefinition: this.taskDefinition,
        assignPublicIp: false,
        vpcSubnets: {
          subnetType: cdk.aws_ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        enableExecuteCommand: true, // ECS Execを有効にする
      }
    );

    // RDS Allow Connection from ECS
    props.rds.connections.allowFrom(
      this.cluster,
      cdk.aws_ec2.Port.tcp(props.rdsConnectionPort)
    );

    // ALB
    this.alb = new cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer(
      scope,
      "ALB",
      {
        vpc: props.vpc,
        vpcSubnets: {
          subnetType: cdk.aws_ec2.SubnetType.PUBLIC,
        },
        internetFacing: true,
      }
    );

    // ALB Listner
    const httpsListner = this.alb.addListener("ALBListnerHttps", {
      port: 443,
      open: true,
      certificates: [props.acmCertificate],
    });

    // ALB Listner Target
    httpsListner.addTargets("TargetListner", {
      port: 3000,
      targets: [fargateService],
      healthCheck: {
        path: "/health",
        port: "traffic-port",
      },
      protocol: cdk.aws_elasticloadbalancingv2.ApplicationProtocol.HTTP,
    });

    // Route53 ARecord Target
    const albAlias = cdk.aws_route53.RecordTarget.fromAlias(
      new cdk.aws_route53_targets.LoadBalancerTarget(this.alb)
    );

    // Route53 ARecord
    new cdk.aws_route53.ARecord(this, "ARecord", {
      zone: props.route53HostZone,
      target: albAlias,
      recordName: props.domainName,
    });
  }
}
