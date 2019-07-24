# Reference: https://gist.github.com/wmnnd/dfc888e965a877e247a7c8f5ad3dab1c#file-dockerfile

# Build stage
FROM bitwalker/alpine-elixir:latest

# Copy source
COPY . .

# Install dependencies and build release
RUN export MIX_ENV=prod && \
    rm -Rf _build && \
    mix deps.get && \
    mix distillery.release

# Set environment variables and expose port
EXPOSE 4000
ENV REPLACE_OS_VARS=true \
    PORT=4000

CMD ["_build/prod/rel/live_share_can/bin/live_share_can", "foreground"]
