import customEventMap from './customEventMap'

describe('customEventMap test', () => {
    test('method should have at least 1 method', () => {
        expect(customEventMap.eventMap[0].method).toBeDefined()
    })
    test('method should return undefined for the event login', () => {
        expect(customEventMap.eventMap[0].method({ fullEventName: 'login' })).toBe(undefined)
    })
    test('method should return undefined for the event logout', () => {
        expect(customEventMap.eventMap[0].method({ fullEventName: 'logout' })).toBe(undefined)
    })
    test('args should return should the same value as the params', () => {
        expect(customEventMap.eventMap[0].args[0]('testArgument')).toBe('testArgument')
    })
})
