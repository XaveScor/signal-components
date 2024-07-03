import { Atom, AtomState } from "@reatom/core";
import { InsideAtomProps } from "./InsideAtomProps";

type UnwrapAtoms<T> = Atom<{
  [K in keyof T]: T[K] extends Atom ? AtomState<T[K]> : T[K];
}>;

export type AllPropsProp<Props> = UnwrapAtoms<InsideAtomProps<Props>>;
