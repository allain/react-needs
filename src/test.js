import React from 'react'
import RenderError from './lib/RenderError'
import collect from 'collect-console'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import ObservableState from 'observable-react-state'

import { Scope, Offer, Need, Want } from './'

Enzyme.configure({ adapter: new Adapter() })

describe('Scope', () => {
  it('exists', () => expect(Scope).toBeTruthy())

  it('renders scope children', () => {
    expect(
      mount(
        <Scope>
          <p>A</p>
        </Scope>
      ).html()
    ).toEqual('<p>A</p>')
  })

  it('can be nested', () => {
    expect(
      mount(
        <Scope>
          <Scope>
            <p>A</p>
          </Scope>
        </Scope>
      ).html()
    ).toEqual('<p>A</p>')
  })
})

describe('Need', () => {
  it('exists', () => expect(Need).toBeTruthy())

  it('complains when not in a Scope', () => {
    const reset = collect.error()
    expect(
      mount(
        <RenderError>
          <Need />
        </RenderError>
      ).html()
    ).toEqual('<div>no scope found</div>')
    reset()
  })

  it('renders null when needs not met', () =>
    expect(
      mount(
        <Scope>
          <p>
            <Need needs="a" />
          </p>
        </Scope>
      ).html()
    ).toEqual('<p></p>'))

  it('can access given values', () =>
    expect(
      mount(
        <Scope>
          <Need value="a">{a => <p>{a}</p>}</Need>
          <Offer name="a" value={100} />
        </Scope>
      ).html()
    ).toEqual('<p>100</p>'))
})

describe('Want', () => {
  it('exists', () => expect(Want).toBeTruthy())

  it('complains when not in a Scope', () => {
    const reset = collect.error()
    expect(
      mount(
        <RenderError>
          <Want />
        </RenderError>
      ).html()
    ).toEqual('<div>no scope found</div>')
    reset()
  })

  it('renders even when needs not met', () =>
    expect(
      mount(
        <Scope>
          <Want needs="a">{a => <br />}</Want>
        </Scope>
      ).html()
    ).toEqual('<br>'))

  it('can access given values', () =>
    expect(
      mount(
        <Scope>
          <Want value="a">{a => <p>{a}</p>}</Want>
          <Offer name="a" value={100} />
        </Scope>
      ).html()
    ).toEqual('<p>100</p>'))
})

describe('Offer', () => {
  it('exists', () => expect(Offer).toBeTruthy())

  it('complains when not in a Scope', () => {
    const reset = collect.error()
    expect(
      mount(
        <RenderError>
          <Offer name="a" value={100} />
        </RenderError>
      ).html()
    ).toEqual('<div>no scope found</div>')
    reset()
  })

  it('can be defined', () =>
    expect(() =>
      mount(
        <Scope>
          <Offer name="a" value={100} />
        </Scope>
      ).html()
    ).not.toThrow(/no scope found/))

  it('can give Observables', () =>
    expect(() =>
      mount(
        <Scope>
          <Offer name="a" value={new ObservableState()} />
        </Scope>
      )
    ).not.toThrow())

  it('detects when observables change', () => {
    class TestState extends ObservableState {
      state = {
        count: 0
      }

      up() {
        this.setState(s => ({ count: s.count + 1 }))
      }
    }

    const observable = new TestState()

    const mounted = mount(
      <Scope>
        <Offer name="a" value={observable} />
        <Need value="a">{a => <p>{a.state.count}</p>}</Need>
      </Scope>
    )

    expect(mounted.html()).toEqual('<p>0</p>')
    observable.up()
    expect(mounted.html()).toEqual('<p>1</p>')
  })
})
