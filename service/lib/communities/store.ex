defmodule LiveShareCommunities.Store do
  use Agent

  def start_link() do
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
    Agent.get(:store, &Map.get(&1, community_name, []))
    |> Enum.map(&Map.get(&1, "email"))
    |> Enum.map(fn x ->
      Registry.LiveShareCommunities
      |> Registry.dispatch(x, fn entries ->
        for {pid, _} <- entries do
          Process.send(pid, community_name, [])
        end
      end)
    end)
  end

  def community(name) do
    %{"name" => name, "members" => members_of(name)}
  end

  def members_of(name) do
    Agent.get(:store, &Map.get(&1, name, []))
  end

  defp add_member_helper(communities, community_name, member) do
    members =
      communities
      |> Map.get(community_name, [])
      |> Enum.filter(fn x -> x["email"] != member["email"] end)

    communities
    |> Map.merge(%{community_name => Enum.concat(members, [member])})
  end

  def add_member(name, member) do
    update(name, &add_member_helper(&1, name, member))
  end

  defp remove_member_helper(communities, community_name, member) do
    members = Map.get(communities, community_name, [])

    Map.merge(
      communities,
      %{
        community_name => Enum.filter(members, fn x -> x["email"] != member["email"] end)
      }
    )
  end

  def remove_member(name, member) do
    update(name, &remove_member_helper(&1, name, member))
  end
end
