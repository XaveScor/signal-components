import { describe, test, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { declareComponent } from "./index";
import { atom } from "@reatom/core";
import { customRender } from "./test-utils";

describe("declare component", () => {
  describe("prop", () => {
    test("primitive", () => {
      const Component = declareComponent<{ x: number }>(({ x }) => {
        const y = atom((ctx) => ctx.spy(x) + 1);

        return (ctx) => {
          return <div>{ctx.spy(y)}</div>;
        };
      });

      customRender(<Component x={1} />);

      expect(screen.queryByText("2")).toBeInTheDocument();
      expect(screen.queryByText("1")).not.toBeInTheDocument();
    });

    test("atom", () => {
      const Component = declareComponent<{ x: number }>(({ x }) => {
        const y = atom((ctx) => ctx.spy(x) + 1);

        return (ctx) => {
          return <div>{ctx.spy(y)}</div>;
        };
      });

      customRender(<Component x={atom(1)} />);

      expect(screen.queryByText("2")).toBeInTheDocument();
      expect(screen.queryByText("1")).not.toBeInTheDocument();
    });
  });

  describe("change prop", () => {
    const Component = declareComponent<{ x: number }>(({ x }) => {
      const y = atom((ctx) => ctx.spy(x) + 1);

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

    test("atom => primitive", () => {
      const { rendered } = customRender(<Component x={atom(1)} />);

      expect(screen.queryByText("2")).toBeInTheDocument();

      rendered.rerender(<Component x={2} />);
      expect(screen.queryByText("3")).toBeInTheDocument();
    });
  });

  test("change don't execute init phase", () => {
    const count = vi.fn();
    const Component = declareComponent<{ x: number }>(({ x }) => {
      count();
      return (ctx) => {
        return <div>{ctx.spy(x)}</div>;
      };
    });

    const { rendered } = customRender(<Component x={1} />);
    expect(count).toHaveBeenCalledTimes(2);
    rendered.rerender(<Component x={2} />);
    expect(count).toHaveBeenCalledTimes(2);
    rendered.rerender(<Component x={3} />);
    expect(count).toHaveBeenCalledTimes(2);
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
