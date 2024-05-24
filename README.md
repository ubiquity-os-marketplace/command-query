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

## Testing

### Cypress

To test with Cypress Studio UI, run

```shell
yarn cy:open
```

Otherwise to simply run the tests through the console, run

```shell
yarn cy:run
```

### Jest

To start Jest tests, run

```shell
yarn test
```
