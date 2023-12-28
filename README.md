# nextjs-mailmerge

# Getting Started

## Setup Google Cloud Project

- Create a new Project at [https://console.cloud.google.com/](https://console.cloud.google.com/)

- Go to
  [https://console.cloud.google.com/apis/dashboard](https://console.cloud.google.com/apis/dashboard),
  this will lead you to the `APIs & Services`.

- Enable `Gmail API` at `Enabled APIs & services`.

- Go to [Credentials](https://console.cloud.google.com/apis/credentials), you
  will see `+ CREATE CREDENTIALS` button at the top bar.

- Create API Key
  
- Create OAuth client ID
    - Application type: Web application
    - Set `Authorized JavaScript origins` to your host address
    - Click `CREATE` button
    - Grab Client ID


## Setup `.env` files

We need the following environment variables, and fill in the values form
previous section.

```
NEXT_PUBLIC_API_KEY=<API_KEY>
NEXT_PUBLIC_CLIENT_ID=<CLIENT_ID>
```


## Run

```bash
pnpm install
pnpm dev
```


# How to use

## Edit Template Tab
The string surrounded with `{{` and `}}` are considered placeholder for
variables.
For example, `{{FirstName}}` will be replaced with the `FirstName` property of
user data.

You can edit subject template and body template (using markdown editor)

The subject template and body template is stored in local storage, and they will be
kept at the next time you open the app.

## Import Tab

Once you import the `.csv` file, the rows will be displayed in the table.

The csv file must have headers.

*NB: The first column is considered as user's email regardless of the header name.*
