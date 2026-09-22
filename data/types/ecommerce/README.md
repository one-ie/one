# data/types/ecommerce — a Shopify-shaped type set

Five types that give you a working shop admin: products, collections, orders,
customers, discounts.

## Turning it on

Every file here starts with `_`, which the `one push` compiler skips
(`compiler.ts` walks `data/types/**.toml` and ignores any basename beginning
with an underscore). Drop the underscore on the types you want, then push:

```bash
mv data/types/ecommerce/_product.toml data/types/ecommerce/product.toml
mv data/types/ecommerce/_order.toml   data/types/ecommerce/order.toml
one push
```

`one push` sends every type file in `data/types/` as ONE `world:declare-types`
call, so the whole set lands together and the sets you left underscored stay
out of the manifest. Mix freely — a shop that also teaches courses can enable
`ecommerce/_product.toml` and an `lms/` type side by side.

> **Needs `@oneie/cli` 4.2.1 or newer.** Up to and including 4.2.0 the compiler
> sent one `world:declare-types` call per TOML file, and that receiver REPLACES
> the manifest rather than adding to it — so a five-file set pushed five times
> and left you with one type, while the CLI reported `Pushed 5/5 item(s).`
> Check with `one --version`; on an older build, enable one type at a time and
> confirm each in the console before enabling the next.

## What you get, without writing code

A declared type generates its own navigation entry, a searchable index table
with inline cell editing and bulk delete, a two-column detail page, and a
create/edit form. A type with a `status` field also gets a Table/Kanban toggle
— which is why `status` is spelled exactly that way in `_order.toml` and
`_product.toml` rather than `state` or `stage`.

## Field kinds

`text · number · currency · tags · select · image · date · markdown · relation`
are what the index and the form render from. A `relation` field resolves to the
linked record's name and draws a line between the two types in the schema
designer. Anything the compiler does not recognise falls back to `text`, so an
unknown kind degrades rather than failing the push.

## Editing

These are starting points, not a schema you are stuck with. Add a `[[fields]]`
block and push again — the column appears in the index and the form
immediately, with no migration. The visual schema designer edits the same
manifest, so a field added in the browser and a field added here are the same
thing.
