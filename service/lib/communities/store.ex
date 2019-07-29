defmodule LiveShareCommunities.Store do
  use Agent

  def start_link(_opts) do
    Agent.start_link(fn -> %{} end, name: :store)
  end

  def everything() do
    Agent.get(:store, & &1)
  end

  defp update(community_name, fun) do
    Agent.update(:store, &fun.(&1))
    inform_subscribers(community_name)
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
    %{"name" => name, "members" => members_of(name), "sessions" => sessions_of(name)}
  end

  def members_of(name) do
    Agent.get(:store, &Map.get(&1, name, %{}))
    |> Map.get("members", [])
  end

  def sessions_of(name) do
    Agent.get(:store, &Map.get(&1, name, %{}))
    |> Map.get("sessions", [])
  end

  defp add_member_helper(communities, community_name, member) do
    community =
      communities
      |> Map.get(community_name, %{})

    members =
      community
      |> Map.get("members", [])
      |> Enum.filter(fn x -> x["email"] != member["email"] end)
      |> Enum.concat([member])

    communities
    |> Map.merge(%{community_name => Map.merge(community, %{"members" => members})})
  end

  def add_member(name, member) do
    update(name, &add_member_helper(&1, name, member))
  end

  defp remove_member_helper(communities, community_name, member) do
    community =
      communities
      |> Map.get(community_name, %{})

    members =
      Map.get(community, "members", [])
      |> Enum.filter(fn x -> x["email"] != member["email"] end)

    communities
    |> Map.merge(%{community_name => Map.merge(community, %{"members" => members})})
  end

  def remove_member(name, member) do
    update(name, &remove_member_helper(&1, name, member))
  end

  defp add_session_helper(communities, community_name, session) do
    community =
      communities
      |> Map.get(community_name, %{})

    sessions =
      community
      |> Map.get("sessions", [])
      |> Enum.concat([session])

    communities
    |> Map.merge(%{community_name => Map.merge(community, %{"sessions" => sessions})})
  end

  def add_session(name, session) do
    update(name, &add_session_helper(&1, name, session))
  end

  defp remove_session_helper(communities, community_name, session) do
    community =
      communities
      |> Map.get(community_name, %{})

    sessions =
      Map.get(community, "sessions", [])
      |> Enum.filter(fn x -> x["id"] != session["id"] end)

    communities
    |> Map.merge(%{community_name => Map.merge(community, %{"sessions" => sessions})})
  end

  def remove_session(name, session) do
    update(name, &remove_session_helper(&1, name, session))
  end
end
