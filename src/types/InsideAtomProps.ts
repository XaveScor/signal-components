import { OnFunctionInsideProps } from "./OnFunctionInsideProps";
import { RawInsideProps } from "./RawInsideProps";

export type InsideAtomProps<Props> = OnFunctionInsideProps<Props> &
  RawInsideProps<Props>;
