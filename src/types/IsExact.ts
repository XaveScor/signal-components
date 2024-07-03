export type IsExact<T1, T2> = T1 extends T2
  ? T2 extends T1
    ? true
    : false
  : false;
