import next from "eslint-config-next";

const eslintConfig = [
  { ignores: [".next/**", "next-env.d.ts", "coverage/**"] },
  ...next,
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];

export default eslintConfig;
