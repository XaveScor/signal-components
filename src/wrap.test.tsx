import { describe, test, expect } from "vitest";
import { wrap } from "./wrap";
import { customRender } from "./test-utils";
import { act, screen } from "@testing-library/react";
import { atom } from "@reatom/core";

describe("wrap", () => {
  test("wrap", () => {
    const Component = ({ x }: { x: number }) => {
      return <span>{x}</span>;
    };

    const WrappedComponent = wrap(Component);

    const x = atom(1);
    const { ctx, rendered } = customRender(<WrappedComponent x={x} />);
    expect(screen.queryByText("1")).toBeInTheDocument();

    act(() => {
      x(ctx, 2);
    });
    expect(screen.queryByText("2")).toBeInTheDocument();

    rendered.rerender(<WrappedComponent x={10} />);
    expect(screen.queryByText("10")).toBeInTheDocument();
  });
});
