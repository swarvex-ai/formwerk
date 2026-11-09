// FORMWERK_ONLY=<id>,<id>: check only these assets one by one (scripts/pipeline-test.mjs sets it from the changed paths
// in the swarvex test pipeline). Not set or empty: all of them. "-": none (the change touches no single asset). Checks
// across the whole catalogue (unique ids, the catalogue, the lists) always run.
const ids = (process.env.FORMWERK_ONLY ?? "").split(",").map((x) => x.trim()).filter(Boolean);

/** Whether the asset with this id is checked in this run. */
export const checked = (id) => ids.length === 0 || ids.includes(id);
/** The items of a list (with an id) that are checked in this run. */
export const only = (list) => list.filter((x) => checked(x.id));
