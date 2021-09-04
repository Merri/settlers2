/** @type {import("snowpack").SnowpackUserConfig } */
export default {
  alias: {
    $: "./src",
    $layouts: "./src/layouts",
    react: "preact/compat",
    "react-dom/test-utils": "preact/test-utils",
    "react-dom": "preact/compat",
    "react/jsx-runtime": "preact/jsx-runtime",
  },
};
