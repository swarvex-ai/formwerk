// Formwerk: the gallery, or the test mode for the scene tests (?test&asset=<id>).
import { startGallery } from "./gallery/gallery";
import { startTest } from "./gallery/test";

const params = new URLSearchParams(location.search);
if (params.has("test")) await startTest(params);
else await startGallery();
