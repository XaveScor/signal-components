import { Atom } from "@reatom/core";

export type ConvertToAtom<T> = T extends Atom ? T : Atom<T>;
