import React from 'react'

export default class RenderError extends React.Component {
  state = {
    error: null
  }

  componentDidCatch(error) {
    this.setState({ error })
  }

  render() {
    const { children } = this.props
    const { error } = this.state
    if (error) {
      return <div>{error.message}</div>
    }

    return children
  }
}
