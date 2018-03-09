// @flow

import React, { Component, Fragment } from 'react'
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
              <Fragment>
                <h1>react-needs example</h1>

                <h2>Needed an Observable Value</h2>
                <p>Count: {counter.state.count} <button onClick={counter.increment}>Add One</button></p>

                <h2>Needed a simple value</h2>
                <p>Now: {now}</p>

                <h2>Want a missing value</h2>
                <Want value="missing">{missing => <p>{missing || 'Missing: No Problemo'}</p>}</Want>
              </Fragment>
            )}
          </Need>
          <Offer name="counter" value={counter} />
          <Offer name="now" value={Date.now()} />
        </div>
      </Scope>
    )
  }
}
