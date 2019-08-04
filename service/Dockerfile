# Reference: https://hexdocs.pm/distillery/guides/working_with_docker.html

# Build stage
FROM bitwalker/alpine-elixir:latest

# Install sqlite
RUN apk update \
    && apk add sqlite-dev \
    && apk add build-base

# Copy source
COPY . .

# Install dependencies and build release
RUN export MIX_ENV=prod && \
    rm -rf _build && \
    rm -rf deps && \
    mix deps.get && \
    mix distillery.release

# Set environment variables and expose port
EXPOSE 4000
ENV REPLACE_OS_VARS=true \
    PORT=4000

CMD trap 'exit' INT; _build/prod/rel/communities/bin/communities foreground
