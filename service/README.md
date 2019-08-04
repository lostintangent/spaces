# Live Share Communities

This hosts the code for the service, written in Elixir.

## Usage

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

```
sh deploy.sh
```
