// @flow

import React, { Component } from 'react'
import ObservableState from 'observable-react-state'

import { Scope, Giver, Need } from 'react-needs'

class Counter extends ObservableState<{count: number}> {
  state = {
    count: 0
  }

  increment = () =>
    this.setState({ count: this.state.count + 1 })
}

const counter = new Counter()

export default class App extends Component {
  render() {
    return (
      <Scope>
        <div className="example">
          <Need needs="counter,now">
            {(counter, now) => (
              <div>
                <h2>Injected an Observable Value</h2>
                <p>Count: {counter.state.count} <button onClick={counter.increment}>Add One</button></p>

                <h2>Injected a simple value</h2>
                <p>Now: {now}</p>
              </div>
            )}
          </Need>
          <Giver name="counter" value={counter} />
          <Giver name="now" value={Date.now()} />
        </div>
      </Scope>
    )
  }
}
