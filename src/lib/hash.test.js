const calcHash = require('./hash');
const fs = require('fs');

describe('hash', () => {
    const fileContent = fs.readFileSync('test/fixtures/pixel.gif');

    test('should calc hash with default params (xxhash32 and shrink=8)', () => {
        expect(calcHash(fileContent)).toBe('fb27d692');
    });

    test('should calc hash (xxhash64 and shrink=16)', () => {
        const options = {
            method: 'xxhash64',
            shrink: 16
        };

        expect(calcHash(fileContent, options)).toBe('56ed89bfa97a733e');
    });

    test('should calc hash with custom function', () => {
        const options = {
            method: () => '12345',
            shrink: 3
        };

        expect(calcHash(fileContent, options)).toBe('123');
    });

    test('should calc hash with crypto method', () => {
        const options = {
            method: 'sha256',
            shrink: 16
        };

        expect(calcHash(fileContent, options)).toBe('09d46019c7a75b96');
    });
});
