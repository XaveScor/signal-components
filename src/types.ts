import { Atom, AtomState } from "@reatom/core";

type ConvertToAtom<T> = T extends Atom ? T : Atom<T>;

type OnFunctionsProps<Props> = RemoveNever<{
  [K in keyof Props as K extends `on${Capitalize<infer T>}`
    ? K
    : never]: Props[K] extends AnyF ? Props[K] : never;
}>;

type RawInsideProps<Props> = {
  [K in keyof Props]: NonNullable<ConvertToAtom<Props[K]>>;
};

type _InsideProps<Props> = OnFunctionsProps<Props> &
  RawInsideProps<Omit<Props, keyof OnFunctionsProps<Props>>>;
export type InsideProps<Props> = _InsideProps<Required<Props>>;

export type AnyF = (...args: any[]) => any;
type RemoveNever<Props> = {
  [K in keyof Props as Props[K] extends never ? never : K]: Props[K];
};

type RawOutsideProps<Props> = {
  [K in keyof Props]:
    | ConvertToAtom<Props[K]>
    | AtomState<ConvertToAtom<Props[K]>>;
};

export type OutsideProps<Props> = OnFunctionsProps<Props> &
  RawOutsideProps<Omit<Props, keyof OnFunctionsProps<Props>>>;
