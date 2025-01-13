const { resolve } = require("node:path");

const project = resolve(__dirname, "tsconfig.app.json");

module.exports = {
  root: true,
  ignorePatterns: ["supabase/functions/**/*"],
  env: {
    node: true,
  },
  extends: [
    require.resolve("@vercel/style-guide/eslint/typescript"),
    require.resolve("@vercel/style-guide/eslint/browser"),
    require.resolve("@vercel/style-guide/eslint/react"),
  ],
  parserOptions: {
    project,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  overrides: [
    {
      files: ["src/**/*.tsx"],
      rules: {
        "@typescript-eslint/no-misused-promises": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "no-console": "off",
      },
    },
  ],
};
