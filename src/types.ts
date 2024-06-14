import { Atom, AtomState } from "@reatom/core";
import { sAllProps } from "./specialProps";

type ConvertToAtom<T> = T extends Atom ? T : Atom<T>;

type OnFunctionsProps<Props> = {
  [K in keyof Props as K extends `on${Capitalize<infer T>}`
    ? K
    : never]: Props[K] extends AnyF
    ? void extends ReturnType<Props[K]>
      ? Props[K]
      : never
    : never;
};

type RawInsideProps<Props> = {
  [K in keyof Props]: NonNullable<ConvertToAtom<Props[K]>>;
};

type _InsideProps<Props> = OnFunctionsProps<Props> &
  RawInsideProps<Omit<Props, keyof OnFunctionsProps<Props>>>;
type RequiredInsideProps<Props> = _InsideProps<Required<Props>>;

type UnwrapAtoms<T> = Atom<{
  [K in keyof T]: T[K] extends Atom ? AtomState<T[K]> : T[K];
}>;

export type AllPropsProp<Props> = UnwrapAtoms<RequiredInsideProps<Props>>;
export type InsideProps<Props> = RequiredInsideProps<Props> & {
  [sAllProps]: AllPropsProp<Props>;
};

export type AnyF = (...args: any[]) => any;

type RawOutsideProps<Props> = {
  [K in keyof Props]:
    | ConvertToAtom<Props[K]>
    | AtomState<ConvertToAtom<Props[K]>>;
};

export type OutsideProps<Props> = OnFunctionsProps<Props> &
  RawOutsideProps<Omit<Props, keyof OnFunctionsProps<Props>>>;
