import { describe, test, expect, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import { declareComponent } from "./index";
import { atom } from "@reatom/core";
import { customRender } from "./test-utils";

// React recreate useMemo twice on mount in StrictMode
const StrictModePenalty = 2;

describe("declare component", () => {
  describe("prop", () => {
    const Component = declareComponent<{ x: number }>(({ x }) => {
      const y = atom((ctx) => ctx.spy(x) + 1);

      return (ctx) => {
        return <div>{ctx.spy(y)}</div>;
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
  });

  describe("change prop", () => {
    const Component = declareComponent<{ x?: number }>(({ x }) => {
      const y = atom((ctx) => (ctx.spy(x) ?? 0) + 1);

      return (ctx) => {
        return <div>{ctx.spy(y)}</div>;
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
          return (ctx) => {
            return <div>{ctx.spy(x)}</div>;
          };
        });

        const initParent = vi.fn();
        const renderParent = vi.fn();
        const Parent = declareComponent<{ x: number }>(({ x }) => {
          initParent();
          return (ctx) => {
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
          return (ctx) => {
            return <div>{ctx.spy(x)}</div>;
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
          return (ctx) => {
            count();
            return <div>{ctx.spy(x)}</div>;
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
          return (ctx) => {
            count();
            return <div>{ctx.spy(x)}</div>;
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
          return (ctx) => {
            count();
            return <div>{ctx.spy(x)}</div>;
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
          return (ctx) => {
            count();
            return <div>{ctx.spy(x)}</div>;
          };
        });

        const { rendered } = customRender(<Component x={atom(1)} />);
        expect(count).toHaveBeenCalledTimes(StrictModePenalty * 1);
        rendered.rerender(<Component x={1} />);
        expect(count).toHaveBeenCalledTimes(StrictModePenalty * 1);
      });
    });
  });

  test("optional props", () => {
    const Component = declareComponent<{ x?: number }>(({ x }) => {
      const y = atom((ctx) =>
        ctx.spy(x) !== undefined ? "defined1" : "undefined2",
      );

      return (ctx) => {
        return <div>{ctx.spy(y)}</div>;
      };
    });

    const { rendered } = customRender(<Component />);

    expect(screen.queryByText("undefined2")).toBeInTheDocument();

    rendered.rerender(<Component x={2} />);
    expect(screen.queryByText("defined1")).toBeInTheDocument();
  });
});
