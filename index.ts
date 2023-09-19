import core from "@actions/core";
import aws from "aws-sdk";

async function run() {
  try {
    const taskDefinition = core.getInput("task-definition");

    if (!taskDefinition) {
      throw new Error("Task definition not specified");
    }

    const cluster = core.getInput("cluster");
    const launchType = core.getInput("launch-type");
    const networkConfiguration = core.getInput("network-configuration");
    const wait = core.getInput("wait-for-tasks-stopped") === "true";
    const overrides = core.getInput("overrides");

    const ecs = new aws.ECS({ apiVersion: "2014-11-13" });

    const runTaskParams: aws.ECS.RunTaskRequest = { taskDefinition };

    if (cluster) {
      runTaskParams.cluster = cluster;
    }

    if (launchType) {
      runTaskParams.launchType = launchType;
    }

    if (networkConfiguration) {
      runTaskParams.networkConfiguration = JSON.parse(networkConfiguration);
    }

    if (overrides) {
      runTaskParams.overrides = JSON.parse(overrides);
    }

    console.log(`Running task ${taskDefinition}...`);

    const runTaskResult = await ecs.runTask(runTaskParams).promise();

    core.debug(JSON.stringify(runTaskResult, null, 2));

    console.log(`Successfully scheduled task ${taskDefinition}`);

    if (wait) {
      const waitParams: aws.ECS.DescribeTasksRequest = {
        tasks: !!runTaskResult.tasks?.length
          ? runTaskResult.tasks
              .map((task) => task.taskArn)
              .filter((arn): arn is string => typeof arn === "string" && !!arn)
          : [],
      };

      if (cluster) {
        waitParams.cluster = cluster;
      }

      console.log("Waiting for task to stop...");

      const waitResult = await ecs
        .waitFor("tasksStopped", waitParams)
        .promise();

      core.debug(JSON.stringify(waitResult, null, 2));

      const hasFailures =
        !!waitResult.tasks?.length &&
        waitResult.tasks.some(
          (task) =>
            !!task.containers?.length &&
            task.containers.some((container) => !!container.exitCode)
        );

      if (hasFailures) {
        core.setFailed("Some containers exited with non-zero exit codes");
      }
    }

    console.log("Done");
  } catch (e) {
    if (e instanceof Error) {
      core.setFailed(e.message);
    }
  }
}

run();
