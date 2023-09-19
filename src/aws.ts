import AWS from "aws-sdk";

export type AwsOptions = {
  onDebug?: (message: string) => void;
  onFailure?: (err: unknown) => void;
};

export const hasTaskFailures = (tasks?: AWS.ECS.Task[]) => {
  if (!tasks?.length) {
    return false;
  }

  return tasks.some((task) => {
    return (
      !!task.containers?.length &&
      task.containers.some(({ exitCode }) => !!exitCode)
    );
  });
};

export const runTasks = async (
  client: AWS.ECS,
  params: AWS.ECS.RunTaskRequest,
  { onDebug }: AwsOptions = {}
) => {
  console.log(`Running task ${params.taskDefinition}`);
  const runTaskResult = await client.runTask(params).promise();

  if (!runTaskResult.tasks?.length) {
    return [];
  }

  onDebug?.(JSON.stringify(runTaskResult, null, 2));

  console.log(`Successfully scheduled task ${params.taskDefinition}`);

  return runTaskResult.tasks
    .map((task) => task.taskArn)
    .filter<string>((arn): arn is string => typeof arn === "string" && !!arn);
};

export const waitForTasks = async (
  client: AWS.ECS,
  params: AWS.ECS.DescribeTasksRequest,
  { onDebug, onFailure }: AwsOptions = {}
) => {
  console.log("Waiting for task to stop");

  const waitResult = await client.waitFor("tasksStopped", params).promise();

  onDebug?.(JSON.stringify(waitResult, null, 2));

  if (hasTaskFailures(waitResult.tasks)) {
    const err = new Error("Some containers exited with non-zero exit codes");

    onFailure?.(err);
  }
};
