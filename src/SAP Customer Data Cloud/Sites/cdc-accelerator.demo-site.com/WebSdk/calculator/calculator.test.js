import calculator from './calculator'

describe('Feature test: calculator', () => {
    test('adds 1 + 2 to equal 3', () => {
        const result = calculator.add(1, 2)
        expect(result).toBe(3)
    })
})
