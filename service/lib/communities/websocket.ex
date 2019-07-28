defmodule LiveShareCommunities.Websocket do
  @behaviour :cowboy_websocket_handler

  def init(_, _req, _opts) do
    # state = %{registry_key: request.path}
    {:upgrade, :protocol, :cowboy_websocket}
  end

  # terminate if no activity for one minute
  @timeout 60000

  # Called on websocket connection initialization.
  def websocket_init(_type, req, _opts) do
    IO.inspect("init")
    IO.inspect(req)
    state = %{}
    LiveShareCommunities.Store.register_subscriber("test1", req)
    {:ok, req, state, @timeout}
  end

  # Handle other messages from the browser - don't reply
  def websocket_handle({:text, message}, req, state) do
    IO.puts(message)
    # {:ok, req, state}
    {:reply, {:text, "pong"}, req, state}
  end

  # Format and forward elixir messages to client
  def websocket_info(message, req, state) do
    {:reply, {:text, message}, req, state}
  end

  # No matter why we terminate, remove all of this pids subscriptions
  def websocket_terminate(_reason, req, _state) do
    IO.inspect("terminate")
    IO.inspect(req)
    LiveShareCommunities.Store.deregister_subscriber("test1")
  end
end
