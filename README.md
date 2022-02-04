# amazon-ecs-run-task

Runs an ECS task

## Usages

```
- name: 'Run database migrations'
  uses: synapsestudios/amazon-ecs-run-task@v1
  with:
    task-definition: my-task-definition
    cluster: my-cluster
    launch-type: FARGATE
    network-configuration: '{"awsvpcConfiguration":{"subnets":["subnet-1","subnet-2","subnet-3"]}}'
    wait-for-tasks-stopped: true
    overrides: '{"containerOverrides":[{"name":"my-container","command":["yarn","run","start"]}]}'
```
