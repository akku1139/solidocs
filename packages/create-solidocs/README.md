# create-solidocs

Scaffold a [Solidocs](https://github.com/akku1139/solidocs/) site —
a SolidJS + Rolldown powered static site generator.

## Usage

```bash
npm create solidocs@latest my-site
cd my-site
npm run dev
```

## Options

| Option | Description |
| --- | --- |
| `--dir <path>` | Target directory (defaults to the project name) |
| `--title <text>` | Site title (defaults to the directory name) |
| `--description <text>` | Site description |
| `--base-path </path/>` | Base path for GitHub Pages style deploys |
| `--force` | Write into a non-empty directory |

## What you get

```
my-site/
├── package.json          # dev / build / preview scripts
├── solidocs.config.ts    # site configuration
├── index.md              # landing page with a hero section
├── guide/
│   └── getting-started.md
├── public/               # static assets
└── tsconfig.json
```

## License

MIT
