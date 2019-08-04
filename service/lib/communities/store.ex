defmodule LiveShareCommunities.Store do
  def everything() do
    {:ok, result} = Sqlitex.Server.query(Store.DB, "SELECT * FROM kv;")

    Enum.map(result, fn x ->
      {:key, name} = List.keyfind(x, :key, 0)
      {:value, value} = List.keyfind(x, :value, 0)

      %{
        "name" => name,
        "value" => Poison.decode!(value)
      }
    end)
  end

  defp update(name, fun) do
    {:ok, result} = Sqlitex.Server.query(Store.DB, "SELECT value FROM kv WHERE key = '#{name}';")
    {:value, community} = List.keyfind(List.flatten(result), :value, 0, {:value, "{}"})

    updated_community =
      community
      |> Poison.decode!
      |> fun.()

    Sqlitex.Server.query(
      Store.DB,
      "REPLACE into kv (key, value) VALUES ('#{name}', '#{Poison.encode!(updated_community)}');"
    )

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
    {:ok, result} = Sqlitex.Server.query(Store.DB, "SELECT value FROM kv WHERE key = '#{name}';")
    {:value, community} = List.keyfind(List.flatten(result), :value, 0, {:value, "{}"})

    community
    |> Poison.decode!
    |> Map.update("name", name, & &1)
    |> Map.update("members", [], & &1)
    |> Map.update("sessions", [], & &1)
    |> Map.update("messages", [], & &1)
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
    members =
      community
      |> Map.get("members", [])
      |> Enum.filter(fn x -> x["email"] != member["email"] end)
      |> Enum.concat([member])

    Map.merge(community, %{"members" => members})
  end

  def add_member(name, member) do
    update(name, &add_member_helper(&1, member))
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
      |> Enum.sort_by(&Map.get(&1, "timestamp"), &Timex.after?/2)
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
        |> Map.merge(%{"sender" => member_email, "timestamp" => DateTime.utc_now()})
      )
    )
  end
end
