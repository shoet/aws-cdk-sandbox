import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";

export interface CDKResourceInitializerProps {
  vpc: cdk.aws_ec2.IVpc;
  config: { secretID: string };
  subnets_selection: cdk.aws_ec2.SubnetSelection;
  function_security_groups: cdk.aws_ec2.ISecurityGroup[];
  function_timeout: cdk.Duration;
  function_memory_size?: number;
  function_log_retention: cdk.aws_logs.RetentionDays;
  docker_image_platform?: string;
}

export class CDKResourceInitializer extends Construct {
  public readonly custom_resource: cdk.custom_resources.AwsCustomResource;

  public readonly response: string;

  public readonly function: cdk.aws_lambda.Function;

  constructor(
    scope: Construct,
    id: string,
    props: CDKResourceInitializerProps
  ) {
    super(scope, id);

    const stack = cdk.Stack.of(this);

    const function_security_group = new cdk.aws_ec2.SecurityGroup(
      scope,
      "Function-SecurityGroup",
      {
        vpc: props.vpc,
        allowAllOutbound: true,
      }
    );

    this.function = new cdk.aws_lambda.DockerImageFunction(this, "Function", {
      code: cdk.aws_lambda.DockerImageCode.fromImageAsset(`${__dirname}`, {}),
      architecture: cdk.aws_lambda.Architecture.X86_64,
      timeout: cdk.Duration.seconds(10),
      functionName: `${id}-DBInit${stack.stackName}`,
      logRetention: props.function_log_retention,
      securityGroups: [
        function_security_group,
        ...props.function_security_groups,
      ],
      vpc: props.vpc,
      vpcSubnets: props.vpc.selectSubnets(props.subnets_selection),
    });

    this.function.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        resources: [props.config.secretID],
        actions: ["secretsmanager:GetSecretValue"],
      })
    );

    const sdkCall: cdk.custom_resources.AwsSdkCall = {
      service: "Lambda",
      action: "invoke",
      parameters: {
        FunctionName: this.function.functionName,
        Payload: JSON.stringify({
          config: props.config,
        }),
      },
      physicalResourceId: cdk.custom_resources.PhysicalResourceId.of(
        `${id}-AwsSdkCall-${
          this.function.currentVersion.version + Date.now().toString()
        }`
      ),
    };

    const customResourceFnRole = new cdk.aws_iam.Role(
      scope,
      "AwsCustomResourceRole",
      {
        assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
      }
    );

    customResourceFnRole.addToPolicy(
      new cdk.aws_iam.PolicyStatement({
        resources: [this.function.functionArn],
        actions: ["lambda:InvokeFunction"],
      })
    );

    this.custom_resource = new cdk.custom_resources.AwsCustomResource(
      scope,
      "AwsCustomResource",
      {
        policy: cdk.custom_resources.AwsCustomResourcePolicy.fromSdkCalls({
          resources: cdk.custom_resources.AwsCustomResourcePolicy.ANY_RESOURCE,
        }),
        onUpdate: sdkCall,
        onCreate: sdkCall,
        timeout: cdk.Duration.minutes(10),
        role: customResourceFnRole,
      }
    );

    this.response = this.custom_resource.getResponseField("Payload");
  }
}
