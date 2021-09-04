/** @type {import("snowpack").SnowpackUserConfig } */
export default {
  alias: {
    $layouts: "./src/layouts",
    react: "preact/compat",
    "react-dom/test-utils": "preact/test-utils",
    "react-dom": "preact/compat",
    "react/jsx-runtime": "preact/jsx-runtime",
  },
};
