import { ConvertToAtom } from "./ConvertToAtom";
import { SplitPropsByName } from "./SplitPropsByName";

type AtomizedProps<Props> = {
  [K in keyof Props]-?: NonNullable<ConvertToAtom<Props[K]>>;
};

export type RawInsideProps<Props> = AtomizedProps<
  SplitPropsByName<Props>["atoms"]
>;
