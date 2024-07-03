import { ConvertToAtom } from "./ConvertToAtom";
import { AtomState } from "@reatom/core";
import { SplitPropsByName } from "./SplitPropsByName";

type RawOutsidePropsValues<Props> = {
  [K in keyof Props]:
    | ConvertToAtom<Props[K]>
    | AtomState<ConvertToAtom<Props[K]>>;
};

export type RawOutsideProps<Props> = RawOutsidePropsValues<
  SplitPropsByName<Props>["atoms"]
>;
