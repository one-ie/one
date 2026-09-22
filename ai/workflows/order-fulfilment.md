---
id: order-fulfilment
label: Order → fulfilled
description: A placed order is acknowledged, picked, and confirmed shipped by a human before the customer is told it is on its way.
trigger: order:created
department: service
---

# Order → fulfilled

Runs on the `order` type from `data/types/ecommerce/`. Declare that set first —
this workflow reads `status`, which is why the type spells it exactly that way.

**Why a human step.** Picking can be judged by an agent; *saying it shipped*
cannot, because the customer acts on it. The `human` step suspends the run until
someone confirms, so nobody is ever told a parcel left that did not.

## Steps

1. **Acknowledge** — the customer hears within a minute that the order landed.
2. **Pick** — the service agent assembles the order and flags anything out of stock.
3. **Confirm shipped** — a person approves. The run waits here.
4. **Tell the customer** — only reached after the approval.

```graph
{
  "steps": [
    { "id": "ack", "kind": "tool", "name": "Acknowledge the order",
      "config": { "receiver": "message:send", "template": "order-received" } },
    { "id": "pick", "kind": "agent", "name": "Pick and pack",
      "config": { "actorId": "service", "instructions": "Assemble the order from its items. If any line is short on stock, set the order status to `backordered`, say which line and stop — do not partially ship without a human saying so." } },
    { "id": "shipped", "kind": "human", "name": "Confirm it actually shipped",
      "config": { "assignee": "{{ owner }}", "prompt": "Order {{ order.reference }} is packed. Confirm it has left, and the customer will be told." } },
    { "id": "tell", "kind": "tool", "name": "Tell the customer it is on its way",
      "config": { "receiver": "message:send", "template": "order-shipped" } }
  ],
  "edges": [["ack", "pick"], ["pick", "shipped"], ["shipped", "tell"]]
}
```

## Changing it

Add a `sell` step before `ack` if you take payment inside the flow rather than
at checkout — it suspends the same way `human` does, and resumes when the buyer
pays. See the `sell` skill for which payment rail that should be.
