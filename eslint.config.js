const { defineConfig } = require('eslint/config');

const globals = require('globals');
const tsParser = require('@typescript-eslint/parser');
const prettier = require('eslint-plugin-prettier');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const flatCompat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

module.exports = defineConfig([
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.commonjs,
        __JEST__: 'readonly',
        __SDK_VERSION__: 'readonly',
        page: 'readonly',
        browser: 'readonly',
        window: true
      },

      parser: tsParser,
      ecmaVersion: 2018,
      sourceType: 'module',

      parserOptions: {
        project: './tsconfig.json'
      }
    },

    extends: flatCompat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
      'plugin:typescript-compat/recommended'
    ),

    plugins: {
      prettier
    },

    rules: {
      '@typescript-eslint/adjacent-overload-signatures': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      'comma-dangle': ['error', 'never'],

      'default-case': [
        'warn',
        {
          commentPattern: '^no default$'
        }
      ],

      'dot-location': ['warn', 'property'],
      'import/no-unresolved': 'off',
      'init-declarations': 0,
      'new-parens': 'warn',
      'no-alert': 0,
      'no-caller': 'error',
      'no-case-declarations': 'off',
      'no-const-assign': 'error',
      'no-constant-condition': 'warn',
      'no-control-regex': 'warn',
      'no-dupe-args': 'error',
      'no-dupe-class-members': 'error',
      'no-dupe-keys': 'warn',
      'no-duplicate-case': 2,
      'no-empty': 'warn',
      'no-eq-null': 2,
      'no-extra-bind': 'warn',
      'no-fallthrough': 'off',
      'no-func-assign': 'warn',
      'no-global-assign': 'warn',
      'no-implied-eval': 'error',
      'no-inner-declarations': [2, 'functions'],
      'no-iterator': 2,
      'no-label-var': 'error',
      'no-loop-func': 'error',
      'no-misleading-character-class': 'off',

      'no-mixed-operators': [
        'warn',
        {
          groups: [
            ['&', '|', '^', '~', '<<', '>>', '>>>'],
            ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
            ['&&', '||'],
            ['in', 'instanceof']
          ],

          allowSamePrecedence: false
        }
      ],

      'no-multi-str': 'warn',
      'no-native-reassign': 'warn',
      'no-negated-in-lhs': 2,
      'no-obj-calls': 'warn',
      'no-octal-escape': 2,
      'no-plusplus': 0,
      'no-prototype-builtins': 'off',
      'no-redeclare': 'error',
      'no-script-url': 'warn',
      'no-self-compare': 2,
      'no-shadow-restricted-names': 'warn',
      'no-sparse-arrays': 'warn',
      'no-this-before-super': 'warn',
      'no-undef-init': 2,
      'no-undef': 'off',
      'no-unexpected-multiline': 'warn',
      'no-unused-expressions': 2,
      'no-unused-vars': 'off',
      'no-useless-call': 2,
      'no-useless-escape': 'warn',

      'no-use-before-define': [
        'warn',
        {
          functions: false,
          classes: false,
          variables: false
        }
      ],

      'no-with': 'error',
      'prefer-const': 0,
      'prefer-rest-params': 'off',
      'prefer-spread': 'off',
      'prettier/prettier': ['off'],
      'rest-spread-spacing': ['warn', 'never'],
      'use-isnan': 2,
      'vars-on-top': 2,
      camelcase: 'off',
      eqeqeq: 'error',
      quotes: ['error', 'single'],
      radix: 'error'
    }
  },
  {
    ignores: [
      '.DS_Store',
      '.hbuilderx',
      '.idea',
      '.vscode',
      '/**/.cache',
      '/**/.ide',
      '/**/.mini-ide',
      '/**/.vscode*',
      '/**/node_modules',
      '/**/package-lock.json',
      '/**/pnpm-lock.yaml',
      '/**/yarn.lock',
      '/build',
      '/dist',
      '/node_modules',
      '/npm-debug.log*',
      '/scripts',
      '/yarn-error.log',
      'dist/**/*.d.ts',
      'eslint.config.js',
      'junit.xml',
      'rollup.config.js',
      'rollup.plugins.config.js',
      'src/index.d.ts'
    ]
  }
]);
