import { AnyF } from "./AnyF";

export type OnFunctionsProps<Props> = {
  [K in keyof Props as K extends `on${Capitalize<infer T>}`
    ? K
    : never]: Props[K] extends AnyF
    ? void extends ReturnType<Props[K]>
      ? Props[K]
      : never
    : never;
};
