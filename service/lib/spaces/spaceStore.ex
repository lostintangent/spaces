defmodule LiveShareSpaces.SpaceStore do
  @top_spaces_count 5
  @key_prefix "space"

  @ls_service_uri "https://prod.liveshare.vsengsaas.visualstudio.com"

  def migrate_old_space_keys() do
    {:ok, keys} = Redix.command(:redix, ["KEYS", "*"])

    Enum.each(keys, fn key ->
      # old keys do not have the `prefix:` pattern and contain only `spaces`
      is_new_key = key =~ ":"

      if !is_new_key do
        {:ok, value} = Redix.command(:redix, ["GET", key])
        {:ok, _} = Redix.command(:redix, ["DEL", key])
        {:ok, _} = Redix.command(:redix, ["SET", get_space_key(key), value])
      end
    end)
  end

  def everything() do
    all_space_names()
    |> Enum.map(fn x ->
      {:ok, value} = Redix.command(:redix, ["GET", get_space_key(x)])

      %{
        "name" => x,
        "value" => Poison.decode!(value)
      }
    end)
  end

  defp all_space_names() do
    {:ok, keys} = Redix.command(:redix, ["KEYS", get_space_key("*")])

    keys
    |> Enum.map(&remove_prefix(&1))
  end

  def total_everything do
    {:ok, keys} = Redix.command(:redix, ["KEYS", "*"])

    Enum.map(keys, fn x ->
      {:ok, value} = Redix.command(:redix, ["GET", x])

      %{
        "name" => x,
        "value" => Poison.decode!(value)
      }
    end)
  end

  defp update(name, fun) when is_binary(name) do
    space_key = get_space_key(name)
    {:ok, value} = Redix.command(:redix, ["GET", space_key])

    space = Poison.decode!(value)
    updated_space = fun.(space)

    {:ok, _} = Redix.command(:redix, ["SET", space_key, Poison.encode!(updated_space)])
    inform_subscribers(name)
    updated_space
  end

  defp update(space, fun) when is_map(space) do
    updated_space = fun.(space)

    space_key = get_space_key(space["name"])
    {:ok, _} = Redix.command(:redix, ["SET", space_key, Poison.encode!(updated_space)])
    inform_subscribers(space["name"])
    updated_space
  end

  defp inform_subscribers(space_name) do
    members_of(space_name)
    |> Enum.map(&Map.get(&1, "email"))
    |> Enum.map(fn x ->
      Registry.LiveShareSpaces
      |> Registry.dispatch(x, fn entries ->
        for {pid, _} <- entries do
          # Send the space with its updated members/sessions to the subscriber
          Process.send(pid, Poison.encode!(space(space_name)), [])
        end
      end)
    end)
  end

  def space(name) do
    {:ok, value} = Redix.command(:redix, ["GET", get_space_key(name)])

    space =
      if value do
        Poison.decode!(value)
      else
        %{
          "name" => name,
          "founders" => [],
          "blocked_members" => [],
          "members" => [],
          "sessions" => [],
          "messages" => [],
          "readme" => "",
          "isPrivate" => false,
          "key" => ""
        }
      end

    space
    |> update_with_thanks_count()
  end

  def update_with_thanks_count(space) do
    thanks = space |> Map.get("thanks", [])

    with_count =
      space
      |> Map.get("members")
      |> Enum.map(
        &Map.merge(&1, %{
          "thanks" => thanks |> Enum.filter(fn y -> y["to"] == &1["email"] end) |> length
        })
      )

    space
    |> Map.merge(%{"members" => with_count})
    |> Map.delete("thanks")
  end

  def top_spaces() do
    # TODO: We can optimize this by sorting inside Redis, and not load all results
    all_space_names()
    |> Enum.map(fn space_name ->
      space = space(space_name)

      %{
        name: space["name"],
        member_count: length(space["members"]),
        is_private: space["isPrivate"]
      }
    end)
    |> Enum.filter(&(&1.member_count > 0 && &1.is_private === false))
    |> Enum.sort_by(& &1.member_count, &>=/2)
    |> Enum.take(@top_spaces_count)
  end

  def cleanup_zombie_sessions(by_email) do
    connected_sockets =
      Registry.LiveShareSpaces
      |> Registry.lookup(by_email)

    if length(connected_sockets) == 0 do
      sessions_by(by_email)
      |> Enum.map(
        &if session_inactive?(&1) do
          remove_session(&1["space"], &1["id"])
        end
      )
    end
  end

  defp session_inactive?(session) do
    response = HTTPotion.get("#{@ls_service_uri}/api/v0.2/workspace/#{session["id"]}/owner/")

    if HTTPotion.Response.success?(response) do
      response.body
      |> Poison.decode!()
      |> Map.get("connected", true)
      |> Kernel.not()
    else
      # Assuming 404 means session has been deleted
      response.status_code == 404
    end
  end

  def sessions_by(email) do
    everything()
    |> Enum.map(&Map.merge(&1, %{"value" => Map.get(&1["value"], "sessions", [])}))
    |> Enum.map(fn x ->
      Map.merge(
        x,
        %{
          "value" =>
            x["value"]
            |> Enum.map(fn y ->
              Map.merge(y, %{"space" => x["name"]})
            end)
        }
      )
    end)
    |> Enum.map(fn x -> x["value"] end)
    |> List.flatten()
    |> Enum.filter(fn x -> x["host"] == email end)
  end

  def members_of(name) do
    space(name)
    |> Map.get("members", [])
  end

  def sessions_of(name) do
    space(name)
    |> Map.get("sessions", [])
  end

  def session(name, id) do
    sessions_of(name)
    |> Enum.find(nil, fn x -> x["id"] == id end)
  end

  def messages_of(name) do
    space(name)
    |> Map.get("messages", [])
  end

  defp add_member_helper(space, member) do
    current_members = space |> Map.get("members", [])
    member_email = member["email"]
    existing_member = Enum.member?(current_members, member_email)

    if existing_member do
      space
    else
      updated_members = Enum.concat(current_members, [Map.put(member, "joined_at", now())])

      current_founders = space |> Map.get("founders", [])

      founders =
        if length(current_founders) > 0 do
          current_founders
        else
          Enum.concat(current_founders, [member_email])
        end

      %{space | "members" => updated_members, "founders" => founders}
    end
  end

  def add_member(space, member) do
    update(
      space,
      &add_member_helper(&1, member)
    )
  end

  defp remove_member_helper(space, member) do
    members =
      space["members"]
      |> Enum.filter(fn x -> x["email"] != member["email"] end)

    %{space | "members" => members}
  end

  def remove_member(name, member) do
    update(name, &remove_member_helper(&1, member))
  end

  defp add_session_helper(space, session) do
    sessions =
      space
      |> Map.get("sessions", [])
      |> Enum.concat([session])

    %{space | "sessions" => sessions}
  end

  def add_session(name, session) do
    update(name, &add_session_helper(&1, session))
  end

  defp remove_session_helper(space, session_id) do
    sessions =
      Map.get(space, "sessions", [])
      |> Enum.filter(fn x -> x["id"] != session_id end)

    %{space | "sessions" => sessions}
  end

  def remove_session(name, session_id) do
    update(name, &remove_session_helper(&1, session_id))
  end

  defp add_message_helper(space, message) do
    messages =
      Map.get(space, "messages", [])
      |> Enum.concat([message])
      |> Enum.sort_by(&Map.get(&1, "timestamp"))
      |> Enum.reverse()
      |> Enum.take(50)

    %{space | "messages" => messages}
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
    update(name, &%{&1 | "messages" => []})
  end

  defp say_thanks_helper(space, values) do
    thanks =
      Map.get(space, "thanks", [])
      |> Enum.concat(values)

    %{space | "thanks" => thanks}
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

  def make_private(name, key) do
    update(
      name,
      &%{&1 | "isPrivate" => true, "key" => key}
    )
  end

  def make_public(name) do
    update(
      name,
      &%{&1 | "isPrivate" => false, "key" => ""}
    )
  end

  def promote_member(name, member) do
    update(
      name,
      &%{&1 | "founders" => [member | &1["founders"]]}
    )
  end

  def demote_member(name, member) do
    update(
      name,
      &%{&1 | "founders" => Enum.filter(&1["founders"], fn founder -> founder !== member end)}
    )
  end

  def block_member(name, member) do
    update(
      name,
      &%{&1 | "blocked_members" => [member | &1["blocked_members"]]}
    )
  end

  def unblock_member(name, member) do
    update(
      name,
      &%{
        &1
        | "blocked_members" => Enum.filter(&1["blocked_members"], fn m -> m !== member end)
      }
    )
  end

  def update_readme(name, readme) do
    update(
      name,
      &%{&1 | "readme" => readme}
    )
  end

  defp now() do
    DateTime.utc_now() |> DateTime.to_iso8601()
  end

  defp get_space_key(name) do
    "#{@key_prefix}:#{name}"
  end

  defp remove_prefix(name) do
    String.replace_prefix(name, "#{@key_prefix}:", "")
  end
end
