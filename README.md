# semverity

[![npm version](https://img.shields.io/npm/v/semverity)](https://www.npmjs.com/package/semverity)

zero-config tool for semantic version bump from git conventional commits history

# Installation

Install globally:

```sh
npm i -g semverity
```

Or run with [npx](https://docs.npmjs.com/cli/v8/commands/npx):

```sh
npx semverity
```

# Usage

Bump version from git [conventional commits](https://www.conventionalcommits.org) history:

```sh
semverity bump [semver]
```

Pass **semver** positional argument if you want to offset version.

Bump and patch files with new version:

```sh
semverity patch [semver]
```

# Examples

Your package have version is `0.0.1` and commit `feat: some feature` with sha `1234abcd`:

```sh
semverity patch

cat package.json # and package-lock.json pathed by default
{
    ...
    "version": "0.1.0+sha.1234abcd",
    ...
}
```

You can specify custom list of files (and dot-notated comma-separated object paths to be patched after **:** symbol):

```sh
semverity patch --files package.json package-lock.json:version,packages..version info.json:meta.version copyright.txt
```

It will also replace all previous `*0.0.1*` strings into `0.1.0+sha.1234abcd` in copyright.txt because it's not json-parseable.
You can also pass `meta.json:` with empty path to `.replaceAll()` with new version.

To automatically commit patched files with `bump: 0.1.0+sha.1234abcd` use:

```sh
semverity patch --commit bump
```
