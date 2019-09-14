defmodule LiveShareSpaces.Events do
  def create(space, message, email) do
    Task.async(fn ->
      LiveShareSpaces.SpaceStore.add_info_message(space, message, email)
    end)
  end

  def send(:member_joined, space, %{email: email}) do
    create(space, "Joined the space", email)
  end

  def send(:member_left, space, %{email: email}) do
    create(space, "Left the space", email)
  end

  def send(:session_start, space, %{id: id}) do
    %{"type" => type, "description" => description, "host" => host} =
      LiveShareSpaces.SpaceStore.session(space, id)

    create(space, "Started #{label(type)}: #{description}", host)
  end

  def send(:session_end, space, %{session: session}) do
    %{"type" => type, "description" => description, "host" => host} = session
    create(space, "Ended #{label(type)}: #{description}", host)
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
