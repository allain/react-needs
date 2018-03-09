// @flow

import React, { Component } from 'react'
import ObservableState from 'observable-react-state'

import { Scope, Offer, Need, Want } from 'react-needs'

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
          <Need values={["counter", "now"]}>
            {(counter, now) => (
              <div>
                <h2>Injected an Observable Value</h2>
                <p>Count: {counter.state.count} <button onClick={counter.increment}>Add One</button></p>

                <h2>Injected a simple value</h2>
                <p>Now: {now}</p>
              </div>
            )}
          </Need>
          <Want value="missing">{missing => <p>{missing || 'Empty'}</p>}</Want>
          <Offer name="counter" value={counter} />
          <Offer name="now" value={Date.now()} />
        </div>
      </Scope>
    )
  }
}
