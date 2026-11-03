```text
Layer 1: gitXxx          (raw git command wrapper)    → Raw Layer
Layer 2: gitXxxYyy       (safe composition API)       → Safe Layer
Layer 3: gitXxxWorkflow  (intent-based API)           → Workflow Layer
```

Raw 是“命令”，Safe 是“行为”，Workflow 是“意图”
