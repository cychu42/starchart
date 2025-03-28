# Contributing

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Node.js v22 LTS](https://nodejs.org/en/download/)

We recommend using a Node.js version manager:

- [nvm](https://github.com/nvm-sh/nvm) (Linux, MacOS, WSL)
- [fnm](https://github.com/Schniz/fnm) (Linux, MacOS, Windows)

## Setup

1. Create a .env based on the example.

   ```bash
   cp .env.example .env
   ```

2. Install and use the project's supported Node.js version.

   With nvm:

   ```bash
   nvm install
   ```

   With fnm:

   ```bash
   fnm install
   ```

3. Start backing services with Docker.

   ```bash
   npm run docker
   ```

   This starts MySQL, Redis, Route53, a Let's Encrypt server, Mailhog, and a SAML IDP. Wait for the services to finish starting, it takes a while before they're ready.

4. Install dependencies.

   ```bash
   npm install
   ```

5. Setup the database.

   ```bash
   npm run setup
   ```

6. Start the app on localhost:8080.

   ```bash
   npm run dev
   ```

7. When done, stop and remove containers.

   ```bash
   docker compose down
   ```

## Testing

### Unit testing

We use [Vitest](https://vitest.dev/) for unit testing.

Assuming your development environment has been set up, follow these steps to run unit tests:

1. Start backing services with Docker, if not already running.

   ```bash
   npm run docker
   ```

2. Setup the test database.

   ```bash
   npm run setup:test
   ```

3. Run the unit tests.

   ```bash
   npm run test
   ```

4. When done, stop and remove containers.

   ```bash
   docker compose down
   ```

### End-to-end testing

We use [Playwright](https://playwright.dev/) for end-to-end testing.

Assuming your development environment has been set up, follow these steps to run end-to-end tests:

1. Start backing services with Docker, if not already running.

   ```bash
   npm run docker
   ```

2. Run the end-to-end tests. There are two ways to do this:

   i. Build the app, start it, and run the tests. This is the same script that is used by our CI E2E tests.

   ```bash
   npm run test:e2e:run
   ```

   ii. Run Playwright in UI mode to explore, run, and debug end-to-end tests with a time travel experience complete with a watch mode. This runs the app using the dev server (without building).

   ```bash
   npm run e2e
   ```

   If prompted to run `npx playwright install`, do so. This will install browsers used by Playwright for testing.

#### Debugging failures in CI

Playwright is configured to generate a report for test failures. This report is available to download from the GitHub Actions Summary page for the failed test run, and contains video(s) and trace(s) of the failed test(s).

See [our wiki page for information about how to download and use this report](https://github.com/DevelopingSpace/starchart/wiki/Playwright#debugging-ci-failures).

## Authentication

The development SAML IDP is configured with a few default accounts for development and testing. The usernames and passwords are:

| user     | pass      |
| -------- | --------- |
| user1    | user1pass |
| user2    | user2pass |
| user3    | user3pass |
| han.solo | starchart |

These can be configured in `./config/simplesamlphp-users`.

## View and edit the database

You can use Prisma Studio as a visual editor for the data in the database:

Development database:

```bash
npm run db:studio
```

Test database:

```bash
npm run db:studio:test
```

## Reset the database

To reset the database or in case of errors during database startup, delete the `docker/volumes/mysql-data/` directory and re-run `npm run setup`.

## Configure environment variables and secrets

Some application configuration is managed via environment variables, and some via secrets (i.e., files).

Your `.env` file should define any environment variables you want to use via `process.env`. For example, the line `MY_ENV_VAR=data` in `.env` will mean that `process.env.MY_ENV_VAR` is available at runtime with `data` as its value.

For secrets, we use [docker-secret](https://github.com/hwkd/docker-secret) to load and expose secrets via Docker Swarm's [secrets](https://docs.docker.com/engine/swarm/secrets/), which are files that get mounted into the container at `/run/secrets/`.

### Using custom secrets

In development, you can override the Docker secrets used by the app with your own by adding `SECRETS_OVERRIDE=1` to your `.env` file. This will load secrets from the `dev-secrets/` directory instead of using Docker Swarm secrets. The `dev-secrets/` folder contains files exposed as secrets to the running app.

To add a secret, for example, a secret named `MY_SECRET` with a value of `this-is-secret`:

1. Create a new file at `dev-secrets/MY_SECRET` with the contents `this-is-secret`.
2. In your code, import secrets with `import secrets from '~/lib/secrets.server'`.
3. In your code, use your secret with `secrets.MY_SECRET`.

## Workflow

Please follow the [GitHub flow][] for contributions:

1. **Fork and clone the repository**

   i. If you are an external contributor, fork the repository. See [Fork a repository](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo).

   ii. Clone the repository using `git clone`.

2. **Update your local main branch**

   ```bash
   git switch main
   git pull --prune
   ```

   Switch to your main branch and pull the latest changes from the remote repository. The `--prune` option removes any references to branches that no longer exist on the remote.

3. **Create a new branch from main**

   ```bash
   git switch -c <issue-number> main
   ```

   Name your branch following the convention `issue-number` (e.g., `issue-1`). If no issue exists for the change you are making, you should [create one][Create an issue], unless the change is really quick or small.

4. **Make your changes, commit, and push**

   You should commit your changes as you're making them. Commit often - smaller commits are generally better. Ideally, each commit contains an isolated, complete change. This makes it easy to revert your changes if you decide to take a different approach. Avoid cosmetic changes to unrelated files in the same commit. If introducing new code, add tests for your changes.

   i. **Review your changes:** Check which files have been changed.

   ```bash
   git status
   ```

   ii. **Stage your changes:** Add the relevant files to the index.

   ```bash
   git add <files>
   ```

   iii. **Commit your changes:** Give each commit a descriptive message to help you and future contributors understand what changes the commit contains.

   ```bash
   git commit -m "<commit message>"
   ```

   iv. **Push your branch:** Push your changes and set the upstream branch.

   ```bash
   git push -u origin <your-branch-name>
   ```

   After you do this for the first time for your branch, your branch now exists on the remote repository, and commits can be pushed with `git push`.

   v. **Create a draft pull request:** [Create a draft pull request][] on GitHub to let others know you're working on the issue and to request feedback on your work as you're working on it. Link your pull request to the issue using [closing keywords][]:

   ```txt
   Fixes #[issue number]
   ```

   vi. Continue making changes, committing them, and pushing them until your changes are ready for review.

5. **Mark your pull request ready for review**

   Once your changes are ready for review, in the merge box, click Ready for review.

   ![ready-for-review-button](https://docs.github.com/assets/cb-62675/mw-1440/images/help/pull_requests/ready-for-review-button.webp)

## Wiki

You can visit our [wiki](https://github.com/DevelopingSpace/starchart/wiki/) for more useful documentation.

## Resources

- [How to Contribute to Open Source][]
- [Using Pull Requests][]
- [GitHub Docs][]

[GitHub flow]: https://docs.github.com/en/get-started/using-github/github-flow
[Create an issue]: https://github.com/DevelopingSpace/starchart/issues/new
[Create a draft pull request]: https://github.com/DevelopingSpace/starchart/compare
[closing keywords]: https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword
[How to Contribute to Open Source]: https://opensource.guide/how-to-contribute/
[Using Pull Requests]: https://docs.github.com/en/free-pro-team@latest/github/collaborating-with-issues-and-pull-requests/about-pull-requests
[GitHub Docs]: https://docs.github.com/
