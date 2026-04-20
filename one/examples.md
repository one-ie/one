# The Substrate in Action

Three practical applications of the 85-line foundation.

**The pattern:**
```
Nodes that compute.
Edges that connect.
Weights that learn.
Signals that flow.
No controller.
```

---

## Example 1: Hyperliquid Trading Group

**The biology:** Forager ants find food sources. Scout ants report quality. Worker ants harvest. The colony routes resources to the best sources — no coordinator needed.

**The application:** Tick data flows through chambers. Signals strengthen trails. Orders follow the strongest strength.

```javascript
import { colony } from "@/engine";

// Build the trading nest
const nest = world();

// ════════════════════════════════════════════════════════════════
// CHAMBERS: Each knows one task
// ════════════════════════════════════════════════════════════════

// Scout chamber: watches the market
nest.add({ receiver: "scout" })
  .assign("tick", ({ price, volume, symbol }) => {
    // Scout sees a tick, decides if it's interesting
    const dominated = price > 0 && volume > 1000;
    return { symbol, price, volume, dominated };
  });

// Analyst chamber: evaluates opportunities
nest.add({ receiver: "analyst" })
  .assign("evaluate", ({ symbol, price, volume, dominated }) => {
    if (!dominated) return { action: "ignore" };

    // Simple signal: volume spike
    const signal = volume > 5000 ? "strong" : "weak";
    return { symbol, price, signal, action: signal === "strong" ? "trade" : "watch" };
  });

// Trader chamber: executes orders
nest.add({ receiver: "trader" })
  .assign("execute", async ({ symbol, price, action }) => {
    if (action !== "trade") return { executed: false };

    // Place order on Hyperliquid
    const order = await placeOrder({ symbol, price, size: 0.1 });
    return { executed: true, orderId: order.id };
  });

// Logger chamber: records everything
nest.add({ receiver: "logger" })
  .assign("record", ({ executed, orderId, symbol }) => {
    console.log(`[${symbol}] executed: ${executed}, order: ${orderId || "none"}`);
    return { logged: true };
  });

// ════════════════════════════════════════════════════════════════
// THE ANT: A tick arrives and knows its entire journey
// ════════════════════════════════════════════════════════════════

function onTick(tick) {
  nest.signal({
    receiver: "scout",
    receive: "tick",
    data: tick,
    callback: {
      receiver: "analyst",
      receive: "evaluate",
      data: { "{{result}}": true },  // Cargo from scout
      callback: {
        receiver: "trader",
        receive: "execute",
        data: { "{{result}}": true },  // Cargo from analyst
        callback: {
          receiver: "logger",
          receive: "record",
          data: { "{{result}}": true }  // Cargo from trader
        }
      }
    }
  });
}

// ════════════════════════════════════════════════════════════════
// EMERGENCE: Superhighways form around profitable paths
// ════════════════════════════════════════════════════════════════

// After many ticks, see which paths are hot
setInterval(() => {
  const highways = nest.highways();
  console.log("Hot paths:", highways);

  // Fade old trails — the colony forgets stale patterns
  nest.fade(0.1);
}, 60000);

// EDGES strengthen with each successful signal:
// "scout:tick → analyst:evaluate" grows strong (always traversed)
// "analyst:evaluate → trader:execute" grows for profitable symbols
// "trader:execute → logger:record" grows for executed trades
//
// The network LEARNS which paths make money.
// BTC edges become superhighways. Low-volume edges fade.
```

**What emerges:**
- No coordinator decides which symbols to trade
- Profitable paths naturally strengthen
- Unprofitable paths fade
- The group learns which routes work

---

## Example 2: Agent Group Coordination

**The biology:** Army ants form living bridges. No ant knows the full structure. Each ant feels the pull of pheromones and joins where needed. The bridge emerges.

**The application:** Agents spawn dynamically. Tasks emit strength. Agents smell and join. Swarms form around hot tasks.

```javascript
import { colony } from "@/engine";

const nest = world();

// ════════════════════════════════════════════════════════════════
// QUEEN CHAMBER: Spawns worker agents
// ════════════════════════════════════════════════════════════════

nest.add({ receiver: "queen" })
  .assign("spawn", ({ type, count }) => {
    const workers = [];
    for (let i = 0; i < count; i++) {
      const id = `${type}-${Date.now()}-${i}`;
      const worker = nest.add({ receiver: id });

      // Each worker knows how to work and report
      worker.assign("work", async ({ task }) => {
        const result = await doWork(task);
        return { worker: id, task, result };
      });

      worker.assign("report", ({ status }) => {
        return { worker: id, status, timestamp: Date.now() };
      });

      workers.push(id);
    }
    return { spawned: workers };
  });

// ════════════════════════════════════════════════════════════════
// COORDINATOR: Smells trails and routes work to strongest paths
// ════════════════════════════════════════════════════════════════

nest.add({ receiver: "coordinator" })
  .assign("dispatch", ({ task }) => {
    // Find available workers by smelling their trails
    const workers = nest.list().filter(id => id.startsWith("worker-"));

    // Route to worker with weakest strength (least busy)
    let bestWorker = null;
    let weakestScent = Infinity;

    for (const worker of workers) {
      const strength = nest.trace(`${worker}:work`);
      if (strength < weakestScent) {
        weakestScent = strength;
        bestWorker = worker;
      }
    }

    if (!bestWorker) return { dispatched: false, reason: "no workers" };

    // Send the task ant to the worker
    return { dispatched: true, worker: bestWorker, task };
  });

// ════════════════════════════════════════════════════════════════
// SWARM FORMATION: Workers cluster around hot tasks
// ════════════════════════════════════════════════════════════════

nest.add({ receiver: "group" })
  .assign("form", ({ taskType }) => {
    // Smell all trails to find where the action is
    const highways = nest.highways(20);

    // Find workers active on this task type
    const activeWorkers = highways
      .filter(h => h.trail.includes(taskType))
      .map(h => h.trail.split(":")[0]);

    return {
      taskType,
      swarmSize: activeWorkers.length,
      members: [...new Set(activeWorkers)]
    };
  })
  .assign("recruit", ({ taskType, needed }) => {
    // Queen spawns more workers for hot tasks
    const currentSwarm = nest.trace(`group:${taskType}`);
    if (currentSwarm < needed) {
      nest.signal({
        receiver: "queen",
        receive: "spawn",
        data: { type: `worker-${taskType}`, count: needed - currentSwarm }
      });
    }
    return { recruiting: needed - currentSwarm };
  });

// ════════════════════════════════════════════════════════════════
// USAGE: The group self-organizes
// ════════════════════════════════════════════════════════════════

// Spawn initial workers
await nest.signal({
  receiver: "queen",
  receive: "spawn",
  data: { type: "worker", count: 5 }
});

// Dispatch tasks — workers with weak strength get work
for (const task of tasks) {
  await nest.signal({
    receiver: "coordinator",
    receive: "dispatch",
    data: { task },
    callback: {
      receiver: "{{result.worker}}",  // Dynamic routing!
      receive: "work",
      data: { task: "{{result.task}}" }
    }
  });
}

// Check group status
const group = await nest.signal({
  receiver: "group",
  receive: "form",
  data: { taskType: "processing" }
});
// → { taskType: "processing", swarmSize: 3, members: ["worker-1", "worker-2", "worker-3"] }
```

**What emerges:**
- Workers cluster around busy tasks (strong strength)
- Idle workers get recruited to new tasks (weak strength)
- Swarms form and dissolve dynamically
- No central scheduler — just strength

---

## Example 3: Task Pheromones — Attraction and Repulsion

**The biology:** Ants mark food with attractive pheromones. They mark danger with repellent pheromones. The colony learns what to approach and what to avoid.

**The application:** Tasks emit strength. Success strengthens attraction. Failure marks repulsion. Agents navigate the strength landscape.

```javascript
import { colony } from "@/engine";

const nest = world();

// ════════════════════════════════════════════════════════════════
// DUAL SCENT: Attraction and Repulsion
// ════════════════════════════════════════════════════════════════

// Extend colony with repulsion (negative strength)
const repel = {};

nest.dropDanger = (trail, strength = 1) => {
  repel[trail] = (repel[trail] || 0) + strength;
};

nest.traceDanger = (trail) => repel[trail] || 0;

nest.netScent = (trail) => {
  return nest.trace(trail) - nest.traceDanger(trail);
};

nest.fadeDanger = (rate = 0.1) => {
  for (const trail in repel) {
    repel[trail] *= (1 - rate);
    if (repel[trail] < 0.01) delete repel[trail];
  }
};

// ════════════════════════════════════════════════════════════════
// TASK BOARD: Where tasks are laid like food sources
// ════════════════════════════════════════════════════════════════

nest.add({ receiver: "taskboard" })
  .assign("post", ({ task, reward, difficulty }) => {
    const taskId = `task-${Date.now()}`;

    // Task emits attractive strength proportional to reward
    nest.mark(`task:${taskId}`, reward);

    // Store task data
    tasks[taskId] = { task, reward, difficulty, posted: Date.now() };

    return { taskId, strength: reward };
  })
  .assign("list", () => {
    // Return tasks sorted by net strength (attraction - repulsion)
    return Object.entries(tasks)
      .map(([id, t]) => ({
        ...t,
        id,
        attraction: nest.trace(`task:${id}`),
        danger: nest.traceDanger(`task:${id}`),
        netScent: nest.netScent(`task:${id}`)
      }))
      .sort((a, b) => b.netScent - a.netScent);
  });

// ════════════════════════════════════════════════════════════════
// WORKER: Follows strength, marks success/failure
// ════════════════════════════════════════════════════════════════

nest.add({ receiver: "worker" })
  .assign("seek", () => {
    // Find most attractive task
    const taskList = nest.signal({ receiver: "taskboard", receive: "list", data: {} });
    const best = taskList[0];

    if (!best || best.netScent <= 0) {
      return { found: false, reason: "no attractive tasks" };
    }

    return { found: true, task: best };
  })
  .assign("attempt", async ({ taskId }) => {
    const task = tasks[taskId];

    try {
      const result = await executeTask(task);

      // Success! Strengthen the attraction trail
      nest.mark(`task:${taskId}`, task.reward);
      nest.mark(`worker:success`, 1);

      return { success: true, result };

    } catch (error) {
      // Failure! Mark danger on this task
      nest.dropDanger(`task:${taskId}`, task.difficulty);
      nest.mark(`worker:failure`, 1);

      return { success: false, error: error.message };
    }
  });

// ════════════════════════════════════════════════════════════════
// FOREMAN: Monitors strength landscape, adjusts rewards
// ════════════════════════════════════════════════════════════════

nest.add({ receiver: "foreman" })
  .assign("survey", () => {
    const successRate = nest.trace("worker:success") /
      (nest.trace("worker:success") + nest.trace("worker:failure") || 1);

    const hotTasks = nest.highways(5)
      .filter(h => h.trail.startsWith("task:"));

    const dangerousTasks = Object.entries(repel)
      .filter(([trail]) => trail.startsWith("task:"))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return { successRate, hotTasks, dangerousTasks };
  })
  .assign("boost", ({ taskId, amount }) => {
    // Foreman can artificially boost a task's strength
    nest.mark(`task:${taskId}`, amount);
    return { boosted: taskId, newScent: nest.trace(`task:${taskId}`) };
  })
  .assign("quarantine", ({ taskId }) => {
    // Mark a task as too dangerous
    nest.dropDanger(`task:${taskId}`, 100);
    return { quarantined: taskId };
  });

// ════════════════════════════════════════════════════════════════
// USAGE: Tasks attract and repel workers naturally
// ════════════════════════════════════════════════════════════════

// Post tasks with different rewards
await nest.signal({ receiver: "taskboard", receive: "post",
  data: { task: "easy-job", reward: 10, difficulty: 1 } });

await nest.signal({ receiver: "taskboard", receive: "post",
  data: { task: "hard-job", reward: 50, difficulty: 10 } });

await nest.signal({ receiver: "taskboard", receive: "post",
  data: { task: "risky-job", reward: 100, difficulty: 50 } });

// Workers seek and attempt tasks
// Easy jobs succeed → attraction grows
// Risky jobs fail → repulsion grows
// World learns: easy-job is safe, risky-job is dangerous

// Time passes — scents fade
setInterval(() => {
  nest.fade(0.05);        // Attraction fades
  nest.fadeDanger(0.02);  // Danger fades slower (memory of pain)
}, 10000);

// Survey the landscape
const survey = await nest.signal({ receiver: "foreman", receive: "survey", data: {} });
// → {
//   successRate: 0.7,
//   hotTasks: [{ trail: "task:easy-job", strength: 45 }],
//   dangerousTasks: [["task:risky-job", 89]]
// }
```

**What emerges:**
- High-reward tasks attract workers (strong positive strength)
- Dangerous tasks repel workers (strong negative strength)
- The colony learns over time — no training needed
- Danger fades slower than attraction (survival instinct)
- Foremen can intervene (boost or quarantine)

---

## The Pattern

All three examples follow the same 85-line genome:

```
1. Chambers know tasks       (specialization)
2. Ants carry cargo          (data flow)
3. Trails strengthen on use  (learning)
4. Scent fades over time     (forgetting)
5. No central controller     (emergence)
```

**Trading group:** Ticks flow through analysis chambers. Profitable paths strengthen.

**Agent coordination:** Workers cluster around hot tasks. Idle workers get recruited.

**Task pheromones:** Success attracts. Failure repels. The colony learns.

---

*The same pattern that lets ants find the shortest path to food lets agents find profitable trades, coordinate swarms, and prioritize tasks. 100 million years of optimization.*

---

## See Also

- [flows.md](flows.md) — Flow patterns these examples implement
- [code.md](code.md) — Substrate primitives used in examples
- [tutorial.md](tutorial.md) — Introduction to the concepts shown here
- [people.md](one/agents.md) — Agent types: worker, router, aggregator
- [ants.md](ants.md) — Biological source of pheromone patterns
- [group.md](group.md) — Coordination patterns at scale
