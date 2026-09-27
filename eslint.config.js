// ESLint 9 flat config. No rules are configured yet; this carries over the
// ignore patterns from the former .eslintignore, which ESLint 9 no longer reads.
export default [
    {
        ignores: ["coverage/**", "docs/**", "lib/**", "node_modules/**"],
    },
];
