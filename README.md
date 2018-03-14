# danger-plugin-flow

[![Build Status](https://travis-ci.org/withspectrum/danger-plugin-flow.svg?branch=master)](https://travis-ci.org/withspectrum/danger-plugin-flow)
[![npm version](https://badge.fury.io/js/danger-plugin-flow.svg)](https://badge.fury.io/js/danger-plugin-flow)

> Ensure all new `.js` files in a project are flow typed

## Usage

Install:

```sh
yarn add danger-plugin-flow --dev
```

At a glance:

```js
// dangerfile.js
import { schedule } from 'danger'
import flow from 'danger-plugin-flow'

schedule(flow());
```

### Options

#### `blacklist`

Blacklist certain globs from being checked:

```JS
schedule(flow({
  blacklist: ['dist/**/*.js']
}))
```

#### `warn`

Warn if files are untyped rather than failing:

```JS
schedule(flow({
  warn: true
}))
```

#### `modified`

Don't include modified files, only newly created ones:

```JS
schedule(flow({
  modified: false
}))
```

## Changelog

See the GitHub [release history](https://github.com/withspectrum/danger-plugin-flow/releases).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
