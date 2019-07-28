defmodule LiveShareCommunities do
  @moduledoc "The main OTP application for LiveShareCommunities"

  use Application

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    children = [
      worker(LiveShareCommunities.Endpoint, [])
    ]

    opts = [strategy: :one_for_one, name: HexVersion.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
