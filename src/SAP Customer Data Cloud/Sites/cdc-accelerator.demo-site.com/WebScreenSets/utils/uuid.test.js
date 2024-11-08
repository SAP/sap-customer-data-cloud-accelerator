import uuid from './uuid'

describe('Utils: uuid.generate()', () => {
    it('should generate a string', () => {
        const result = uuid.generate()
        expect(typeof result).toBe('string')
    })

    it('should generate a string of length 36', () => {
        const result = uuid.generate()
        expect(result.length).toBe(36)
    })

    it('should generate a string in UUID format', () => {
        const result = uuid.generate()
        const uuidFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        expect(result).toMatch(uuidFormat)
    })

    it('should generate unique UUIDs', () => {
        const uuid1 = uuid.generate()
        const uuid2 = uuid.generate()
        expect(uuid1).not.toBe(uuid2)
    })
})