# react-needs

> Simple dependency injection library for react

[![NPM](https://img.shields.io/npm/v/react-needs.svg)](https://www.npmjs.com/package/react-needs)

## Install

```bash
npm install --save react-needs
```

## Example Usage 

```jsx
import React, { Component } from 'react'

import { Scope, Need, Want, Offer } from 'react-needs'

import ObservableState from 'observable-react-state'

class CounterState extends ObservableState {
  state = { count: 0 }
  inc() { this.setState({count: this.state.count + 1})}
}
const counter = new CounterState()

class Example extends Component {
  render () {
    return (
      <Scope>
        <h2>Need simple value</h2>
        <Need value="a">{a => <p>{a}</p>}</Need>

        <h2>Need a missing value</h2>
        <Need value="missing">{x => <p>Should <em>not</em> Be rendered since missing in unmet</p>}</Need>

        <h2>Want a missing value</h2>
        <Want value="missing">{missing => <p>Should be rendered since missing in only wanted, not needed.</p>}</Want>

        <h2>Need an observable value (An observable state because it's cool)</h2>
        <Need value="counter">
        {counter =>
          <p>{counter.state.count} <button onClick={() => counter.setState({count: counter.state.count + 1})}>+1</button></p>}
        </Need>

        <Offer name="a" value={100} />
        <Offer value="counter" value={counter}/>
      </Scope>
    )
  }
}
```

## API

### `<Scope>`
Scope must be installed at the root of your app. Offers only exist within a scope.

### `<Offer name="name" value={value} />`
Offer makes a value available within the scope.

### `<Need value="name">{val => ...}</Need>`
Resolves the value name by looking in the Scope for offers. If no offer is found, it will not render its chidlren.

### `<Need values={['name1', 'name2']}">{(name1, name2)=> ...}</Need>`
Resolves all values by looking in the Scope for offers. If value cannot be resolved, it will not render its chidlren.

### `<Want value="name">{val => ...}</Want>`
Resolves the value name by looking in the Scope for offers. If no offer is found, it will not render its chidlren.

### `<Want values={['name1', 'name2']}">{(name1, name2)=> ...}</Want>`
Resolves all values by looking in the Scope for offers. Renders its chidlren even if some of its wanted values could not be found.

*That's it. Cheers*




## License

ISC © [allain](https://github.com/allain/react-needs)
