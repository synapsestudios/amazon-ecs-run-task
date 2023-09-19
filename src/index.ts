import { debug } from "@actions/core";
// It's necessary to import the entire AWS SDK
// in order for aws-sdk-mock to work
import AWS from "aws-sdk";
import { runTasks, waitForTasks } from "./aws";
import { getActionInputs, setGhaFailure } from "./github";

async function run(
  client: AWS.ECS,
  options = { onDebug: debug, onFailure: setGhaFailure }
) {
  const { wait, ...runTaskParams } = getActionInputs();

  try {
    const resultTasks = await runTasks(ecs, runTaskParams, options);

    if (wait) {
      await waitForTasks(
        client,
        {
          tasks: resultTasks,
          cluster: runTaskParams.cluster,
        },
        options
      );
    }

    console.log("Done");
  } catch (e) {
    setGhaFailure(e);
  }
}

const ecs = new AWS.ECS({ apiVersion: "2014-11-13" });

run(ecs);
