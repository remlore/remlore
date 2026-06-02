import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
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
              sourceTag: 'scope:rem-words',
              bannedExternalImports: ['@nestjs/*'],
              onlyDependOnLibsWithTags: ['scope:rem-words', 'scope:rem'],
              notDependOnLibsWithTags: ['scope:rem-api', 'scope:rem-web', 'scope:ids', 'scope:rem-words-api']
            },
            {
              sourceTag: 'scope:rem-words-api',
              bannedExternalImports: ['@angular/*'],
              onlyDependOnLibsWithTags: ['scope:rem-words-api', 'scope:rem'],
              notDependOnLibsWithTags: ['scope:rem-api', 'scope:rem-web', 'scope:rem-ids-fe', 'scope:rem-words']
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
  { ignores: ['node_modules\r', '**/dist'] }
]
