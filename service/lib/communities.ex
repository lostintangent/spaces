defmodule LiveShareCommunities do
  @moduledoc "The main OTP application for LiveShareCommunities"

  use Application

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    children = [
      Plug.Cowboy.child_spec(:http, LiveShareCommunities.HTTP, [], dispatch: dispatch()),
      worker(LiveShareCommunities.Store, [])
    ]

    opts = [strategy: :one_for_one, name: HexVersion.Supervisor]
    Supervisor.start_link(children, opts)
  end

  defp dispatch do
    [
      {:_,
       [
         {"/ws", LiveShareCommunities.Websocket, []},
         {:_, Plug.Adapters.Cowboy.Handler, {LiveShareCommunities.HTTP, []}}
       ]}
    ]
  end
end
