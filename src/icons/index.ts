// The icons of the catalogue. A new icon is one file in its category folder plus its import and its entry here,
// each on a line of its own (never two on one line: parallel tasks then merge cleanly, see .gitattributes).
import type { AnyIcon } from "./define";
import { home } from "./navigation/home";
import { user } from "./navigation/user";
import { arrow } from "./navigation/arrow";
import { list } from "./navigation/list";
import { search } from "./actions/search";
import { close } from "./actions/close";
import { plus } from "./actions/plus";
import { check } from "./actions/check";
import { trash } from "./actions/trash";
import { pencil } from "./actions/pencil";
import { download } from "./actions/download";
import { play } from "./actions/play";
import { copy } from "./actions/copy";
import { undo } from "./actions/undo";
import { redo } from "./actions/redo";
import { bell } from "./status/bell";
import { mark } from "./status/mark";
import { heart } from "./status/heart";
import { star } from "./status/star";
import { lock } from "./status/lock";
import { eye } from "./status/eye";
import { clock } from "./status/clock";
import { warning } from "./status/warning";
import { info } from "./status/info";
import { wifi } from "./status/wifi";
import { gear } from "./objects/gear";
import { mail } from "./objects/mail";
import { chart } from "./objects/chart";
import { sliders } from "./objects/sliders";
import { folder } from "./objects/folder";
import { calendar } from "./objects/calendar";

export const ICONS: AnyIcon[] = [
  home,
  user,
  arrow,
  list,
  search,
  close,
  plus,
  check,
  trash,
  pencil,
  download,
  play,
  copy,
  undo,
  redo,
  bell,
  mark,
  heart,
  star,
  lock,
  eye,
  clock,
  warning,
  info,
  wifi,
  gear,
  mail,
  chart,
  sliders,
  folder,
  calendar,
];
export const iconById = (id: string) => ICONS.find((i) => i.id === id);
