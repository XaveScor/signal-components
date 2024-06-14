import { InsideProps } from "./types";
import { sAllProps } from "./specialProps";

export function getAllPropsSignal<Props>(props: InsideProps<Props>) {
  return props[sAllProps];
}
