import { AnyF } from "./AnyF";
import { SplitPropsByName } from "./SplitPropsByName";

type CalculateProp<F> = F extends AnyF
  ? void extends ReturnType<F>
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
