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

**Recommended setup**:

```JS
schedule(flow({
  modified: "warn",
  created: "fail"
}))
```

This will fail the build for any newly introduced file that isn't flow typed, but will only warn the developer if they touch a file that's not flow typed. This is what we use because it can be hard to type legacy code, but we want to ensure every newly incoming code is properly typed.

#### `blacklist`

Blacklist certain globs from being checked:

```JS
schedule(flow({
  blacklist: ['dist/**/*.js']
}))
```

#### `created`

Decide whether you want to warn, fail or ignore newly created files that are untyped:

```JS
schedule(flow({
  created: "warn"
}))

schedule(flow({
  created: "fail"
}))

schedule(flow({
  created: false
}))
```

#### `modified`

Decide whether you want to warn, fail or ignore modified files that are untyped:

```JS
schedule(flow({
  modified: "warn"
}))

schedule(flow({
  modified: "fail"
}))

schedule(flow({
  modified: false
}))
```

## Changelog

See the GitHub [release history](https://github.com/withspectrum/danger-plugin-flow/releases).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
