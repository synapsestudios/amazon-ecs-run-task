import AWS from "aws-sdk";
import { runTasks, waitForTasks } from "./aws";

const helloWorldTask = {
  containerDefinitions: [
    {
      essential: true,
      image: "public.ecr.aws/amazonlinux/amazonlinux:2023-minimal",
      name: "ecs-run-task-action-container",
    },
  ],
  cpu: "256",
  family: "ecs-run-task-action",
  memory: "512",
  requiresCompatibilities: ["FARGATE"],
};

describe("AWS ECS", () => {
  let taskDefinitionArn: string;
  const ecs = new AWS.ECS({ apiVersion: "2014-11-13", region: "us-west-2" });

  beforeAll(async () => {
    const res = await ecs.registerTaskDefinition(helloWorldTask).promise();

    taskDefinitionArn = res.taskDefinition?.taskDefinitionArn || "";
  });

  afterAll(async () => {
    await ecs
      .deregisterTaskDefinition({ taskDefinition: taskDefinitionArn })
      .promise();
  });

  it("should run given tasks", async () => {
    const result = await runTasks(
      ecs,
      {
        taskDefinition: taskDefinitionArn,
      },
      {
        onDebug: jest.fn(),
        onFailure: jest.fn(),
      }
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(taskDefinitionArn);
  });

  // Not sure how to test this without creating a failing container image
  it.skip("should wait for given tasks", async () => {
    await waitForTasks(
      ecs,
      {
        tasks: [taskDefinitionArn],
      },
      {
        onDebug: jest.fn(),
        onFailure: jest.fn(),
      }
    );
  });
});
