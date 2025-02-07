# `@ubiquity-os-marketplace/command-query-user`

This package helps users querying their information, from they wallet address, label access control or current XP.

## Technical Architecture

### Core Components

- **GitHub Bot Integration**: Built as a Cloudflare Worker that processes GitHub comment webhooks
- **Supabase Database**: Stores user-related data including:
  - Wallet addresses
  - Access control labels
  - User permissions
- **Access Control**: Supports both public queries and repository collaborator-only queries
- **Type Safety**: Comprehensive TypeScript implementation with runtime type validation using TypeBox

### Key Technologies

- **Runtime**: Cloudflare Workers (Edge Computing Platform)
- **Database**: Supabase (PostgreSQL)
- **Framework**: Hono (Lightweight web framework)
- **SDK**: @ubiquity-os/plugin-sdk for standardized plugin development
- **Type Validation**: @sinclair/typebox for runtime type checking
- **GitHub Integration**: @octokit/rest for GitHub API interactions

### Command Processing Flow

1. Webhook receives GitHub comment event
2. Command parser validates the syntax (/query @user)
3. Access control check (if enabled)
4. User data retrieval from Supabase
5. Response formatting and posting as GitHub comment

## Usage

The following commands are allowed:

```shell
/query @user
```

Response Format:

```markdown
| Property | Value |
| -------- | ----- |
| Wallet   | 0x... |
| Access   | [...] |
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

### Configuration Options

- `allowPublicQuery`: Enable/disable public user queries
- `logLevel`: Set logging verbosity (INFO, ERROR, etc.)

## Testing

### Jest

To start Jest tests, run

```shell
yarn test
```

### Development Requirements

- Node.js >=20.10.0
- Yarn package manager
- Supabase CLI (for local development)
