defmodule LiveShareCommunities.Events do
  def create(community, message, email) do
    Task.async(fn ->
      LiveShareCommunities.Store.add_info_message(community, message, email)
    end)
  end

  def send(:member_joined, community, %{email: email}) do
    create(community, "Joined the community", email)
  end

  def send(:member_left, community, %{email: email}) do
    create(community, "Left the community", email)
  end

  def send(:session_start, community, %{id: id}) do
    %{"type" => type, "description" => description, "host" => host} =
      LiveShareCommunities.Store.session(community, id)

    create(community, "Started #{label(type)}: #{description}", host)
  end

  def send(:session_end, community, %{id: id}) do
    %{"type" => type, "description" => description, "host" => host} =
      LiveShareCommunities.Store.session(community, id)

    create(community, "Ended #{label(type)}: #{description}", host)
  end

  defp label(session_type) do
    case session_type do
      0 ->
        "broadcast"

      1 ->
        "code review"

      2 ->
        "help request"
    end
  end
end
