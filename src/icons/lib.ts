// Formwerk icons as a library, without three.js: `import { home, gear } from "formwerk/icons"`. Every icon is a
// function of its parameters and returns the drawing: `.svg()` as text in the text colour (currentColor), `.pixels(size)`
// as RGBA pixels in any size, both from the same geometry.
import type { Values } from "../core/params";
import { makeIcon, type Icon, type StyleSchema } from "./define";
import { home as i1 } from "./navigation/home";
import { user as i2 } from "./navigation/user";
import { search as i3 } from "./actions/search";
import { bell as i4 } from "./status/bell";
import { mark as i5 } from "./status/mark";
import { gear as i6 } from "./objects/gear";

export { ICONS, iconById } from "./index";
export { makeIcon, ICON_CATEGORIES, STYLE } from "./define";
export { legibility, GRID } from "../core/vector";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Input<I extends Icon<any>> = Partial<Values<I["params"] & StyleSchema>> & { preset?: Extract<keyof I["presets"], string> };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const zeichen = <I extends Icon<any>>(i: I) => (values: Input<I> = {}) => makeIcon(i, values);

export const home = zeichen(i1), user = zeichen(i2), search = zeichen(i3), bell = zeichen(i4), mark = zeichen(i5), gear = zeichen(i6);
