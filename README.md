**Signal-components is the easy way to integrate real reactivity into your React app.**

## Goals

- **Integration** - Provide the simplest way to integrate [any reactivity system](#Supported-Reactivity-Systems) into your React app.
- **Type Safety** - Typescript is the first-class citizen in this project.

## Documentation

### Motivation

React is a great library for building user interfaces, but it lacks a built-in reactivity system.
They chose to use rerenders as a way to update the UI, which is not always the best solution.

Signal-like reactivity systems are a great way to solve this problem. They don't trigger rerenders when the state changes,
but instead, they trigger only the components that depend on the changed state. But this way is not ideal too.
Any reactivity system designed for describing the signals globally, and it's hard to integrate them into existing React app.

Signal-components act as the glue between your hook-based components and the reactivity system.

### Introduction

```tsx
import {declareComponent} from 'signal-components';

type Props = {
  x: number;
  y: number;
};

const Component = declareComponent<Props>(({x, y}, options) => {
  //                                          ^
  //                                     Inside props
  // x and y are Atom<number> here
  const z = atom(ctx => ctx.spy(x) + ctx.spy(y));
  // init phase

  return ({ctx}) => {
    // render phase
    return <div>{ctx.spy(z)}</div>
  }
});

<Component x={1} y={atom(1)} /> // <- Outside props
```

### Phases

- **Init phase** - This phase is called only once when the component is created. It's a good place to create atoms and functions.
- **Render phase** - This phase is called every time the component is rendered. We delegate the rendering to React. It means you can use any React hooks and components inside the render phase.

#### Init Phase
You have access to the functions in the init phase via the second arg:
- **wireHook**(callback: () => T): Atom\<T>. You can execute any React hooks code inside the callback. It is the good way to move to the reactive code.

#### Render Phase
You have access to the functions in the render phase:  
- **ctx.spy** - This function is used to subscribe rerender to a received Atom. If value inside the Atom is changed, the React render call.
- **ctx.component** - This function is the way to create a new component for a received Atom. If value inside the Atom is changed, the React rerender only created component. Nothing more. It is the good way to minimize the rerenders.

### Props

- **Outside props** - The public API of the component. You can pass T | Atom<T> here. Signal-components will pass it to the init phase as an Atom<T>.
- **Inside props** - The internal API of the component. You always get Atom<T> here inside props. Nothing will distract you from your reactive code.
- **Props** - The types. Please, don't use Atom<T> here. Only raw types. 

#### Stable functions
Props with prefix `on[A-Z]` are called "Stable functions" in signal-components.
That means you receive the same function instance from the `insideProps`. Doesn't matter how many times the component is rendered and what you pass to the prop: different functions or the `undefined` value.

Stable functions benefits demo: https://codesandbox.io/p/sandbox/signal-components-stable-functions-7d4m34
### Insights

**Inside props** is the Proxy object. That's the reason because we have one significant limitation: you cannot get rest of the `inside props`.
```tsx
const Component = declareComponent<Props>((insideProps, options) => {
  const {...rest} = insideProps; // <- Error here. Use `rest` operator instead
  // ...
});
```

### Operators

#### defaults

**Defaults** operator is a way to provide default values for the __internal props__.
```tsx
const Component = declareComponent<Props>((insideProps, options) => {
  const {x = atom(1)} = insideProps; // <- Error here because x is Atom<undefined>. Not undefined
  const {x} = defaults(insideProps, {x: 1}); // <- Ok way
  // ...
});
```

#### rest
**Rest** operator is a way to get the rest of the __internal props__. See [Insights](#Insights) for more information.
```tsx
const Component = declareComponent<Props>((insideProps, options) => {
  const {x, ...rest} = insideProps; // <- Error here. Use `rest` operator instead
  
  const {x} = insideProps; 
  const restProps = rest(insideProps, ['x']); // <- Ok way
  // ...
});
```

## Supported Reactivity Systems

- [Reatom](https://reatom.dev)
- [Planning] [Effector](https://effector.dev)
- [Planning] [MobX](https://mobx.js.org/)
- [Planning] [Redux](https://redux.js.org/)
