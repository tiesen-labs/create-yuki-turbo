# create-yuki-repo

## Installation

```bash
npx create-turbo@latest -e https://github.com/tiesen243/create-yuki-turbo
```

## About

This is a template for creating a new application with monorepo structure using [Turborepo](https://turborepo.org) and contains:

```text
apps
 └─ web
      ├─ Next.js 14
      ├─ React 18
      └─ Tailwind CSS
packages
 └─ ui
      └─ Start of a UI package for the webapp using shadcn-ui
tooling
  ├─ eslint
  |   └─ shared, fine-grained, eslint presets
  ├─ prettier
  |   └─ shared prettier configuration
  ├─ tailwind
  |   └─ shared tailwind configuration
  └─ typescript
      └─ shared tsconfig you can extend from
```

> In this template, we use `@yuki` as a placeholder for package names. As a user, you might want to replace it with your own organization or project name. You can use find-and-replace to change all the instances of `@yuki` to something like `@my-company` or `@project-name`.

## Quick Start

1. Setup the project:

```bash
# Install dependencies
bun install

# Configure environment variables
cp .env.example .env
```

2. When you want to add a new UI component:

Run the ui-add script to add a new UI component using the interactive shadcn/ui CLI:

```bash
bun ui-add
```

3. When you want to add a new package:

Run the following command to add a new package:

```bash
bunx --bun turbo gen init
```

The generator sets up the package.json, tsconfig.json and a index.ts, as well as configures all the necessary configurations for tooling around your package such as formatting, linting and typechecking. When the package is created, you're ready to go build out the package.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
