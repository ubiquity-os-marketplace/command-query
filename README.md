# `@ubiquibot/command-query-user`

This package helps users querying their information, from they wallet address, label access control or current XP.

## Usage

The following commands are allowed:

```shell
/query @user
```

## Running locally
### Worker
Start the Worker by running
```shell
yarn dev
```

### Make requests
To trigger the worker, `POST` requests should be made to http://localhost:4000 with a `Content-Type: application/json`
header and a body looking like
```json
{
  "stateId": "",
  "eventName": "",
  "eventPayload": "",
  "settings": "",
  "ref": ""
}
```
For convenience, you can find an `.http` file with a valid request [here](/tests/http/request.http).

## Configuration
A valid configuration can be like:

```yaml
- plugin: https://ubiquibot-command-query-user.ubq.fi
  with:
    allowPublicQuery: true
```

## Testing
### Jest

To start Jest tests, run

```shell
yarn test
```
