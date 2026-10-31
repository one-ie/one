// node cli.mjs <file.md>  → JSON from render(). The viewer calls this: marked is slow in Herdr's own engine.
import { readFileSync } from "node:fs";
import { render } from "./render.mjs";
const file = process.argv[2];
process.stdout.write(JSON.stringify(render(readFileSync(file, "utf8"), file)));
