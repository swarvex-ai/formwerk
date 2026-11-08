// The icons of the catalogue. A new icon is one file in its category folder plus one line here.
import type { AnyIcon } from "./define";
import { home } from "./navigation/home";
import { user } from "./navigation/user";
import { search } from "./actions/search";
import { bell } from "./status/bell";
import { mark } from "./status/mark";
import { gear } from "./objects/gear";

export const ICONS: AnyIcon[] = [home, user, search, bell, mark, gear];
export const iconById = (id: string) => ICONS.find((i) => i.id === id);
