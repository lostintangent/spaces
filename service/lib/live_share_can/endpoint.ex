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
    {:ok, _} = Agent.start_link(fn -> %{} end, name: :store)
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

  def member(name, email) do
    %{"name" => name, "email" => email}
  end

  def community(name, members) do
    %{"name" => name, "members" => members}
  end

  def add_member(communities, community_name, name, email) do
    # TODO: de-dupe if email already exists
    members = Map.get(communities, community_name, [])

    Map.merge(
      communities,
      %{community_name => Enum.concat(members, [member(name, email)])}
    )
  end

  def remove_member(communities, community_name, email) do
    members = Map.get(communities, community_name, [])

    Map.merge(
      communities,
      %{community_name => Enum.filter(members, fn x -> x["email"] != email end)}
    )
  end

  get "/v0/load" do
    conn = Plug.Conn.fetch_query_params(conn)

    result =
      if Map.has_key?(conn.params, "names") do
        conn.params
        |> Map.get("names")
        |> String.split(",")
        |> Enum.filter(fn x -> String.length(x) > 0 end)
        |> Enum.map(fn x -> community(x, Agent.get(:store, fn y -> Map.get(y, x, []) end)) end)
      else
        []
      end

    conn
    |> send_resp(200, Poison.encode!(result))
  end

  post "/v0/join" do
    member = conn.body_params["member"]
    community_name = conn.body_params["name"]

    Agent.update(:store, fn x ->
      add_member(x, community_name, member["name"], member["email"])
    end)

    community = Agent.get(:store, fn x -> Map.get(x, community_name, []) end)
    send_resp(conn, 200, Poison.encode!(community))
  end

  post "/v0/leave" do
    member = conn.body_params["member"]
    community_name = conn.body_params["name"]

    Agent.update(:store, fn x ->
      remove_member(x, community_name, member["email"])
    end)

    send_resp(conn, 200, Poison.encode!(%{}))
  end

  match _ do
    send_resp(conn, 404, "404!")
  end
end
