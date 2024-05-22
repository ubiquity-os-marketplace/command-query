# `@ubiquibot/command-query-user`

This package helps users querying their information, from they wallet address, label access control or current XP.

## Usage

The following commands are allowed:

```shell
/query @user
```

## Configuration
A valid configuration can be like:

```yaml
- plugin: https://ubiquibot-command-query-user.ubq.fi
  type: github
  with:
    allowPublicQuery: true
```

## Testing
### Jest

To start Jest tests, run

```shell
yarn test
```
