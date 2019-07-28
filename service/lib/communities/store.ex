defmodule LiveShareCommunities.Store do
  use Agent

  def start_link() do
    Agent.start_link(fn -> %{:communities => %{}, :subscribers => %{}} end, name: :store)
  end

  def everything() do
    Agent.get(:store, & &1)
  end

  defp update_communities(fun) do
    communities = fun.(Agent.get(:store, &Map.get(&1, :communities)))
    Agent.update(:store, &Map.replace!(&1, :communities, communities))

    # TODO
    # when community with a subsriber changes, we want to inform the subscriber
  end

  def register_subscriber(email, socket_req) do
    subscribers = Agent.get(:store, &Map.get(&1, :subscribers))

    Agent.update(
      :store,
      &Map.replace!(&1, :subscribers, Map.merge(subscribers, %{email => "test"}))
    )
  end

  def deregister_subscriber(email) do
    subscribers = Agent.get(:store, &Map.get(&1, :subscribers))

    Agent.update(
      :store,
      &Map.replace!(&1, :subscribers, Map.delete(subscribers, email))
    )
  end

  def community(name) do
    %{"name" => name, "members" => members_of(name)}
  end

  def members_of(name) do
    Agent.get(:store, &Map.get(Map.get(&1, :communities), name, []))
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
    update_communities(&add_member_helper(&1, name, member))
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
    update_communities(&remove_member_helper(&1, name, member))
  end
end
