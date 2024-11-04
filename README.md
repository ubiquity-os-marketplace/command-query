# `@ubiquity-os-marketplace/command-query-user`

This package helps users querying their information, from they wallet address, label access control or current XP.

## Usage

The following commands are allowed:

```shell
/query @user
```

## Running locally
### Supabase types
You can run the type generations against a local database with
```shell
yarn supabase:generate:local
```
Or against an instance by setting the `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_ID` in your `.env` file
```shell
yarn prebuild
```

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
- plugin: https://os.ubq.fi/command-query
  with:
    allowPublicQuery: true
    logLevel: INFO
```

## Testing
### Jest

To start Jest tests, run

```shell
yarn test
```