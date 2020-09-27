# Live Share Spaces

This hosts the code for the service, written in Elixir.

- [Development](#development)
- [Deployment](#deployment)
  - [Logs](#logs)

## Development

Requires Elixir and Mix.

```
mix -v
Erlang/OTP 21 [erts-10.3.1] [source] [64-bit] [smp:4:4] [ds:4:4:10] [async-threads:1] [hipe] [dtrace]

Mix 1.8.1 (compiled with Erlang/OTP 21)
```

### Install dependencies

```
mix deps.get
```

### Run the service for development

```
redis-server
iex -S mix
```

Open http://localhost:4000

### Build release

```
mix distillery.release
```

See commands in printed out to run service in foreground.

### Run docker

```
docker build .
```

For the created container id, run it with the exposed port.

```
docker run -it -p 4000:4000 8149677643a1
```

To run `sh` in the container

```
docker run -it -p 4000:4000 8149677643a1 /bin/sh
```

## Deployment

This app is deployed to Azure App Service. To start a new deployment, run:

```
sh deploy.sh
```

### Logs

Use this [direct link](https://ms.portal.azure.com/#@microsoft.onmicrosoft.com/resource/subscriptions/41d63c49-c2fb-4a5b-86ee-ba56db9b3af5/resourceGroups/vslsCommunitiesResourceGroup/providers/Microsoft.Web/sites/vslsCommunitiesWebapp/logStream) to see live logs from the app.

Or, use the following steps:

- Open Azure Portal
- Open Azure App Service and find this app (`vslsCommunitiesWebapp`)
- Click **Log stream** from the left sidebar (under Monitoring section) to see live logs
