// Formwerk icons as a library, without three.js: `import { home, gear } from "formwerk/icons"`. Every icon is a
// function of its parameters and returns the drawing: `.svg()` as text in the text colour (currentColor), `.pixels(size)`
// as RGBA pixels in any size, both from the same geometry.
import type { Values } from "../core/params";
import { makeIcon, type Icon, type StyleSchema } from "./define";
import { home as homeIcon } from "./navigation/home";
import { user as userIcon } from "./navigation/user";
import { arrow as arrowIcon } from "./navigation/arrow";
import { list as listIcon } from "./navigation/list";
import { search as searchIcon } from "./actions/search";
import { close as closeIcon } from "./actions/close";
import { plus as plusIcon } from "./actions/plus";
import { check as checkIcon } from "./actions/check";
import { trash as trashIcon } from "./actions/trash";
import { pencil as pencilIcon } from "./actions/pencil";
import { download as downloadIcon } from "./actions/download";
import { play as playIcon } from "./actions/play";
import { copy as copyIcon } from "./actions/copy";
import { undo as undoIcon } from "./actions/undo";
import { redo as redoIcon } from "./actions/redo";
import { bell as bellIcon } from "./status/bell";
import { mark as markIcon } from "./status/mark";
import { heart as heartIcon } from "./status/heart";
import { star as starIcon } from "./status/star";
import { lock as lockIcon } from "./status/lock";
import { eye as eyeIcon } from "./status/eye";
import { clock as clockIcon } from "./status/clock";
import { warning as warningIcon } from "./status/warning";
import { info as infoIcon } from "./status/info";
import { wifi as wifiIcon } from "./status/wifi";
import { gear as gearIcon } from "./objects/gear";
import { mail as mailIcon } from "./objects/mail";
import { chart as chartIcon } from "./objects/chart";
import { sliders as slidersIcon } from "./objects/sliders";
import { folder as folderIcon } from "./objects/folder";
import { calendar as calendarIcon } from "./objects/calendar";

export { ICONS, iconById } from "./index";
export { makeIcon, ICON_CATEGORIES, STYLE } from "./define";
export { legibility, GRID } from "../core/vector";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Input<I extends Icon<any>> = Partial<Values<I["params"] & StyleSchema>> & { preset?: Extract<keyof I["presets"], string> };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const zeichen = <I extends Icon<any>>(i: I) => (values: Input<I> = {}) => makeIcon(i, values);

export const home = zeichen(homeIcon);
export const user = zeichen(userIcon);
export const arrow = zeichen(arrowIcon);
export const list = zeichen(listIcon);
export const search = zeichen(searchIcon);
export const close = zeichen(closeIcon);
export const plus = zeichen(plusIcon);
export const check = zeichen(checkIcon);
export const trash = zeichen(trashIcon);
export const pencil = zeichen(pencilIcon);
export const download = zeichen(downloadIcon);
export const play = zeichen(playIcon);
export const copy = zeichen(copyIcon);
export const undo = zeichen(undoIcon);
export const redo = zeichen(redoIcon);
export const bell = zeichen(bellIcon);
export const mark = zeichen(markIcon);
export const heart = zeichen(heartIcon);
export const star = zeichen(starIcon);
export const lock = zeichen(lockIcon);
export const eye = zeichen(eyeIcon);
export const clock = zeichen(clockIcon);
export const warning = zeichen(warningIcon);
export const info = zeichen(infoIcon);
export const wifi = zeichen(wifiIcon);
export const gear = zeichen(gearIcon);
export const mail = zeichen(mailIcon);
export const chart = zeichen(chartIcon);
export const sliders = zeichen(slidersIcon);
export const folder = zeichen(folderIcon);
export const calendar = zeichen(calendarIcon);
