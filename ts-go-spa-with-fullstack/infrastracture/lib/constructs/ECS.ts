import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";

export class ECS extends Construct {
  constructor(
    scope: Construct,
    id: string,
    vpc: cdk.aws_ec2.Vpc,
    dynamodbTable: cdk.aws_dynamodb.Table,
    props?: any
  ) {
    super(scope, id);

    // ECSクラスターの作成
    const cluster = new cdk.aws_ecs.Cluster(this, "ECSCluster", {
      vpc: vpc,
    });

    // タスク定義の作成
    const taskDefinition = new cdk.aws_ecs.TaskDefinition(
      this,
      "TaskDefinition",
      {
        compatibility: cdk.aws_ecs.Compatibility.FARGATE,
        memoryMiB: "512",
        cpu: "256",
      }
    );

    // タスク定義にコンテナを追加
    taskDefinition.addContainer("Backend", {
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
        // command: ["curl", "http://localhost:3000/health"],
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
    });

    // ECS Fargate
    const fargateService = new cdk.aws_ecs.FargateService(
      this,
      "FargateService",
      {
        cluster: cluster,
        taskDefinition: taskDefinition,
        assignPublicIp: false,
        vpcSubnets: {
          subnetType: cdk.aws_ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        enableExecuteCommand: true, // ECS Execを有効にする
      }
    );

    // ALB
    const alb = new cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer(
      scope,
      "ALB",
      {
        vpc: vpc,
        vpcSubnets: {
          subnetType: cdk.aws_ec2.SubnetType.PUBLIC,
        },
        internetFacing: true,
      }
    );

    // 80番で受ける
    const listner = alb.addListener("ALBListner", {
      port: 80,
      open: true,
    });

    //
    listner.addTargets("TargetListner", {
      port: 3000,
      targets: [fargateService],
      healthCheck: {
        path: "/health",
        port: "traffic-port",
      },
      protocol: cdk.aws_elasticloadbalancingv2.ApplicationProtocol.HTTP,
    });

    dynamodbTable.grantReadWriteData(taskDefinition.taskRole);
  }
}
