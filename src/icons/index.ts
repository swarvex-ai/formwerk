// The icons of the catalogue. A new icon is one file in its category folder plus one line here.
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
import { bell } from "./status/bell";
import { mark } from "./status/mark";
import { heart } from "./status/heart";
import { star } from "./status/star";
import { lock } from "./status/lock";
import { eye } from "./status/eye";
import { clock } from "./status/clock";
import { gear } from "./objects/gear";
import { mail } from "./objects/mail";
import { chart } from "./objects/chart";

export const ICONS: AnyIcon[] = [
  home, user, arrow, list,
  search, close, plus, check, trash, pencil, download, play,
  bell, mark, heart, star, lock, eye, clock,
  gear, mail, chart,
];
export const iconById = (id: string) => ICONS.find((i) => i.id === id);
