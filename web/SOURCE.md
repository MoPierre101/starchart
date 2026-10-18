# StarChart complete source

Every project text file is reproduced in full below, grouped by folder. Installed dependencies, generated builds, screenshots, and this generated listing are excluded.


## web


### web/.gitignore

```text title="web/.gitignore"
node_modules/
dist/
*.local
.DS_Store
.preview/
```


### web/README.md

````markdown title="web/README.md"
# StarChart

A React + TypeScript discovery template for comic stories, characters, creators, publication history, and crossovers. Built with Vite, React Router, and Tailwind CSS. No additional UI or state libraries.

## Run this checkout

The implementation is already on the `ui_test` branch. From the repository root:

```sh
cd web
npm ci
npm run dev
```

Open the Local URL printed by Vite. To verify or preview production output:

```sh
npm run typecheck
npm run build
npm run preview
```

## Scaffold in a fresh checkout

These commands are for a checkout without the branch or `web/` project. Apply the supplied source files after scaffolding; the generic Vite starter does not include this UI.

```sh
git checkout -b ui_test
npm create vite@latest web -- --template react-ts
cd web
npm install react react-dom react-router
npm install -D typescript vite @vitejs/plugin-react @types/node @types/react @types/react-dom tailwindcss @tailwindcss/vite
npm run dev
```

The Vite configuration loads Tailwind through `@tailwindcss/vite`. Google Fonts supplies Newsreader and Manrope; system serif and sans-serif fallbacks work offline.

## Screens

| Screen | Route |
| --- | --- |
| Discover | `/` |
| Search | `/search` |
| Issue or collection | `/issues/:issueId` |
| Publisher timeline | `/publishers/:publisherId` |
| Release calendar | `/calendar` |
| Creator | `/creators/:creatorId` |
| Character | `/characters/:characterId` |
| Reading order | `/reading-order/:orderId` |

Use the navigation rail to open populated examples. Its active marker follows the route category, including other creators and publishers. On phones it becomes a fixed bottom bar, and the Discover right rail moves below the main content.

Search filters use the URL parameters `q`, `publisher`, `from`, `to`, `entity`, and `kind`. Filter changes replace the current history entry. Local search ranks keyword overlap; it does not call a semantic search service. Try an issue-number query such as a series title followed by `#5`. Publisher, date, entity, and content filters combine. Invalid or inverted year bounds produce an empty result.

## Data boundary

Every fictional name, record, date, selection, and example relationship lives under `src/data/`. The fixtures contain 13 publishers, four series, four creators, three characters, 12 regular issues, three collections, variants, and an eight-event timeline with two milestones. Real publisher names are used only as the requested demo publishing context; the stories and credits are fictional and are not asserted to exist in GCD.

`src/types/` defines the shared domain and resolved view models. Feature adapters resolve relationships and expose resource hooks. Presentational components receive props and never import fixtures. Features use only their own files and shared modules; `index.ts` is each feature's public export.

Replace these adapter function bodies when connecting real data. Their signatures already accept synchronous models or promises, so the existing hooks and components accept an asynchronous implementation:

| Function | File |
| --- | --- |
| `getDiscover()` | `src/features/discover/data/getDiscover.ts` |
| `getSearchResults(filters)` | `src/features/search/data/getSearchResults.ts` |
| `getIssueDetail(issueId)` | `src/features/issue-detail/data/getIssueDetail.ts` |
| `getPublisherTimeline(publisherId)` | `src/features/publisher-timeline/data/getPublisherTimeline.ts` |
| `getReleaseCalendar(year, month)` | `src/features/release-calendar/data/getReleaseCalendar.ts` |
| `getCreator(creatorId)` | `src/features/creator/data/getCreator.ts` |
| `getCharacter(characterId)` | `src/features/character/data/getCharacter.ts` |
| `getReadingOrder(orderId)` | `src/features/reading-order/data/getReadingOrder.ts` |

Return the existing typed models. `useResource` ignores stale request results, handles rejected promises, and preserves previous search/calendar values during refresh so inputs keep focus. `ResourceBoundary` handles initial loading and errors; missing records and empty lists have their own messages.

Also replace demo configuration in `getCalendarDefaults()` in the calendar adapter and default entity destinations in `getNavigation()` in `src/app/navigation.ts`. Those are synchronous configuration boundaries. Availability URLs are empty sample stubs: populate the typed `availability` records to activate the existing library, store, and reader anchors. Follow controls use local component state and reset on remount.

## State examples

- Loading: the labelled loading preview in the Discover rail, and `/search?state=loading` for the full result-grid skeleton.
- Empty: the calendar initially selects a day with no releases; dates with dots show issues. A search with no matches also shows an empty state.
- Missing cover: the last Discover top pick uses the shared cover placeholder.
- Variants: open the featured issue and select alternate covers. Variants stay inside detail pages and never enter result lists, timelines, or calendars as standalone issues.
- Partial dates: the featured issue has a year-only date; additional records have month-only dates. Calendars include only complete release dates and regular single issues.
- Missing record: an unknown issue, creator, character, publisher, or reading-order ID renders a clear fallback. Unknown routes offer a return to Discover.

## Verification

- `npm run build` passes strict TypeScript checks and the Vite production build.
- Architecture checks passed across 89 source files and 47 component files; the largest component file is 49 lines.
- No component fixture imports, cross-feature internal imports, `any`, type casts, or JSX prop spreads were found.
- 253 fixture and selector assertions checked relationships, record counts, dates, labels, variants, filters, timeline ordering, and calendar exclusions.
- Browser checks covered all eight screens at 390px and 320px without horizontal overflow; desktop rendering was checked at 1440px.
- Interactive checks covered combined filters, empty search, numbered search, year-input focus, variant selection, local follows, keyboard date selection, month navigation, loading, missing records, and active navigation.

`SOURCE.md` contains every authored text file and the generated dependency lockfile in full, grouped by folder. Generated builds, installed dependencies, preview screenshots, and the source listing itself are excluded from that listing.

## Commit

From the repository root, while on `ui_test`:

```sh
git add web
git commit -m "Add StarChart discovery demo"
```

Existing changes outside `web/` are not part of those staging commands.
````


### web/index.html

```html title="web/index.html"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#eeeae0" />
    <meta name="description" content="StarChart connects comic stories, characters, creators, and the issues where they belong." />
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='18' fill='%232e443c'/%3E%3Cpath d='M32 8 38 26 56 32 38 38 32 56 26 38 8 32 26 26Z' fill='%23f7f4eb'/%3E%3C/svg%3E" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Newsreader:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet" />
    <title>StarChart — A universe of stories</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```


### web/package-lock.json

```json title="web/package-lock.json"
{
  "name": "starchart-demo",
  "version": "0.1.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "starchart-demo",
      "version": "0.1.0",
      "dependencies": {
        "react": "^19.2.0",
        "react-dom": "^19.2.0",
        "react-router": "^7.13.0"
      },
      "devDependencies": {
        "@tailwindcss/vite": "^4.1.0",
        "@types/node": "^24.0.0",
        "@types/react": "^19.2.0",
        "@types/react-dom": "^19.2.0",
        "@vitejs/plugin-react": "^6.0.0",
        "tailwindcss": "^4.1.0",
        "typescript": "^5.9.3",
        "vite": "^8.0.0"
      }
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.13",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.0",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/remapping": {
      "version": "2.3.5",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.5",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.6.0",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.31",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@oxc-project/types": {
      "version": "0.154.0",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/oxc-project"
      }
    },
    "node_modules/@rolldown/binding-android-arm-eabi": {
      "version": "1.2.14",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-android-arm-eabi/-/binding-android-arm-eabi-1.2.14.tgz",
      "integrity": "sha512-aWR+XKH9+rW7m5fWq/5360J3mHycrx/o6xZM2DQFdJnTMdyP7/WzxPjhtLbVWdKo2y612/4U1bWqb3HQhiF7vg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-android-arm64": {
      "version": "1.2.14",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-android-arm64/-/binding-android-arm64-1.2.14.tgz",
      "integrity": "sha512-QiVxHofl6A8lQU7WAtOUY4QMVZXohxwz7WJJoeh8NBEUyKfIkMRKhYyq8az/1RypNiIXzNTtiS6KwHz0erxYRQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-arm64": {
      "version": "1.2.14",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-x64": {
      "version": "1.2.14",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-x64/-/binding-darwin-x64-1.2.14.tgz",
      "integrity": "sha512-hyMKEGatjmBYCs/Q4sbIcL/GqpFEqsX3wc+HYVQ/85A4rxc1o7rPm4DUI4GV4k/h0ITddwFSGpqQunI14GXjTA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-freebsd-x64": {
      "version": "1.2.14",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-freebsd-x64/-/binding-freebsd-x64-1.2.14.tgz",
      "integrity": "sha512-u371GbXoVXrEgP20PwzoGNOdAOqAMhzo19JzzY+V4YmmnC+DTOoqdbMu+O+54emM59Mik/UdrtWgcuEDKWRPKA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm-gnueabihf": {
      "version": "1.2.14",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm-gnueabihf/-/binding-linux-arm-gnueabihf-1.2.14.tgz",
      "integrity": "sha512-BqwKsdZQf6EqVWr8fv2MrDYzAvOZ7+NYFSJESRGs87fkseEhs0TU9TXgRJTkZoRRkxTizyEg1LKUXfU3/78uqg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-gnu": {
      "version": "1.2.14",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-gnu/-/binding-linux-arm64-gnu-1.2.14.tgz",
      "integrity": "sha512-SD9kY8M009x/7s57Z1dgUVlP5+uYBgKQK0Tkr1WIWngrtUJmRCW1RJFMY7QDla2khXhmg2i5Io7MUjcmZNZ/KQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-musl": {
      "version": "1.2.14",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-musl/-/binding-linux-arm64-musl-1.2.14.tgz",
      "integrity": "sha512-BJ2CL19M6uuWesMgnqJzgxoI+N+eV7b0A9O9vLV42y+gitC41fNa8KElau1tHVzuLWX5GzEuxMPhAO0tQXQMkg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-ppc64-gnu": {
      "version": "1.2.14",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-ppc64-gnu/-/binding-linux-ppc64-gnu-1.2.14.tgz",
      "integrity": "sha512-4+Kl8daPV8NDHaD7mfCcc1pRM+Qg7ab8DyMm5FG5WoZgv4h2i3KFN1CybYBNbQqmuYm7ftJLvmMI1eHYJ22S/Q==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-s390x-gnu": {
      "version": "1.2.14",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-s390x-gnu/-/binding-linux-s390x-gnu-1.2.14.tgz",
      "integrity": "sha512-V/h8ePq1fKDrmtFMz6xcCN3DKvuvMRrwwD1q0PkBeeo4DpK64biaKvqWGVxqCeYKqeRk7gE7/iKPxLCn08O97A==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-gnu": {
      "version": "1.2.14",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-gnu/-/binding-linux-x64-gnu-1.2.14.tgz",
      "integrity": "sha512-WxalXzgrLVpKC93xfpaJ3gCXUWzeCr+FRCbDVD2mUAy4L6Vo3lNVz0epUEUpxPWJkLNYUwM4OSIikv36OJ9mLg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-musl": {
      "version": "1.2.14",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-musl/-/binding-linux-x64-musl-1.2.14.tgz",
      "integrity": "sha512-3G3tnAmTpdk9jO3GQtyHXqeFD2SlecfTws/Y3M2mmj9nMBwwuLT4kur8sZKeu7ENUHSpVO3cIsm5A52LEWWwlg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-openharmony-arm64": {
      "version": "1.2.14",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-openharmony-arm64/-/binding-openharmony-arm64-1.2.14.tgz",
      "integrity": "sha512-qyr5XiNGxm2ytx17vvtcJ9nXn6v1gENETi503bJx3OGwZ1tSonj7BosxbMa/xeAfSl5iS9X6KjEWYXLu6v1L7Q==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-arm64-msvc": {
      "version": "1.2.14",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-arm64-msvc/-/binding-win32-arm64-msvc-1.2.14.tgz",
      "integrity": "sha512-oA4o5o0S2yB199YyYXDzKUv1Z56Rc+mgOjwm7Z/vJ9Z8igiDPYvoOuDyo6g7AK/ZaF09nPhDKVnGBcYHO11GXA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-x64-msvc": {
      "version": "1.2.14",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-x64-msvc/-/binding-win32-x64-msvc-1.2.14.tgz",
      "integrity": "sha512-9mE94bf2GZUaR/fUSXCMpBoWkctu421Mi0ORpm4zqfbkjKep7RxzPFa5etcGs5h+2KApoWBOA/hAJa/7saGgEQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/pluginutils": {
      "version": "1.0.1",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@tailwindcss/node": {
      "version": "4.3.3",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/remapping": "^2.3.5",
        "enhanced-resolve": "^5.24.1",
        "jiti": "^2.7.0",
        "lightningcss": "1.32.0",
        "magic-string": "^0.30.21",
        "source-map-js": "^1.2.1",
        "tailwindcss": "4.3.3"
      }
    },
    "node_modules/@tailwindcss/oxide": {
      "version": "4.3.3",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 20"
      },
      "optionalDependencies": {
        "@tailwindcss/oxide-android-arm64": "4.3.3",
        "@tailwindcss/oxide-darwin-arm64": "4.3.3",
        "@tailwindcss/oxide-darwin-x64": "4.3.3",
        "@tailwindcss/oxide-freebsd-x64": "4.3.3",
        "@tailwindcss/oxide-linux-arm-gnueabihf": "4.3.3",
        "@tailwindcss/oxide-linux-arm64-gnu": "4.3.3",
        "@tailwindcss/oxide-linux-arm64-musl": "4.3.3",
        "@tailwindcss/oxide-linux-x64-gnu": "4.3.3",
        "@tailwindcss/oxide-linux-x64-musl": "4.3.3",
        "@tailwindcss/oxide-wasm32-wasi": "4.3.3",
        "@tailwindcss/oxide-win32-arm64-msvc": "4.3.3",
        "@tailwindcss/oxide-win32-x64-msvc": "4.3.3"
      }
    },
    "node_modules/@tailwindcss/oxide-android-arm64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-android-arm64/-/oxide-android-arm64-4.3.3.tgz",
      "integrity": "sha512-Y85A2gmPSkl5Ve5qR86GL4HT509cFqQh1aes9p3sSkyTPwt0Pppf3GkwGe4JPACcRYjgJIEhQgM6dBClnr0NYw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-darwin-arm64": {
      "version": "4.3.3",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-darwin-x64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-darwin-x64/-/oxide-darwin-x64-4.3.3.tgz",
      "integrity": "sha512-fAeUqfV5ndhxRwai8cXGzdLvul9utWOmeTkv69unv4ZXixjn61Z+p9lCWdwOwA3TYboG3BwdVuN/RDjhBRl0mw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-freebsd-x64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-freebsd-x64/-/oxide-freebsd-x64-4.3.3.tgz",
      "integrity": "sha512-iyf5bV6+wnAlflVeEy7R25dupxTNECZN5QMI0qNT6eT+EgaGdZcKhGkr5SdoaWiLJ3spLqIY9VCeSGrwmtg4kw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-arm-gnueabihf": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-arm-gnueabihf/-/oxide-linux-arm-gnueabihf-4.3.3.tgz",
      "integrity": "sha512-aAYUprJAJQWWbRrPvtjdroZ56Md+JM8pMiopS6xGEwDfLhqj+2ver2p4nU4Mb3CRqcMmNBjo8KkUgcxhkzVQGQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-arm64-gnu": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-arm64-gnu/-/oxide-linux-arm64-gnu-4.3.3.tgz",
      "integrity": "sha512-nDxldcEENOxZRzC2uu9jrutZdAAQtb+8WWDCSnWL1zvBk1+FN+x6MtDViPB5AJMfttVCUhehGWus3XBPgatM/w==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-arm64-musl": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-arm64-musl/-/oxide-linux-arm64-musl-4.3.3.tgz",
      "integrity": "sha512-Md44bD6veX/PC5iyF8cDVnw4HBIANZepRZZ7a8DQOvkfo5WUBwcp6iAuCUz23u+4SUkhJlD3eL7hNdW8ezd/kA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-x64-gnu": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-x64-gnu/-/oxide-linux-x64-gnu-4.3.3.tgz",
      "integrity": "sha512-tx7us1muwOKAKWao2v/GaafFeQboE6aj88vC6ziN2NCGcRm8gWUhwjzg+YdVB1e4boAtdtma4L43onunI6NS4w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-x64-musl": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-x64-musl/-/oxide-linux-x64-musl-4.3.3.tgz",
      "integrity": "sha512-SJxX60smvHgasZoBy11dX6YRjXJFovwWBoedhbQPOBzgFWBHGB+TVPWB9BxzR7TTxU8FQZAI2AyiNCMzFm8Img==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-wasm32-wasi": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-wasm32-wasi/-/oxide-wasm32-wasi-4.3.3.tgz",
      "integrity": "sha512-jx1+rPhY/5Ympkktd656HBWEBLxP7dH06losBLjjf5vgCODXvi9KhtftWcMIwTFIDqBr7cRnQkdLnAG+IOlGvQ==",
      "bundleDependencies": [
        "@napi-rs/wasm-runtime",
        "@emnapi/core",
        "@emnapi/runtime",
        "@tybys/wasm-util",
        "@emnapi/wasi-threads",
        "tslib"
      ],
      "cpu": [
        "wasm32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/core": "^1.11.1",
        "@emnapi/runtime": "^1.11.1",
        "@emnapi/wasi-threads": "^1.2.2",
        "@napi-rs/wasm-runtime": "^1.1.4",
        "@tybys/wasm-util": "^0.10.2",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/@emnapi/core": {
      "version": "1.11.1",
      "dev": true,
      "inBundle": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/wasi-threads": "1.2.2",
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/@emnapi/runtime": {
      "version": "1.11.1",
      "dev": true,
      "inBundle": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/@emnapi/wasi-threads": {
      "version": "1.2.2",
      "dev": true,
      "inBundle": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/@napi-rs/wasm-runtime": {
      "version": "1.1.4",
      "dev": true,
      "inBundle": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@tybys/wasm-util": "^0.10.1"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/Brooooooklyn"
      },
      "peerDependencies": {
        "@emnapi/core": "^1.7.1",
        "@emnapi/runtime": "^1.7.1"
      }
    },
    "node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/@tybys/wasm-util": {
      "version": "0.10.2",
      "dev": true,
      "inBundle": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/tslib": {
      "version": "2.8.1",
      "dev": true,
      "inBundle": true,
      "license": "0BSD",
      "optional": true
    },
    "node_modules/@tailwindcss/oxide-win32-arm64-msvc": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-win32-arm64-msvc/-/oxide-win32-arm64-msvc-4.3.3.tgz",
      "integrity": "sha512-3rc292Ca2ceK6Ulcc/bAVnTs/3nDtoPhyEKlgPv+yQJQi/JS/AMJlqzxvlDacL1nekbrcf6bTqp/jV4qgnPxNQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-win32-x64-msvc": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-win32-x64-msvc/-/oxide-win32-x64-msvc-4.3.3.tgz",
      "integrity": "sha512-yJ0pwIVc/nYeGoV02WtsN8KYyLQv7kyI2wDnkezyJlGGjkd4QLwDGAwl47YpPJeuI0M0ObaXGSPjvWDPeTPggw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/vite": {
      "version": "4.3.3",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@tailwindcss/node": "4.3.3",
        "@tailwindcss/oxide": "4.3.3",
        "tailwindcss": "4.3.3"
      },
      "peerDependencies": {
        "vite": "^5.2.0 || ^6 || ^7 || ^8"
      }
    },
    "node_modules/@types/node": {
      "version": "24.19.2",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "undici-types": ">=7.24.0 <7.24.7"
      }
    },
    "node_modules/@types/react": {
      "version": "19.3.0",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "csstype": "^3.2.2"
      }
    },
    "node_modules/@types/react-dom": {
      "version": "19.3.0",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "^19.3.0"
      }
    },
    "node_modules/@vitejs/plugin-react": {
      "version": "6.1.2",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@rolldown/pluginutils": "^1.0.1"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "peerDependencies": {
        "@rolldown/plugin-babel": "^0.1.7 || ^0.2.0",
        "babel-plugin-react-compiler": "^1.0.0",
        "oxc-transform-react": "^0.152.0",
        "vite": "^8.0.0"
      },
      "peerDependenciesMeta": {
        "@rolldown/plugin-babel": {
          "optional": true
        },
        "babel-plugin-react-compiler": {
          "optional": true
        },
        "oxc-transform-react": {
          "optional": true
        }
      }
    },
    "node_modules/cookie": {
      "version": "1.1.1",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/csstype": {
      "version": "3.2.3",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/detect-libc": {
      "version": "2.1.2",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/enhanced-resolve": {
      "version": "5.26.0",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "graceful-fs": "^4.2.4",
        "tapable": "^2.3.3"
      },
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/fdir": {
      "version": "6.5.0",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/graceful-fs": {
      "version": "4.2.11",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/jiti": {
      "version": "2.7.0",
      "dev": true,
      "license": "MIT",
      "bin": {
        "jiti": "lib/jiti-cli.mjs"
      }
    },
    "node_modules/lightningcss": {
      "version": "1.32.0",
      "dev": true,
      "license": "MPL-2.0",
      "dependencies": {
        "detect-libc": "^2.0.3"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      },
      "optionalDependencies": {
        "lightningcss-android-arm64": "1.32.0",
        "lightningcss-darwin-arm64": "1.32.0",
        "lightningcss-darwin-x64": "1.32.0",
        "lightningcss-freebsd-x64": "1.32.0",
        "lightningcss-linux-arm-gnueabihf": "1.32.0",
        "lightningcss-linux-arm64-gnu": "1.32.0",
        "lightningcss-linux-arm64-musl": "1.32.0",
        "lightningcss-linux-x64-gnu": "1.32.0",
        "lightningcss-linux-x64-musl": "1.32.0",
        "lightningcss-win32-arm64-msvc": "1.32.0",
        "lightningcss-win32-x64-msvc": "1.32.0"
      }
    },
    "node_modules/lightningcss-android-arm64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.32.0.tgz",
      "integrity": "sha512-YK7/ClTt4kAK0vo6w3X+Pnm0D2cf2vPHbhOXdoNti1Ga0al1P4TBZhwjATvjNwLEBCnKvjJc2jQgHXH0NEwlAg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-arm64": {
      "version": "1.32.0",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-x64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.32.0.tgz",
      "integrity": "sha512-U+QsBp2m/s2wqpUYT/6wnlagdZbtZdndSmut/NJqlCcMLTWp5muCrID+K5UJ6jqD2BFshejCYXniPDbNh73V8w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-freebsd-x64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.32.0.tgz",
      "integrity": "sha512-JCTigedEksZk3tHTTthnMdVfGf61Fky8Ji2E4YjUTEQX14xiy/lTzXnu1vwiZe3bYe0q+SpsSH/CTeDXK6WHig==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm-gnueabihf": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.32.0.tgz",
      "integrity": "sha512-x6rnnpRa2GL0zQOkt6rts3YDPzduLpWvwAF6EMhXFVZXD4tPrBkEFqzGowzCsIWsPjqSK+tyNEODUBXeeVHSkw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-gnu": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.32.0.tgz",
      "integrity": "sha512-0nnMyoyOLRJXfbMOilaSRcLH3Jw5z9HDNGfT/gwCPgaDjnx0i8w7vBzFLFR1f6CMLKF8gVbebmkUN3fa/kQJpQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-musl": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.32.0.tgz",
      "integrity": "sha512-UpQkoenr4UJEzgVIYpI80lDFvRmPVg6oqboNHfoH4CQIfNA+HOrZ7Mo7KZP02dC6LjghPQJeBsvXhJod/wnIBg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-gnu": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.32.0.tgz",
      "integrity": "sha512-V7Qr52IhZmdKPVr+Vtw8o+WLsQJYCTd8loIfpDaMRWGUZfBOYEJeyJIkqGIDMZPwPx24pUMfwSxxI8phr/MbOA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-musl": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.32.0.tgz",
      "integrity": "sha512-bYcLp+Vb0awsiXg/80uCRezCYHNg1/l3mt0gzHnWV9XP1W5sKa5/TCdGWaR/zBM2PeF/HbsQv/j2URNOiVuxWg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-arm64-msvc": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.32.0.tgz",
      "integrity": "sha512-8SbC8BR40pS6baCM8sbtYDSwEVQd4JlFTOlaD3gWGHfThTcABnNDBda6eTZeqbofalIJhFx0qKzgHJmcPTnGdw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-x64-msvc": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.32.0.tgz",
      "integrity": "sha512-Amq9B/SoZYdDi1kFrojnoqPLxYhQ4Wo5XiL8EVJrVsB8ARoC1PWW6VGtT0WKCemjy8aC+louJnjS7U18x3b06Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/magic-string": {
      "version": "0.30.21",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.5"
      }
    },
    "node_modules/nanoid": {
      "version": "3.3.20",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/picomatch": {
      "version": "4.0.7",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/postcss": {
      "version": "8.5.30",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.20",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.2"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/react": {
      "version": "19.3.1",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "19.3.1",
      "license": "MIT",
      "dependencies": {
        "scheduler": "^0.28.0"
      },
      "peerDependencies": {
        "react": "^19.3.1"
      }
    },
    "node_modules/react-router": {
      "version": "7.18.4",
      "license": "MIT",
      "dependencies": {
        "cookie": "^1.0.1",
        "set-cookie-parser": "^2.6.0"
      },
      "engines": {
        "node": ">=20.0.0"
      },
      "peerDependencies": {
        "react": ">=18",
        "react-dom": ">=18"
      },
      "peerDependenciesMeta": {
        "react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/rolldown": {
      "version": "1.2.14",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@oxc-project/types": "=0.154.0",
        "@rolldown/pluginutils": "^1.0.0"
      },
      "bin": {
        "rolldown": "bin/cli.mjs"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "optionalDependencies": {
        "@rolldown/binding-android-arm-eabi": "1.2.14",
        "@rolldown/binding-android-arm64": "1.2.14",
        "@rolldown/binding-darwin-arm64": "1.2.14",
        "@rolldown/binding-darwin-x64": "1.2.14",
        "@rolldown/binding-freebsd-x64": "1.2.14",
        "@rolldown/binding-linux-arm-gnueabihf": "1.2.14",
        "@rolldown/binding-linux-arm64-gnu": "1.2.14",
        "@rolldown/binding-linux-arm64-musl": "1.2.14",
        "@rolldown/binding-linux-ppc64-gnu": "1.2.14",
        "@rolldown/binding-linux-s390x-gnu": "1.2.14",
        "@rolldown/binding-linux-x64-gnu": "1.2.14",
        "@rolldown/binding-linux-x64-musl": "1.2.14",
        "@rolldown/binding-openharmony-arm64": "1.2.14",
        "@rolldown/binding-win32-arm64-msvc": "1.2.14",
        "@rolldown/binding-win32-x64-msvc": "1.2.14"
      }
    },
    "node_modules/scheduler": {
      "version": "0.28.0",
      "license": "MIT"
    },
    "node_modules/set-cookie-parser": {
      "version": "2.7.2",
      "license": "MIT"
    },
    "node_modules/source-map-js": {
      "version": "1.2.2",
      "dev": true,
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/tailwindcss": {
      "version": "4.3.3",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tapable": {
      "version": "2.3.3",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/webpack"
      }
    },
    "node_modules/tinyglobby": {
      "version": "0.2.17",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fdir": "^6.5.0",
        "picomatch": "^4.0.4"
      },
      "engines": {
        "node": ">=12.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/typescript": {
      "version": "5.9.3",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "tsc": "bin/tsc",
        "tsserver": "bin/tsserver"
      },
      "engines": {
        "node": ">=14.17"
      }
    },
    "node_modules/undici-types": {
      "version": "7.24.6",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/vite": {
      "version": "8.3.4",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "lightningcss": "^1.33.0",
        "picomatch": "^4.0.7",
        "postcss": "^8.5.29",
        "rolldown": "~1.2.12",
        "tinyglobby": "^0.2.17"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^20.19.0 || >=22.12.0",
        "@vitejs/devtools": "^0.7.1",
        "esbuild": "^0.27.0 || ^0.28.0",
        "jiti": ">=1.21.0",
        "less": "^4.0.0",
        "sass": "^1.70.0",
        "sass-embedded": "^1.70.0",
        "stylus": ">=0.54.8",
        "sugarss": "^5.0.0",
        "terser": "^5.16.0",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "@vitejs/devtools": {
          "optional": true
        },
        "esbuild": {
          "optional": true
        },
        "jiti": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    },
    "node_modules/vite/node_modules/lightningcss": {
      "version": "1.33.0",
      "dev": true,
      "license": "MPL-2.0",
      "dependencies": {
        "detect-libc": "^2.0.3"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      },
      "optionalDependencies": {
        "lightningcss-android-arm64": "1.33.0",
        "lightningcss-darwin-arm64": "1.33.0",
        "lightningcss-darwin-x64": "1.33.0",
        "lightningcss-freebsd-x64": "1.33.0",
        "lightningcss-linux-arm-gnueabihf": "1.33.0",
        "lightningcss-linux-arm64-gnu": "1.33.0",
        "lightningcss-linux-arm64-musl": "1.33.0",
        "lightningcss-linux-x64-gnu": "1.33.0",
        "lightningcss-linux-x64-musl": "1.33.0",
        "lightningcss-win32-arm64-msvc": "1.33.0",
        "lightningcss-win32-x64-msvc": "1.33.0"
      }
    },
    "node_modules/vite/node_modules/lightningcss-android-arm64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.33.0.tgz",
      "integrity": "sha512-gEpRTalKdosp4Bb8qWtc2iOgE5SeIHlpS1up9bFq2wAyYhl1UdTObYiHe98zEM9SQvSoqQZ1IQD0JNpg3Ml5pg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/vite/node_modules/lightningcss-darwin-arm64": {
      "version": "1.33.0",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/vite/node_modules/lightningcss-darwin-x64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.33.0.tgz",
      "integrity": "sha512-Z5UPAxzrjlWNNyGy6i65cJzzvgJ5D3T6wMvs+gWpY9d7qRhANrxqAp6LhxIgZhWEw18RfJTGcRxjuLIBr+m8XQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/vite/node_modules/lightningcss-freebsd-x64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.33.0.tgz",
      "integrity": "sha512-QQM/Ti/hQajJwCY+RiWuCZ9sdtI/XQk7nDK5vC8kkdwixezOlDgvDx7+RT+QjK6FcFT4MpsuoBnHIo/O3StRRg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/vite/node_modules/lightningcss-linux-arm-gnueabihf": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.33.0.tgz",
      "integrity": "sha512-N7FVBe6iS24MlM6R/4RBTxGhQheZGs7tiQ9U32UtF75NzP5Q7xWPRqLBCKxlRQRk3rY1jCIPLzx7WzOhuUIRLQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/vite/node_modules/lightningcss-linux-arm64-gnu": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.33.0.tgz",
      "integrity": "sha512-j2v/itmy4HlNxlc6voKXYgBqNi0Ng2LShg4z7GufpEgs05P+2suBVyi9I6YHq5uoVFx9ETin3eCEhLVyXGQnKg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/vite/node_modules/lightningcss-linux-arm64-musl": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.33.0.tgz",
      "integrity": "sha512-yiO5ROMuYQgXbC60yjZU5CYSFZGKXL0HFATXt9mHJn1+zW55oCtMI9NfcVhYLMFDL7gV7oBPon/EmMMGg2OvtQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/vite/node_modules/lightningcss-linux-x64-gnu": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.33.0.tgz",
      "integrity": "sha512-ar+Ju7LmcN0Jo4FpL4hpFybwNG9/3A/Br5KW2n2jyODg3MEZXaDYADdemoNS+BDNfMgKvylJLj4S5tyRActuAg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/vite/node_modules/lightningcss-linux-x64-musl": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.33.0.tgz",
      "integrity": "sha512-RYiYbkokw0trfKqqzfF55lginwEPrD3OJDfTuJzFs1MK6iFnDenaz1fqLLtX4ITG3OktJQXOeTaw1awrBAlZPw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/vite/node_modules/lightningcss-win32-arm64-msvc": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.33.0.tgz",
      "integrity": "sha512-1K+MPfLSFVpphzpdbfkhlWk6wBrTObBzS2T6db10PNOZgR9GoVsAWzwNyuhUYYbTp23j+4RrncfujZ4uAzXvwA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/vite/node_modules/lightningcss-win32-x64-msvc": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.33.0.tgz",
      "integrity": "sha512-OlEICDx/Xl0FqSp4bry8zFnCvGpig3Gl4gCquvYwHuqJKEC1+n9NgDniFvqHGmMv1ZkqDJrDqKKSykTDX+ehuA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    }
  }
}
```


### web/package.json

```json title="web/package.json"
{
  "name": "starchart-demo",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "typecheck": "tsc --noEmit",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --host 127.0.0.1"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router": "^7.13.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.0",
    "@types/node": "^24.0.0",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@vitejs/plugin-react": "^6.0.0",
    "tailwindcss": "^4.1.0",
    "typescript": "^5.9.3",
    "vite": "^8.0.0"
  }
}
```


## web/src/app


### web/src/app/navigation.ts

```ts title="web/src/app/navigation.ts"
import type { IconName } from '../components/Icon';
import { characters, creators } from '../data/catalog';
import { readingOrderScenario, timelineScenario } from '../data/scenarios';

export type NavigationEntry = { id: string; label: string; path: string; icon: IconName };

export function getNavigation(): NavigationEntry[] {
  return [
    { id: 'discover', label: 'Discover', path: '/', icon: 'compass' },
    { id: 'search', label: 'Search stories', path: '/search', icon: 'search' },
    { id: 'timeline', label: 'Publisher timeline', path: `/publishers/${timelineScenario.publisherId}`, icon: 'timeline' },
    { id: 'calendar', label: 'Release calendar', path: '/calendar', icon: 'calendar' },
    { id: 'creators', label: 'Creators', path: `/creators/${creators[0].id}`, icon: 'pen' },
    { id: 'characters', label: 'Characters', path: `/characters/${characters[0].id}`, icon: 'character' },
    { id: 'reading-order', label: 'Reading order', path: `/reading-order/${readingOrderScenario.id}`, icon: 'layers' },
  ];
}
```


### web/src/app/router.tsx

```tsx title="web/src/app/router.tsx"
import { createBrowserRouter } from 'react-router';
import { CharacterPage } from '../features/character';
import { CreatorPage } from '../features/creator';
import { DiscoverPage } from '../features/discover';
import { IssueDetailPage } from '../features/issue-detail';
import { PublisherTimelinePage } from '../features/publisher-timeline';
import { ReadingOrderPage } from '../features/reading-order';
import { ReleaseCalendarPage } from '../features/release-calendar';
import { SearchPage } from '../features/search';
import { AppLayout } from '../layouts/AppLayout';
import { ActionLink } from '../components/ActionLink';
import { EmptyState } from '../components/EmptyState';

export const router = createBrowserRouter([
  { path: '/', element: <DiscoverPage /> },
  { path: '/search', element: <SearchPage /> },
  { path: '/issues/:issueId', element: <IssueDetailPage /> },
  { path: '/publishers/:publisherId', element: <PublisherTimelinePage /> },
  { path: '/calendar', element: <ReleaseCalendarPage /> },
  { path: '/creators/:creatorId', element: <CreatorPage /> },
  { path: '/characters/:characterId', element: <CharacterPage /> },
  { path: '/reading-order/:orderId', element: <ReadingOrderPage /> },
  { path: '*', element: <AppLayout><EmptyState title="An uncharted corner" description="We couldn't find that page." /><ActionLink to="/">Back to discovery</ActionLink></AppLayout> },
]);
```


### web/src/app/styles.css

```css title="web/src/app/styles.css"
@import 'tailwindcss' source('../');

@theme {
  --color-canvas: #d3d6c9;
  --color-surface: #faf8f1;
  --color-panel: #eeeee2;
  --color-ink: #28372f;
  --color-muted: #646e61;
  --color-accent: #d46b58;
  --color-accent-ink: #a84b3d;
  --color-pill: #283d34;
  --color-line: #dedfd3;
  --color-paper: #fff9e8;
  --color-sage: #a7b09a;
  --color-sage-deep: #374d43;
  --color-coral: #d58b73;
  --color-coral-deep: #7b3c39;
  --color-midnight: #243e50;
  --color-midnight-light: #a3c4c5;
  --color-ochre: #d2ad64;
  --color-ochre-deep: #775236;
  --color-plum: #6e5b70;
  --color-plum-light: #d3a7a1;
  --color-sand: #c9b9a0;
  --color-sand-deep: #736454;
  --font-display: 'Newsreader', Georgia, serif;
  --font-sans: 'Manrope', sans-serif;
  --radius-card: 22px;
  --shadow-cover: 0 24px 24px -13px color-mix(in srgb, var(--color-ink) 42%, transparent), 0 5px 9px -4px color-mix(in srgb, var(--color-ink) 30%, transparent);
  --shadow-panel: 0 12px 65px -30px color-mix(in srgb, var(--color-ink) 25%, transparent);
}

@layer base {
  * { box-sizing: border-box; }
  html { background: var(--color-canvas); scroll-behavior: smooth; }
  body { margin: 0; color: var(--color-ink); font-family: var(--font-sans); -webkit-font-smoothing: antialiased; }
  button, input, select { font: inherit; }
  button, a, input, select { -webkit-tap-highlight-color: transparent; }
  button, select { cursor: pointer; }
  a { color: inherit; text-decoration: none; }
  button { touch-action: manipulation; }
  button:disabled { cursor: default; opacity: .5; }
  :focus-visible { outline: 2px solid var(--color-accent); outline-offset: 5px; }
  ::selection { color: var(--color-ink); background: var(--color-sand); }
  h1, h2, h3, p { margin: 0; }
}

@layer components {
  .app-frame { position: relative; display: grid; grid-template-columns: 82px minmax(0, 1fr); max-width: 1600px; min-height: calc(100dvh - 56px); margin: 28px auto; overflow: clip; background: var(--color-surface); border: 1px solid color-mix(in srgb, var(--color-paper) 60%, transparent); border-radius: 28px; box-shadow: var(--shadow-panel); }
  .app-body { min-width: 0; display: flex; flex-direction: column; }
  .navigation-rail { display: flex; align-items: center; flex-direction: column; padding: 29px 0; border-right: 1px solid var(--color-line); }
  .brand-symbol { display: grid; width: 43px; height: 43px; place-items: center; border-radius: 15px; color: var(--color-paper); background: var(--color-pill); }
  .navigation-rail nav { position: sticky; top: 40px; display: flex; flex-direction: column; gap: 16px; margin-top: 75px; }
  .navigation-link { display: grid; width: 44px; height: 44px; place-items: center; border-radius: 50%; color: var(--color-muted); transition: color .2s, background .2s, transform .2s; }
  .navigation-link:hover { color: var(--color-ink); background: var(--color-panel); transform: translateY(-2px); }
  .navigation-active, .navigation-active:hover { color: var(--color-paper); background: var(--color-accent); }
  .rail-footnote { margin-top: auto; padding-top: 65px; color: var(--color-muted); font-size: 10px; letter-spacing: .15em; }
  .top-bar { display: flex; align-items: center; gap: 24px; min-height: 95px; padding: 20px 40px; border-bottom: 1px solid var(--color-line); }
  .wordmark { display: flex; align-items: center; gap: 7px; font-family: var(--font-display); font-size: 27px; letter-spacing: -.8px; white-space: nowrap; }
  .wordmark-dot { color: var(--color-accent); font-size: 19px; }
  .top-bar-caption { padding-left: 22px; border-left: 1px solid var(--color-line); color: var(--color-muted); font-size: 11px; }
  .top-bar-search { width: 310px; margin-left: auto; }
  .top-bar-calendar { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid var(--color-line); border-radius: 50%; }
  .content-layout { flex: 1; min-width: 0; }
  .has-right-rail { display: grid; grid-template-columns: minmax(0, 1fr) 300px; }
  .main-content { min-width: 0; padding: 38px 40px 48px; }
  .right-rail { padding: 38px 24px; border-left: 1px solid var(--color-line); background: color-mix(in srgb, var(--color-panel) 40%, var(--color-surface)); }
  .app-footer { display: flex; justify-content: space-between; gap: 16px; margin: 0 40px; padding: 19px 0; border-top: 1px solid var(--color-line); color: var(--color-muted); font-size: 10px; }
  .skip-link { position: absolute; top: 12px; left: 100px; z-index: 50; transform: translateY(-200%); padding: 10px 15px; border-radius: 8px; background: var(--color-pill); color: var(--color-paper); }
  .skip-link:focus { transform: translateY(0); }
  .eyebrow { color: var(--color-muted); font-size: 9px; font-weight: 700; letter-spacing: .19em; line-height: 1.5; text-transform: uppercase; }
  .page-heading { margin-bottom: 32px; }
  .page-heading h1 { max-width: 900px; margin-top: 12px; font-family: var(--font-display); font-size: clamp(38px, 4vw, 60px); line-height: 1.05; letter-spacing: -.035em; }
  .page-description { max-width: 600px; margin-top: 18px; color: var(--color-muted); font-size: 13px; line-height: 1.9; }
  .content-section { min-width: 0; }
  .section-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 23px; }
  .section-heading h2 { margin-top: 6px; font-family: var(--font-display); font-size: 28px; font-weight: 400; line-height: 1.1; letter-spacing: -.6px; }
  .right-rail .section-heading h2 { font-size: 25px; }
  .right-rail .eyebrow { font-size: 8px; }
  .action { display: inline-flex; flex-shrink: 0; align-items: center; justify-content: center; gap: 12px; min-height: 42px; padding: 12px 21px; border: 1px solid transparent; border-radius: 999px; font-size: 11px; font-weight: 600; line-height: 1.4; transition: background .2s, transform .2s; }
  .action-primary { color: var(--color-paper); background: var(--color-pill); }
  .action-primary:hover { background: var(--color-sage-deep); transform: translateY(-2px); }
  .action-quiet { min-height: 34px; padding: 8px 0; color: var(--color-ink); background: transparent; }
  .action-quiet:hover { color: var(--color-accent-ink); }
  .follow-button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-width: 32px; min-height: 32px; padding: 8px 12px; border: 1px solid var(--color-line); border-radius: 999px; color: var(--color-ink); font-size: 10px; white-space: nowrap; }
  .follow-button[aria-pressed='true'] { border-color: var(--color-sage); color: var(--color-sage-deep); background: color-mix(in srgb, var(--color-sage) 16%, transparent); }
  .search-box { display: flex; align-items: center; gap: 11px; min-width: 0; padding: 7px 0 7px 11px; border-bottom: 1px solid var(--color-line); color: var(--color-muted); }
  .search-box input { min-width: 0; width: 100%; padding: 5px 0; border: 0; outline: none; color: var(--color-ink); background: transparent; font-size: 11px; }
  .search-box:focus-within { outline: 2px solid var(--color-accent); outline-offset: 3px; border-radius: 10px; }
  .search-box input::placeholder { color: var(--color-muted); opacity: 1; }
  .search-submit { display: inline-flex; align-items: center; justify-content: center; gap: 12px; flex-shrink: 0; min-width: 32px; min-height: 32px; border-radius: 50%; color: var(--color-ink); }
  .search-box-large { gap: 15px; padding: 12px 13px 12px 20px; border: 1px solid var(--color-line); border-radius: 16px; background: color-mix(in srgb, var(--color-paper) 25%, var(--color-surface)); box-shadow: 0 5px 12px -9px var(--color-muted); }
  .search-box-large input { font-size: 13px; }
  .search-box-large .search-submit { min-height: 43px; padding: 10px 18px; border-radius: 999px; color: var(--color-paper); background: var(--color-pill); font-size: 10px; font-weight: 600; }
  .featured-story { background-image: radial-gradient(ellipse at 15% 85%, color-mix(in srgb, var(--color-sage) 19%, transparent), transparent 65%); }
  .featured-orbit { position: absolute; top: 15%; width: 250px; height: 250px; border: 1px solid color-mix(in srgb, var(--color-sage) 45%, transparent); border-radius: 50%; }
  .featured-orbit::after { position: absolute; top: 20px; left: 24px; width: 8px; height: 8px; border-radius: 50%; background: var(--color-accent); content: ''; }
  .cover { position: relative; display: flex; flex-direction: column; flex-shrink: 0; justify-content: space-between; aspect-ratio: 2 / 3; max-width: 100%; overflow: hidden; isolation: isolate; border-radius: 4px 10px 10px 4px; color: var(--color-paper); background: linear-gradient(145deg, var(--cover-light), var(--cover-dark)); box-shadow: var(--shadow-cover); padding: 9% 10%; }
  .cover-sm { width: 72px; min-width: 64px; padding: 9px 8px; border-radius: 3px 5px 5px 3px; }
  .cover-md { width: 160px; padding: 17px 17px 16px; }
  .cover-lg { width: 250px; padding: 23px 22px 20px; }
  .cover-compact { width: 65px; padding: 8px; }
  .cover-coral { --cover-light: var(--color-coral); --cover-dark: var(--color-coral-deep); }
  .cover-sage { --cover-light: var(--color-sage); --cover-dark: var(--color-sage-deep); }
  .cover-midnight { --cover-light: var(--color-midnight); --cover-dark: var(--color-midnight); }
  .cover-ochre { --cover-light: var(--color-ochre); --cover-dark: var(--color-ochre-deep); }
  .cover-plum { --cover-light: var(--color-plum); --cover-dark: var(--color-plum); }
  .cover-sand { --cover-light: var(--color-sand); --cover-dark: var(--color-sand-deep); }
  .cover-publisher { position: relative; z-index: 2; font-size: 7px; font-weight: 600; line-height: 1.4; letter-spacing: .16em; text-transform: uppercase; }
  .cover-title { position: relative; z-index: 2; margin-top: auto; padding-top: 52%; padding-bottom: 14%; font-family: var(--font-display); font-size: 31px; font-weight: 500; line-height: .96; letter-spacing: -.03em; overflow-wrap: anywhere; }
  .cover-caption { position: relative; z-index: 2; font-size: 7px; font-weight: 600; letter-spacing: .13em; text-transform: uppercase; }
  .cover-lg .cover-title { font-size: 42px; }
  .cover-lg .cover-publisher, .cover-lg .cover-caption { font-size: 8px; }
  .cover-sm .cover-title, .cover-compact .cover-title { font-size: 15px; line-height: 1.05; }
  .cover-sm .cover-publisher, .cover-sm .cover-caption, .cover-compact .cover-publisher, .cover-compact .cover-caption { font-size: 4px; letter-spacing: .08em; }
  .cover-orbit { position: absolute; top: 20%; left: 15%; width: 102%; height: 55%; transform: rotate(-30deg); border: 1px solid color-mix(in srgb, var(--color-paper) 55%, transparent); border-radius: 50%; box-shadow: 0 0 0 16px color-mix(in srgb, var(--color-paper) 6%, transparent), 0 0 0 35px color-mix(in srgb, var(--color-paper) 4%, transparent); }
  .cover-horizon { position: absolute; z-index: -1; top: 30%; left: 15%; width: 78%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 30% 20%, var(--color-paper), color-mix(in srgb, var(--color-ochre) 90%, transparent) 42%, transparent 72%); opacity: .7; }
  .cover-star { position: absolute; top: 25%; left: 30%; font-size: 39px; }
  .cover-midnight .cover-horizon { background: radial-gradient(circle at 30% 20%, var(--color-midnight-light), var(--color-sage-deep) 48%, transparent 72%); }
  .cover-plum .cover-horizon { background: radial-gradient(circle at 30% 20%, var(--color-plum-light), var(--color-coral-deep) 48%, transparent 72%); }
  .cover-spine { position: absolute; inset: 0 auto 0 0; z-index: 3; width: 8%; background: linear-gradient(90deg, color-mix(in srgb, var(--color-ink) 30%, transparent), transparent 25%, color-mix(in srgb, var(--color-paper) 18%, transparent) 45%, transparent); }
  .cover-missing { align-items: center; justify-content: center; gap: 16px; border: 1px dashed var(--color-sage); background: var(--color-panel); color: var(--color-muted); text-align: center; box-shadow: none; }
  .cover-missing .cover-title { margin: 0; padding: 0; font-size: 24px; }
  .cover-sm.cover-missing { gap: 6px; }
  .cover-sm.cover-missing svg { width: 18px; height: 18px; }
  .cover-sm.cover-missing .cover-title { font-size: 14px; }
  .issue-card { min-width: 0; }
  .issue-cover-link { position: relative; display: block; margin-bottom: 24px; padding: 3px 6px 0 0; }
  .issue-cover-link .cover { width: 100%; max-width: 210px; transition: transform .25s; }
  .issue-cover-link:hover .cover { transform: translateY(-5px) rotate(-1deg); }
  .issue-publisher { margin-bottom: 7px; color: var(--color-muted); font-size: 9px; line-height: 1.6; }
  .issue-card h3 { font-family: var(--font-display); font-size: 22px; font-weight: 500; line-height: 1.1; letter-spacing: -.4px; }
  .issue-card h3 a:hover { color: var(--color-accent-ink); }
  .issue-series { margin-top: 8px; color: var(--color-muted); font-size: 10px; line-height: 1.5; }
  .variant-badge { position: absolute; right: 14px; bottom: 9px; z-index: 4; padding: 5px 7px; border-radius: 6px; background: var(--color-surface); color: var(--color-ink); font-size: 7px; }
  .tag-row { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 12px; }
  .tag { display: inline-flex; align-items: center; min-height: 20px; padding: 4px 7px; border: 1px solid transparent; border-radius: 5px; font-size: 8px; font-weight: 600; line-height: 1; white-space: nowrap; }
  .tag-issue { border-color: var(--color-line); color: var(--color-muted); }
  .tag-collection { background: var(--color-sand); color: var(--color-ink); }
  .tag-ff { background: color-mix(in srgb, var(--color-sage) 27%, transparent); color: var(--color-sage-deep); }
  .tag-nff { background: color-mix(in srgb, var(--color-coral) 20%, transparent); color: var(--color-coral-deep); }
  .tag-unknown { background: var(--color-panel); color: var(--color-muted); }
  .issue-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 40px 28px; }
  .issue-grid .cover-title { font-size: clamp(26px, 2.2vw, 43px); }
  .calendar-caption { margin-bottom: 23px; font-family: var(--font-display); font-size: 27px; text-align: center; }
  .calendar-weekdays, .calendar-days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 7px; }
  .calendar-weekdays { margin-bottom: 12px; color: var(--color-muted); font-size: 10px; text-align: center; }
  .calendar-day { position: relative; display: grid; place-items: center; min-height: 45px; border-radius: 10px; font-size: 12px; transition: background .2s; }
  .calendar-day:hover { background: color-mix(in srgb, var(--color-sage) 20%, transparent); }
  .calendar-selected, .calendar-selected:hover { color: var(--color-paper); background: var(--color-pill); }
  .release-dot { position: absolute; bottom: 5px; left: calc(50% - 1.5px); width: 3px; height: 3px; border-radius: 50%; background: var(--color-accent); }
  .calendar-selected .release-dot { background: var(--color-paper); }
  .calendar-compact .calendar-caption { margin: 5px 0 17px; font-size: 20px; }
  .calendar-compact .calendar-weekdays { gap: 2px; margin-bottom: 8px; font-size: 8px; }
  .calendar-compact .calendar-days { gap: 2px; }
  .calendar-compact .calendar-day { min-height: 29px; border-radius: 50%; font-size: 10px; }
  .calendar-compact .release-dot { bottom: 2px; }
  .skeleton { min-height: 230px; border-radius: 10px; background: linear-gradient(100deg, var(--color-panel) 20%, var(--color-line) 45%, var(--color-panel) 70%); background-size: 200% 100%; animation: shimmer 2s ease-in-out infinite; }
  .skeleton.h-3 { min-height: 12px; }
  .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; min-height: 220px; padding: 30px; border: 1px dashed var(--color-line); border-radius: var(--radius-card); text-align: center; }
  .empty-symbol { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; color: var(--color-sage-deep); background: var(--color-panel); }
  .empty-state h3 { font-family: var(--font-display); font-size: 27px; }
  .empty-state p { max-width: 360px; color: var(--color-muted); font-size: 12px; line-height: 1.8; }
  .variant-option { padding: 7px; border: 1px solid transparent; border-radius: 9px; }
  .variant-option[aria-pressed='true'] { border-color: var(--color-accent); background: var(--color-panel); }
}

@keyframes shimmer { from { background-position: 180% 0; } to { background-position: -80% 0; } }

@media (min-width: 1700px) { .app-frame { margin-top: 42px; } }
@media (min-width: 800px) and (max-width: 1660px) { .app-frame { margin-right: 24px; margin-left: 24px; } }
@media (max-width: 1199px) {
  .has-right-rail { grid-template-columns: minmax(0, 1fr); }
  .right-rail { border-top: 1px solid var(--color-line); border-left: 0; padding: 32px 40px; }
  .right-rail > div { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
  .top-bar-caption { display: none; }
  .issue-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 799px) {
  .app-frame { min-height: 100dvh; margin: 0; border: 0; border-radius: 0; grid-template-columns: minmax(0, 1fr); }
  .navigation-rail { position: fixed; z-index: 30; inset: auto 0 0; display: block; padding: 8px 10px max(8px, env(safe-area-inset-bottom)); border-top: 1px solid var(--color-line); border-right: 0; background: var(--color-surface); }
  .brand-symbol, .rail-footnote { display: none; }
  .navigation-rail nav { position: static; flex-direction: row; justify-content: space-around; gap: 2px; margin: 0; }
  .navigation-link { width: 40px; height: 40px; }
  .top-bar { min-height: 77px; gap: 15px; padding: 18px 22px; }
  .wordmark { font-size: 25px; }
  .top-bar-search { margin-left: auto; width: 210px; }
  .top-bar-calendar { display: none; }
  .main-content { padding: 29px 23px 40px; }
  .right-rail { padding: 30px 23px; }
  .app-footer { margin: 0 23px 70px; font-size: 8px; }
  .issue-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px 22px; }
  .issue-grid .cover-title { font-size: clamp(29px, 5vw, 50px); }
  .section-heading h2 { font-size: 25px; }
}
@media (max-width: 480px) {
  .top-bar-search { width: 125px; }
  .top-bar-search .search-box { gap: 8px; padding-left: 0; }
  .top-bar-search .search-box > svg, .top-bar-search .search-submit { display: none; }
  .search-box-large { padding: 10px 9px 10px 13px; gap: 10px; }
  .search-box-large .search-submit { width: 39px; min-width: 39px; min-height: 39px; padding: 8px; }
  .search-box-large .search-submit span { display: none; }
  .search-box-large input { font-size: 11px; }
  .featured-story { gap: 21px; }
  .featured-story .cover-lg { width: 220px; }
  .right-rail > div { grid-template-columns: minmax(0, 1fr); }
  .section-heading .action { font-size: 9px; gap: 5px; }
  .issue-publisher { font-size: 8px; }
  .issue-card h3 { font-size: 20px; }
  .cover-md { width: 140px; }
  .cover-md .cover-title { font-size: 27px; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```


## web/src/components


### web/src/components/ActionLink.tsx

```tsx title="web/src/components/ActionLink.tsx"
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { classNames } from '../lib/classNames';
import { Icon } from './Icon';

type Props = { to: string; children: ReactNode; variant?: 'primary' | 'quiet'; hasArrow?: boolean };

export function ActionLink({ to, children, variant = 'primary', hasArrow = true }: Props) {
  return (
    <Link to={to} className={classNames('action', `action-${variant}`)}>
      {children}{hasArrow && <Icon name="arrow-up-right" size={16} />}
    </Link>
  );
}
```


### web/src/components/Button.tsx

```tsx title="web/src/components/Button.tsx"
import type { ReactNode } from 'react';
import { classNames } from '../lib/classNames';

type Props = {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'quiet';
  type?: 'button' | 'submit'; disabled?: boolean;
};

export function Button({ children, onClick, variant = 'primary', type = 'button', disabled }: Props) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classNames('action', `action-${variant}`)}>
      {children}
    </button>
  );
}
```


### web/src/components/CalendarMonth.tsx

```tsx title="web/src/components/CalendarMonth.tsx"
import { useId } from 'react';
import type { ReleaseDay } from '../types';
import { buildCalendarMonth } from '../lib/buildCalendarMonth';
import { classNames } from '../lib/classNames';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
type Props = {
  year: number; month: number; selectedDay: number; onSelectDay: (day: number) => void;
  releases: ReleaseDay[]; isCompact?: boolean;
};

export function CalendarMonth({ year, month, selectedDay, onSelectDay, releases, isCompact = false }: Props) {
  const captionId = useId();
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, 1)));
  return (
    <div className={classNames('calendar-month', isCompact && 'calendar-compact')}>
      <p id={captionId} className="calendar-caption">{monthName}</p>
      <div className="calendar-weekdays" aria-hidden="true">{weekdays.map((weekday) => <span key={weekday}>{weekday.slice(0, 2)}</span>)}</div>
      <div className="calendar-days" role="group" aria-labelledby={captionId}>
        {buildCalendarMonth(year, month).map((cell) => {
          if (!cell.day) return <span key={cell.id} />;
          const day = cell.day;
          const release = releases.find((releaseDay) => releaseDay.date.day === day);
          const releaseCount = release?.issues.length ?? 0;
          return (
            <button key={cell.id} type="button" aria-pressed={selectedDay === day} aria-label={`${monthName} ${day}, ${releaseCount} releases`} className={classNames('calendar-day', selectedDay === day && 'calendar-selected')} onClick={() => onSelectDay(day)}>
              {day}{releaseCount > 0 && <span className="release-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```


### web/src/components/Cover.tsx

```tsx title="web/src/components/Cover.tsx"
import type { CoverModel } from '../types';
import { classNames } from '../lib/classNames';
import { Icon } from './Icon';

type Props = { cover: CoverModel; size?: 'sm' | 'md' | 'lg'; isCompact?: boolean };

export function Cover({ cover, size = 'md', isCompact = false }: Props) {
  const coverLabel = `${cover.title}, ${cover.publisherName}. ${cover.caption}`;
  if (cover.isMissing) {
    return (
      <div role="img" aria-label={`Cover unavailable: ${coverLabel}`} className={classNames('cover cover-missing', `cover-${size}`, isCompact && 'cover-compact')}>
        <Icon name="book" size={32} /><span className="cover-title">{cover.title}</span>
        <span className="cover-publisher">Cover coming soon</span>
      </div>
    );
  }
  return (
    <div role="img" aria-label={coverLabel} className={classNames('cover', `cover-${cover.tone}`, `cover-${size}`, isCompact && 'cover-compact')}>
      <span className="cover-publisher">{cover.publisherName}</span>
      <span className="cover-orbit" aria-hidden="true" /><span className="cover-horizon" aria-hidden="true" />
      <span className="cover-star" aria-hidden="true">✦</span>
      <span className="cover-title">{cover.title}</span>
      <span className="cover-caption">{cover.caption}</span>
      <span className="cover-spine" aria-hidden="true" />
    </div>
  );
}
```


### web/src/components/EmptyState.tsx

```tsx title="web/src/components/EmptyState.tsx"
import { Icon } from './Icon';

type Props = { title: string; description?: string };

export function EmptyState({ title, description }: Props) {
  return (
    <div className="empty-state" role="status">
      <span className="empty-symbol"><Icon name="spark" size={26} /></span>
      <h3>{title}</h3>{description && <p>{description}</p>}
    </div>
  );
}
```


### web/src/components/FollowButton.tsx

```tsx title="web/src/components/FollowButton.tsx"
import { useState } from 'react';
import { Icon } from './Icon';

type Props = { label: string; initialIsFollowed?: boolean; isCompact?: boolean };

export function FollowButton({ label, initialIsFollowed = false, isCompact = false }: Props) {
  const [isFollowed, setIsFollowed] = useState(initialIsFollowed);
  function handleToggle() { setIsFollowed((previousIsFollowed) => !previousIsFollowed); }
  const buttonLabel = isFollowed ? `Following ${label}` : `Follow ${label}`;
  return (
    <button type="button" className="follow-button" aria-label={buttonLabel} aria-pressed={isFollowed} onClick={handleToggle}>
      <Icon name={isFollowed ? 'check' : 'plus'} size={15} /><span className={isCompact ? 'sr-only' : undefined}>{buttonLabel}</span>
    </button>
  );
}
```


### web/src/components/Icon.tsx

```tsx title="web/src/components/Icon.tsx"
export type IconName = 'arrow-up-right' | 'spark' | 'search' | 'calendar' |
  'compass' | 'timeline' | 'pen' | 'character' | 'layers' | 'check' | 'plus' |
  'chevron-left' | 'chevron-right' | 'book';

const paths: Record<IconName, string> = {
  'arrow-up-right': 'M6 18 18 6M6 6h12v12',
  spark: 'm12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8Z',
  search: 'm21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  calendar: 'M4 5h16v16H4ZM4 10h16M8 3v4m8-4v4M8 14h1m6 0h1m-8 3h1',
  compass: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0m-6-6-3 7-7 3 3-7Z',
  timeline: 'M6 3v18M3 6h6m-6 6h6m-6 6h6m4-12h8m-8 6h5m-5 6h8',
  pen: 'm4 16-1 5 5-1L21 7l-4-4ZM14 6l4 4M3 21h7',
  character: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2',
  layers: 'm12 3 10 5-10 5L2 8Zm-9 10 9 5 9-5m-18 5 9 5 9-5',
  check: 'm5 12 4 4L19 6',
  plus: 'M12 5v14M5 12h14',
  'chevron-left': 'm15 5-7 7 7 7',
  'chevron-right': 'm9 5 7 7-7 7',
  book: 'M12 5v16M3 3l9 2 9-2v16l-9 2-9-2Z',
};

type Props = { name: IconName; size?: number };

export function Icon({ name, size = 20 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}
```


### web/src/components/IssueCard.tsx

```tsx title="web/src/components/IssueCard.tsx"
import { Link } from 'react-router';
import type { IssueSummary } from '../types';
import { formatPartialDate } from '../lib/formatPartialDate';
import { Cover } from './Cover';
import { Tag } from './Tag';

type Props = { issue: IssueSummary };

export function IssueCard({ issue }: Props) {
  return (
    <article className="issue-card">
      <Link to={`/issues/${issue.id}`} className="issue-cover-link" aria-label={`Explore ${issue.title}`}>
        <Cover cover={issue.cover} />
        {issue.hasVariants && <span className="variant-badge">+ variants</span>}
      </Link>
      <p className="issue-publisher">{issue.publisherName} · {issue.publishedAt.year}</p>
      <h3><Link to={`/issues/${issue.id}`}>{issue.title}</Link></h3>
      <p className="issue-series">{issue.seriesTitle} · {issue.number}</p>
      <p className="sr-only">Published {formatPartialDate(issue.publishedAt)}</p>
      <div className="tag-row"><Tag kind={issue.kind} /><Tag familyFriendly={issue.familyFriendly} /></div>
    </article>
  );
}
```


### web/src/components/IssueGrid.tsx

```tsx title="web/src/components/IssueGrid.tsx"
import type { IssueSummary } from '../types';
import { EmptyState } from './EmptyState';
import { IssueCard } from './IssueCard';
import { Skeleton } from './Skeleton';

type Props = { issues: IssueSummary[]; isLoading?: boolean; emptyMessage?: string };

export function IssueGrid({ issues, isLoading = false, emptyMessage = 'Try a broader search or clear a filter.' }: Props) {
  if (isLoading) return <div aria-busy="true" className="issue-grid"><Skeleton label="Loading covers" /><Skeleton /><Skeleton /><Skeleton /></div>;
  if (issues.length === 0) return <EmptyState title="No stories here yet" description={emptyMessage} />;
  return <div className="issue-grid">{issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)}</div>;
}
```


### web/src/components/PageHeading.tsx

```tsx title="web/src/components/PageHeading.tsx"
type Props = { eyebrow?: string; title: string; description?: string };

export function PageHeading({ eyebrow, title, description }: Props) {
  return (
    <header className="page-heading">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {description && <p className="page-description">{description}</p>}
    </header>
  );
}
```


### web/src/components/ResourceBoundary.tsx

```tsx title="web/src/components/ResourceBoundary.tsx"
import type { ReactNode } from 'react';
import type { Resource } from '../lib/useResource';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';

type Props<Value> = { resource: Resource<Value>; children: (value: Value) => ReactNode };

export function ResourceBoundary<Value>({ resource, children }: Props<Value>) {
  if (resource.status === 'loading') {
    if (resource.value !== undefined) return children(resource.value);
    return <div aria-busy="true"><Skeleton label="Loading this part of the universe" /></div>;
  }
  if (resource.status === 'error') return <EmptyState title="This corner couldn't load" description="Please refresh the page to try again." />;
  return children(resource.value);
}
```


### web/src/components/SearchBox.tsx

```tsx title="web/src/components/SearchBox.tsx"
import { useEffect, useId, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { classNames } from '../lib/classNames';
import { Icon } from './Icon';

type Props = { initialQuery?: string; isLarge?: boolean };

export function SearchBox({ initialQuery = '', isLarge = false }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const inputId = useId();
  const navigate = useNavigate();
  useEffect(() => { setQuery(initialQuery); }, [initialQuery]);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parameters = new URLSearchParams();
    if (query.trim()) parameters.set('q', query.trim());
    navigate(`/search?${parameters.toString()}`);
  }
  return (
    <form onSubmit={handleSubmit} role="search" className={classNames('search-box', isLarge && 'search-box-large')}>
      <Icon name="search" size={isLarge ? 23 : 18} />
      <label htmlFor={inputId} className="sr-only">Describe a story, character, creator, or series</label>
      <input id={inputId} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isLarge ? 'Describe the story you want...' : 'Search the universe...'} />
      <button type="submit" aria-label="Search comics" className="search-submit">
        {isLarge && <span>Find my story</span>}<Icon name="arrow-up-right" size={18} />
      </button>
    </form>
  );
}
```


### web/src/components/Section.tsx

```tsx title="web/src/components/Section.tsx"
import type { ReactNode } from 'react';

type Props = { title: string; eyebrow?: string; action?: ReactNode; children: ReactNode };

export function Section({ title, eyebrow, action, children }: Props) {
  return (
    <section className="content-section">
      <div className="section-heading">
        <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>
        {action}
      </div>
      {children}
    </section>
  );
}
```


### web/src/components/Skeleton.tsx

```tsx title="web/src/components/Skeleton.tsx"
import { classNames } from '../lib/classNames';

type Props = { className?: string; label?: string };

export function Skeleton({ className, label = 'Loading' }: Props) {
  return <div role="status" className={classNames('skeleton', className)}><span className="sr-only">{label}</span></div>;
}
```


### web/src/components/Tag.tsx

```tsx title="web/src/components/Tag.tsx"
import type { ContentKind, FamilyFriendlyLabel } from '../types';

const contentLabels: Record<ContentKind, string> = { 'single-issue': 'Single issue', collection: 'Collection' };
const contentStyles: Record<ContentKind, string> = { 'single-issue': 'tag-issue', collection: 'tag-collection' };
const familyLabels: Record<FamilyFriendlyLabel, string> = { FF: 'FF', NFF: 'NFF', Unknown: 'Unknown' };
const familyStyles: Record<FamilyFriendlyLabel, string> = { FF: 'tag-ff', NFF: 'tag-nff', Unknown: 'tag-unknown' };
const familyDescriptions: Record<FamilyFriendlyLabel, string> = {
  FF: 'Family friendly', NFF: 'Not family friendly', Unknown: 'Family friendliness unknown',
};

type Props = { kind?: ContentKind; familyFriendly?: FamilyFriendlyLabel };

export function Tag({ kind, familyFriendly }: Props) {
  if (kind) return <span className={`tag ${contentStyles[kind]}`}>{contentLabels[kind]}</span>;
  if (familyFriendly) {
    return <span title={familyDescriptions[familyFriendly]} className={`tag ${familyStyles[familyFriendly]}`}><span className="sr-only">{familyDescriptions[familyFriendly]}: </span>{familyLabels[familyFriendly]}</span>;
  }
  return null;
}
```


## web/src/data


### web/src/data/availability.ts

```ts title="web/src/data/availability.ts"
import type { AvailabilityLink } from '../types';

export const demoAvailability: AvailabilityLink[] = [
  { id: 'library', label: 'Library', kind: 'library', url: '' },
  { id: 'store', label: 'Store', kind: 'store', url: '' },
  { id: 'reader', label: 'Digital reader', kind: 'reader', url: '' },
];
```


### web/src/data/catalog.ts

```ts title="web/src/data/catalog.ts"
import type { IssueDetail, IssueSummary, ReleaseDay, SeriesSummary } from '../types';
import { characters } from './characters';
import { creators } from './creators';
import { issues } from './issues';
import { publishers } from './publishers';
import { series } from './series';

export { characters, creators, issues, publishers, series };

export function getIssueSummary(issueId: string): IssueSummary | undefined {
  const issue = issues.find((issue) => issue.id === issueId);
  if (!issue) return undefined;
  const issueSeries = series.find((series) => series.id === issue.seriesId);
  const publisher = publishers.find((publisher) => publisher.id === issueSeries?.publisherId);
  if (!issueSeries || !publisher) return undefined;

  return {
    id: issue.id, title: issue.title, number: issue.number,
    seriesId: issueSeries.id, seriesTitle: issueSeries.title,
    publisherId: publisher.id, publisherName: publisher.name,
    publishedAt: issue.publishedAt, kind: issue.kind, familyFriendly: issue.familyFriendly,
    hasVariants: issue.variants.length > 0,
    cover: {
      title: issueSeries.title, publisherName: publisher.name,
      tone: issue.tone, isMissing: issue.isCoverMissing,
      caption: issue.kind === 'single-issue' ? `No. ${issue.number}` : issue.number,
    },
  };
}

export function getIssueSummaries(issueIds: string[]): IssueSummary[] {
  const summaries: IssueSummary[] = [];
  for (const issueId of issueIds) {
    const summary = getIssueSummary(issueId);
    if (summary) summaries.push(summary);
  }
  return summaries;
}

export function getSeriesSummary(seriesId: string): SeriesSummary | undefined {
  const issueSeries = series.find((series) => series.id === seriesId);
  const firstIssue = issues.find((issue) => issue.seriesId === seriesId && issue.kind === 'single-issue');
  if (!issueSeries || !firstIssue) return undefined;
  const summary = getIssueSummary(firstIssue.id);
  if (!summary) return undefined;
  return {
    id: issueSeries.id, title: issueSeries.title, publisherName: summary.publisherName,
    cover: summary.cover, started: issueSeries.started, ended: issueSeries.ended,
  };
}

export function getIssueDetailModel(issueId: string): IssueDetail | undefined {
  const issue = issues.find((issue) => issue.id === issueId);
  const summary = getIssueSummary(issueId);
  if (!issue || !summary) return undefined;
  const credits: IssueDetail['credits'] = [];
  for (const credit of issue.credits) {
    const creator = creators.find((creator) => creator.id === credit.creatorId);
    if (creator) credits.push({ id: creator.id, name: creator.name, role: credit.role });
  }
  const variants = issue.variants.map((variant) => ({
    id: variant.id, label: variant.label,
    cover: { ...summary.cover, tone: variant.tone, caption: variant.label, isMissing: false },
  }));
  return {
    ...summary, description: issue.description, credits, variants,
    relatedIssues: getIssueSummaries(issue.relatedIssueIds), availability: issue.availability,
  };
}

export function getMonthlyReleases(year: number, month: number): ReleaseDay[] {
  const releasesByDay = new Map<number, IssueSummary[]>();
  for (const issue of issues) {
    const publishedAt = issue.publishedAt;
    const isInMonth = publishedAt.year === year && publishedAt.month === month;
    if (!isInMonth || !publishedAt.day || issue.kind !== 'single-issue') continue;
    const summary = getIssueSummary(issue.id);
    if (!summary) continue;
    const dayReleases = releasesByDay.get(publishedAt.day) ?? [];
    dayReleases.push(summary);
    releasesByDay.set(publishedAt.day, dayReleases);
  }
  return Array.from(releasesByDay.entries())
    .sort(([firstDay], [secondDay]) => firstDay - secondDay)
    .map(([day, dayReleases]) => ({ date: { year, month, day }, issues: dayReleases }));
}
```


### web/src/data/characters.ts

```ts title="web/src/data/characters.ts"
import type { Character } from '../types';

export const characters: Character[] = [
  {
    id: 'vesper', name: 'Vesper',
    description: 'A star courier with a borrowed ship, a missing past, and an unfailing instinct to help.',
    firstAppearanceId: 'glass-1', majorSeriesIds: ['glass-orbit', 'quiet-engine'],
    recentIssueIds: ['glass-8', 'glass-7', 'quiet-2'],
  },
  {
    id: 'lumen', name: 'Lumen',
    description: 'A small mechanical dreamer who can hear the stories sleeping inside machines.',
    firstAppearanceId: 'quiet-1', majorSeriesIds: ['quiet-engine', 'glass-orbit'],
    recentIssueIds: ['glass-8', 'quiet-2', 'glass-7'],
  },
  {
    id: 'iona-salt', name: 'Iona Salt',
    description: 'An ocean archivist carrying the last map of a city that disappeared beneath the tide.',
    firstAppearanceId: 'salt-1', majorSeriesIds: ['saltwake', 'glass-orbit'],
    recentIssueIds: ['glass-8', 'glass-6', 'salt-1'],
  },
];
```


### web/src/data/creators.ts

```ts title="web/src/data/creators.ts"
import type { Creator } from '../types';

export const creators: Creator[] = [
  {
    id: 'mara-vale', name: 'Mara Vale', roles: ['Writer', 'Co-creator'],
    biography: 'A fictional writer of faraway places, quiet courage, and the families we find along the way.',
  },
  {
    id: 'sol-ibarra', name: 'Sol Ibarra', roles: ['Artist', 'Colorist'],
    biography: 'A fictional artist whose imagined worlds pair expressive linework with warm, luminous color.',
  },
  {
    id: 'niko-reed', name: 'Niko Reed', roles: ['Writer'],
    biography: 'A fictional writer exploring the places where everyday life meets the uncanny.',
  },
  {
    id: 'aya-mercer', name: 'Aya Mercer', roles: ['Artist', 'Letterer'],
    biography: 'A fictional artist and letterer drawn to ocean landscapes, mechanical creatures, and hidden cities.',
  },
];
```


### web/src/data/issues.ts

```ts title="web/src/data/issues.ts"
import type { CreatorCredit, Issue } from '../types';
import { demoAvailability } from './availability';

const glassCredits: CreatorCredit[] = [
  { creatorId: 'mara-vale', role: 'Writer' },
  { creatorId: 'sol-ibarra', role: 'Artist & colorist' },
];

const quietCredits: CreatorCredit[] = [
  { creatorId: 'niko-reed', role: 'Writer' },
  { creatorId: 'aya-mercer', role: 'Artist' },
];

const saltCredits: CreatorCredit[] = [
  { creatorId: 'mara-vale', role: 'Writer' },
  { creatorId: 'aya-mercer', role: 'Artist & letterer' },
];

const lanternCredits: CreatorCredit[] = [
  { creatorId: 'niko-reed', role: 'Writer' },
  { creatorId: 'sol-ibarra', role: 'Artist' },
];

export const issues: Issue[] = [
  {
    id: 'glass-1', title: 'The Signal Garden', number: '1', seriesId: 'glass-orbit',
    kind: 'single-issue', familyFriendly: 'FF', publishedAt: { year: 2018 },
    description: 'Somewhere between the stars, a city has forgotten how to dream. When courier Vesper intercepts a message addressed to tomorrow, one small delivery becomes a hopeful space mystery about belonging, memory, and found family.',
    tone: 'sage', isCoverMissing: false, credits: glassCredits, characterIds: ['vesper'],
    variants: [
      { id: 'glass-1-variant-coral', label: 'Signal cover · Sol Ibarra', tone: 'coral' },
      { id: 'glass-1-variant-midnight', label: 'Night sky cover · Aya Mercer', tone: 'midnight' },
    ],
    relatedIssueIds: ['glass-volume-1'], availability: demoAvailability,
  },
  {
    id: 'glass-2', title: 'A Map of Elsewhere', number: '2', seriesId: 'glass-orbit',
    kind: 'single-issue', familyFriendly: 'FF', publishedAt: { year: 2020, month: 5 },
    description: 'Vesper follows an impossible map into the abandoned quarter of the orbital city, where every door opens onto a different memory.',
    tone: 'coral', isCoverMissing: false, credits: glassCredits, characterIds: ['vesper'],
    variants: [], relatedIssueIds: ['glass-volume-1'], availability: demoAvailability,
  },
  {
    id: 'glass-3', title: 'The Borrowed Sky', number: '3', seriesId: 'glass-orbit',
    kind: 'single-issue', familyFriendly: 'FF', publishedAt: { year: 2023, month: 5, day: 17 },
    description: 'A missing constellation brings a whole neighborhood together. Vesper discovers that a ship can be repaired with patience, but trust takes something more.',
    tone: 'ochre', isCoverMissing: false, credits: glassCredits, characterIds: ['vesper'],
    variants: [], relatedIssueIds: ['glass-volume-1'], availability: demoAvailability,
  },
  {
    id: 'glass-4', title: 'A Light Left On', number: '4', seriesId: 'glass-orbit',
    kind: 'single-issue', familyFriendly: 'FF', publishedAt: { year: 2026, month: 9, day: 30 },
    description: 'Years after the first signal, a new light appears at the edge of the city. Vesper returns to the garden where the journey began.',
    tone: 'plum', isCoverMissing: false, credits: glassCredits, characterIds: ['vesper'],
    variants: [], relatedIssueIds: ['glass-volume-1'], availability: demoAvailability,
  },
  {
    id: 'glass-5', title: 'The Long Eclipse: First Light', number: '5', seriesId: 'glass-orbit',
    kind: 'single-issue', familyFriendly: 'FF', publishedAt: { year: 2026, month: 10, day: 7 },
    description: 'The Long Eclipse begins. As daylight disappears across connected worlds, Vesper receives three messages from the same impossible place.',
    tone: 'midnight', isCoverMissing: false, credits: glassCredits, characterIds: ['vesper'],
    variants: [], relatedIssueIds: ['glass-volume-1'], availability: demoAvailability,
  },
  {
    id: 'glass-6', title: 'The Long Eclipse: Tidal Memory', number: '6', seriesId: 'glass-orbit',
    kind: 'single-issue', familyFriendly: 'FF', publishedAt: { year: 2026, month: 10, day: 14 },
    description: 'Iona Salt brings an ocean of lost memories to the orbital city. Together, she and Vesper search for the shoreline hiding inside a star.',
    tone: 'sage', isCoverMissing: false, credits: glassCredits, characterIds: ['vesper', 'iona-salt'],
    variants: [], relatedIssueIds: ['glass-volume-1'], availability: demoAvailability,
  },
  {
    id: 'glass-7', title: 'The Long Eclipse: Dream Current', number: '7', seriesId: 'glass-orbit',
    kind: 'single-issue', familyFriendly: 'FF', publishedAt: { year: 2026, month: 10, day: 21 },
    description: 'Lumen hears a heartbeat beneath the city. Vesper must decide whether to trust a machine whose dreams could bring back the light.',
    tone: 'ochre', isCoverMissing: false, credits: glassCredits, characterIds: ['vesper', 'lumen'],
    variants: [], relatedIssueIds: ['glass-volume-1'], availability: demoAvailability,
  },
  {
    id: 'glass-8', title: 'The Long Eclipse: A Sky for Everyone', number: '8', seriesId: 'glass-orbit',
    kind: 'single-issue', familyFriendly: 'FF', publishedAt: { year: 2026, month: 10, day: 28 },
    description: 'Vesper, Lumen, and Iona bring their worlds together for one last journey into the dark. The Long Eclipse reaches a hopeful conclusion.',
    tone: 'coral', isCoverMissing: false, credits: glassCredits, characterIds: ['vesper', 'lumen', 'iona-salt'],
    variants: [{ id: 'glass-8-variant-sage', label: 'Dawn cover · Sol Ibarra', tone: 'sage' }],
    relatedIssueIds: ['glass-volume-1'], availability: demoAvailability,
  },
  {
    id: 'quiet-1', title: 'The Machine That Dreamed', number: '1', seriesId: 'quiet-engine',
    kind: 'single-issue', familyFriendly: 'FF', publishedAt: { year: 2026, month: 10, day: 7 },
    description: 'A gentle mechanical creature called Lumen wakes beneath a sleepless city. The first dream it remembers belongs to someone living among the stars.',
    tone: 'ochre', isCoverMissing: false, credits: quietCredits, characterIds: ['lumen'],
    variants: [], relatedIssueIds: ['quiet-volume-1'], availability: demoAvailability,
  },
  {
    id: 'quiet-2', title: 'The Long Eclipse: Under the City', number: '2', seriesId: 'quiet-engine',
    kind: 'single-issue', familyFriendly: 'FF', publishedAt: { year: 2026, month: 10, day: 21 },
    description: 'Vesper follows Lumen through the dreaming machinery beneath the city. A forgotten station holds a clue to the disappearing daylight.',
    tone: 'sand', isCoverMissing: false, credits: quietCredits, characterIds: ['lumen', 'vesper'],
    variants: [], relatedIssueIds: ['quiet-volume-1'], availability: demoAvailability,
  },
  {
    id: 'salt-1', title: 'The Long Eclipse: What the Sea Keeps', number: '1', seriesId: 'saltwake',
    kind: 'single-issue', familyFriendly: 'Unknown', publishedAt: { year: 2026, month: 10, day: 14 },
    description: 'Ocean archivist Iona Salt discovers that the rising tide is carrying messages from a vanished world. Her search begins with a map written in salt.',
    tone: 'sage', isCoverMissing: false, credits: saltCredits, characterIds: ['iona-salt'],
    variants: [], relatedIssueIds: ['salt-volume-1'], availability: demoAvailability,
  },
  {
    id: 'lantern-1', title: 'The Long Eclipse: Last Train Down', number: '1', seriesId: 'lanterns-below',
    kind: 'single-issue', familyFriendly: 'NFF', publishedAt: { year: 2026, month: 10, day: 28 },
    description: 'At midnight, a train arrives at a station abandoned for decades. Its passengers carry lanterns, and none of them remember where they boarded. A dark mystery with unsettling themes.',
    tone: 'plum', isCoverMissing: true, credits: lanternCredits, characterIds: [],
    variants: [], relatedIssueIds: [], availability: demoAvailability,
  },
  {
    id: 'glass-volume-1', title: 'Glass Orbit: The Signal Garden', number: 'Volume 1', seriesId: 'glass-orbit',
    kind: 'collection', familyFriendly: 'FF', publishedAt: { year: 2026, month: 11, day: 4 },
    description: 'The complete opening journey of Vesper, collected with a fictional sketchbook and a guide to the orbital city. Collects Glass Orbit #1–8.',
    tone: 'midnight', isCoverMissing: false, credits: glassCredits, characterIds: ['vesper', 'lumen', 'iona-salt'],
    variants: [], relatedIssueIds: ['glass-1', 'glass-2', 'glass-3', 'glass-4', 'glass-5', 'glass-6', 'glass-7', 'glass-8'],
    availability: demoAvailability,
  },
  {
    id: 'quiet-volume-1', title: 'The Quiet Engine: Small Dreams', number: 'Volume 1', seriesId: 'quiet-engine',
    kind: 'collection', familyFriendly: 'FF', publishedAt: { year: 2026, month: 11, day: 11 },
    description: 'The first two chapters of Lumen’s story, collected in one volume with imagined city maps. Collects The Quiet Engine #1–2.',
    tone: 'ochre', isCoverMissing: false, credits: quietCredits, characterIds: ['lumen', 'vesper'],
    variants: [], relatedIssueIds: ['quiet-1', 'quiet-2'], availability: demoAvailability,
  },
  {
    id: 'salt-volume-1', title: 'Saltwake: An Atlas of Lost Things', number: 'Volume 1', seriesId: 'saltwake',
    kind: 'collection', familyFriendly: 'Unknown', publishedAt: { year: 2026, month: 12 },
    description: 'Iona Salt’s first journey, collected alongside a fictional atlas of the drowned coast. Collects Saltwake #1 with expanded world notes.',
    tone: 'sand', isCoverMissing: false, credits: saltCredits, characterIds: ['iona-salt'],
    variants: [], relatedIssueIds: ['salt-1'], availability: demoAvailability,
  },
];
```


### web/src/data/publishers.ts

```ts title="web/src/data/publishers.ts"
import type { Publisher } from '../types';

export const publishers: Publisher[] = [
  { id: 'dc', name: 'DC Comics', initials: 'DC', description: 'A sample archive of impossible cities and hopeful heroes.' },
  { id: 'marvel', name: 'Marvel Comics', initials: 'M', description: 'A sample archive of extraordinary lives in familiar places.' },
  { id: 'image', name: 'Image Comics', initials: 'I', description: 'A sample archive of independent worlds and unexpected journeys.' },
  { id: 'dark-horse', name: 'Dark Horse Comics', initials: 'DH', description: 'A sample archive of strange places and restless mysteries.' },
  { id: 'boom', name: 'BOOM! Studios', initials: 'B!', description: 'A publisher available in the StarChart demo catalogue.' },
  { id: 'dynamite', name: 'Dynamite Entertainment', initials: 'DE', description: 'A publisher available in the StarChart demo catalogue.' },
  { id: 'titan', name: 'Titan Comics', initials: 'TC', description: 'A publisher available in the StarChart demo catalogue.' },
  { id: 'archie', name: 'Archie Comics', initials: 'AC', description: 'A publisher available in the StarChart demo catalogue.' },
  { id: 'oni', name: 'Oni Press', initials: 'OP', description: 'A publisher available in the StarChart demo catalogue.' },
  { id: 'mad-cave', name: 'Mad Cave Studios', initials: 'MC', description: 'A publisher available in the StarChart demo catalogue.' },
  { id: 'valiant', name: 'Valiant Entertainment', initials: 'VE', description: 'A publisher available in the StarChart demo catalogue.' },
  { id: 'vault', name: 'Vault Comics', initials: 'VC', description: 'A publisher available in the StarChart demo catalogue.' },
  { id: 'ignition', name: 'Ignition Press', initials: 'IP', description: 'A publisher available in the StarChart demo catalogue.' },
];
```


### web/src/data/scenarios.ts

```ts title="web/src/data/scenarios.ts"
import type { PartialDate } from '../types';

type TimelineScenario = {
  publisherId: string;
  title: string;
  description: string;
  events: {
    id: string;
    issueId: string;
    date: PartialDate;
    milestone?: { kind: 'first-appearance' | 'first-event'; label: string };
  }[];
};

type CreatorRun = {
  id: string; creatorId: string; seriesId: string;
  started: PartialDate; ended?: PartialDate; role: string;
};

export const discoverScenario = {
  greeting: 'Good afternoon, explorer.',
  description: 'Somewhere in a comic, there’s a story for you. Let’s find it.',
  featuredIssueId: 'glass-1',
  topPickIds: ['quiet-1', 'salt-1', 'glass-volume-1', 'lantern-1'],
  publisherIds: ['dc', 'marvel', 'image', 'dark-horse'],
  year: 2026, month: 10, selectedDay: 14,
};

export const timelineScenario: TimelineScenario = {
  publisherId: 'dc', title: 'Every story leaves a trace.',
  description: 'Follow the fictional Glass Orbit catalogue, from Vesper’s first appearance to a world-spanning crossover.',
  events: [
    {
      id: 'timeline-glass-1', issueId: 'glass-1', date: { year: 2018 },
      milestone: { kind: 'first-appearance', label: 'First appearance of Vesper' },
    },
    { id: 'timeline-glass-2', issueId: 'glass-2', date: { year: 2020, month: 5 } },
    { id: 'timeline-glass-3', issueId: 'glass-3', date: { year: 2023, month: 5, day: 17 } },
    { id: 'timeline-glass-4', issueId: 'glass-4', date: { year: 2026, month: 9, day: 30 } },
    {
      id: 'timeline-glass-5', issueId: 'glass-5', date: { year: 2026, month: 10, day: 7 },
      milestone: { kind: 'first-event', label: 'First event: The Long Eclipse' },
    },
    { id: 'timeline-glass-6', issueId: 'glass-6', date: { year: 2026, month: 10, day: 14 } },
    { id: 'timeline-glass-7', issueId: 'glass-7', date: { year: 2026, month: 10, day: 21 } },
    { id: 'timeline-glass-8', issueId: 'glass-8', date: { year: 2026, month: 10, day: 28 } },
  ],
};

export const calendarScenario = {
  year: 2026, month: 10, selectedDay: 16,
};

export const readingOrderScenario = {
  id: 'the-long-eclipse', title: 'The Long Eclipse',
  description: 'Four imagined worlds. One disappearing sky. Follow the crossover across titles, one issue at a time.',
  issueIds: ['glass-5', 'quiet-1', 'salt-1', 'glass-6', 'quiet-2', 'glass-7', 'lantern-1', 'glass-8'],
};

export const creatorRuns: CreatorRun[] = [
  { id: 'mara-glass', creatorId: 'mara-vale', seriesId: 'glass-orbit', started: { year: 2018 }, ended: { year: 2026 }, role: 'Writer & co-creator' },
  { id: 'mara-salt', creatorId: 'mara-vale', seriesId: 'saltwake', started: { year: 2026, month: 10 }, role: 'Writer' },
  { id: 'sol-glass', creatorId: 'sol-ibarra', seriesId: 'glass-orbit', started: { year: 2018 }, ended: { year: 2026 }, role: 'Artist & colorist' },
  { id: 'sol-lantern', creatorId: 'sol-ibarra', seriesId: 'lanterns-below', started: { year: 2026, month: 10 }, role: 'Artist' },
  { id: 'niko-quiet', creatorId: 'niko-reed', seriesId: 'quiet-engine', started: { year: 2026, month: 10 }, role: 'Writer' },
  { id: 'niko-lantern', creatorId: 'niko-reed', seriesId: 'lanterns-below', started: { year: 2026, month: 10 }, role: 'Writer' },
  { id: 'aya-quiet', creatorId: 'aya-mercer', seriesId: 'quiet-engine', started: { year: 2026, month: 10 }, role: 'Artist' },
  { id: 'aya-salt', creatorId: 'aya-mercer', seriesId: 'saltwake', started: { year: 2026, month: 10 }, role: 'Artist & letterer' },
];
```


### web/src/data/series.ts

```ts title="web/src/data/series.ts"
import type { Series } from '../types';

export const series: Series[] = [
  {
    id: 'glass-orbit', title: 'Glass Orbit', publisherId: 'dc',
    description: 'A courier follows a forgotten signal through a city suspended between stars.',
    started: { year: 2018 },
  },
  {
    id: 'quiet-engine', title: 'The Quiet Engine', publisherId: 'marvel',
    description: 'Beneath a sleepless city, a gentle machine learns how to dream.',
    started: { year: 2026, month: 10 },
  },
  {
    id: 'saltwake', title: 'Saltwake', publisherId: 'image',
    description: 'An ocean archivist searches for the memories a rising sea has swallowed.',
    started: { year: 2026, month: 10 },
  },
  {
    id: 'lanterns-below', title: 'Lanterns Below', publisherId: 'dark-horse',
    description: 'An abandoned underground station lights up with messages from the missing.',
    started: { year: 2026, month: 10 },
  },
];
```


## web/src/features/character


### web/src/features/character/CharacterPage.tsx

```tsx title="web/src/features/character/CharacterPage.tsx"
import { useParams } from 'react-router';
import { EmptyState } from '../../components/EmptyState';
import { ResourceBoundary } from '../../components/ResourceBoundary';
import { AppLayout } from '../../layouts/AppLayout';
import { CharacterAppearances } from './components/CharacterAppearances';
import { CharacterProfile } from './components/CharacterProfile';
import { useCharacter } from './data/getCharacter';

export function CharacterPage() {
  const { characterId = '' } = useParams();
  const profileResult = useCharacter(characterId);

  return (
    <AppLayout>
      <ResourceBoundary resource={profileResult}>
        {(profile) => (
          <>
            {profile && (
              <div className="space-y-12">
                <CharacterProfile character={profile.character} firstAppearance={profile.firstAppearance} />
                <CharacterAppearances majorSeries={profile.majorSeries} recentAppearances={profile.recentAppearances} />
              </div>
            )}
            {!profile && <EmptyState title="Character not found" description="Try another character from the demo catalog." />}
          </>
        )}
      </ResourceBoundary>
    </AppLayout>
  );
}
```


## web/src/features/character/components


### web/src/features/character/components/CharacterAppearances.tsx

```tsx title="web/src/features/character/components/CharacterAppearances.tsx"
import { Link } from 'react-router';
import { Cover } from '../../../components/Cover';
import { IssueGrid } from '../../../components/IssueGrid';
import { Section } from '../../../components/Section';
import { formatPartialDate } from '../../../lib/formatPartialDate';
import type { IssueSummary, SeriesSummary } from '../../../types';

type Props = { majorSeries: SeriesSummary[]; recentAppearances: IssueSummary[] };

export function CharacterAppearances({ majorSeries, recentAppearances }: Props) {
  return (
    <div className="space-y-12">
      <Section title="The bigger picture" eyebrow="Major series">
        <div className="grid gap-7 sm:grid-cols-2">
          {majorSeries.map((series) => (
            <Link key={series.id} to={`/search?q=${encodeURIComponent(series.title)}`} className="group flex items-center gap-5 rounded-card border border-line p-5">
              <Cover cover={series.cover} size="sm" />
              <div>
                <p className="mb-2 text-xs text-muted">{series.publisherName}</p>
                <h3 className="font-display text-xl group-hover:text-accent-ink">{series.title}</h3>
                <p className="mt-3 text-xs text-muted">Since {formatPartialDate(series.started)}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>
      <Section title="Back in the story" eyebrow="Recent appearances">
        <IssueGrid issues={recentAppearances} emptyMessage="No recent appearances in the catalog yet." />
      </Section>
    </div>
  );
}
```


### web/src/features/character/components/CharacterProfile.tsx

```tsx title="web/src/features/character/components/CharacterProfile.tsx"
import { ActionLink } from '../../../components/ActionLink';
import { Cover } from '../../../components/Cover';
import { Icon } from '../../../components/Icon';
import { PageHeading } from '../../../components/PageHeading';
import { Tag } from '../../../components/Tag';
import { formatPartialDate } from '../../../lib/formatPartialDate';
import type { Character, IssueSummary } from '../../../types';

type Props = { character: Character; firstAppearance: IssueSummary };

export function CharacterProfile({ character, firstAppearance }: Props) {
  return (
    <div>
      <PageHeading eyebrow="Character atlas" title={character.name} description={character.description} />
      <section className="mt-9 flex flex-col gap-8 rounded-card bg-panel p-7 sm:flex-row sm:items-center sm:p-9">
        <div className="shrink-0"><Cover cover={firstAppearance.cover} size="md" /></div>
        <div>
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent-ink">
            <Icon name="spark" size={16} /> The first appearance
          </p>
          <p className="mb-2 text-xs text-muted">{firstAppearance.seriesTitle} · {firstAppearance.number}</p>
          <h2 className="font-display text-3xl leading-tight">{firstAppearance.title}</h2>
          <div className="mt-3 flex flex-wrap gap-2"><Tag kind={firstAppearance.kind} /><Tag familyFriendly={firstAppearance.familyFriendly} /></div>
          <p className="mb-6 mt-4 text-xs text-muted">{firstAppearance.publisherName} · {formatPartialDate(firstAppearance.publishedAt)}</p>
          <ActionLink to={`/issues/${firstAppearance.id}`} hasArrow>Where it all began</ActionLink>
        </div>
      </section>
    </div>
  );
}
```


## web/src/features/character/data


### web/src/features/character/data/getCharacter.ts

```ts title="web/src/features/character/data/getCharacter.ts"
import { useCallback } from 'react';
import { characters, getIssueSummaries, getIssueSummary, getSeriesSummary } from '../../../data/catalog';
import { useResource } from '../../../lib/useResource';
import type { SeriesSummary } from '../../../types';
import type { CharacterModel } from '../types';

export function getCharacter(characterId: string): CharacterModel | undefined | Promise<CharacterModel | undefined> {
  const character = characters.find((character) => character.id === characterId);
  if (!character) return undefined;
  const firstAppearance = getIssueSummary(character.firstAppearanceId);
  if (!firstAppearance) return undefined;

  const majorSeries: SeriesSummary[] = [];
  for (const seriesId of character.majorSeriesIds) {
    const series = getSeriesSummary(seriesId);
    if (series) majorSeries.push(series);
  }

  return {
    character,
    firstAppearance,
    majorSeries,
    recentAppearances: getIssueSummaries(character.recentIssueIds),
  };
}

export function useCharacter(characterId: string) {
  const loader = useCallback(() => getCharacter(characterId), [characterId]);
  return useResource(loader);
}
```


## web/src/features/character


### web/src/features/character/index.ts

```ts title="web/src/features/character/index.ts"
export { CharacterPage } from './CharacterPage';
```


### web/src/features/character/types.ts

```ts title="web/src/features/character/types.ts"
import type { Character, IssueSummary, SeriesSummary } from '../../types';

export type CharacterModel = {
  character: Character;
  firstAppearance: IssueSummary;
  majorSeries: SeriesSummary[];
  recentAppearances: IssueSummary[];
};
```


## web/src/features/creator


### web/src/features/creator/CreatorPage.tsx

```tsx title="web/src/features/creator/CreatorPage.tsx"
import { useParams } from 'react-router';
import { EmptyState } from '../../components/EmptyState';
import { ResourceBoundary } from '../../components/ResourceBoundary';
import { AppLayout } from '../../layouts/AppLayout';
import { CreatorProfile } from './components/CreatorProfile';
import { CreatorRuns } from './components/CreatorRuns';
import { useCreator } from './data/getCreator';

export function CreatorPage() {
  const { creatorId = '' } = useParams();
  const profileResult = useCreator(creatorId);

  return (
    <AppLayout>
      <ResourceBoundary resource={profileResult}>
        {(profile) => (
          <>
            {profile && <div className="max-w-4xl space-y-10"><CreatorProfile creator={profile.creator} /><CreatorRuns runs={profile.runs} /></div>}
            {!profile && <EmptyState title="Creator not found" description="Try another name from the demo catalog." />}
          </>
        )}
      </ResourceBoundary>
    </AppLayout>
  );
}
```


## web/src/features/creator/components


### web/src/features/creator/components/CreatorProfile.tsx

```tsx title="web/src/features/creator/components/CreatorProfile.tsx"
import { Icon } from '../../../components/Icon';
import { PageHeading } from '../../../components/PageHeading';
import type { Creator } from '../../../types';

type Props = { creator: Creator };

export function CreatorProfile({ creator }: Props) {
  return (
    <section className="flex flex-col gap-7 border-b border-line pb-10 sm:flex-row sm:items-center">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-canvas text-accent-ink">
        <Icon name="pen" size={34} />
      </div>
      <PageHeading eyebrow={creator.roles.join(' · ')} title={creator.name} description={creator.biography} />
    </section>
  );
}
```


### web/src/features/creator/components/CreatorRuns.tsx

```tsx title="web/src/features/creator/components/CreatorRuns.tsx"
import { Link } from 'react-router';
import { Cover } from '../../../components/Cover';
import { EmptyState } from '../../../components/EmptyState';
import { Icon } from '../../../components/Icon';
import { Section } from '../../../components/Section';
import { formatPartialDate } from '../../../lib/formatPartialDate';
import type { CreatorRun } from '../types';

type Props = { runs: CreatorRun[] };

function formatRunRange(run: CreatorRun) {
  const started = formatPartialDate(run.started);
  if (!run.ended) return `${started} – present`;
  return `${started} – ${formatPartialDate(run.ended)}`;
}

export function CreatorRuns({ runs }: Props) {
  return (
    <Section title="A life across the panels" eyebrow="Series & runs">
      {runs.length === 0 && <EmptyState title="No series runs yet" description="Creator credits will appear here as the catalog grows." />}
      <div className="divide-y divide-line">
        {runs.map((run) => (
          <Link key={run.id} to={`/search?q=${encodeURIComponent(run.series.title)}`} className="group flex items-center gap-6 py-7 first:pt-0">
            <Cover cover={run.series.cover} size="sm" />
            <div className="flex-1">
              <p className="mb-2 text-xs text-muted">{run.series.publisherName} · {run.role}</p>
              <h3 className="font-display text-2xl group-hover:text-accent-ink">{run.series.title}</h3>
              <p className="mt-3 text-xs text-muted">{formatRunRange(run)}</p>
            </div>
            <Icon name="arrow-up-right" size={19} />
          </Link>
        ))}
      </div>
    </Section>
  );
}
```


## web/src/features/creator/data


### web/src/features/creator/data/getCreator.ts

```ts title="web/src/features/creator/data/getCreator.ts"
import { useCallback } from 'react';
import { creators, getSeriesSummary } from '../../../data/catalog';
import { creatorRuns } from '../../../data/scenarios';
import { useResource } from '../../../lib/useResource';
import type { CreatorModel, CreatorRun } from '../types';

export function getCreator(creatorId: string): CreatorModel | undefined | Promise<CreatorModel | undefined> {
  const creator = creators.find((creator) => creator.id === creatorId);
  if (!creator) return undefined;

  const runs: CreatorRun[] = [];
  for (const run of creatorRuns) {
    if (run.creatorId !== creatorId) continue;
    const series = getSeriesSummary(run.seriesId);
    if (!series) continue;
    runs.push({ id: run.id, series, started: run.started, ended: run.ended, role: run.role });
  }

  return { creator, runs };
}

export function useCreator(creatorId: string) {
  const loader = useCallback(() => getCreator(creatorId), [creatorId]);
  return useResource(loader);
}
```


## web/src/features/creator


### web/src/features/creator/index.ts

```ts title="web/src/features/creator/index.ts"
export { CreatorPage } from './CreatorPage';
```


### web/src/features/creator/types.ts

```ts title="web/src/features/creator/types.ts"
import type { Creator, PartialDate, SeriesSummary } from '../../types';

export type CreatorRun = {
  id: string;
  series: SeriesSummary;
  started: PartialDate;
  ended?: PartialDate;
  role: string;
};

export type CreatorModel = { creator: Creator; runs: CreatorRun[] };
```


## web/src/features/discover


### web/src/features/discover/DiscoverPage.tsx

```tsx title="web/src/features/discover/DiscoverPage.tsx"
import { AppLayout } from '../../layouts/AppLayout';
import { ResourceBoundary } from '../../components/ResourceBoundary';
import { useDiscover } from './data/getDiscover';
import { DiscoverIntro } from './components/DiscoverIntro';
import { DiscoverRail } from './components/DiscoverRail';
import { FeaturedIssue } from './components/FeaturedIssue';
import { TopPicks } from './components/TopPicks';

export function DiscoverPage() {
  const resource = useDiscover();
  const discovery = resource.value;
  const rightRail = resource.status === 'ready' && discovery ? <DiscoverRail discovery={discovery} /> : undefined;

  return (
    <AppLayout rightRail={rightRail}>
      <ResourceBoundary resource={resource}>
        {(discovery) => (
          <>
            <DiscoverIntro greeting={discovery.greeting} description={discovery.description} />
            <FeaturedIssue issue={discovery.featuredIssue} />
            <TopPicks issues={discovery.topPicks} />
          </>
        )}
      </ResourceBoundary>
    </AppLayout>
  );
}
```


## web/src/features/discover/components


### web/src/features/discover/components/DiscoverIntro.tsx

```tsx title="web/src/features/discover/components/DiscoverIntro.tsx"
import { SearchBox } from '../../../components/SearchBox';

type Props = { greeting: string; description: string };

export function DiscoverIntro({ greeting, description }: Props) {
  return (
    <section className="mb-10" aria-labelledby="discover-title">
      <p className="eyebrow mb-3">{greeting}</p>
      <h1 id="discover-title" className="font-display text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl xl:text-6xl">
        A whole universe.<br /><span className="text-muted">Find your next story.</span>
      </h1>
      <p className="mb-6 mt-4 max-w-xl text-sm leading-6 text-muted">{description}</p>
      <SearchBox isLarge />
      <p className="mt-3 text-xs text-muted">Search by a feeling, a character, a creator, or an issue.</p>
    </section>
  );
}
```


### web/src/features/discover/components/DiscoverRail.tsx

```tsx title="web/src/features/discover/components/DiscoverRail.tsx"
import { useState } from 'react';
import { ActionLink } from '../../../components/ActionLink';
import { CalendarMonth } from '../../../components/CalendarMonth';
import { Section } from '../../../components/Section';
import { Skeleton } from '../../../components/Skeleton';
import type { Publisher, ReleaseDay } from '../../../types';
import { FollowedPublishers } from './FollowedPublishers';

type Props = {
  discovery: {
    year: number; month: number; selectedDay: number; releases: ReleaseDay[];
    followedPublishers: Publisher[];
  };
};

export function DiscoverRail({ discovery }: Props) {
  const [selectedDay, setSelectedDay] = useState(discovery.selectedDay);

  return (
    <div className="space-y-9">
      <Section title="On the horizon" eyebrow="New worlds, every week">
        <div className="mt-1 rounded-card border border-line bg-surface p-3">
          <CalendarMonth year={discovery.year} month={discovery.month} selectedDay={selectedDay} onSelectDay={setSelectedDay} releases={discovery.releases} isCompact />
        </div>
        <div className="mt-3"><ActionLink to="/calendar" variant="quiet" hasArrow>See release calendar</ActionLink></div>
      </Section>
      <FollowedPublishers publishers={discovery.followedPublishers} />
      <div className="rounded-card border border-line p-4">
        <p className="eyebrow mb-3">Loading preview</p>
        <Skeleton className="mb-2 h-3 w-4/5" label="Loading release information" />
        <Skeleton className="h-3 w-3/5" />
      </div>
      <p className="text-[11px] leading-5 text-muted">Catalog source: Grand Comics Database (GCD). This template uses fictional sample records.</p>
    </div>
  );
}
```


### web/src/features/discover/components/FeaturedIssue.tsx

```tsx title="web/src/features/discover/components/FeaturedIssue.tsx"
import { ActionLink } from '../../../components/ActionLink';
import { Cover } from '../../../components/Cover';
import { Icon } from '../../../components/Icon';
import { Tag } from '../../../components/Tag';
import { formatPartialDate } from '../../../lib/formatPartialDate';
import type { IssueSummary } from '../../../types';

type Props = { issue: IssueSummary };

export function FeaturedIssue({ issue }: Props) {
  return (
    <section className="featured-story relative mb-12 grid items-center gap-9 rounded-card bg-panel p-6 sm:grid-cols-[1fr_1.1fr] sm:p-8" aria-labelledby="featured-title">
      <div className="relative flex justify-center py-4">
        <span className="featured-orbit" aria-hidden="true" />
        <div className="relative -rotate-6 transition-transform duration-300 hover:rotate-0">
          <Cover cover={issue.cover} size="lg" />
        </div>
      </div>
      <div className="relative">
        <p className="eyebrow mb-4 inline-flex items-center gap-2"><Icon name="spark" size={14} /> In the spotlight</p>
        <p className="mb-2 text-xs text-muted">{issue.seriesTitle} · {issue.cover.caption}</p>
        <h2 id="featured-title" className="font-display text-3xl leading-tight text-ink sm:text-4xl">{issue.title}</h2>
        <p className="mb-4 mt-3 text-sm text-muted">{issue.publisherName} · {formatPartialDate(issue.publishedAt)}</p>
        <div className="mb-6 flex flex-wrap gap-2"><Tag kind={issue.kind} /><Tag familyFriendly={issue.familyFriendly} /></div>
        <ActionLink to={`/issues/${issue.id}`} hasArrow>Explore the story</ActionLink>
        <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-muted">Every story has a starting point</p>
      </div>
    </section>
  );
}
```


### web/src/features/discover/components/FollowedPublishers.tsx

```tsx title="web/src/features/discover/components/FollowedPublishers.tsx"
import { Link } from 'react-router';
import { FollowButton } from '../../../components/FollowButton';
import { Section } from '../../../components/Section';
import type { Publisher } from '../../../types';

type Props = { publishers: Publisher[] };

export function FollowedPublishers({ publishers }: Props) {
  return (
    <Section title="Your publishers" eyebrow="Follow the worlds you love">
      <ul className="divide-y divide-line">
        {publishers.map((publisher) => (
          <li key={publisher.id} className="flex items-center justify-between gap-3 py-4">
            <Link to={`/publishers/${publisher.id}`} className="group flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line font-display text-sm text-ink">{publisher.initials}</span>
              <span className="text-xs font-semibold text-ink group-hover:text-accent-ink">{publisher.name}</span>
            </Link>
            <FollowButton label={publisher.name} initialIsFollowed isCompact />
          </li>
        ))}
      </ul>
    </Section>
  );
}
```


### web/src/features/discover/components/TopPicks.tsx

```tsx title="web/src/features/discover/components/TopPicks.tsx"
import { ActionLink } from '../../../components/ActionLink';
import { IssueCard } from '../../../components/IssueCard';
import { Section } from '../../../components/Section';
import type { IssueSummary } from '../../../types';

type Props = { issues: IssueSummary[] };

export function TopPicks({ issues }: Props) {
  return (
    <Section title="Top picks for you" eyebrow="A little something to get lost in" action={<ActionLink to="/search" variant="quiet" hasArrow>Browse all</ActionLink>}>
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
        {issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
      </div>
      <p className="mt-6 text-[11px] leading-5 text-muted">A curated demo selection · All stories, characters, and creators are fictional.</p>
    </Section>
  );
}
```


## web/src/features/discover/data


### web/src/features/discover/data/getDiscover.ts

```ts title="web/src/features/discover/data/getDiscover.ts"
import { getIssueSummaries, getIssueSummary, getMonthlyReleases, publishers } from '../../../data/catalog';
import { discoverScenario } from '../../../data/scenarios';
import { useResource } from '../../../lib/useResource';
import type { DiscoverModel } from '../types';

export function getDiscover(): DiscoverModel | Promise<DiscoverModel> {
  const featuredIssue = getIssueSummary(discoverScenario.featuredIssueId);
  if (!featuredIssue) throw new Error('The featured issue is unavailable.');

  return {
    greeting: discoverScenario.greeting,
    description: discoverScenario.description,
    featuredIssue,
    topPicks: getIssueSummaries(discoverScenario.topPickIds),
    followedPublishers: publishers.filter((publisher) => discoverScenario.publisherIds.includes(publisher.id)),
    year: discoverScenario.year,
    month: discoverScenario.month,
    selectedDay: discoverScenario.selectedDay,
    releases: getMonthlyReleases(discoverScenario.year, discoverScenario.month),
  };
}

export function useDiscover() {
  return useResource(getDiscover);
}
```


## web/src/features/discover


### web/src/features/discover/index.ts

```ts title="web/src/features/discover/index.ts"
export { DiscoverPage } from './DiscoverPage';
```


### web/src/features/discover/types.ts

```ts title="web/src/features/discover/types.ts"
import type { IssueSummary, Publisher, ReleaseDay } from '../../types';

export type DiscoverModel = {
  greeting: string;
  description: string;
  featuredIssue: IssueSummary;
  topPicks: IssueSummary[];
  followedPublishers: Publisher[];
  year: number;
  month: number;
  selectedDay: number;
  releases: ReleaseDay[];
};
```


## web/src/features/issue-detail


### web/src/features/issue-detail/IssueDetailPage.tsx

```tsx title="web/src/features/issue-detail/IssueDetailPage.tsx"
import { useParams } from 'react-router';
import { AppLayout } from '../../layouts/AppLayout';
import { EmptyState } from '../../components/EmptyState';
import { ResourceBoundary } from '../../components/ResourceBoundary';
import { useIssueDetail } from './data/getIssueDetail';
import { IssueHero } from './components/IssueHero';
import { AvailabilityLinks } from './components/AvailabilityLinks';
import { IssueRelations } from './components/IssueRelations';

export function IssueDetailPage() {
  const { issueId } = useParams();
  const resource = useIssueDetail(issueId ?? '');

  return (
    <AppLayout>
      <ResourceBoundary resource={resource}>
        {(issue) => {
          if (!issue) return <EmptyState title="This story is still uncharted" description="Choose a story from Discover or search the demo catalog." />;
          return (
            <>
              <IssueHero key={issue.id} issue={issue} />
              <AvailabilityLinks links={issue.availability} />
              <IssueRelations kind={issue.kind} issues={issue.relatedIssues} />
            </>
          );
        }}
      </ResourceBoundary>
    </AppLayout>
  );
}
```


## web/src/features/issue-detail/components


### web/src/features/issue-detail/components/AvailabilityLinks.tsx

```tsx title="web/src/features/issue-detail/components/AvailabilityLinks.tsx"
import { Icon } from '../../../components/Icon';
import { Section } from '../../../components/Section';
import type { AvailabilityLink } from '../../../types';

type Props = { links: AvailabilityLink[] };

export function AvailabilityLinks({ links }: Props) {
  return (
    <Section title="Where to get it" eyebrow="Your next stop">
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        {links.map((link) => (
          <div key={link.id} className="rounded-card border border-line bg-surface p-5">
            <div className="mb-4 flex items-center justify-between text-ink"><Icon name="book" size={20} /><Icon name="arrow-up-right" size={16} /></div>
            <h3 className="mb-2 text-sm font-semibold text-ink">{link.label}</h3>
            {link.url ? <a href={link.url} className="text-xs text-accent-ink" target="_blank" rel="noreferrer">Visit destination</a> : <span className="text-xs text-muted">Demo destination · coming soon</span>}
          </div>
        ))}
      </div>
      <p className="mb-10 text-[11px] leading-5 text-muted">Sample availability only. Connect your library, retailer, and reader destinations here.</p>
    </Section>
  );
}
```


### web/src/features/issue-detail/components/IssueCoverStrip.tsx

```tsx title="web/src/features/issue-detail/components/IssueCoverStrip.tsx"
import { Cover } from '../../../components/Cover';
import type { IssueDetail } from '../../../types';

type Props = {
  issue: IssueDetail;
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
};

export function IssueCoverStrip({ issue, selectedVariantId, onVariantChange }: Props) {
  if (issue.variants.length === 0) {
    return <p className="mt-4 text-center text-xs text-muted">Regular cover</p>;
  }

  return (
    <fieldset className="mt-5 border-t border-line pt-5">
      <legend className="px-2 text-xs text-muted">Choose a cover · {issue.variants.length + 1} editions</legend>
      <div className="flex flex-wrap justify-center gap-4 pt-2">
        <button type="button" aria-pressed={selectedVariantId === ''} onClick={() => onVariantChange('')} className="variant-option rounded-lg p-2">
          <Cover cover={issue.cover} size="sm" isCompact />
          <span className="mt-2 block text-[10px] text-muted">Regular</span>
        </button>
        {issue.variants.map((variant) => (
          <button key={variant.id} type="button" aria-pressed={selectedVariantId === variant.id} onClick={() => onVariantChange(variant.id)} className="variant-option rounded-lg p-2">
            <Cover cover={variant.cover} size="sm" isCompact />
            <span className="mt-2 block text-[10px] text-muted">{variant.label}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
```


### web/src/features/issue-detail/components/IssueHero.tsx

```tsx title="web/src/features/issue-detail/components/IssueHero.tsx"
import { useState } from 'react';
import { Link } from 'react-router';
import { Cover } from '../../../components/Cover';
import { FollowButton } from '../../../components/FollowButton';
import { Tag } from '../../../components/Tag';
import { formatPartialDate } from '../../../lib/formatPartialDate';
import type { IssueDetail } from '../../../types';
import { IssueCoverStrip } from './IssueCoverStrip';

type Props = { issue: IssueDetail };

export function IssueHero({ issue }: Props) {
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const selectedVariant = issue.variants.find((variant) => variant.id === selectedVariantId);
  const selectedCover = selectedVariant?.cover ?? issue.cover;

  return (
    <section className="mb-10 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]" aria-labelledby="issue-title">
      <div className="rounded-card bg-panel px-6 pb-5 pt-8">
        <div className="flex justify-center py-4"><Cover cover={selectedCover} size="lg" /></div>
        <IssueCoverStrip issue={issue} selectedVariantId={selectedVariantId} onVariantChange={setSelectedVariantId} />
      </div>
      <div className="flex flex-col justify-center">
        <Link to={`/search?q=${encodeURIComponent(issue.seriesTitle)}`} className="eyebrow mb-3 text-muted hover:text-accent-ink">{issue.seriesTitle} · {issue.cover.caption}</Link>
        <h1 id="issue-title" className="font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">{issue.title}</h1>
        <p className="mb-4 mt-4 text-sm text-muted">{issue.publisherName} · {formatPartialDate(issue.publishedAt)}</p>
        <div className="mb-6 flex gap-2"><Tag kind={issue.kind} /><Tag familyFriendly={issue.familyFriendly} /></div>
        <p className="text-sm leading-7 text-muted">{issue.description}</p>
        <dl className="my-6 grid gap-3 border-y border-line py-5 text-sm">
          {issue.credits.map((credit) => (
            <div key={`${credit.id}-${credit.role}`} className="flex justify-between gap-4">
              <dt className="text-muted">{credit.role}</dt>
              <dd><Link className="text-ink hover:text-accent-ink" to={`/creators/${credit.id}`}>{credit.name}</Link></dd>
            </div>
          ))}
        </dl>
        <div><FollowButton label={issue.seriesTitle} /></div>
        <p className="mt-5 text-[11px] leading-5 text-muted">Fictional sample record. Production catalog source: Grand Comics Database (GCD).</p>
      </div>
    </section>
  );
}
```


### web/src/features/issue-detail/components/IssueRelations.tsx

```tsx title="web/src/features/issue-detail/components/IssueRelations.tsx"
import { IssueGrid } from '../../../components/IssueGrid';
import { Section } from '../../../components/Section';
import type { ContentKind, IssueSummary } from '../../../types';

type Props = { kind: ContentKind; issues: IssueSummary[] };

const relationTitles: Record<ContentKind, string> = {
  'single-issue': 'Reprinted in', collection: 'Collects',
};

export function IssueRelations({ kind, issues }: Props) {
  return (
    <Section title={relationTitles[kind]} eyebrow="Connect the story">
      <IssueGrid issues={issues} emptyMessage="No connected editions are recorded for this story yet." />
    </Section>
  );
}
```


## web/src/features/issue-detail/data


### web/src/features/issue-detail/data/getIssueDetail.ts

```ts title="web/src/features/issue-detail/data/getIssueDetail.ts"
import { useCallback } from 'react';
import { getIssueDetailModel } from '../../../data/catalog';
import { useResource } from '../../../lib/useResource';
import type { IssueDetailModel } from '../types';

export function getIssueDetail(issueId: string): IssueDetailModel | undefined | Promise<IssueDetailModel | undefined> {
  return getIssueDetailModel(issueId);
}

export function useIssueDetail(issueId: string) {
  const loadIssueDetail = useCallback(() => getIssueDetail(issueId), [issueId]);
  return useResource(loadIssueDetail);
}
```


## web/src/features/issue-detail


### web/src/features/issue-detail/index.ts

```ts title="web/src/features/issue-detail/index.ts"
export { IssueDetailPage } from './IssueDetailPage';
```


### web/src/features/issue-detail/types.ts

```ts title="web/src/features/issue-detail/types.ts"
import type { IssueDetail } from '../../types';

export type IssueDetailModel = IssueDetail;
```


## web/src/features/publisher-timeline


### web/src/features/publisher-timeline/PublisherTimelinePage.tsx

```tsx title="web/src/features/publisher-timeline/PublisherTimelinePage.tsx"
import { useParams } from 'react-router';
import { EmptyState } from '../../components/EmptyState';
import { ResourceBoundary } from '../../components/ResourceBoundary';
import { AppLayout } from '../../layouts/AppLayout';
import { PublisherHistory } from './components/PublisherHistory';
import { usePublisherTimeline } from './data/getPublisherTimeline';

export function PublisherTimelinePage() {
  const { publisherId = '' } = useParams();
  const timelineResult = usePublisherTimeline(publisherId);

  return (
    <AppLayout>
      <ResourceBoundary resource={timelineResult}>
        {(timeline) => (
          <>
            {timeline && <PublisherHistory timeline={timeline} />}
            {!timeline && <EmptyState title="Publisher not found" description="Try another publisher from the demo catalog." />}
          </>
        )}
      </ResourceBoundary>
    </AppLayout>
  );
}
```


## web/src/features/publisher-timeline/components


### web/src/features/publisher-timeline/components/PublisherHistory.tsx

```tsx title="web/src/features/publisher-timeline/components/PublisherHistory.tsx"
import { EmptyState } from '../../../components/EmptyState';
import { FollowButton } from '../../../components/FollowButton';
import { PageHeading } from '../../../components/PageHeading';
import { TimelineEvent } from './TimelineEvent';
import type { PublisherTimelineModel } from '../types';

type Props = { timeline: PublisherTimelineModel };

export function PublisherHistory({ timeline }: Props) {
  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <PageHeading eyebrow={timeline.publisher.name} title={timeline.title} description={timeline.description} />
        <FollowButton key={timeline.publisher.id} label={timeline.publisher.name} />
      </div>
      <div className="mt-10 flex items-center gap-6 border-y border-line py-5 text-xs text-muted">
        <span>{timeline.events.length} releases</span>
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent" /> Milestones</span>
        <span>Publication history</span>
      </div>
      {timeline.events.length === 0 && <div className="mt-10"><EmptyState title="A history waiting to be discovered" description="No releases are recorded for this publisher in the demo catalog yet." /></div>}
      {timeline.events.length > 0 && (
        <ol className="ml-2 mt-10 border-l border-line">
          {timeline.events.map((event) => <TimelineEvent key={event.id} event={event} />)}
        </ol>
      )}
    </div>
  );
}
```


### web/src/features/publisher-timeline/components/TimelineEvent.tsx

```tsx title="web/src/features/publisher-timeline/components/TimelineEvent.tsx"
import { Link } from 'react-router';
import { Cover } from '../../../components/Cover';
import { Icon } from '../../../components/Icon';
import { Tag } from '../../../components/Tag';
import { formatPartialDate } from '../../../lib/formatPartialDate';
import type { PublisherTimelineEvent } from '../types';

type Props = { event: PublisherTimelineEvent };

export function TimelineEvent({ event }: Props) {
  const hasMilestone = Boolean(event.milestone);
  const markerClass = hasMilestone ? 'bg-accent ring-accent/15' : 'bg-panel ring-line';

  return (
    <li className="relative pb-12 pl-9 last:pb-0 sm:pl-12">
      <span className={`absolute -left-[7px] top-2 h-3 w-3 rounded-full ring-4 ${markerClass}`} />
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-muted">
        {formatPartialDate(event.date)}
      </p>
      {event.milestone && (
        <p className="mb-4 flex items-center gap-2 text-xs font-semibold text-accent-ink">
          <Icon name="spark" size={15} />{event.milestone.label}
        </p>
      )}
      <Link to={`/issues/${event.issue.id}`} className="group flex gap-5 rounded-card focus-visible:outline-offset-8">
        <Cover cover={event.issue.cover} size="sm" />
        <div className="self-center">
          <p className="mb-2 text-xs text-muted">{event.issue.seriesTitle} · {event.issue.number}</p>
          <h3 className="font-display text-2xl leading-tight group-hover:text-accent-ink">{event.issue.title}</h3>
          <div className="mt-3 flex flex-wrap gap-2"><Tag kind={event.issue.kind} /><Tag familyFriendly={event.issue.familyFriendly} /></div>
          <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium">
            Explore this release <Icon name="arrow-up-right" size={14} />
          </span>
        </div>
      </Link>
    </li>
  );
}
```


## web/src/features/publisher-timeline/data


### web/src/features/publisher-timeline/data/getPublisherTimeline.ts

```ts title="web/src/features/publisher-timeline/data/getPublisherTimeline.ts"
import { useCallback } from 'react';
import { getIssueSummaries, getIssueSummary, issues, publishers } from '../../../data/catalog';
import { timelineScenario } from '../../../data/scenarios';
import { useResource } from '../../../lib/useResource';
import type { PublisherTimelineEvent, PublisherTimelineModel } from '../types';

export function getPublisherTimeline(publisherId: string): PublisherTimelineModel | undefined | Promise<PublisherTimelineModel | undefined> {
  const publisher = publishers.find((publisher) => publisher.id === publisherId);
  if (!publisher) return undefined;

  if (publisherId !== timelineScenario.publisherId) {
    const releases = getIssueSummaries(issues.map((issue) => issue.id));
    const publisherReleases = releases.filter((issue) => issue.publisherId === publisherId && issue.kind === 'single-issue');
    publisherReleases.sort((firstIssue, secondIssue) => {
      const firstDate = firstIssue.publishedAt;
      const secondDate = secondIssue.publishedAt;
      const firstTimestamp = Date.UTC(firstDate.year, (firstDate.month ?? 1) - 1, firstDate.day ?? 1);
      const secondTimestamp = Date.UTC(secondDate.year, (secondDate.month ?? 1) - 1, secondDate.day ?? 1);
      return firstTimestamp - secondTimestamp;
    });

    return {
      publisher,
      title: publisher.name,
      description: publisher.description,
      events: publisherReleases.map((issue) => ({ id: `timeline-${issue.id}`, date: issue.publishedAt, issue })),
    };
  }

  const events: PublisherTimelineEvent[] = [];
  for (const event of timelineScenario.events) {
    const issue = getIssueSummary(event.issueId);
    if (!issue || issue.kind !== 'single-issue') continue;
    events.push({ id: event.id, date: event.date, issue, milestone: event.milestone });
  }

  return {
    publisher,
    title: timelineScenario.title,
    description: timelineScenario.description,
    events,
  };
}

export function usePublisherTimeline(publisherId: string) {
  const loader = useCallback(() => getPublisherTimeline(publisherId), [publisherId]);
  return useResource(loader);
}
```


## web/src/features/publisher-timeline


### web/src/features/publisher-timeline/index.ts

```ts title="web/src/features/publisher-timeline/index.ts"
export { PublisherTimelinePage } from './PublisherTimelinePage';
```


### web/src/features/publisher-timeline/types.ts

```ts title="web/src/features/publisher-timeline/types.ts"
import type { IssueSummary, PartialDate, Publisher } from '../../types';

export type PublisherMilestone = {
  kind: 'first-appearance' | 'first-event';
  label: string;
};

export type PublisherTimelineEvent = {
  id: string;
  date: PartialDate;
  issue: IssueSummary;
  milestone?: PublisherMilestone;
};

export type PublisherTimelineModel = {
  publisher: Publisher;
  title: string;
  description: string;
  events: PublisherTimelineEvent[];
};
```


## web/src/features/reading-order


### web/src/features/reading-order/ReadingOrderPage.tsx

```tsx title="web/src/features/reading-order/ReadingOrderPage.tsx"
import { useParams } from 'react-router';
import { EmptyState } from '../../components/EmptyState';
import { ResourceBoundary } from '../../components/ResourceBoundary';
import { AppLayout } from '../../layouts/AppLayout';
import { CrossoverOverview } from './components/CrossoverOverview';
import { OrderedIssues } from './components/OrderedIssues';
import { useReadingOrder } from './data/getReadingOrder';

export function ReadingOrderPage() {
  const { orderId = '' } = useParams();
  const orderResult = useReadingOrder(orderId);

  return (
    <AppLayout>
      <ResourceBoundary resource={orderResult}>
        {(readingOrder) => (
          <>
            {readingOrder && <div className="max-w-4xl space-y-10"><CrossoverOverview readingOrder={readingOrder} /><OrderedIssues entries={readingOrder.entries} /></div>}
            {!readingOrder && <EmptyState title="Reading order not found" description="This crossover is not part of the demo catalog yet." />}
          </>
        )}
      </ResourceBoundary>
    </AppLayout>
  );
}
```


## web/src/features/reading-order/components


### web/src/features/reading-order/components/CrossoverOverview.tsx

```tsx title="web/src/features/reading-order/components/CrossoverOverview.tsx"
import { Icon } from '../../../components/Icon';
import { PageHeading } from '../../../components/PageHeading';
import { formatPartialDate } from '../../../lib/formatPartialDate';
import type { ReadingOrderModel } from '../types';

type Props = { readingOrder: ReadingOrderModel };

export function CrossoverOverview({ readingOrder }: Props) {
  return (
    <section className="border-b border-line pb-8">
      <PageHeading eyebrow="A story across titles" title={readingOrder.title} description={readingOrder.description} />
      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted">
        <span className="flex items-center gap-2"><Icon name="layers" size={16} /> {readingOrder.entries.length} issues</span>
        <span>{readingOrder.seriesCount} series</span>
        <span>{formatPartialDate(readingOrder.started)} – {formatPartialDate(readingOrder.ended)}</span>
      </div>
    </section>
  );
}
```


### web/src/features/reading-order/components/OrderedIssues.tsx

```tsx title="web/src/features/reading-order/components/OrderedIssues.tsx"
import { Link } from 'react-router';
import { Cover } from '../../../components/Cover';
import { EmptyState } from '../../../components/EmptyState';
import { Icon } from '../../../components/Icon';
import { Section } from '../../../components/Section';
import { Tag } from '../../../components/Tag';
import { formatPartialDate } from '../../../lib/formatPartialDate';
import type { ReadingOrderEntry } from '../types';

type Props = { entries: ReadingOrderEntry[] };

export function OrderedIssues({ entries }: Props) {
  return (
    <Section title="Follow the thread" eyebrow="The complete reading order">
      {entries.length === 0 && <EmptyState title="The order is coming together" description="Issues will appear here in story order." />}
      <ol className="divide-y divide-line">
        {entries.map((entry) => (
          <li key={entry.id} className="py-6 first:pt-0">
            <Link to={`/issues/${entry.issue.id}`} className="group flex items-center gap-4 sm:gap-7">
              <span className="w-7 shrink-0 font-display text-3xl text-muted/60">{String(entry.position).padStart(2, '0')}</span>
              <Cover cover={entry.issue.cover} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="mb-2 text-xs font-medium text-accent-ink">{entry.issue.seriesTitle} · {entry.issue.number}</p>
                <h3 className="font-display text-xl group-hover:text-accent-ink sm:text-2xl">{entry.issue.title}</h3>
                <p className="mt-3 text-xs text-muted">{entry.issue.publisherName} · {formatPartialDate(entry.issue.publishedAt)}</p>
                <div className="mt-3 flex flex-wrap gap-2"><Tag kind={entry.issue.kind} /><Tag familyFriendly={entry.issue.familyFriendly} /></div>
              </div>
              <span className="hidden sm:block"><Icon name="arrow-up-right" size={18} /></span>
            </Link>
          </li>
        ))}
      </ol>
    </Section>
  );
}
```


## web/src/features/reading-order/data


### web/src/features/reading-order/data/getReadingOrder.ts

```ts title="web/src/features/reading-order/data/getReadingOrder.ts"
import { useCallback } from 'react';
import { getIssueSummaries } from '../../../data/catalog';
import { readingOrderScenario } from '../../../data/scenarios';
import { useResource } from '../../../lib/useResource';
import type { ReadingOrderModel } from '../types';

export function getReadingOrder(orderId: string): ReadingOrderModel | undefined | Promise<ReadingOrderModel | undefined> {
  if (orderId !== readingOrderScenario.id) return undefined;
  const issues = getIssueSummaries(readingOrderScenario.issueIds);
  const regularIssues = issues.filter((issue) => issue.kind === 'single-issue');
  const entries = regularIssues.map((issue, position) => ({ id: issue.id, position: position + 1, issue }));
  const seriesCount = new Set(regularIssues.map((issue) => issue.seriesId)).size;

  return {
    id: readingOrderScenario.id,
    title: readingOrderScenario.title,
    description: readingOrderScenario.description,
    started: regularIssues.at(0)?.publishedAt,
    ended: regularIssues.at(-1)?.publishedAt,
    seriesCount,
    entries,
  };
}

export function useReadingOrder(orderId: string) {
  const loader = useCallback(() => getReadingOrder(orderId), [orderId]);
  return useResource(loader);
}
```


## web/src/features/reading-order


### web/src/features/reading-order/index.ts

```ts title="web/src/features/reading-order/index.ts"
export { ReadingOrderPage } from './ReadingOrderPage';
```


### web/src/features/reading-order/types.ts

```ts title="web/src/features/reading-order/types.ts"
import type { IssueSummary, PartialDate } from '../../types';

export type ReadingOrderEntry = { id: string; position: number; issue: IssueSummary };

export type ReadingOrderModel = {
  id: string;
  title: string;
  description: string;
  started?: PartialDate;
  ended?: PartialDate;
  seriesCount: number;
  entries: ReadingOrderEntry[];
};
```


## web/src/features/release-calendar


### web/src/features/release-calendar/ReleaseCalendarPage.tsx

```tsx title="web/src/features/release-calendar/ReleaseCalendarPage.tsx"
import { useState } from 'react';
import { AppLayout } from '../../layouts/AppLayout';
import { ResourceBoundary } from '../../components/ResourceBoundary';
import { getCalendarDefaults, useReleaseCalendar } from './data/getReleaseCalendar';
import { ReleaseMonth } from './components/ReleaseMonth';
import { DayReleases } from './components/DayReleases';

export function ReleaseCalendarPage() {
  const defaults = getCalendarDefaults();
  const [selection, setSelection] = useState(defaults);
  const resource = useReleaseCalendar(selection.year, selection.month);

  function handleSelectDay(day: number) {
    setSelection({ year: selection.year, month: selection.month, selectedDay: day });
  }

  function handleMonthChange(offset: number) {
    const nextMonth = new Date(selection.year, selection.month - 1 + offset, 1);
    setSelection({ year: nextMonth.getFullYear(), month: nextMonth.getMonth() + 1, selectedDay: 1 });
  }

  return (
    <AppLayout>
      <ResourceBoundary resource={resource}>
        {(calendar) => {
          const selectedRelease = calendar.releases.find((release) => release.date.day === selection.selectedDay);
          return (
            <>
              <ReleaseMonth calendar={calendar} selectedDay={selection.selectedDay} onSelectDay={handleSelectDay} onMonthChange={handleMonthChange} />
              <DayReleases date={{ year: selection.year, month: selection.month, day: selection.selectedDay }} issues={selectedRelease?.issues ?? []} />
            </>
          );
        }}
      </ResourceBoundary>
    </AppLayout>
  );
}
```


## web/src/features/release-calendar/components


### web/src/features/release-calendar/components/DayReleases.tsx

```tsx title="web/src/features/release-calendar/components/DayReleases.tsx"
import { IssueGrid } from '../../../components/IssueGrid';
import { Section } from '../../../components/Section';
import { formatPartialDate } from '../../../lib/formatPartialDate';
import type { IssueSummary, PartialDate } from '../../../types';

type Props = { date: PartialDate; issues: IssueSummary[] };

export function DayReleases({ date, issues }: Props) {
  return (
    <Section title={formatPartialDate(date)} eyebrow="On the shelves">
      <IssueGrid issues={issues} emptyMessage="A quiet day in this corner of the universe. Select a date with a dot to discover new releases." />
    </Section>
  );
}
```


### web/src/features/release-calendar/components/ReleaseMonth.tsx

```tsx title="web/src/features/release-calendar/components/ReleaseMonth.tsx"
import { Button } from '../../../components/Button';
import { CalendarMonth } from '../../../components/CalendarMonth';
import { FollowButton } from '../../../components/FollowButton';
import { Icon } from '../../../components/Icon';
import { PageHeading } from '../../../components/PageHeading';
import type { ReleaseDay } from '../../../types';

type Props = {
  calendar: { year: number; month: number; releases: ReleaseDay[] };
  selectedDay: number;
  onSelectDay: (day: number) => void;
  onMonthChange: (offset: number) => void;
};

export function ReleaseMonth({ calendar, selectedDay, onSelectDay, onMonthChange }: Props) {
  return (
    <section className="mb-10" aria-label="Release calendar">
      <PageHeading eyebrow="Something to look forward to" title="Fresh off the press." description="A month of new worlds. Pick a date to see what lands." />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="quiet" onClick={() => onMonthChange(-1)}><Icon name="chevron-left" size={16} /><span className="sr-only">Previous month</span></Button>
          <Button variant="quiet" onClick={() => onMonthChange(1)}><Icon name="chevron-right" size={16} /><span className="sr-only">Next month</span></Button>
          <span className="ml-2 text-xs text-muted">Regular issues only</span>
        </div>
        <FollowButton label="release calendar" />
      </div>
      <div className="rounded-card border border-line bg-panel p-4 sm:p-6">
        <CalendarMonth year={calendar.year} month={calendar.month} selectedDay={selectedDay} onSelectDay={onSelectDay} releases={calendar.releases} />
      </div>
      <p className="mt-3 text-[11px] text-muted">Dots mark release days. Editions with partial dates appear in search and publisher history.</p>
    </section>
  );
}
```


## web/src/features/release-calendar/data


### web/src/features/release-calendar/data/getReleaseCalendar.ts

```ts title="web/src/features/release-calendar/data/getReleaseCalendar.ts"
import { useCallback } from 'react';
import { getMonthlyReleases } from '../../../data/catalog';
import { calendarScenario } from '../../../data/scenarios';
import { useResource } from '../../../lib/useResource';
import type { CalendarDefaults, ReleaseCalendarModel } from '../types';

export function getCalendarDefaults(): CalendarDefaults {
  return {
    year: calendarScenario.year,
    month: calendarScenario.month,
    selectedDay: calendarScenario.selectedDay,
  };
}

export function getReleaseCalendar(year: number, month: number): ReleaseCalendarModel | Promise<ReleaseCalendarModel> {
  return { year, month, releases: getMonthlyReleases(year, month) };
}

export function useReleaseCalendar(year: number, month: number) {
  const loadReleaseCalendar = useCallback(() => getReleaseCalendar(year, month), [year, month]);
  return useResource(loadReleaseCalendar, { keepsPreviousValue: true });
}
```


## web/src/features/release-calendar


### web/src/features/release-calendar/index.ts

```ts title="web/src/features/release-calendar/index.ts"
export { ReleaseCalendarPage } from './ReleaseCalendarPage';
```


### web/src/features/release-calendar/types.ts

```ts title="web/src/features/release-calendar/types.ts"
import type { ReleaseDay } from '../../types';

export type ReleaseCalendarModel = {
  year: number;
  month: number;
  releases: ReleaseDay[];
};

export type CalendarDefaults = {
  year: number;
  month: number;
  selectedDay: number;
};
```


## web/src/features/search


### web/src/features/search/SearchPage.tsx

```tsx title="web/src/features/search/SearchPage.tsx"
import { useSearchParams } from 'react-router';
import { AppLayout } from '../../layouts/AppLayout';
import { PageHeading } from '../../components/PageHeading';
import { ResourceBoundary } from '../../components/ResourceBoundary';
import { SearchBox } from '../../components/SearchBox';
import { useSearchResults } from './data/getSearchResults';
import { SearchFilters } from './components/SearchFilters';
import { SearchResults } from './components/SearchResults';
import type { SearchFilters as SearchFilterValues } from './types';

const filterParameters: Record<keyof SearchFilterValues, string> = {
  query: 'q', publisherId: 'publisher', fromYear: 'from', toYear: 'to', entityId: 'entity', kind: 'kind',
};

export function SearchPage() {
  const [searchParameters, setSearchParameters] = useSearchParams();
  const filters: SearchFilterValues = {
    query: searchParameters.get('q') ?? '', publisherId: searchParameters.get('publisher') ?? '',
    fromYear: searchParameters.get('from') ?? '', toYear: searchParameters.get('to') ?? '',
    entityId: searchParameters.get('entity') ?? '', kind: searchParameters.get('kind') ?? '',
  };
  const resource = useSearchResults(filters);

  function handleFilterChange(name: keyof SearchFilterValues, value: string) {
    const nextParameters = new URLSearchParams(searchParameters);
    if (value) nextParameters.set(filterParameters[name], value);
    else nextParameters.delete(filterParameters[name]);
    setSearchParameters(nextParameters, { replace: true, flushSync: true });
  }

  function handleReset() {
    setSearchParameters({}, { replace: true, flushSync: true });
  }

  return (
    <AppLayout>
      <PageHeading eyebrow="Follow your curiosity" title="Which kind of story, where?" description="A story can start anywhere. Find the issue that starts yours." />
      <SearchBox key={filters.query} initialQuery={filters.query} isLarge />
      <ResourceBoundary resource={resource}>
        {(results) => (
          <>
            <SearchFilters filters={filters} options={results} onChange={handleFilterChange} onReset={handleReset} />
            <SearchResults issues={results.issues} query={filters.query} isLoading={searchParameters.get('state') === 'loading'} />
          </>
        )}
      </ResourceBoundary>
    </AppLayout>
  );
}
```


## web/src/features/search/components


### web/src/features/search/components/SearchFilters.tsx

```tsx title="web/src/features/search/components/SearchFilters.tsx"
import { Button } from '../../../components/Button';
import type { Character, Creator, Publisher } from '../../../types';
import type { SearchFilters as SearchFilterValues } from '../types';

type Props = {
  filters: SearchFilterValues;
  options: { publishers: Publisher[]; creators: Creator[]; characters: Character[] };
  onChange: (name: keyof SearchFilterValues, value: string) => void;
  onReset: () => void;
};

export function SearchFilters({ filters, options, onChange, onReset }: Props) {
  const fieldClassName = 'mt-2 w-full rounded-xl border border-line bg-surface px-3 py-3 text-xs text-ink';

  return (
    <section className="mb-8 mt-6 rounded-card bg-panel p-4" aria-label="Filter stories">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.1fr_1fr_1.2fr_1fr]">
        <label className="text-[11px] font-medium text-muted">Publisher
          <select className={fieldClassName} value={filters.publisherId} onChange={(event) => onChange('publisherId', event.target.value)}>
            <option value="">All publishers</option>
            {options.publishers.map((publisher) => <option key={publisher.id} value={publisher.id}>{publisher.name}</option>)}
          </select>
        </label>
        <fieldset>
          <legend className="text-[11px] font-medium text-muted">Publication years</legend>
          <div className="flex items-center gap-2">
            <input aria-label="From year" className={fieldClassName} type="number" min="1900" max="2100" placeholder="From" value={filters.fromYear} onChange={(event) => onChange('fromYear', event.target.value)} />
            <span className="mt-2 text-muted">–</span>
            <input aria-label="To year" className={fieldClassName} type="number" min="1900" max="2100" placeholder="To" value={filters.toYear} onChange={(event) => onChange('toYear', event.target.value)} />
          </div>
        </fieldset>
        <label className="text-[11px] font-medium text-muted">Creator or character
          <select className={fieldClassName} value={filters.entityId} onChange={(event) => onChange('entityId', event.target.value)}>
            <option value="">Anyone</option>
            <optgroup label="Creators">{options.creators.map((creator) => <option key={creator.id} value={creator.id}>{creator.name}</option>)}</optgroup>
            <optgroup label="Characters">{options.characters.map((character) => <option key={character.id} value={character.id}>{character.name}</option>)}</optgroup>
          </select>
        </label>
        <label className="text-[11px] font-medium text-muted">Format
          <select className={fieldClassName} value={filters.kind} onChange={(event) => onChange('kind', event.target.value)}>
            <option value="">All formats</option><option value="single-issue">Single issue</option><option value="collection">Collection</option>
          </select>
        </label>
      </div>
      <div className="mt-3 flex justify-end"><Button variant="quiet" onClick={onReset}>Reset filters</Button></div>
    </section>
  );
}
```


### web/src/features/search/components/SearchResults.tsx

```tsx title="web/src/features/search/components/SearchResults.tsx"
import { IssueGrid } from '../../../components/IssueGrid';
import type { IssueSummary } from '../../../types';

type Props = { issues: IssueSummary[]; query: string; isLoading: boolean };

export function SearchResults({ issues, query, isLoading }: Props) {
  let countLabel = `${issues.length} stories`;
  if (issues.length === 1) countLabel = '1 story';
  let resultLabel = `${countLabel} to explore`;
  if (query) resultLabel = `${countLabel} for “${query}”`;
  if (isLoading) resultLabel = 'Finding your next story…';

  return (
    <section aria-labelledby="results-title">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
        <h2 id="results-title" className="font-display text-2xl text-ink">{resultLabel}</h2>
        <span className="text-[11px] text-muted">Fictional demo catalog · GCD-ready structure</span>
      </div>
      <IssueGrid issues={issues} isLoading={isLoading} emptyMessage="No stories match these filters. Try another phrase or reset the filters." />
    </section>
  );
}
```


## web/src/features/search/data


### web/src/features/search/data/getSearchResults.ts

```ts title="web/src/features/search/data/getSearchResults.ts"
import { useCallback } from 'react';
import { characters, creators, getIssueSummaries, issues, publishers, series } from '../../../data/catalog';
import { useResource } from '../../../lib/useResource';
import type { Issue } from '../../../types';
import type { SearchFilters, SearchResultsModel } from '../types';

function getSearchableText(issue: Issue): string {
  const issueSeries = series.find((series) => series.id === issue.seriesId);
  const publisher = publishers.find((publisher) => publisher.id === issueSeries?.publisherId);
  const creditedNames = issue.credits.map((credit) => creators.find((creator) => creator.id === credit.creatorId)?.name ?? '');
  const characterNames = characters.filter((character) => issue.characterIds.includes(character.id)).map((character) => character.name);
  return [issue.title, issue.number, issue.description, issueSeries?.title, issueSeries?.description, publisher?.name, ...creditedNames, ...characterNames].join(' ').toLowerCase();
}

function hasValidYearRange(filters: SearchFilters): boolean {
  const fromYear = filters.fromYear.trim();
  const toYear = filters.toYear.trim();
  const yearPattern = /^[1-9]\d{0,3}$/;
  const hasInvalidYear = [fromYear, toYear].some((year) => year !== '' && !yearPattern.test(year));
  if (hasInvalidYear) return false;
  if (!fromYear || !toYear) return true;
  return Number(fromYear) <= Number(toYear);
}

function matchesFilters(issue: Issue, filters: SearchFilters): boolean {
  const issueSeries = series.find((series) => series.id === issue.seriesId);
  if (filters.publisherId && filters.publisherId !== 'all' && issueSeries?.publisherId !== filters.publisherId) return false;
  if (filters.kind && filters.kind !== 'all' && issue.kind !== filters.kind) return false;
  const fromYear = Number.parseInt(filters.fromYear, 10);
  const toYear = Number.parseInt(filters.toYear, 10);
  if (Number.isFinite(fromYear) && issue.publishedAt.year < fromYear) return false;
  if (Number.isFinite(toYear) && issue.publishedAt.year > toYear) return false;
  if (!filters.entityId || filters.entityId === 'all') return true;
  const hasCreator = issue.credits.some((credit) => credit.creatorId === filters.entityId);
  return hasCreator || issue.characterIds.includes(filters.entityId);
}

export function getSearchResults(filters: SearchFilters): SearchResultsModel | Promise<SearchResultsModel> {
  if (!hasValidYearRange(filters)) return { issues: [], publishers, creators, characters };
  const normalizedQuery = filters.query.trim().toLowerCase();
  const requestedNumber = normalizedQuery.match(/(?:^|\s)(?:#|issue\s+)(\d+[a-z]?)\b/)?.[1];
  const storyQuery = normalizedQuery.replace(/(?:^|\s)(?:#|issue\s+)\d+[a-z]?\b/, ' ');
  const requestedPublisher = publishers.find((publisher) => publisher.name.toLowerCase() === normalizedQuery || publisher.initials.toLowerCase() === normalizedQuery);
  const ignoredWords = new Set(['a', 'an', 'at', 'by', 'in', 'is', 'of', 'on', 'to', 'the', 'and', 'for', 'with', 'about', 'that', 'want', 'story', 'stories', 'comic', 'comics', 'issue', 'read', 'find', 'please']);
  const queryWords = storyQuery.split(/\W+/).filter((word) => word !== '' && !ignoredWords.has(word));
  const matches = issues.filter((issue) => {
    if (!matchesFilters(issue, filters)) return false;
    if (requestedNumber && (issue.kind !== 'single-issue' || issue.number.toLowerCase() !== requestedNumber)) return false;
    if (requestedPublisher) {
      const issueSeries = series.find((series) => series.id === issue.seriesId);
      return issueSeries?.publisherId === requestedPublisher.id;
    }
    return true;
  });
  const scoredIssues = matches.map((issue) => {
    const searchableText = getSearchableText(issue);
    const score = queryWords.filter((word) => searchableText.includes(word)).length;
    return { id: issue.id, score };
  });
  const matchingIds = scoredIssues
    .filter((issue) => queryWords.length === 0 || issue.score > 0)
    .sort((firstIssue, secondIssue) => secondIssue.score - firstIssue.score)
    .map((issue) => issue.id);

  return { issues: getIssueSummaries(matchingIds), publishers, creators, characters };
}

export function useSearchResults(filters: SearchFilters) {
  const { query, publisherId, fromYear, toYear, entityId, kind } = filters;
  const loadSearchResults = useCallback(
    () => getSearchResults({ query, publisherId, fromYear, toYear, entityId, kind }),
    [query, publisherId, fromYear, toYear, entityId, kind],
  );
  return useResource(loadSearchResults, { keepsPreviousValue: true });
}
```


## web/src/features/search


### web/src/features/search/index.ts

```ts title="web/src/features/search/index.ts"
export { SearchPage } from './SearchPage';
```


### web/src/features/search/types.ts

```ts title="web/src/features/search/types.ts"
import type { Character, Creator, IssueSummary, Publisher } from '../../types';

export type SearchFilters = {
  query: string;
  publisherId: string;
  fromYear: string;
  toYear: string;
  entityId: string;
  kind: string;
};

export type SearchResultsModel = {
  issues: IssueSummary[];
  publishers: Publisher[];
  creators: Creator[];
  characters: Character[];
};
```


## web/src/layouts


### web/src/layouts/AppLayout.tsx

```tsx title="web/src/layouts/AppLayout.tsx"
import type { ReactNode } from 'react';
import { classNames } from '../lib/classNames';
import { NavigationRail } from './NavigationRail';
import { TopBar } from './TopBar';

type Props = { children: ReactNode; rightRail?: ReactNode };

export function AppLayout({ children, rightRail }: Props) {
  return (
    <div className="app-frame">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <NavigationRail />
      <div className="app-body">
        <TopBar />
        <div className={classNames('content-layout', Boolean(rightRail) && 'has-right-rail')}>
          <main id="main-content" className="main-content" tabIndex={-1}>{children}</main>
          {rightRail && <aside className="right-rail" aria-label="Releases and publishers">{rightRail}</aside>}
        </div>
        <footer className="app-footer"><span>A universe of stories. All connected.</span><span>StarChart · Demo edition</span></footer>
      </div>
    </div>
  );
}
```


### web/src/layouts/NavigationRail.tsx

```tsx title="web/src/layouts/NavigationRail.tsx"
import { Link, useLocation } from 'react-router';
import { getNavigation } from '../app/navigation';
import { Icon } from '../components/Icon';

export function NavigationRail() {
  const navigation = getNavigation();
  const { pathname } = useLocation();
  return (
    <div className="navigation-rail">
      <Link to="/" className="brand-symbol" aria-label="StarChart home"><Icon name="spark" size={29} /></Link>
      <nav aria-label="Main navigation">
        {navigation.map((entry) => {
          const category = entry.path.split('/')[1];
          const isSameCategory = Boolean(category) && pathname.split('/')[1] === category;
          const isIssueSearch = entry.id === 'search' && pathname.startsWith('/issues/');
          const isActive = pathname === entry.path || isSameCategory || isIssueSearch;
          return (
            <Link key={entry.id} to={entry.path} title={entry.label} aria-label={entry.label} aria-current={isActive ? 'location' : undefined} className={isActive ? 'navigation-link navigation-active' : 'navigation-link'}>
              <Icon name={entry.icon} size={21} />
            </Link>
          );
        })}
      </nav>
      <span className="rail-footnote" aria-hidden="true">S / C</span>
    </div>
  );
}
```


### web/src/layouts/TopBar.tsx

```tsx title="web/src/layouts/TopBar.tsx"
import { Link, useSearchParams } from 'react-router';
import { Icon } from '../components/Icon';
import { SearchBox } from '../components/SearchBox';

export function TopBar() {
  const [parameters] = useSearchParams();
  return (
    <header className="top-bar">
      <Link to="/" className="wordmark">StarChart<span className="wordmark-dot">✦</span></Link>
      <span className="top-bar-caption">Comics, connected.</span>
      <div className="top-bar-search"><SearchBox initialQuery={parameters.get('q') ?? ''} /></div>
      <Link to="/calendar" className="top-bar-calendar" aria-label="View release calendar"><Icon name="calendar" size={20} /></Link>
    </header>
  );
}
```


## web/src/lib


### web/src/lib/buildCalendarMonth.ts

```ts title="web/src/lib/buildCalendarMonth.ts"
export type CalendarCell = { id: string; day?: number };

export function buildCalendarMonth(year: number, month: number): CalendarCell[] {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const leadingDays = (firstWeekday + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cellCount = Math.ceil((leadingDays + daysInMonth) / 7) * 7;
  return Array.from({ length: cellCount }, (_, position) => {
    const day = position - leadingDays + 1;
    if (day < 1 || day > daysInMonth) return { id: `${year}-${month}-blank-${position}` };
    return { id: `${year}-${month}-${day}`, day };
  });
}
```


### web/src/lib/classNames.ts

```ts title="web/src/lib/classNames.ts"
export function classNames(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
```


### web/src/lib/formatPartialDate.ts

```ts title="web/src/lib/formatPartialDate.ts"
import type { PartialDate } from '../types';

export function formatPartialDate(date?: PartialDate): string {
  if (!date) return 'Date unknown';
  if (!date.month) return String(date.year);
  const formattedDate = new Date(Date.UTC(date.year, date.month - 1, date.day ?? 1));
  if (!date.day) {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(formattedDate);
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  }).format(formattedDate);
}
```


### web/src/lib/useResource.ts

```ts title="web/src/lib/useResource.ts"
import { useEffect, useState } from 'react';

export type Resource<Value> =
  | { status: 'loading'; value?: Value }
  | { status: 'error'; value?: undefined }
  | { status: 'ready'; value: Value };

type Loader<Value> = () => Value | Promise<Value>;
type RequestState<Value> = { loader: Loader<Value>; resource: Resource<Value> };
type Options = { keepsPreviousValue?: boolean };

export function useResource<Value>(loader: Loader<Value>, { keepsPreviousValue = false }: Options = {}): Resource<Value> {
  const [request, setRequest] = useState<RequestState<Value>>({ loader, resource: { status: 'loading' } });
  useEffect(() => {
    let isCurrent = true;
    setRequest((previousRequest) => ({
      loader, resource: { status: 'loading', value: keepsPreviousValue ? previousRequest.resource.value : undefined },
    }));
    Promise.resolve().then(loader).then((value) => {
      if (isCurrent) setRequest({ loader, resource: { status: 'ready', value } });
    }).catch(() => {
      if (isCurrent) setRequest({ loader, resource: { status: 'error' } });
    });
    return () => { isCurrent = false; };
  }, [loader, keepsPreviousValue]);
  if (request.loader !== loader) {
    return { status: 'loading', value: keepsPreviousValue ? request.resource.value : undefined };
  }
  return request.resource;
}
```


## web/src


### web/src/main.tsx

```tsx title="web/src/main.tsx"
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { router } from './app/router';
import './app/styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('StarChart root element is missing.');
createRoot(rootElement).render(<StrictMode><RouterProvider router={router} /></StrictMode>);
```


## web/src/types


### web/src/types/domain.ts

```ts title="web/src/types/domain.ts"
export type ContentKind = 'single-issue' | 'collection';
export type FamilyFriendlyLabel = 'FF' | 'NFF' | 'Unknown';
export type CoverTone = 'coral' | 'sage' | 'midnight' | 'ochre' | 'plum' | 'sand';
export type PartialDate = { year: number; month?: number; day?: number };
export type Publisher = { id: string; name: string; initials: string; description: string };
export type Series = {
  id: string; title: string; publisherId: string; description: string;
  started: PartialDate; ended?: PartialDate;
};
export type Creator = { id: string; name: string; roles: string[]; biography: string };
export type Character = {
  id: string; name: string; description: string; firstAppearanceId: string;
  majorSeriesIds: string[]; recentIssueIds: string[];
};
export type CreatorCredit = { creatorId: string; role: string };
export type CoverVariant = { id: string; label: string; tone: CoverTone };
export type AvailabilityLink = {
  id: string; label: string; url: string; kind: 'library' | 'store' | 'reader';
};
export type Issue = {
  id: string; title: string; number: string; seriesId: string;
  kind: ContentKind; familyFriendly: FamilyFriendlyLabel; publishedAt: PartialDate;
  description: string; tone: CoverTone; isCoverMissing: boolean;
  credits: CreatorCredit[]; characterIds: string[]; variants: CoverVariant[];
  relatedIssueIds: string[]; availability: AvailabilityLink[];
};
```


### web/src/types/index.ts

```ts title="web/src/types/index.ts"
export type * from './domain';
export type * from './viewModels';
```


### web/src/types/viewModels.ts

```ts title="web/src/types/viewModels.ts"
import type { AvailabilityLink, ContentKind, CoverTone, FamilyFriendlyLabel, PartialDate } from './domain';

export type CoverModel = {
  title: string; publisherName: string; tone: CoverTone; isMissing: boolean;
  caption: string;
};
export type IssueSummary = {
  id: string; title: string; number: string; seriesId: string; seriesTitle: string;
  publisherId: string; publisherName: string; publishedAt: PartialDate;
  kind: ContentKind; familyFriendly: FamilyFriendlyLabel; cover: CoverModel;
  hasVariants: boolean;
};
export type SeriesSummary = {
  id: string; title: string; publisherName: string; cover: CoverModel;
  started: PartialDate; ended?: PartialDate;
};
export type ResolvedCredit = { id: string; name: string; role: string };
export type VariantCover = { id: string; label: string; cover: CoverModel };
export type IssueDetail = IssueSummary & {
  description: string; credits: ResolvedCredit[]; variants: VariantCover[];
  relatedIssues: IssueSummary[]; availability: AvailabilityLink[];
};
export type ReleaseDay = { date: PartialDate; issues: IssueSummary[] };
```


## web


### web/tsconfig.json

```json title="web/tsconfig.json"
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "types": ["vite/client", "node"]
  },
  "include": ["src", "vite.config.ts"]
}
```


### web/vite.config.ts

```ts title="web/vite.config.ts"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({ plugins: [react(), tailwindcss()] });
```


## Run the supplied project

```sh
cd web
npm ci
npm run dev
```

The fresh Vite scaffold and dependency-install commands are in the complete README above. The branch `ui_test` already exists in this checkout.

## Replace with real data

Replace the bodies of `getDiscover`, `getSearchResults`, `getIssueDetail`, `getPublisherTimeline`, `getReleaseCalendar`, `getCreator`, `getCharacter`, and `getReadingOrder`. Each accepts a promise return without component changes. Update synchronous demo configuration in `getCalendarDefaults` and `getNavigation` as well.

## Commit from the repository root

```sh
git add web
git commit -m "Add StarChart discovery demo"
```
