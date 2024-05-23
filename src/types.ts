import { Atom, AtomState } from "@reatom/core";

type ConvertToAtom<T> = T extends Atom ? T : Atom<T>;
export type InsideProps<Props> = Required<{
  [K in keyof Props]: NonNullable<ConvertToAtom<Props[K]>>;
}>;

export type OutsideProps<Props> = {
  [K in keyof Props]:
    | ConvertToAtom<Props[K]>
    | AtomState<ConvertToAtom<Props[K]>>;
};
