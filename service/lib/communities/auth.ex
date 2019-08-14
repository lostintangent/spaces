defmodule LiveShareCommunities.Authentication do
  import Plug.Conn

  def init(opts), do: opts

  def findPublicKey(kid) do
    # TODO: add the logic to cache cert keys
    response = HTTPotion.get "https://login.microsoftonline.com/common/discovery/v2.0/keys"
    jsonBody = Poison.decode!(response.body)
    keys = jsonBody["keys"]

    certItem = Enum.find(keys, fn key ->
      key["kid"] == kid
    end)

    if certItem == nil do
      ""
    end

    certKey = Enum.at(certItem["x5c"], 0)

    if certKey == "" do
      raise "Cannot find appropriate public key."
    end

    certKey
  end

  # def okSet(ok) do
  #   if ok == true do
  #     {:ok, claims}
  #   else
  #     {:error, "Token is not valid."}
  #   end
  # end

  def validIssuer?({:ok, claims}) do
    if claims.fields["iss"] == "https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/v2.0" do
      {:ok, claims}
    else
      {:error, "Invalid issuer."}
    end
  end

  def validAudience?({:ok, claims}) do
    if claims.fields["aud"] == "9db1d849-f699-4cfb-8160-64bed3335c72" do
      {:ok, claims}
    else
      {:error, "Invalid audience."}
    end
  end

  def validExpiration?({:ok, claims}) do
    exp = claims.fields["exp"]
    expDate = case DateTime.from_unix(exp) do
      {:ok, date} ->
        date
      {:error, reason} ->
        raise reason
    end

    if DateTime.utc_now() > expDate do
      {:error, "Token is expired."}
    else
      {:ok, claims}
    end
  end

  def getKid?({:ok, token}) do
    try do
      protected = JOSE.JWT.peek_protected(token)
      kid = protected.fields["kid"]
      {:ok, kid}
    catch
      :exit, _ -> "exit blocked"
      # x -> "Got #{x}"
      # e in RuntimeError ->
      # IO.inspect "Caught!"
      # {:error, "Failed to parse kid."}
    end
  end

  def isValidAADToken(token) do
    kid = {:ok, token}
      |> getKid?
    # protected = JOSE.JWT.peek_protected(token)
    # kid = protected.fields["kid"]
    certKey = findPublicKey(kid)
    cert = "-----BEGIN CERTIFICATE-----\n#{certKey}\n-----END CERTIFICATE-----"

    jwk = JOSE.JWK.from_pem(cert)

    case JOSE.JWT.verify_strict(jwk, ["RS256"], token) do
      {ok, claims, _} ->
        if ok == false do
          {:error, "Token is not valid"}
        else
          {:ok, claims}
            |> validIssuer?
            |> validAudience?
            |> validExpiration?
        end
      {:error, error} ->
        IO.inspect error
        {:error, error}
    end
  end

  def authenticated?(conn) do
    auth_header_list = conn |> get_req_header("authorization")
    len = auth_header_list |> length

    # no auth header
    if len < 1 do
      false
    end

    auth_header = Enum.at(auth_header_list, 0)

    values = String.split(auth_header, " ")

    type = Enum.at(values, 0)
    token = Enum.at(values, 1)

    case isValidAADToken(token) do
      {:ok, claims} ->
        true
      {:error, reason} ->
        IO.inspect reason
        false
    end
  end

  def call(conn, _opts) do
    if authenticated?(conn) do
      conn
    else
      conn
      |> send_resp(401, "")
      |> halt
    end
  end
end
