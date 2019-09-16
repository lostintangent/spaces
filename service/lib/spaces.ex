defmodule LiveShareSpaces do
  @moduledoc "The main OTP application for LiveShareSpaces"

  use Application

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    children = [
      Plug.Cowboy.child_spec(
        scheme: :http,
        plug: LiveShareSpaces.HTTP,
        options: [dispatch: dispatch()]
      ),
      Registry.child_spec(
        keys: :duplicate,
        name: Registry.LiveShareSpaces
      ),
      {Redix, name: :redix}
    ]

    opts = [strategy: :one_for_one, name: HexVersion.Supervisor]
    result = Supervisor.start_link(children, opts)

    # Temporary migration for empty private communities that are unusable
    LiveShareSpaces.SpaceStore.migrate_empty_private_spaces()

    result
  end

  defp dispatch do
    [
      {:_,
       [
         {"/ws", LiveShareSpaces.Websocket, []},
         {:_, Plug.Cowboy.Handler, {LiveShareSpaces.HTTP, []}}
       ]}
    ]
  end
end
