import { describe, test, expect, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import { declareComponent } from "./index";
import { customRender } from "./test-utils";
import React, { Dispatch, SetStateAction } from "react";

// React recreate useMemo twice on mount in StrictMode
const StrictModePenalty = 2;

describe("hooks", () => {
  test("useState", () => {
    let innerSetState: Dispatch<SetStateAction<number>> = () => {};
    const countInit = vi.fn();
    const countRender = vi.fn();
    const Component = declareComponent((_, { wireHook }) => {
      countInit();

      const number = wireHook(() => {
        const [state, setState] = React.useState(1);
        innerSetState = setState;
        return state;
      });

      return ({ ctx }) => {
        countRender();
        return <div>{ctx.component(number)}</div>;
      };
    });

    customRender(<Component />);
    expect(countInit).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(countRender).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(screen.queryByText("1")).toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
    expect(screen.queryByText("3")).not.toBeInTheDocument();

    act(() => {
      innerSetState(2);
    });
    expect(countInit).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(countRender).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(screen.queryByText("2")).toBeInTheDocument();
    expect(screen.queryByText("3")).not.toBeInTheDocument();

    act(() => {
      innerSetState(3);
    });
    expect(countInit).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(countRender).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
    expect(screen.queryByText("3")).toBeInTheDocument();
  });
});
