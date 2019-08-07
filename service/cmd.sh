#!/bin/sh

# Start Redis server with AOF mode, to persist the DB on App Service storage
redis-server --daemonize yes --appendonly yes --appendfilename "redis.aof" --dir /home

# Start Elixir service
_build/prod/rel/communities/bin/communities foreground
