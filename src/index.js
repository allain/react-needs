// @flow

import React, { Component, Node } from 'react'
import createReactContext from 'create-react-context'

const isFunction = x => typeof x === 'function'
const isObservable = x =>
  x && x[Symbol.observable] && x[Symbol.observable]() === x

const NeedsContext = createReactContext()

export class Scope extends Component<> {
  state = {}

  render() {
    return (
      <NeedsContext.Provider value={this}>
        {this.props.children}
      </NeedsContext.Provider>
    )
  }
}

type NeedProps = {
  children: any => Node,
  needs: Array<string> | string
}

export class Need extends Component<NeedProps> {
  render() {
    const { children, needs } = this.props

    return (
      <NeedsContext.Consumer>
        {scope => {
          if (!scope) throw new Error('no scope found')

          const resolutions = resolveNeeds(scope, needs)
          if (hasUnmetNeeds(resolutions)) return null

          return isFunction(children)
            ? children.apply(null, resolutions)
            : children || null
        }}
      </NeedsContext.Consumer>
    )
  }
}

const hasUnmetNeeds = resolutions =>
  resolutions.filter(r => r === null || typeof r === 'undefined').length > 0

const resolveNeeds = (scope, needs) =>
  (Array.isArray(needs) ? needs : needs.split(',')).map(
    need => scope.state[need]
  )

type OfferProps = {
  name: string,
  value: any
}

export class Offer extends Component<OfferProps> {
  render() {
    const { name, value } = this.props
    return (
      <NeedsContext.Consumer>
        {scope => {
          if (!scope) throw new Error('no scope found')

          return isObservable(value) ? (
            <ObservingComponent name={name} value={value} scope={scope} />
          ) : (
            <SimpleOfferComponent name={name} value={value} scope={scope} />
          )
        }}
      </NeedsContext.Consumer>
    )
  }
}

// Offer of a simple value
class SimpleOfferComponent extends React.Component {
  componentWillMount() {
    this.props.scope.setState({ [this.props.name]: this.props.value })
  }

  componentWillUnmount() {
    this.props.scope.setState({ [this.props.name]: undefined })
  }

  render() {
    return null
  }
}

// Component for observing observables, when changes are detected it'll update the passed in scope
class ObservingComponent extends React.Component {
  state = {
    subscription: null
  }

  updateValue(newValue) {
    const { subscription } = this.state

    if (subscription) subscription.unsubscribe()

    if (newValue) {
      this.setState({
        subscription: newValue.subscribe(newValue =>
          this.props.scope.setState({ [this.props.name]: newValue })
        )
      })
      this.props.scope.setState({ [this.props.name]: newValue })
    } else {
      this.setState({ subscription: null })
    }
  }

  componentWillReceiveProps({ value }) {
    // If it's the same value it's already being listened to, no need to do anything
    if (this.props.value !== value) this.updateValue(value)
  }

  componentWillMount() {
    this.updateValue(this.props.value)
  }

  componentWillUnmount() {
    this.updateValue(null)
  }

  render() {
    return null
  }
}

class LifecycleComponent extends Component {
  componentWillMount() {
    this.props.componentWillMount && this.props.componentWillMount()
  }

  componentWillUnmount() {
    this.props.componentWillUnmount && this.props.componentWillUnmount()
  }

  componentWillUpdate(newProps, newState) {
    this.props.componentWillUpdate &&
      this.props.componentWillUpdate(newProps, newState)
  }

  render() {
    return this.props.children || null
  }
}
