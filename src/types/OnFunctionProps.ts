import { AnyF } from "./AnyF";
import { SplitPropsByName } from "./SplitPropsByName";

type FilterFunctions<Props> = {
  [K in keyof Props]: Props[K] extends AnyF
    ? void extends ReturnType<Props[K]>
      ? Props[K]
      : never
    : never;
};

export type OnFunctionsProps<Props> = FilterFunctions<
  SplitPropsByName<Props>["onFunctions"]
>;
