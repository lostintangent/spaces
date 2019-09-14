defmodule LiveShareSpaces.ProfileStore do
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

  def get_profile(id) do
    dt1 = DateTime.utc_now()

    {:ok, value} = Redix.command(:redix, ["GET", get_profile_key(id)])

    dt2 = DateTime.utc_now()

    if value do
      Poison.decode!(value)
    end

    IO.inspect("** Profile lookup time: #{DateTime.diff(dt2, dt1, :millisecond)}")

    if value do
      Poison.decode!(value)
    else
      nil
    end
  end

  def create_profile(id, name, email) do
    profile = %{id: id, name: name, email: email}
    {:ok, _} = Redix.command(:redix, ["SET", get_profile_key(id), Poison.encode!(profile)])
  end

  defp get_profile_key(id) do
    "#{@key_prefix}:#{id}"
  end
end
