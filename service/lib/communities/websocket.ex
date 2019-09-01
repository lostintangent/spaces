defmodule LiveShareCommunities.Websocket do
  @behaviour :cowboy_websocket

  def init(request, _state) do
    # The websocket connection is to be setup at /ws?user_email
    # where user_email is the email of the user.
    state = %{registry_key: request.qs}
    {:cowboy_websocket, request, state}
  end

  def websocket_init(state) do
    Registry.LiveShareCommunities
    |> Registry.register(state.registry_key, {})

    {:ok, state}
  end

  def websocket_handle({:text, message}, state) do
    # Clients can send chat messages that are added to the community store
    incoming = Poison.decode!(message)
    type = incoming["type"]

    if type == "message" do
      LiveShareCommunities.CommunityStore.add_message(incoming["name"], incoming, state[:registry_key])
    end

    {:ok, state}
  end

  def websocket_info(info, state) do
    # Called via the registry, when we want to send something to a subscriber
    {:reply, {:text, info}, state}
  end
end
