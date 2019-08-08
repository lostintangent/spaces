defmodule LiveShareCommunities.Store do
  @top_communities_count 5

  def everything() do
    {:ok, keys} = Redix.command(:redix, ["KEYS", "*"])

    Enum.map(keys, fn x ->
      {:ok, value} = Redix.command(:redix, ["GET", x])

      %{
        "name" => x,
        "value" => Poison.decode!(value)
      }
    end)
  end

  defp update(name, fun) do
    {:ok, value} = Redix.command(:redix, ["GET", name])

    community =
      if value do
        Poison.decode!(value)
      else
        %{}
      end

    updated_community = fun.(community)
    {:ok, _} = Redix.command(:redix, ["SET", name, Poison.encode!(updated_community)])
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
    {:ok, value} = Redix.command(:redix, ["GET", name])

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

  def top_communities() do
    # TODO: We can optimize this by sorting inside Redis, and not load all results
    {:ok, keys} = Redix.command(:redix, ["KEYS", "*"])

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

  def clear_messages(name) do
    update(name, fn x -> Map.merge(x, %{"messages" => []}) end)
  end

  defp now() do
    DateTime.utc_now() |> DateTime.to_iso8601()
  end
end
