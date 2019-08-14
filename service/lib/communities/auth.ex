defmodule LiveShareCommunities.Authentication do
  import Plug.Conn

  def init(opts), do: opts

  def findPublicKey?({:ok, kid, token}) do
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

    {:ok, certKey, token}
  end

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
      {:ok, kid, token}
    rescue
      # :exit, _ -> "exit blocked"
      e in ArgumentError -> e
      {:error, "Failed to parse kid."}
    end
  end

  def createCert?({:ok, certKey, token}) do
    cert = "-----BEGIN CERTIFICATE-----\n#{certKey}\n-----END CERTIFICATE-----"
    try do
      jwk = JOSE.JWK.from_pem(cert)
      {:ok, jwk, token}
    rescue
      e in ArgumentError -> e
      {:error, "Failed to create cert."}
    end
  end

  def verifyToken?({:ok, jwk, token}) do
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

  def isValidAADToken(token) do
    try do
      {:ok, jwk} = {:ok, token}
        |> getKid?
        |> findPublicKey?
        |> createCert?
        |> verifyToken?
    rescue
      e in FunctionClauseError ->
        {:error, "Token is invalid. #{e.function}"}
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
