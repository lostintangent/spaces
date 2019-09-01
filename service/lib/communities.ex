defmodule LiveShareCommunities do
  @moduledoc "The main OTP application for LiveShareCommunities"

  use Application

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    children = [
      Plug.Cowboy.child_spec(
        scheme: :http,
        plug: LiveShareCommunities.HTTP,
        options: [dispatch: dispatch()]
      ),
      Registry.child_spec(
        keys: :duplicate,
        name: Registry.LiveShareCommunities
      ),
      {Redix, name: :redix}
    ]

    opts = [strategy: :one_for_one, name: HexVersion.Supervisor]
    result = Supervisor.start_link(children, opts)

    # temporary call to migrate the old community keys
    LiveShareCommunities.CommunityStore.migrate_old_community_keys()

    result
  end

  defp dispatch do
    [
      {:_,
       [
         {"/ws", LiveShareCommunities.Websocket, []},
         {:_, Plug.Cowboy.Handler, {LiveShareCommunities.HTTP, []}}
       ]}
    ]
  end
end
