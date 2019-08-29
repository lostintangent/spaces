defmodule LiveShareCommunities.ProfileStore do
  @key_prefix "profile"

  def everything() do
    {:ok, keys} = Redix.command(:redix, ["KEYS", get_profile_key("*")])

    Enum.map(keys, fn x ->
      {:ok, value} = Redix.command(:redix, ["GET", x])
      value = Poison.decode!(value)

      %{
        "name" => x,
        "value" => value
      }
    end)
  end

  defp get_profile(name) do
    {:ok, value} = Redix.command(:redix, ["GET", get_profile_key(name)])
    if value do
      Poison.decode!(value)
    else
      nil
    end
  end

#   defp update(name, fun) do
#     {:ok, value} = Redix.command(:redix, ["GET", name])

#     community =
#       if value do
#         Poison.decode!(value)
#       else
#         %{}
#       end

#     updated_community = fun.(community)
#     {:ok, _} = Redix.command(:redix, ["SET", name, Poison.encode!(updated_community)])
#     inform_subscribers(name)
#   end

  def create_profile(auth_context) do
    profile = get_profile(auth_context.id)

    if profile != nil do
      auth_context = Map.merge(profile, auth_context)
    end

    {:ok, _} = Redix.command(:redix, ["SET", get_profile_key(auth_context.id), Poison.encode!(auth_context)])
  end

  defp get_profile_key(name) do
    "#{@key_prefix}:#{name}"
  end

end
