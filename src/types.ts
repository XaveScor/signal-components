import { Atom, AtomState } from "@reatom/core";
import { sAllProps } from "./specialProps";
import type { OnFunctionsOutsideProps } from "./types/OnFunctionsOutsideProps";
import type { OnFunctionInsideProps } from "./types/OnFunctionInsideProps";
import { ConvertToAtom } from "./types/ConvertToAtom";
import { RawInsideProps } from "./types/RawInsideProps";

export type { AnyF } from "./types/AnyF";

type RequiredInsideProps<Props> = OnFunctionInsideProps<Props> &
  RawInsideProps<Props>;

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

export type OutsideProps<Props> = OnFunctionsOutsideProps<Props> &
  RawOutsideProps<Omit<Props, keyof OnFunctionsOutsideProps<Props>>>;
