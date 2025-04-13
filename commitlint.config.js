module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
      'type-enum': [2, 'always', ['feat', 'fix', 'chore', 'docs', 'refactor', 'style', 'test']],
      'subject-empty': [2, 'never'],
      'type-empty': [2, 'never'],
    },
  };