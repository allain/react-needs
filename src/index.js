// @flow

import React, { Component, Node } from 'react'
import createReactContext from 'create-react-context'

const isObservable = x =>
  x && x[Symbol.observable] && x[Symbol.observable]() === x

const NeedsContext = createReactContext()

export class Scope extends Component<> {
  state = {}

  render() {
    return (
      <NeedsContext.Consumer>
        {({ registry = {} } = {}) => {
          return (
            <NeedsContext.Provider
              value={{
                scope: this,
                // combine this scope's and its parents registry
                registry: { ...registry, ...this.state }
              }}>
              {this.props.children}
            </NeedsContext.Provider>
          )
        }}
      </NeedsContext.Consumer>
    )
  }

  set(name, value) {
    this.setState(state => {
      if (state[name] !== undefined)
        throw new Error(`offer already made: ${name}`)

      return { ...state, [name]: value }
    })
  }

  unset(name) {
    this.setState(state => {
      const newState = { ...state }
      delete newState[name]
      return newState
    })
  }
}

type NeedProps = {
  children: any => Node,
  values?: Array<string>,
  value?: string,
  strict: boolean
}

export const Need = ({ children, values, value, strict = true }: NeedProps) => {
  const needs = parseNeeds(values || value)

  return (
    <NeedsContext.Consumer>
      {({ registry } = {}) => {
        if (!registry) throw new Error('no scope found')

        const resolutions = needs.map(need => registry[need])
        if (strict && hasUnmetNeeds(resolutions)) return null

        return typeof children === 'function'
          ? children.apply(null, resolutions)
          : children || null
      }}
    </NeedsContext.Consumer>
  )
}

type WantProps = {
  children: Node,
  values?: Array<string>,
  value: string
}
export const Want = (props: WantProps) => Need({ ...props, strict: false })

const parseNeeds = needs =>
  needs ? (Array.isArray(needs) ? needs : needs.split(',')) : []

const hasUnmetNeeds = resolutions =>
  resolutions.filter(r => r === null || typeof r === 'undefined').length > 0

type OfferProps = {
  name: string,
  value: any
}

export const Offer = ({ name, value }: OfferProps) => (
  <NeedsContext.Consumer>
    {({ scope } = {}) => {
      if (!scope) throw new Error('no scope found')

      return <ObservingComponent name={name} value={value} scope={scope} />
    }}
  </NeedsContext.Consumer>
)

class ObservingComponent extends React.Component {
  state = {
    subscription: null
  }

  updateValue(newValue) {
    const { subscription } = this.state
    const { name, scope } = this.props

    if (subscription) subscription.unsubscribe()

    if (newValue === undefined) {
      this.clearValue()
    } else {
      if (isObservable(newValue)) this.observeValue(newValue)

      scope.set(name, newValue)
    }
  }

  clearValue() {
    const { name, scope } = this.props

    this.setState({ subscription: null })

    scope.unset(name)
  }

  observeValue(newValue) {
    const { name, scope } = this.props

    this.setState({
      subscription: newValue.subscribe(newValue =>
        // By bypassing scope.set, it doesn't throw an exception
        scope.setState({ [name]: newValue })
      )
    })
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
