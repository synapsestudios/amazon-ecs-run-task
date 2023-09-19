import { setFailed, getInput } from "@actions/core";

export const setGhaFailure = (err: unknown) => {
  if (err instanceof Error) {
    setFailed(err.message);
  }
};

export const getActionInputs = () => {
  const taskDefinition = getInput("task-definition");

  if (!taskDefinition) {
    throw new Error("Task definition not specified");
  }

  const cluster = getInput("cluster");
  const launchType = getInput("launch-type");
  const networkConfiguration = getInput("network-configuration");
  const wait = getInput("wait-for-tasks-stopped") === "true";
  const overrides = getInput("overrides");

  return {
    cluster: !!cluster ? cluster : undefined,
    launchType: !!launchType ? launchType : undefined,
    networkConfiguration: !!networkConfiguration
      ? JSON.parse(networkConfiguration)
      : undefined,
    overrides: !!overrides ? JSON.parse(overrides) : undefined,
    taskDefinition,
    wait,
  };
};
