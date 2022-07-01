import type { AWS } from "@serverless/typescript";

import createTodo from "@functions/createTodo";
import getTodo from "@functions/getTodo";
import updateTodo from "@functions/updateTodo";

const serverlessConfiguration: AWS = {
  service: "serverless-todo",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    stage: "${opt:stage, 'dev'}",
    region: "us-east-1",
    profile: "recebido-app",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      TODOS_TABLE: "${self:custom.todos_table}",
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:PutItem",
        ],
        Resource: [{ "Fn::GetAtt": ["todosTable", "Arn"] }],
      },
    ],
  },
  // import the function via paths
  functions: { createTodo, getTodo, updateTodo },
  resources: {
    Resources: {
      todosTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:provider.environment.TODOS_TABLE}",
          AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
          KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
          BillingMode: "PAY_PER_REQUEST",
        },
      },
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    todos_table: "todos-table-dev",
  },
};

module.exports = serverlessConfiguration;
