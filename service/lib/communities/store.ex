defmodule LiveShareCommunities.Store do
  @top_communities_count 5
  @key_prefix "communitiy"

  def everything() do
    {:ok, keys} = Redix.command(:redix, ["KEYS", get_community_key("*")])

    Enum.map(keys, fn x ->
      {:ok, value} = Redix.command(:redix, ["GET", x])

      %{
        "name" => x,
        "value" => Poison.decode!(value)
      }
    end)
  end

  defp update(name, fun) do
    communitiy_key = get_community_key(name)
    {:ok, value} = Redix.command(:redix, ["GET", communitiy_key])

    community =
      if value do
        Poison.decode!(value)
      else
        %{}
      end

    updated_community = fun.(community)
    {:ok, _} = Redix.command(:redix, ["SET", communitiy_key, Poison.encode!(updated_community)])
    inform_subscribers(name)
  end

  defp inform_subscribers(community_name) do
    members_of(community_name)
    |> Enum.map(&Map.get(&1, "email"))
    |> Enum.map(fn x ->
      Registry.LiveShareCommunities
      |> Registry.dispatch(x, fn entries ->
        for {pid, _} <- entries do
          # Send the community with its updated members/sessions to the subscriber
          Process.send(pid, Poison.encode!(community(community_name)), [])
        end
      end)
    end)
  end

  def community(name) do
    {:ok, value} = Redix.command(:redix, ["GET", get_community_key(name)])

    community =
      if value do
        Poison.decode!(value)
      else
        %{}
      end

    community
      |> Map.update("name", name, & &1)
      |> Map.update("members", [], & &1)
      |> Map.update("sessions", [], & &1)
      |> Map.update("messages", [], & &1)
      |> update_with_titles()
      |> update_with_thanks_count()
  end

  def update_with_titles(community) do
    first =
      community
      |> Map.get("members")
      |> Enum.map(&Map.get(&1, "joined_at", now()))
      |> Enum.concat([now()])
      |> Enum.min()

    with_titles =
      community
      |> Map.get("members")
      |> Enum.map(
        &if Map.get(&1, "joined_at") == first do
          Map.merge(&1, %{"title" => "Founder"})
        else
          &1
        end
      )

    Map.merge(community, %{"members" => with_titles})
  end

  def update_with_thanks_count(community) do
    thanks = community |> Map.get("thanks", [])

    with_count =
      community
      |> Map.get("members")
      |> Enum.map(
        &Map.merge(&1, %{
          "thanks" => thanks |> Enum.filter(fn y -> y["to"] == &1["email"] end) |> length
        })
      )

    community
    |> Map.merge(%{"members" => with_count})
    |> Map.delete("thanks")
  end

  def top_communities() do
    # TODO: We can optimize this by sorting inside Redis, and not load all results
    {:ok, keys} = Redix.command(:redix, ["KEYS", "communitiy:*"])

    communities =
      Enum.map(keys, fn x ->
        %{
          name: x,
          member_count: community(x) |> Map.get("members", []) |> length
        }
      end)

    communities
    |> Enum.filter(&(&1.member_count > 0))
    |> Enum.sort_by(& &1.member_count, &>=/2)
    |> Enum.take(@top_communities_count)
  end

  def members_of(name) do
    community(name)
    |> Map.get("members", [])
  end

  def sessions_of(name) do
    community(name)
    |> Map.get("sessions", [])
  end

  def session(name, id) do
    sessions_of(name)
    |> Enum.find(nil, fn x -> x["id"] == id end)
  end

  def messages_of(name) do
    community(name)
    |> Map.get("messages", [])
  end

  defp add_member_helper(community, member) do
    existing_members = community |> Map.get("members", [])

    has_member =
      existing_members
      |> Enum.filter(fn x -> x["email"] == member["email"] end)
      |> length

    members =
      if has_member == 0 do
        existing_members |> Enum.concat([member])
      else
        existing_members
      end

    Map.merge(community, %{"members" => members})
  end

  def add_member(name, member) do
    update(
      name,
      &add_member_helper(
        &1,
        member |> Map.merge(%{"joined_at" => now()})
      )
    )
  end

  defp remove_member_helper(community, member) do
    members =
      Map.get(community, "members", [])
      |> Enum.filter(fn x -> x["email"] != member["email"] end)

    Map.merge(community, %{"members" => members})
  end

  def remove_member(name, member) do
    update(name, &remove_member_helper(&1, member))
  end

  defp add_session_helper(community, session) do
    sessions =
      community
      |> Map.get("sessions", [])
      |> Enum.concat([session])

    Map.merge(community, %{"sessions" => sessions})
  end

  def add_session(name, session) do
    update(name, &add_session_helper(&1, session))
  end

  defp remove_session_helper(community, session_id) do
    sessions =
      Map.get(community, "sessions", [])
      |> Enum.filter(fn x -> x["id"] != session_id end)

    Map.merge(community, %{"sessions" => sessions})
  end

  def remove_session(name, session_id) do
    update(name, &remove_session_helper(&1, session_id))
  end

  defp add_message_helper(community, message) do
    messages =
      Map.get(community, "messages", [])
      |> Enum.concat([message])
      |> Enum.sort_by(&Map.get(&1, "timestamp"))
      |> Enum.reverse()
      # Only save 50 messages for a community
      |> Enum.take(50)

    Map.merge(community, %{"messages" => messages})
  end

  def add_message(name, message, member_email) do
    update(
      name,
      &add_message_helper(
        &1,
        message
        |> Map.delete("name")
        |> Map.merge(%{
          "sender" => member_email,
          "timestamp" => now()
        })
      )
    )
  end

  def add_info_message(name, content, member_email) do
    add_message(name, %{"content" => content, "type" => "info_message"}, member_email)
  end

  def clear_messages(name) do
    update(name, fn x -> Map.merge(x, %{"messages" => []}) end)
  end

  defp say_thanks_helper(community, values) do
    thanks =
      Map.get(community, "thanks", [])
      |> Enum.concat(values)

    Map.merge(community, %{"thanks" => thanks})
  end

  def say_thanks(name, from, to) do
    update(
      name,
      &say_thanks_helper(
        &1,
        Enum.map(to, fn x -> %{"to" => x, "from" => from, "timestamp" => now()} end)
      )
    )
  end

  defp now() do
    DateTime.utc_now() |> DateTime.to_iso8601()
  end
  
  defp get_community_key(name) do
    "#{@key_prefix}:#{name}"
  end
  
end
