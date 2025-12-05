const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const nrwlEslintPluginNx = require('@nrwl/eslint-plugin-nx')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
})

module.exports = [
  { plugins: { '@nrwl/nx': nrwlEslintPluginNx } },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nrwl/nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          depConstraints: [
            {
              sourceTag: 'scope:rem',
              onlyDependOnLibsWithTags: ['*']
            },
            {
              sourceTag: 'scope:rem-web',
              bannedExternalImports: ['@nestjs/*'],
              onlyDependOnLibsWithTags: ['scope:rem-web', 'scope:rem'],
              notDependOnLibsWithTags: ['scope:rem-api', 'scope:rem-ids-fe', 'scope:rem-ids']
            },
            {
              sourceTag: 'scope:rem-ids-fe',
              bannedExternalImports: ['@nestjs/*'],
              onlyDependOnLibsWithTags: ['scope:rem-ids-fe', 'scope:rem'],
              notDependOnLibsWithTags: ['scope:rem-api', 'scope:rem-web', 'scope:ids']
            },
            {
              sourceTag: 'scope:rem-ids',
              bannedExternalImports: ['@angular/*'],
              onlyDependOnLibsWithTags: ['scope:rem-ids', 'scope:rem'],
              notDependOnLibsWithTags: ['scope:rem-api', 'scope:rem-web', 'scope:rem-ids-fe']
            },
            {
              sourceTag: 'scope:rem-api',
              bannedExternalImports: ['@angular/*'],
              onlyDependOnLibsWithTags: ['scope:rem-api', 'scope:rem'],
              notDependOnLibsWithTags: ['rem-ids', 'scope:rem-web', 'scope:rem-ids-fe']
            },
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: ['type:feature', 'type:util', 'type:data-access', 'type:ui']
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: ['type:feature', 'type:util', 'type:data-access', 'type:ui']
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:util', 'type:ui']
            },
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: ['type:util', 'type:data-access']
            },
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: ['type:util']
            }
          ]
        }
      ],
    }
  },
  ...compat.config({ extends: ['plugin:@nrwl/nx/typescript'] }).map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      ...config.rules
    }
  })),
  ...compat.config({ extends: ['plugin:@nrwl/nx/javascript'] }).map((config) => ({
    ...config,
    files: ['**/*.js', '**/*.jsx'],
    rules: {
      ...config.rules
    }
  })),
  ...compat.config({ env: { jest: true } }).map((config) => ({
    ...config,
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
    rules: {
      ...config.rules
    }
  })),
  { ignores: ['node_modules\r'] }
]
