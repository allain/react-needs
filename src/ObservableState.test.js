import OS from '../example/src/ObservableState'
import isObservable from 'is-observable'

describe('ObservableState', () => {
  it('instances are observable', () =>
    expect(isObservable(new OS())).toBeTruthy())
})
