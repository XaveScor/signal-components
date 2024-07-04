type IsOptional<T, K extends keyof T> = {} extends Pick<T, K> ? true : false;

export type MoveUndefinedToOptional<T> = {
  [K in keyof T as IsOptional<T, K> extends true ? K : never]: T[K];
} & {
  [K in keyof T as IsOptional<T, K> extends false
    ? undefined extends T[K]
      ? never
      : K
    : never]: T[K];
} & {
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K];
};
