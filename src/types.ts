import { AtomState } from "@reatom/core";
import { sAllProps } from "./specialProps";
import type { OnFunctionsOutsideProps } from "./types/OnFunctionsOutsideProps";
import { ConvertToAtom } from "./types/ConvertToAtom";
import { InsideAtomProps } from "./types/InsideAtomProps";
import { AllPropsProp } from "./types/AllPropsProp";

export type { AnyF } from "./types/AnyF";

export type InsideProps<Props> = InsideAtomProps<Props> & {
  [sAllProps]: AllPropsProp<Props>;
};

type RawOutsideProps<Props> = {
  [K in keyof Props]:
    | ConvertToAtom<Props[K]>
    | AtomState<ConvertToAtom<Props[K]>>;
};

export type OutsideProps<Props> = OnFunctionsOutsideProps<Props> &
  RawOutsideProps<Omit<Props, keyof OnFunctionsOutsideProps<Props>>>;
