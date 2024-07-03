import { sAllProps } from "./specialProps";
import type { OnFunctionsOutsideProps } from "./types/OnFunctionsOutsideProps";
import { InsideAtomProps } from "./types/InsideAtomProps";
import { AllPropsProp } from "./types/AllPropsProp";
import { RawOutsideProps } from "./types/RawOutsideProps";

export type { AnyF } from "./types/AnyF";

export type InsideProps<Props> = InsideAtomProps<Props> & {
  [sAllProps]: AllPropsProp<Props>;
};

export type OutsideProps<Props> = OnFunctionsOutsideProps<Props> &
  RawOutsideProps<Props>;
