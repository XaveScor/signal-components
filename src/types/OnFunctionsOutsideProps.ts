import { AnyF } from "./AnyF";
import { SplitPropsByName } from "./SplitPropsByName";
import { IsExact } from "./IsExact";

type CalculateProp<F> = F extends AnyF
  ? IsExact<ReturnType<F>, void> extends true
    ? F
    : never
  : never;
type CalculateOptionalProp<F> = CalculateProp<NonNullable<F>>;

type FilterFunctions<Props> = {
  [K in keyof Props]: CalculateOptionalProp<Props[K]>;
};

export type OnFunctionsOutsideProps<Props> = FilterFunctions<
  SplitPropsByName<Props>["onFunctions"]
>;
