// The Start panel's list and what one press does. Pure: no herdr imports, so tests
// import it. start.json (written by install.sh from the profile):
//   [{ "label": "What's new?", "prompt": "Tell me in plain English what changed…" }]

// Claude Code's own prefill cap for a link is 5000 characters; a button stays under it.
export const MAX_PROMPT = 5000;

export function validStart(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter((s) =>
    typeof s?.label === "string" && s.label.trim() && s.label.length <= 40 &&
    typeof s.prompt === "string" && s.prompt.trim() && s.prompt.length <= MAX_PROMPT);
}

// One press: a Claude Code tab in the active space, in the folder that space is in,
// started with the request. `space`: { id, place } where place is its live folder.
export function startTab(item, space) {
  const args = { name: item.label, argv: ["claude"], task: item.prompt };
  if (space?.id) args.space = space.id;
  if (space?.place) args.folder = space.place;
  return args;
}
