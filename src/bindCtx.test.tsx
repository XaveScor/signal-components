import { describe, test, expect } from "vitest";
import { html } from "./html";
import { customRender } from "./test-utils";
import { action, atom } from "@reatom/core";
import { declareComponent } from "./declareComponent";
import { bindCtx } from "./bindCtx";
import { fireEvent, screen } from "@testing-library/react";

describe("bindCtx", () => {
  const Component = declareComponent(() => {
    const x = atom(1);
    const increase = action((ctx) => x(ctx, (s) => s + 1));

    return (
      <html.div>
        <html.span>{x}</html.span>
        <html.button onClick={bindCtx(increase)}>+</html.button>
      </html.div>
    );
  });

  test("simple test", () => {
    customRender(<Component />);
    expect(screen.queryByText("1")).toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(screen.queryByText("2")).toBeInTheDocument();
  });
});
