defmodule LiveShareCommunities do
  @moduledoc "The main OTP application for LiveShareCommunities"

  @db_location "store.sqlite3"

  use Application

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    Sqlitex.with_db(@db_location, fn(db) ->
      Sqlitex.query(db, "CREATE TABLE IF NOT EXISTS kv (key text unique, value text)")
    end)

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
      worker(Sqlitex.Server, [@db_location, [name: Store.DB]])
    ]

    opts = [strategy: :one_for_one, name: HexVersion.Supervisor]
    Supervisor.start_link(children, opts)
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
