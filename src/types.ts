import { Atom, AtomState } from "@reatom/core";
import { sAllProps } from "./specialProps";
import type { OnFunctionsProps } from "./types/OnFunctionProps";
import { ConvertToAtom } from "./types/ConvertToAtom";
import { RawInsideProps } from "./types/RawInsideProps";

export type { AnyF } from "./types/AnyF";

type _InsideProps<Props> = OnFunctionsProps<Props> & RawInsideProps<Props>;
type RequiredInsideProps<Props> = _InsideProps<Required<Props>>;

type UnwrapAtoms<T> = Atom<{
  [K in keyof T]: T[K] extends Atom ? AtomState<T[K]> : T[K];
}>;

export type AllPropsProp<Props> = UnwrapAtoms<RequiredInsideProps<Props>>;
export type InsideProps<Props> = RequiredInsideProps<Props> & {
  [sAllProps]: AllPropsProp<Props>;
};

type RawOutsideProps<Props> = {
  [K in keyof Props]:
    | ConvertToAtom<Props[K]>
    | AtomState<ConvertToAtom<Props[K]>>;
};

export type OutsideProps<Props> = OnFunctionsProps<Props> &
  RawOutsideProps<Omit<Props, keyof OnFunctionsProps<Props>>>;
