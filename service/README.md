# Live Share Collaboration Area Networks

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

### Release

```
mix distillery.release
```

See commands in printed out to run service in foreground.
