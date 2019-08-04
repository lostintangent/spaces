defmodule LiveShareCommunities.HTTP do
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
  end

  get "/" do
    conn
    |> send_resp(
      :ok,
      "<a href=\"https://github.com/vsls-contrib/communities\">Live Share Communities</a>"
    )
  end

  get "/join_redirect/:name" do
    redirect_url = "lostintangent.vsls-communities/join?#{name}"

    prefix =
      if Map.has_key?(conn.params, "insiders") do
        "vscode-insiders://"
      else
        "vscode://"
      end

    conn
      |> put_resp_header("Location", "#{prefix}#{redirect_url}")
      |> send_resp(:found, "")
  end

  get "/v0/load" do
    result =
      if Map.has_key?(conn.params, "names") do
        conn.params
        |> Map.get("names")
        |> String.split(",")
        |> Enum.filter(fn x -> String.length(x) > 0 end)
        |> Enum.map(&LiveShareCommunities.Store.community(&1))
      else
        []
      end

    conn
    |> send_resp(:ok, Poison.encode!(result))
  end

  get "/v0/top_communities" do
    result = LiveShareCommunities.Store.top_communities()

    conn
    |> send_resp(:ok, Poison.encode!(result))
  end

  post "/v0/join" do
    member = conn.body_params["member"]
    community_name = conn.body_params["name"]

    LiveShareCommunities.Store.add_member(community_name, member)
    community = LiveShareCommunities.Store.community(community_name)
    send_resp(conn, :ok, Poison.encode!(community))
  end

  post "/v0/leave" do
    member = conn.body_params["member"]
    community_name = conn.body_params["name"]

    LiveShareCommunities.Store.remove_member(community_name, member)
    send_resp(conn, :ok, Poison.encode!(%{}))
  end

  post "/v0/community/:name/session" do
    LiveShareCommunities.Store.add_session(name, conn.body_params)
    send_resp(conn, :ok, Poison.encode!(conn.body_params))
  end

  delete "v0/community/:name/session/:session_id" do
    LiveShareCommunities.Store.remove_session(name, session_id)
    send_resp(conn, :ok, Poison.encode!(%{}))
  end

  get "v0/community/:name/messages" do
    messages = LiveShareCommunities.Store.messages_of(name)
    send_resp(conn, :ok, Poison.encode!(messages))
  end

  get "/v0/debug" do
    store = LiveShareCommunities.Store.everything()
    send_resp(conn, :ok, Poison.encode!(store))
  end

  match _ do
    send_resp(conn, :not_found, "404!")
  end
end
