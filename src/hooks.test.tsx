import { describe, expect, test, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import { declareComponent } from "./index";
import { customRender } from "./test-utils";
import React from "react";
import { atom } from "@reatom/core";

// React recreate useMemo twice on mount in StrictMode
const StrictModePenalty = 2;

describe("hooks", () => {
  test("useState", () => {
    let innerSetState = (x: number) => {};
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

  test("context", () => {
    const countInit = vi.fn();
    const countRender = vi.fn();
    const context = React.createContext(1);
    const Component = declareComponent((_, { wireHook }) => {
      countInit();

      const number = wireHook(() => React.useContext(context));

      return ({ ctx }) => {
        countRender();
        return <div>{ctx.component(number)}</div>;
      };
    });

    const { rendered } = customRender(
      <context.Provider value={1}>
        <Component />
      </context.Provider>,
    );
    expect(countInit).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(countRender).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(screen.queryByText("1")).toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
    expect(screen.queryByText("3")).not.toBeInTheDocument();

    rendered.rerender(
      <context.Provider value={2}>
        <Component />
      </context.Provider>,
    );
    expect(countInit).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(countRender).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(screen.queryByText("2")).toBeInTheDocument();
    expect(screen.queryByText("3")).not.toBeInTheDocument();

    rendered.rerender(
      <context.Provider value={3}>
        <Component />
      </context.Provider>,
    );
    expect(countInit).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(countRender).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
    expect(screen.queryByText("3")).toBeInTheDocument();
  });

  test("spy", () => {
    const testAtom = atom(1);
    const countInit = vi.fn();
    const countRender = vi.fn();
    const Component = declareComponent((_, { wireHook }) => {
      countInit();

      const number = wireHook(({ spy }) => spy(testAtom));

      return ({ ctx }) => {
        countRender();
        return <div>{ctx.component(number)}</div>;
      };
    });

    const { ctx } = customRender(<Component />);
    expect(countInit).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(countRender).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(screen.queryByText("1")).toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
    expect(screen.queryByText("3")).not.toBeInTheDocument();

    act(() => {
      testAtom(ctx, 2);
    });
    expect(countInit).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(countRender).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(screen.queryByText("2")).toBeInTheDocument();
    expect(screen.queryByText("3")).not.toBeInTheDocument();

    act(() => {
      testAtom(ctx, 3);
    });
    expect(countInit).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(countRender).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
    expect(screen.queryByText("3")).toBeInTheDocument();
  });

  test("useMemo", () => {
    const countInit = vi.fn();
    const countRender = vi.fn();
    type Props = {
      x: number;
    };
    const Component = declareComponent<Props>(({ x }, { wireHook }) => {
      countInit();

      const number = wireHook(({ spy }) => {
        const v = spy(x);
        return React.useMemo(() => v, [v]);
      });

      return ({ ctx }) => {
        countRender();
        return <div>{ctx.component(number)}</div>;
      };
    });

    const { rendered } = customRender(<Component x={1} />);
    expect(countInit).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(countRender).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(screen.queryByText("1")).toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
    expect(screen.queryByText("3")).not.toBeInTheDocument();

    rendered.rerender(<Component x={2} />);
    expect(countInit).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(countRender).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(screen.queryByText("2")).toBeInTheDocument();
    expect(screen.queryByText("3")).not.toBeInTheDocument();

    rendered.rerender(<Component x={3} />);
    expect(countInit).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(countRender).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
    expect(screen.queryByText("3")).toBeInTheDocument();
  });

  test("useEffect", () => {
    const countInit = vi.fn();
    const countRender = vi.fn();
    const countEffect = vi.fn();
    type Props = {
      x: number;
    };
    const Component = declareComponent<Props>(({ x }, { wireHook }) => {
      countInit();

      wireHook(({ spy }) => {
        const v = spy(x);
        React.useEffect(() => {
          countEffect();
        }, [v]);
      });

      return ({ ctx }) => {
        countRender();
        return <div></div>;
      };
    });

    const { rendered } = customRender(<Component x={1} />);
    expect(countInit).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(countRender).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(countEffect).toHaveBeenCalledTimes(StrictModePenalty * 1);

    act(() => {
      rendered.rerender(<Component x={2} />);
    });
    expect(countInit).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(countRender).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(countEffect).toHaveBeenCalledTimes(StrictModePenalty * 1 + 1);

    act(() => {
      rendered.rerender(<Component x={3} />);
    });
    expect(countInit).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(countRender).toHaveBeenCalledTimes(StrictModePenalty * 1);
    expect(countEffect).toHaveBeenCalledTimes(StrictModePenalty * 1 + 2);
  });
});
