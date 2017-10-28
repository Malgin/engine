module.exports = {
  "env": {
    "browser": true,
    "es6": true
  },
  "extends": "eslint:recommended",
  "globals": {
    "process": true
  },
  "parserOptions": {
    "sourceType": "module"
  },
  "rules": {
    "indent": [
      "error",
      2,
      { "SwitchCase": 1 }
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "no-console": [
      "warn"
    ],
    "comma-dangle": [
      "error"
    ],
    "no-empty": [
      "error"
    ],
    "no-extra-semi": [
      "error"
    ],
    "no-fallthrough": [
      "error"
    ],
    "no-redeclare": [
      "error"
    ],
    "no-unused-vars": [
      "error",
      { "args": "none" }
    ],
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ],
    "space-before-function-paren": [
      "error",
      "always"
    ]
  }
};