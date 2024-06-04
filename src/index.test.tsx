import { describe, test, expect, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import { declareComponent, defaults } from "./index";
import { atom } from "@reatom/core";
import { customRender } from "./test-utils";

// React recreate useMemo twice on mount in StrictMode
const StrictModePenalty = 2;

describe("declare component", () => {
  describe("outside prop", () => {
    const Component = declareComponent<{ x: number }>(({ x }) => {
      const y = atom((ctx) => ctx.spy(x) + 1);

      return ({ spy }) => {
        return <div>{spy(y)}</div>;
      };
    });
    test("primitive", () => {
      customRender(<Component x={1} />);
      expect(screen.queryByText("2")).toBeInTheDocument();
      expect(screen.queryByText("1")).not.toBeInTheDocument();
    });

    test("atom", () => {
      customRender(<Component x={atom(1)} />);

      expect(screen.queryByText("2")).toBeInTheDocument();
      expect(screen.queryByText("1")).not.toBeInTheDocument();
    });

    test("function non-stable", () => {
      const Component = declareComponent<{ x: () => number }>(({ x }) => {
        const y = atom((ctx) => ctx.spy(x)() + 1);

        return ({ spy }) => {
          return <div>{spy(y)}</div>;
        };
      });

      customRender(<Component x={() => 1} />);
      expect(screen.queryByText("2")).toBeInTheDocument();

      customRender(<Component x={() => 2} />);
      expect(screen.queryByText("3")).toBeInTheDocument();
    });
  });

  describe("change prop", () => {
    const Component = declareComponent<{ x?: number }>(({ x }) => {
      const y = atom((ctx) => (ctx.spy(x) ?? 0) + 1);

      return ({ spy }) => {
        return <div>{spy(y)}</div>;
      };
    });

    test("primitive => primitive", () => {
      const { rendered } = customRender(<Component x={1} />);

      expect(screen.queryByText("2")).toBeInTheDocument();

      rendered.rerender(<Component x={2} />);
      expect(screen.queryByText("3")).toBeInTheDocument();
    });

    test("primitive => atom", () => {
      const { rendered } = customRender(<Component x={1} />);

      expect(screen.queryByText("2")).toBeInTheDocument();

      rendered.rerender(<Component x={atom(2)} />);
      expect(screen.queryByText("3")).toBeInTheDocument();
    });

    test("atom => atom", () => {
      const { rendered } = customRender(<Component x={atom(1)} />);

      expect(screen.queryByText("2")).toBeInTheDocument();

      rendered.rerender(<Component x={atom(2)} />);
      expect(screen.queryByText("3")).toBeInTheDocument();
    });

    test("atom + change value", async () => {
      const a = atom(1);
      const { ctx } = customRender(<Component x={a} />);
      expect(screen.queryByText("2")).toBeInTheDocument();
      await act(() => ctx.schedule(() => act(() => a(ctx, 2))));
      expect(screen.queryByText("3")).toBeInTheDocument();
    });

    test("atom => atom + change value", async () => {
      const { rendered, ctx } = customRender(<Component x={atom(1)} />);

      expect(screen.queryByText("2")).toBeInTheDocument();

      const a = atom(2);
      rendered.rerender(<Component x={a} />);
      expect(screen.queryByText("3")).toBeInTheDocument();
      await act(() => ctx.schedule(() => a(ctx, 4)));
      expect(screen.queryByText("5")).toBeInTheDocument();
    });

    test("atom => primitive", () => {
      const { rendered } = customRender(<Component x={atom(1)} />);

      expect(screen.queryByText("2")).toBeInTheDocument();

      rendered.rerender(<Component x={2} />);
      expect(screen.queryByText("3")).toBeInTheDocument();
    });

    test("atom => undefined", () => {
      const { rendered } = customRender(<Component x={atom(1)} />);

      expect(screen.queryByText("2")).toBeInTheDocument();

      rendered.rerender(<Component />);
      expect(screen.queryByText("1")).toBeInTheDocument();
    });

    test("primitive => undefined", () => {
      const { rendered } = customRender(<Component x={1} />);

      expect(screen.queryByText("2")).toBeInTheDocument();

      rendered.rerender(<Component />);
      expect(screen.queryByText("1")).toBeInTheDocument();
    });
  });

  describe("rerender", () => {
    describe("parent => child", () => {
      test("change prop in parent should rerender only child react phase", () => {
        const initChild = vi.fn();
        const Child = declareComponent<{ x: number }>(({ x }) => {
          initChild();
          return ({ spy }) => {
            return <div>{spy(x)}</div>;
          };
        });

        const initParent = vi.fn();
        const renderParent = vi.fn();
        const Parent = declareComponent<{ x: number }>(({ x }) => {
          initParent();
          return () => {
            renderParent();
            return <Child x={x} />;
          };
        });

        const { rendered } = customRender(<Parent x={1} />);
        expect(initParent).toHaveBeenCalledTimes(StrictModePenalty * 1);
        expect(initChild).toHaveBeenCalledTimes(StrictModePenalty * 1);
        expect(renderParent).toHaveBeenCalledTimes(StrictModePenalty * 1);

        rendered.rerender(<Parent x={2} />);
        expect(initParent).toHaveBeenCalledTimes(StrictModePenalty * 1);
        expect(initChild).toHaveBeenCalledTimes(StrictModePenalty * 1);
        expect(renderParent).toHaveBeenCalledTimes(StrictModePenalty * 1);
      });
    });

    describe("init phase", () => {
      test("once(twice because of strictMode)", () => {
        const count = vi.fn();
        const Component = declareComponent<{ x: number }>(({ x }) => {
          count();
          return ({ spy }) => {
            return <div>{spy(x)}</div>;
          };
        });

        const { rendered } = customRender(<Component x={1} />);
        expect(count).toHaveBeenCalledTimes(StrictModePenalty * 1);
        rendered.rerender(<Component x={2} />);
        expect(count).toHaveBeenCalledTimes(StrictModePenalty * 1);
        rendered.rerender(<Component x={3} />);
        expect(count).toHaveBeenCalledTimes(StrictModePenalty * 1);
      });
    });

    describe("react phase", () => {
      test("primitive => primitive", () => {
        const count = vi.fn();
        const Component = declareComponent<{ x: number }>(({ x }) => {
          return ({ spy }) => {
            count();
            return <div>{spy(x)}</div>;
          };
        });

        const { rendered } = customRender(<Component x={1} />);
        expect(count).toHaveBeenCalledTimes(StrictModePenalty * 1);
        rendered.rerender(<Component x={1} />);
        expect(count).toHaveBeenCalledTimes(StrictModePenalty * 1);
      });

      test("primitive => atom", () => {
        const count = vi.fn();
        const Component = declareComponent<{ x: number }>(({ x }) => {
          return ({ spy }) => {
            count();
            return <div>{spy(x)}</div>;
          };
        });

        const { rendered } = customRender(<Component x={1} />);
        expect(count).toHaveBeenCalledTimes(StrictModePenalty * 1);
        rendered.rerender(<Component x={atom(1)} />);
        expect(count).toHaveBeenCalledTimes(StrictModePenalty * 1);
      });

      test("atom => atom", () => {
        const count = vi.fn();
        const Component = declareComponent<{ x: number }>(({ x }) => {
          return ({ spy }) => {
            count();
            return <div>{spy(x)}</div>;
          };
        });

        const { rendered } = customRender(<Component x={atom(1)} />);
        expect(count).toHaveBeenCalledTimes(StrictModePenalty * 1);
        rendered.rerender(<Component x={atom(1)} />);
        expect(count).toHaveBeenCalledTimes(StrictModePenalty * 1);
      });

      test("atom => primitive", () => {
        const count = vi.fn();
        const Component = declareComponent<{ x: number }>(({ x }) => {
          return ({ spy }) => {
            count();
            return <div>{spy(x)}</div>;
          };
        });

        const { rendered } = customRender(<Component x={atom(1)} />);
        expect(count).toHaveBeenCalledTimes(StrictModePenalty * 1);
        rendered.rerender(<Component x={1} />);
        expect(count).toHaveBeenCalledTimes(StrictModePenalty * 1);
      });
    });

    describe("spy.component", () => {
      test("isolated", () => {
        const count = vi.fn();
        const Component = declareComponent<{ x: number }>(({ x }) => {
          return ({ component }) => {
            count();
            return <div>{component(x)}</div>;
          };
        });

        const { rendered } = customRender(<Component x={1} />);
        expect(count).toHaveBeenCalledTimes(StrictModePenalty * 1);
        expect(screen.queryByText("1")).toBeInTheDocument();
        expect(screen.queryByText("2")).not.toBeInTheDocument();
        rendered.rerender(<Component x={2} />);
        expect(count).toHaveBeenCalledTimes(StrictModePenalty * 1);
        expect(screen.queryByText("1")).not.toBeInTheDocument();
        expect(screen.queryByText("2")).toBeInTheDocument();
      });

      test("mapper", () => {
        const count = vi.fn();
        const Component = declareComponent<{ x: number }>(({ x }) => {
          return ({ component }) => {
            count();
            return <div>{component(x, (x) => "x" + 10 * x)}</div>;
          };
        });

        const { rendered } = customRender(<Component x={1} />);
        expect(count).toHaveBeenCalledTimes(StrictModePenalty * 1);
        expect(screen.queryByText("x10")).toBeInTheDocument();
        expect(screen.queryByText("x20")).not.toBeInTheDocument();
        rendered.rerender(<Component x={2} />);
        expect(count).toHaveBeenCalledTimes(StrictModePenalty * 1);
        expect(screen.queryByText("x10")).not.toBeInTheDocument();
        expect(screen.queryByText("x20")).toBeInTheDocument();
      });
    });
  });

  describe("optional internal props", () => {
    test("optional props", () => {
      const Component = declareComponent<{ x?: number }>(({ x }) => {
        const y = atom((ctx) =>
          ctx.spy(x) !== undefined ? "defined1" : "undefined2",
        );

        return ({ spy }) => {
          return <div>{spy(y)}</div>;
        };
      });

      const { rendered } = customRender(<Component />);

      expect(screen.queryByText("undefined2")).toBeInTheDocument();

      rendered.rerender(<Component x={2} />);
      expect(screen.queryByText("defined1")).toBeInTheDocument();
    });

    test("defaults", () => {
      const Component = declareComponent<{ x?: number }>((props) => {
        const { x } = defaults(props, { x: 1 });
        return ({ spy }) => {
          return <div>{spy(x)}</div>;
        };
      });

      const { rendered } = customRender(<Component />);

      expect(screen.queryByText("1")).toBeInTheDocument();
    });
  });

  describe("ctx", () => {
    const obj = {
      ctx: null as any,
      Component: declareComponent(() => {
        return ({ spy, component, reatomCtx }) => {
          obj.ctx = {
            spy,
            component,
            reatomCtx,
          };
          return <></>;
        };
      }),
    };

    test("spy", () => {
      customRender(<obj.Component />);
      expect(obj.ctx?.spy).toStrictEqual(expect.any(Function));
    });

    test("component", () => {
      customRender(<obj.Component />);
      expect(obj.ctx?.component).toStrictEqual(expect.any(Function));
    });

    test("reatomCtx", () => {
      customRender(<obj.Component />);
      expect(obj.ctx?.reatomCtx).toStrictEqual(expect.any(Object));
    });
  });
});
