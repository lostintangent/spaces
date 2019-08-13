defmodule LiveShareCommunities.Authentication do
  import Plug.Conn

  def init(opts), do: opts

  # def decode(jwt_string, public_key) do
  #   token = Joken.verify_and_validate(jwt_string, public_key)

  #   IO.inspect token
  #   # jwt_string
  #   #   |> Joken.token
  #   #   |> Joken.with_validation("exp", &(&1 > Joken.current_time()))
  #  end

  def isValidAADToken(token) do
    # TODO: add the logic to get and cache the cert dynamically
    # cert_endpoint = "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration"
    # keys = "https://login.microsoftonline.com/common/discovery/v2.0/keys"
    cert = "-----BEGIN CERTIFICATE-----\nMIIDBTCCAe2gAwIBAgIQdRnV9VlJ0JZDXnbfp+XqZjANBgkqhkiG9w0BAQsFADAtMSswKQYDVQQDEyJhY2NvdW50cy5hY2Nlc3Njb250cm9sLndpbmRvd3MubmV0MB4XDTE5MDcxNTAwMDAwMFoXDTIxMDcxNTAwMDAwMFowLTErMCkGA1UEAxMiYWNjb3VudHMuYWNjZXNzY29udHJvbC53aW5kb3dzLm5ldDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAOvLcdnJzn5Lx3+9OXPmSGX14ssROnPS6sVUA4yLPvQ27wxCO+Od5GYvbb0GM7JCRXQZQ/DGLlYV/AaYv2FBRfHqCdTxQtv/NrA4RfpjSe7D62LIDCQC9638zikGqcd5vUT0vtfCgGToPkiA8GzXKw5ua2MOaF4to2zuHLSs0Sj94857xw3i5ywk3JwxpDAkQbhDSboMIe6B47RqYdS97zaSNpa6Adxytk3A9TK+XGE3K3fo+m5pPC0XsCwiY4qWcJrtw4luP5EZ4oMPDuQZmIDGJFmexpdOPCgWS/uz8h0wF2+7TKfRXSX1mPl7vSgfWsgFvOBmwjCe6qKI8KAg290CAwEAAaMhMB8wHQYDVR0OBBYEFCle84Tr3/8aZbTs2jryx2w21ANZMA0GCSqGSIb3DQEBCwUAA4IBAQAZsQq6JX4IFDXjfV9UnauPP2E5OUMQvqnNasAATucYctaeW307aQEhB4OQgFDKKUpcN4RHOLqxG4phqUhI72PzW8kNVjGvgSL+uXO7P0mYi0N+ujGXYi92ZzH9tODODQ2147ZDLDe0kiRB9KXwFLdJcY6dbkj0wVmIy4D5JtB9zTRj4R5ymWXCXz3ecN4DhjeZnjnZfxaqJJA6lbWLIcjenKjRXoW95WgtdSu2gpjaJCt4zITTw1cFL6sdHrcsT24j23EpNxUld8C/3IY8ac72HKMR5AloTRlXxwXM8XUwLcrUCVp0c61VNY6U2J0TXYdSvJHwSQ98wSbiSryT2SUk\n-----END CERTIFICATE-----"

    jwk = JOSE.JWK.from_pem(cert)
    verificationResult = case JOSE.JWT.verify_strict(jwk, ["RS256"], token) do
      {ok, claims, _} ->
        if ok == false do
          false
        end

        if claims.fields["aud"] != "9db1d849-f699-4cfb-8160-64bed3335c72" do
          false
        end

        true

      {:error, error} ->
        IO.inspect error
        false
    end

    verificationResult
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

    IO.inspect type
    IO.inspect token

    if type != "Bearer" do
      false
    end

    if token == nil or (String.trim(token) == "") do
      false
    end

    isValidAADToken(token)
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
