以下の構成で Web アプリケーションを構築

- web
  - TypeScript - React によるフロントエンドの構築
- server-hono
  - TypeScript - hono による API サーバーの構築
- infrastracture
  - AWS CDK によるインフラの構築

# 構成図

```
architecture-beta
	group aws_cloud(cloud)[AWS Cloud]

	group public_subnet(cloud)[PublicSubnet] in aws_cloud
	group private_subnet(cloud)[PrivateSubnet] in aws_cloud

	service dynamo_db(database)[DynamoDB] in aws_cloud

	service s3(disk)[SPA on S3] in aws_cloud

	group ecs_cluster(server)[ECS Cluster] in public_subnet
	service ecs_task(server)[ECS Service] in ecs_cluster

	service alb(server)[ALB] in private_subnet
	service user(internet)[User]

	user:R -- L:alb
	user:T -- L:s3
	alb:R -- L:ecs_task
	dynamo_db:L -- R:ecs_task
```
