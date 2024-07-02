type OnFunctions<Props> = {
  [K in keyof Props as K extends `on${Capitalize<infer T>}`
    ? K
    : never]: Props[K];
};

export type SplitPropsByName<Props> = {
  onFunctions: OnFunctions<Props>;
  atoms: Omit<Props, keyof OnFunctions<Props>>;
};
