module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // roots: ['<rootDir>/tests'], // or src if you put tests next to files
    // transform: {
    //   '^.+\\.tsx?$': 'ts-jest',
    // },
    // testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    // moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    clearMocks: true,
    coverageDirectory: "coverage",
};
