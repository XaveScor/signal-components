import { OnFunctionsOutsideProps } from "./OnFunctionsOutsideProps";

export type OnFunctionInsideProps<Props> = Required<
  OnFunctionsOutsideProps<Props>
>;
