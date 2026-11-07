// Formwerk: the gallery, or the test mode for the scene tests (?test&asset=<id>). Each tab of the gallery loads its own
// module, so the sounds open without three.js.
const params = new URLSearchParams(location.search);
if (params.has("test")) await (await import("./gallery/test")).startTest(params);
else await (await import("./gallery/shell")).startShell();

export {};
