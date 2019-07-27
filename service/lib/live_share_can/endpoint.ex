defmodule LiveShareCAN.Endpoint do
  use Plug.Router
  require Logger

  plug(Plug.Logger)
  plug(Plug.Parsers, parsers: [:json], json_decoder: Poison)
  plug(:match)
  plug(:dispatch)

  def init(options) do
    options
  end

  def start_link do
    # This starts Cowboy listening on the default port of 4000
    {:ok, _} = Plug.Adapters.Cowboy.http(__MODULE__, [])
    {:ok, _} = Agent.start_link(fn -> [] end, name: :store)
  end

  get "/" do
    # Agent.update(:store, fn list -> ["test" | list] end)
    # Agent.get(:store, fn list -> list end)

    conn
    |> send_resp(
      200,
      "<a href=\"https://github.com/vsls-contrib/communities\">Live Share Communities</a>"
    )
  end

  def init do
    # Map with key as community name and value as list of members in the community
    %{}
  end

  def member(name, email) do
    %{"name" => name, "email" => email}
  end

  def community(name) do
    %{"name" => name, "members" => [member("Arjun Attam", "foo@bar.com")]}
  end

  def add_member(community, name, email) do
    Map.merge(community, %{"members" => Enum.concat(community["members"], [member(name, email)])})
  end

  get "/v0/load" do
    conn = Plug.Conn.fetch_query_params(conn)
    names = String.split(conn.params["names"], ",")

    result =
      names
      |> Enum.map(&community(&1))

    conn
    |> send_resp(200, Poison.encode!(result))
  end

  post "/v0/join" do
    member = conn.body_params["member"]
    result = add_member(community(conn.body_params["name"]), member["name"], member["email"])
    send_resp(conn, 200, Poison.encode!(result))
  end

  post "/v0/leave" do
    send_resp(conn, 200, Poison.encode!(%{}))
  end

  match _ do
    send_resp(conn, 404, "404!")
  end
end
