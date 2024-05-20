**Signal-components is the easy way to integrate real reactivity into your React app.**

## Key Features

TBD

## Examples

```typescript
const Component = declareComponent<{ x: number }>(({ x }: {x: Atom<number>}) => {
  const y = atom((ctx) => ctx.spy(x) + 1);
  // init part
  return (ctx: Ctx) => {
    // render part
    return <div>{ctx.spy(y)}</div>;
  };
});
```
