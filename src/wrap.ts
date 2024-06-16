import React, {
  Component,
  ForwardRefExoticComponent,
  JSX,
  ReactNode,
} from "react";
import { declareComponent } from "./declareComponent";
import { getAllPropsSignal } from "./getAllPropsSignal";

export function wrap<
  CT extends
    | ForwardRefExoticComponent<any>
    | { new (props: any): Component<any> }
    | ((props: any, deprecatedLegacyContext?: any) => ReactNode)
    | keyof JSX.IntrinsicElements,
>(type: CT) {
  return declareComponent<React.ComponentProps<CT>>((props) => {
    return ({ spy }) => {
      const allProps = spy(getAllPropsSignal(props));

      return React.createElement(type, allProps);
    };
  });
}
