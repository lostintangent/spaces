defmodule LiveShareCAN do
  @moduledoc "The main OTP application for LiveShareCAN"

  use Application

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    children = [
      worker(LiveShareCAN.Endpoint, [])
    ]

    opts = [strategy: :one_for_one, name: HexVersion.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
