// Formwerk icons as a library, without three.js: `import { home, gear } from "formwerk/icons"`. Every icon is a
// function of its parameters and returns the drawing: `.svg()` as text in the text colour (currentColor), `.pixels(size)`
// as RGBA pixels in any size, both from the same geometry.
import type { Values } from "../core/params";
import { makeIcon, type Icon, type StyleSchema } from "./define";
import { home as i1 } from "./navigation/home";
import { user as i2 } from "./navigation/user";
import { arrow as i3 } from "./navigation/arrow";
import { list as i4 } from "./navigation/list";
import { search as i5 } from "./actions/search";
import { close as i6 } from "./actions/close";
import { plus as i7 } from "./actions/plus";
import { check as i8 } from "./actions/check";
import { trash as i9 } from "./actions/trash";
import { pencil as i10 } from "./actions/pencil";
import { download as i11 } from "./actions/download";
import { play as i12 } from "./actions/play";
import { bell as i13 } from "./status/bell";
import { mark as i14 } from "./status/mark";
import { heart as i15 } from "./status/heart";
import { star as i16 } from "./status/star";
import { lock as i17 } from "./status/lock";
import { eye as i18 } from "./status/eye";
import { clock as i19 } from "./status/clock";
import { gear as i20 } from "./objects/gear";
import { mail as i21 } from "./objects/mail";
import { chart as i22 } from "./objects/chart";

export { ICONS, iconById } from "./index";
export { makeIcon, ICON_CATEGORIES, STYLE } from "./define";
export { legibility, GRID } from "../core/vector";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Input<I extends Icon<any>> = Partial<Values<I["params"] & StyleSchema>> & { preset?: Extract<keyof I["presets"], string> };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const zeichen = <I extends Icon<any>>(i: I) => (values: Input<I> = {}) => makeIcon(i, values);

export const home = zeichen(i1),
  user = zeichen(i2),
  arrow = zeichen(i3),
  list = zeichen(i4),
  search = zeichen(i5),
  close = zeichen(i6),
  plus = zeichen(i7),
  check = zeichen(i8),
  trash = zeichen(i9),
  pencil = zeichen(i10),
  download = zeichen(i11),
  play = zeichen(i12),
  bell = zeichen(i13),
  mark = zeichen(i14),
  heart = zeichen(i15),
  star = zeichen(i16),
  lock = zeichen(i17),
  eye = zeichen(i18),
  clock = zeichen(i19),
  gear = zeichen(i20),
  mail = zeichen(i21),
  chart = zeichen(i22);
