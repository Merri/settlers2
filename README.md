# Settlers II.net

Welcome stranger or friend!

## What is this site?

Settlers II.net is a resource for this old DOS game that was built with Amiga tools. The aim of the site is to provide
accurate information that helps modding and expanding the original game by providing technical information and tools.
The site also caters to people who are new to the game and just wish to know a bit more about it to get started with it.

In addition the site works as an archive.

Visit [settlers2.net](https://settlers2.net)

### Vision

To provide easy-to-use map generator, maps database, online localization tool & font editor.

Wild idea: generate game demo with chosen map, and run it on DOSBox on the browser.

More wild ideas: graphics editor, texture set editor, sound editor, music editor. Full modding.

### Contributing

We do not yet have a proper contribution guide, but in general you're welcome to do changes and create a pull request
with your changes. You can contact the main author Merri through [Return to the Roots Discord Server](https://discord.gg/kyTQsSx) if you have questions!

## Getting started

The project uses `pnpm` instead of `npm`:

```
npm i -g pnpm
git clone https://github.com/Merri/settlers2.git
cd settlers2
pnpm i
pnpm run dev
```

In a couple of seconds you should be able to go to `localhost:3000`. If you change the sources you will see the changes
happen immediately in the browser, too.

### Tech of the site

- Built with the wonderful [Astro](https://astro.build)
- Easy to add content in Markdown, or in JSX-similar `.astro` syntax
- Fast development, ultra fast static site
- Prefer static HTML/CSS when possible, vanilla JS next, Preact when more complexity is involved

As of writing Astro is bleeding edge, being only three months old and still in early beta phase. It has it's quirks, but
nothing prevents making good working stuff with it regardless of the issues.

### 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```
/
├── public/
│   ├── robots.txt
│   └── favicon.ico
├── src/
│   ├── components/
│   │   └── Tour.astro
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact/SolidJS components.

Any static assets, like images, can be placed in the `public/` directory.

### 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command           | Action                                      |
|:------------------|:--------------------------------------------|
| `pnpm i`          | Installs dependencies                       |
| `pnpm run dev`    | Starts local dev server at `localhost:3000` |
| `pnpm run build`  | Build your production site to `./dist/`     |

### 👀 Want to learn more about Astro?

Feel free to check [documentation](https://github.com/withastro/astro) or jump into our [Discord server](https://astro.build/chat).
