/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testEnvironmentOptions: {
        output: 'minimal',
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: {
                    strict: false,
                    esModuleInterop: true,
                },
            },
        ],
    },
    testTimeout: 36000000,
};
