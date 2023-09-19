import { ECS } from "aws-sdk";
import { getActionInputs, setGhaFailure } from "./github";
import { runTasks, waitForTasks } from "./aws";
import { debug } from "@actions/core";

async function run(
  client: ECS,
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

const ecs = new ECS({ apiVersion: "2014-11-13" });

run(ecs);
