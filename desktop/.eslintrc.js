module.exports = {
  extends: 'erb',
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    // Since React 17 and typescript 4.1 you can safely disable the rule
    'react/react-in-jsx-scope': 'off',
    'no-use-before-define': [
      'error',
      { variables: false, functions: false, classes: false },
    ],
    'react-hooks/exhaustive-deps': 'off',
    'react/require-default-props': 'off',
    'import/prefer-default-export': 'off',
    'no-plusplus': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'react/destructuring-assignment': 'off',
    'no-underscore-dangle': 'off',
    'promise/catch-or-return': 'off',
    'promise/always-return': 'off',
    'no-restricted-syntax': 'off',
    '@typescript-eslint/dot-notation': 'off',
    'import/extensions': 'off',
    'array-callback-return': 'off',
    'consistent-return': 'off',
    'import/no-unresolved': 'off',
    'no-continue': 'off',
    'no-await-in-loop': 'off',
    '@typescript-eslint/no-loop-func': 'off',
    'react/prop-types': 'off',
    'no-nested-ternary': 'off',
    'jsx-a11y/media-has-caption': 'off',
    'max-classes-per-file': 'off',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
      },
      typescript: {},
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
