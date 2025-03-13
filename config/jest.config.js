module.exports = {
    // The root directory that Jest should scan for tests and modules
    rootDir: '../',
    
    // The test environment that will be used for testing
    testEnvironment: 'jsdom',
    
    // The glob patterns Jest uses to detect test files
    testMatch: [
      '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
      '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
    ],
    
    // An array of file extensions your modules use
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
    
    // A list of paths to directories that Jest should use to search for files in
    roots: ['<rootDir>/src'],
    
    // A map from regular expressions to module names or to arrays of module names
    // that allow to stub out resources with a single module
    moduleNameMapper: {
      // Handle CSS imports (with CSS modules)
      // https://jestjs.io/docs/webpack#mocking-css-modules
      '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
      
      // Handle CSS imports (without CSS modules)
      '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
      
      // Handle image imports
      // https://jestjs.io/docs/webpack#handling-static-assets
      '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$': '<rootDir>/__mocks__/fileMock.js',
      
      // Handle module aliases
      '^@/(.*)$': '<rootDir>/src/$1'
    },
    
    // A list of paths to modules that run some code to configure or set up the testing framework
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    
    // The test environment options
    testEnvironmentOptions: {
      url: 'http://localhost'
    },
    
    // An array of regexp pattern strings that are matched against all test paths before executing the test
    testPathIgnorePatterns: [
      '<rootDir>/node_modules/',
      '<rootDir>/build/',
      '<rootDir>/public/',
      '<rootDir>/coverage/'
    ],
    
    // An array of regexp pattern strings that are matched against all source file paths before transformation
    transformIgnorePatterns: [
      '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$',
      '^.+\\.module\\.(css|sass|scss)$'
    ],
    
    // A map from regular expressions to paths to transformers
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'] }],
      '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
      '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '<rootDir>/config/jest/fileTransform.js'
    },
    
    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: true,
    
    // The directory where Jest should output its coverage files
    coverageDirectory: '<rootDir>/coverage',
    
    // An array of glob patterns indicating a set of files for which coverage information should be collected
    collectCoverageFrom: [
      'src/**/*.{js,jsx,ts,tsx}',
      '!src/**/*.d.ts',
      '!src/index.tsx',
      '!src/serviceWorker.ts',
      '!src/reportWebVitals.ts',
      '!src/setupTests.ts',
      '!src/**/*.stories.{js,jsx,ts,tsx}',
      '!src/mock/**',
      '!src/types/**'
    ],
    
    // A list of reporter names that Jest uses when writing coverage reports
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    
    // The threshold enforcement for coverage results
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70
      }
    },
    
    // An object that configures minimum threshold enforcement for coverage results
    watchPlugins: [
      'jest-watch-typeahead/filename',
      'jest-watch-typeahead/testname'
    ],
    
    // Automatically reset mock state before every test
    resetMocks: true,
    
    // Automatically clear mock calls and instances between every test
    clearMocks: true,
    
    // Jest transformers for specific file types
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node', 'mjs'],
    
    // Maximum number of workers used to run tests (set to 50% of available CPUs)
    maxWorkers: '50%',
    
    // Enable verbose test output
    verbose: true,
    
    // Disable watchman for watching file system changes (optional, enable if needed)
    watchman: false,
    
    // Don't automatically detect test files, only rely on the testMatch patterns
    // This makes it a bit faster when you have a lot of files
    // in your project that aren't test files
    testRegex: [],
    
    // Mock the UUID module to return predictable values
    unmockedModulePathPatterns: [],
    
    // Fail tests on unhandled promise rejections
    unhandledRejectionLevel: 'warn',
    
    // Mock location and history for router testing
    globals: {
      'ts-jest': {
        isolatedModules: true
      }
    },
    
    // Create mock files for assets and styles
    setupFiles: ['<rootDir>/src/setupJest.js']
  };