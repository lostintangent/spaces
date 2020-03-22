alias LiveShareSpaces.Authentication

defmodule LiveShareSpaces.HTTP do
  @logo "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACECAMAAABvcdPvAAABs1BMVEUAAAAoKCgoKCgoKCgwMDAoKCgoKCgoKCgoKCgoKCgqKiooKCgoKCgpKSkwLzQoKCgoKCgoKCgpKSkpKSkoKCgoKChJQ1gnJycoKCgoKCgqKiooKCgoKCgxLzQ/PEc9OElDPVE7OkM/PUkoKCgnJycoKChFQk8pKSknJyc0MzooKCgxMDRKRFZPTFs5OUIoKChDPVOSfdVUUWUnJycoKCiVfdXz8/P////Ltv+ji+Giks1DPVL9/f1eU355aKkuLTKNd8psXZQ1NTVBQUH4+Pj29vb6+vr19fU2Mz3m5ubBwcGHc79RSGg8N0j8/PyAbbVyYp9lV4nx8fHOzs5NTU1JQl7a2tqnp6fBrfeOjo5XTXQqKitoaGixme2tra2amppcXFyFhYV0dHRFQk86OULCrf7i4uKXgdiioqKBgYFlXXt6enq3pOmqkuelj+Te3t7T09PHx8e0tLSxsbGOgLGqqqqFeKVwcHBZWVlQUFDIs/+9qPm6pPa4oPOsluro6OichNu6urp1ZaN7cJiXl5d7e3tgWnVlZWXs7Oysm9zV1dXIyMidjcWWh71vYJpaVG2Meb5z0YqHAAAANHRSTlMAwID+EPFA0CCgMPtgsP7hcPaQUO1W/OXJqT3beGn+9/Tt2NfCuZyXSvPd3MqUkIx+YFg7fKBMqwAACMhJREFUeNrtW+WX00AcDE3ackBxd3dnE6SpcFVaSmmhQHF3d3f3PxnZNJPd7DZSCF+YD7x3j0tmMj+NnPLHMHIoTghJjlH+EcYQC8mEEiXAD6RGKpFDixMH4jElaownLMZFHYcU4TEi2jiM+E16on1+GBJimhINIGDz5s3mJ0gYN0mJBhDwC+U7jjiMUqIABFC070HCxIjiEKMCLJj7CijJKFojBFgol+8Mk8haIwS0Lf6iYZTabxCHoaBxGFzATxT33UccxissohBgVMq14UhaIwTssATsMihKldfRjChtzLjfHGchwELx2TvE4S+0RmwinACgvKfwd1tjAnPIKQColO78xRGVGEEcaDMCEAe0Royov0BPuiYEcBKu7e3TGpFKQ6tIaOytGZt7MA0elfKtYY8RpS0dS8Lj9Xt69RYMN0rtbt8RtWYA+sKLMrghwB0HeWvUFg7g/XVcPAQIUb4hGVHagsHoeZQNCSqV8444/AH+4ZqIvmTIUdyBkhxSLKwmFk6/2nZ5ixc+nCY9nN/lYjeLhgeK2FasgtxIKMbe3uIDd236d0awi0ccbvVSkRbDCvrTqQM+6A9ctN3fY7roK4Yf0G0FFswJwn+KWLhU5OmLRgAU3yALFlL//fB/sJtFzQx19UCN9sRfw5Se0RH/x0+3ivE916u9Nke/C/Q+sc8WMIYaYNM/eq5LsN22n0t+s2QExn4qwF6mLvb4n+qe/LdCBx+wtsWYdU+DCBzx5t/HXX4lBP8xQpGwBWyz/PfkLzzju25w7DjcW9EUXsBWT/5S2OgDWBITvIAzMv5mTsi/ywhlPzoxL+CIJ//g9p+0V4JJikvAVTF/viHkL4ax394Nk6MUToA8BdLgHzD79w8z96s+BRwkFAPww35sxr4F7CYU1wbl38fY71tA3krAGwy/ERw3bftTmuJXABLg9aD8F0gPWIj9CGjRg+6bg/HD/nGw34+Aeg4JiPgPYP9k2O8tAAG4Phh/13F7rPgXgBFwwkf/qXUPH++Kq+84CSUAFVAoe/Dv2H+YetwVj/7QAjLuAJQFDCdJD8eF9ocWULc2sL4FsL9AgGHp6Ce5nQEFIAONzUBFSA9IR3+jngksIIsVUJIAtb2Eg2z0H9T14AKq1FVTFgDMFkBi/249hIDd7hlQ4bMbAd5N48WMftivBxUAAwqmJAAXQF/dnu8ljGj079T1MAKyLgNMtrmA3pGx+1zhyW3XwwlIuzKgxGU3zo/fr7nsb+ohBKAHvBCuwHtgb54VfBP24/+DC8AeVmYMAD+ymz1g7w4mPag9gQUgBY8JDAB/Ou8umkK3a4en2tTDCcDpnnElCH5kNyRz6EBfcAE7qaG8AeCHvdDMoqXrAwjIIQXZDNgh4IdoINfUBxGwm1/EzB7/XvALFSA9QgtASr9zN8GTIn5EoYreFF4AEqrmMuAY+MVotjKZFtwPJQBdqM3vQXss/ozugUEFtGhJ8zW4o4D664d8NputDySgQ37hDiLADMBGXkqdzXQapIdGJ5PNBxeAIrzGpWDNKrC6mLzeShM3Gq16QAFIgV2IgDMAu8UF0CEypLcHEYDbkQdcBLp9EmB7VUKOsgwi4CAGEWpgn3WuvCDyDeKFRtOvAIz2j2wbtlagrDvnO8QPWgEE5NguYDoysOO+/BzzAVMqlqBvo0Ylxg8lmengW0CeHsBGoEBPkndXN5Acz9/7jxyTIoBfAVk7B1GE+zFiZfNnCOyMhlg8qIAWd0tesg2ouh4ggl7+WlyDBG8BcPWmLQAGZHl+nx/KaKlAAjpsEZi2AWmdhZ3+McULk+I+BaAKdyAHYYAw/vGE4o1RSf8Cquw2VJQYsB1PHf1AowpSPgRwVVgyaiIDmjmLX1MYTJk+efQvTJ4+XqQgEVxAxTgsMqAh4p8dJ05MWMdQrZ86YpLiLaDOtYHeFMiKGlDcWX2x0YSHOuTk2qAAYgHoQ8dRBBfQA5gHmJyjy0HvxOgpChBAwD3ckQwL9tCdrvqbQWRYHEYAGmF5Pz8FsLIkcZqVRI5pIQRgGyjSFDwoMgAFOBl0h06//bJt29u5hxzJGELA0Z6A9/QcdcETVCTYIpvrlPUFxJOr5/LzVHgQXkANNcg/wx/piv9p+g7+4ZFz9BfnIQ9CC7gkSMEGa8AmYuGV6/33y54JU8IKMKUpiAyYYJF8Frx/zlvFqYYVsA+rMBeBcXb7Y/mvcDPb8mBGSAEnBPcCafYzIOsa77L8iAIsCCHAFG1CbBOcYuWflf26C/OpB7FgAs5TAWcFTaBJGRUL0+iPNP/PnNPdoAImhOqE5wUR2M5uFlb9b5G/fZ5Kf0ULJOAwFVD4XQPuTRwpMJOe/bLs/T/2/Nk+BTQd09AQ3Y10mNePqd8GH0IGCjCamRzeCwn2gRq6EJBmcnAW+YW5tAPqYsynu4NfATl7KTXvYw7IBNAd6C39Akki4Otvl0b7EQCLhz+1z15CEcoF+PkCQ0Un8H1rBhz0FnDIeby0EH0IAAOQy3sLUPsLyAdwAOMej9w9BGAO6hJk++VAym7kuIJmQ8oPAUwjnNpXwE60QtmH+d9YC/MZy4R0U/zEEX1gifo7Tr+Pl30HNxbj041J6GRMDHdnMpntKEDXNI6xswgXIM3BZZJ7NgILcIJ+yIpmwcU+ZdhSscEJMIQvGv0JyKOvYSE+1KcRHeq/EIwk1jUcwCzrjwazkU10WHBOHjKyBJRiC8ipL7CwLw6yC4aKheCK2DBEQAhtHLEwNu0LVfZOf4jYQTgjLQEyS5FjVJwEBLIQFqinhV+EVmHAH1aQ4v/eVM0d2PLwnOj6sRRLEzFJAmMODk+qVhTuckF4qaoENdMP2sRA5Px+E7ezaNsT0GfHEguqpnhi5PhkIP6RjP7Rqn1zPPUrnScd3B6rMxVf0BKxtUtjvjCJP3SCCjr6L34G/98AalmGCSOVSLAMF+2ASss1EmizbAmgnwz7I8Co6SoTe7JouRI1poyI90p/+hxN+Y//8MYPhh5YE6I4SBgAAAAASUVORK5CYII="

  use Plug.Router
  require Logger

  plug(Plug.Logger)
  plug(Plug.Parsers, parsers: [:json], json_decoder: Poison)
  plug(Authentication)
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
      "<a href=\"https://github.com/vsls-contrib/spaces\">Live Share Spaces</a>"
    )
  end

  get "/join_redirect/:name" do
    redirect_url = "vsls-contrib.spaces/join?space=#{name}"

    prefix =
      if Map.has_key?(conn.params, "insiders") do
        "vscode-insiders://"
      else
        "vscode://"
      end

    suffix =
      if Map.has_key?(conn.params, "key") do
        key = Map.get(conn.params, "key")
        "&key=#{key}"
      else
        ""
      end

    conn
    |> put_resp_header("Location", "#{prefix}#{redirect_url}#{suffix}")
    |> send_resp(:found, "")
  end

  get "/badge/:name" do
    members = LiveShareSpaces.SpaceStore.members_of(name) |> length

    prefix =
      if Map.has_key?(conn.params, "insiders") do
        "Live Share Space Insiders"
      else
        "Live Share Space"
      end

    badge_name =
      if members > 0 do
        "#{name} (#{members})"
      else
        name
      end

    redirect_url = "https://img.shields.io/badge/#{prefix}-#{badge_name}-8F80CF.svg?logo=#{@logo}"

    conn
    |> put_resp_header("Location", redirect_url)
    |> put_resp_header("Cache-Control", "no-cache, no-store, must-revalidate")
    |> put_resp_header("Pragma", "no-cache")
    |> put_resp_header("Expires", "0")
    |> send_resp(:found, "")
  end

  get "/v0/load" do
    IO.inspect(conn.auth_context)

    conn
    |> send_resp(
      :ok,
      Poison.encode!(LiveShareSpaces.SpaceStore.spaces_with_member(conn.auth_context.email))
    )
  end

  get "/v0/top_spaces" do
    result = LiveShareSpaces.SpaceStore.top_spaces()

    conn
    |> send_resp(:ok, Poison.encode!(result))
  end

  defp join_space(space, member, conn) do
    unless LiveShareSpaces.SpaceStore.member?(space, member["email"]) do
      updated_space = LiveShareSpaces.SpaceStore.add_member(space, member)

      LiveShareSpaces.Events.send(:member_joined, updated_space["name"], %{
        email: member["email"]
      })

      send_resp(conn, :ok, Poison.encode!(updated_space))
    else
      send_resp(conn, :ok, Poison.encode!(space))
    end
  end

  post "/v0/join" do
    %{"name" => space_name, "member" => member} = conn.body_params

    space = LiveShareSpaces.SpaceStore.space(space_name)

    member_blocked = Enum.member?(space["blocked_members"], member["email"])

    if member_blocked do
      send_resp(conn, :forbidden, "Forbidden")
    else
      is_private = space["isPrivate"] === true

      key =
        if Map.has_key?(conn.body_params, "key") do
          conn.body_params["key"]
        else
          ""
        end

      if is_private and key !== space["key"] do
        send_resp(conn, :unauthorized, "Unauthorized")
      else
        join_space(space, member, conn)
      end
    end
  end

  post "/v0/leave" do
    %{"name" => space_name, "member" => member} = conn.body_params
    LiveShareSpaces.SpaceStore.remove_member(space_name, member)
    LiveShareSpaces.Events.send(:member_left, space_name, %{email: member["email"]})

    send_resp(conn, :ok, Poison.encode!(%{}))
  end

  post "/v0/space/:name/session" do
    name = URI.decode(name)
    LiveShareSpaces.SpaceStore.add_session(name, conn.body_params)

    LiveShareSpaces.Events.send(:session_start, name, %{id: conn.body_params["id"]})

    send_resp(conn, :ok, Poison.encode!(conn.body_params))
  end

  post "/v0/space/:name/thanks" do
    name = URI.decode(name)
    %{"from" => from, "to" => to} = conn.body_params
    LiveShareSpaces.SpaceStore.say_thanks(name, from, to)
    send_resp(conn, :ok, Poison.encode!(%{}))
  end

  delete "/v0/space/:name/session/:session_id" do
    name = URI.decode(name)
    session = LiveShareSpaces.SpaceStore.session(name, session_id)

    LiveShareSpaces.SpaceStore.remove_session(name, session_id)

    if session do
      LiveShareSpaces.Events.send(:session_end, name, %{session: session})
    end

    send_resp(conn, :ok, Poison.encode!(%{}))
  end

  get "/v0/space/:name/messages" do
    name = URI.decode(name)
    messages = LiveShareSpaces.SpaceStore.messages_of(name)
    send_resp(conn, :ok, Poison.encode!(messages))
  end

  delete "/v0/space/:name/messages" do
    name = URI.decode(name)
    LiveShareSpaces.SpaceStore.clear_messages(name)
    send_resp(conn, :ok, Poison.encode!(%{}))
  end

  get "/v0/debug" do
    store = LiveShareSpaces.SpaceStore.total_everything()
    send_resp(conn, :ok, Poison.encode!(store))
  end

  get "/v0/debug-spaces" do
    store = LiveShareSpaces.SpaceStore.everything()
    send_resp(conn, :ok, Poison.encode!(store))
  end

  get "/v0/debug-profiles" do
    store = LiveShareSpaces.SpaceStore.everything()
    send_resp(conn, :ok, Poison.encode!(store))
  end

  get "/v0/debug-profile" do
    store = LiveShareSpaces.ProfileStore.everything()
    send_resp(conn, :ok, Poison.encode!(store))
  end

  # TODO: Ensure the following are only callable by
  # the specified space's founder
  post "/v0/space/:name/private" do
    name = URI.decode(name)
    %{"key" => key} = conn.body_params
    LiveShareSpaces.SpaceStore.make_private(name, key)
    send_resp(conn, :ok, Poison.encode!(%{}))
  end

  post "/v0/space/:name/public" do
    name = URI.decode(name)
    LiveShareSpaces.SpaceStore.make_public(name)
    send_resp(conn, :ok, Poison.encode!(%{}))
  end

  post "/v0/space/:name/readme" do
    name = URI.decode(name)
    LiveShareSpaces.SpaceStore.update_readme(name, conn.body_params["readme"])
    send_resp(conn, :ok, Poison.encode!(%{}))
  end

  post "/v0/space/:name/promote_member" do
    name = URI.decode(name)
    %{"member" => member} = conn.body_params
    LiveShareSpaces.SpaceStore.promote_member(name, member)
    send_resp(conn, :ok, Poison.encode!(%{}))
  end

  post "/v0/space/:name/demote_member" do
    name = URI.decode(name)
    %{"member" => member} = conn.body_params
    LiveShareSpaces.SpaceStore.demote_member(name, member)
    send_resp(conn, :ok, Poison.encode!(%{}))
  end

  post "/v0/space/:name/block_member" do
    name = URI.decode(name)
    %{"member" => member} = conn.body_params
    LiveShareSpaces.SpaceStore.block_member(name, member)
    LiveShareSpaces.Events.send(:member_left, name, %{email: member})
    send_resp(conn, :ok, Poison.encode!(%{}))
  end

  post "/v0/space/:name/unblock_member" do
    name = URI.decode(name)
    %{"member" => member} = conn.body_params
    LiveShareSpaces.SpaceStore.unblock_member(name, member)
    send_resp(conn, :ok, Poison.encode!(%{}))
  end

  match _ do
    send_resp(conn, :not_found, "404!")
  end
end
