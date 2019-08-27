defmodule LiveShareCommunities.Authentication do
  import Plug.Conn
  use Memoize

  def init(opts), do: opts

  defmemo get_aad_keys?(arg) do
    case arg do
      {:ok, kid, token} ->
        response = HTTPotion.get "https://login.microsoftonline.com/common/discovery/v2.0/keys"
        jsonBody = Poison.decode!(response.body)
        keys = jsonBody["keys"]
        {:ok, kid, token, keys}
      {:error, reason} -> {:error, reason}
    end
  end
  
  defmemo find_cascade_public_key?(arg) do
    case arg do
      {:ok, token} ->
        response = HTTPotion.get "https://prod.liveshare.vsengsaas.visualstudio.com/api/authenticatemetadata"
        jsonBody = Poison.decode!(response.body)
        keys = jsonBody["jwtPublicKeys"]
        certKey = Enum.at(keys, 0)
        {:ok, certKey, token}
      {:error, reason} -> {:error, reason}
    end
  end

  def find_aad_public_key_in_keys?(arg) do
    case arg do
      {:ok, kid, token, keys} ->
        certItem = Enum.find(keys, fn key ->
          key["kid"] == kid
        end)

        if certItem == nil do
          {:error, "Cannot find appropriate public key."}
        else
          certKey = Enum.at(certItem["x5c"], 0)
          {:ok, certKey, token}
        end
    end
  end

  def find_aad_public_key?(arg) do
    case arg do
      {:ok, kid, token} ->
        {:ok, kid, token}
          |> get_aad_keys?
          |> find_aad_public_key_in_keys?
      {:error, reason} -> {:error, reason}
    end
  end

  def valid_issuer?(arg) do
    case arg do
      {:ok, claims} ->
        if claims.fields["iss"] == "https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/v2.0" do
          {:ok, claims}
        else
          {:error, "Invalid AAD issuer."}
        end
      {:error, reason}  -> {:error, reason}
    end
  end
  
  def valid_cascade_issuer?(arg) do
    case arg do
      {:ok, claims} ->
        if claims.fields["iss"] == "https://insiders.liveshare.vsengsaas.visualstudio.com/" do
          {:ok, claims}
        else
          {:error, "Invalid Cascade issuer."}
        end
      {:error, reason}  -> {:error, reason}
    end
  end

  def valid_audience?(arg) do
    case arg do
      {:ok, claims} ->
        if claims.fields["aud"] == "9db1d849-f699-4cfb-8160-64bed3335c72" do
          {:ok, claims}
        else
          {:error, "Invalid AAD audience."}
        end
      {:error, reason} -> {:error, reason}
    end
  end
  
  def validCascadeAudience?(arg) do
    case arg do
      {:ok, claims} ->
        if claims.fields["aud"] == "https://insiders.liveshare.vsengsaas.visualstudio.com/" do
          {:ok, claims}
        else
          {:error, "Invalid Cascade audience."}
        end
      {:error, reason} -> {:error, reason}
    end
  end

  def valid_expiration?(arg) do
    case arg do
      {:ok, claims} ->
        exp = claims.fields["exp"]
        expDate = case DateTime.from_unix(exp) do
          {:ok, date} ->
            date
          {:error, reason} ->
            raise reason
        end

        if DateTime.utc_now() > expDate do
          {:error, "AAD token is expired."}
        else
          {:ok, claims}
        end
      {:error, reason} -> {:error, reason}
    end
  end
  
  def valid_cascade_expiration?(arg) do
    case arg do
      {:ok, claims} ->
        expDate = claims.fields["exp"] * 1000
        now = :os.system_time() / 1000 / 1000
        
        if now > expDate do
          {:error, "Cascade token is expired."}
        else
          {:ok, claims}
        end
      {:error, reason} -> {:error, reason}
    end
  end

  def get_aad_kid?(arg) do
    case arg do
      {:ok, token} ->
        try do
          protected = JOSE.JWT.peek_protected(token)
          kid = protected.fields["kid"]
          {:ok, kid, token}
        rescue
          e in ArgumentError ->
            {:error, "Failed to parse kid."}
        end
      {:error, reason} -> {:error, reason}
    end
  end

  def create_cert?(arg) do
    case arg do
      {:ok, certKey, token} ->
        cert = "-----BEGIN CERTIFICATE-----\n#{certKey}\n-----END CERTIFICATE-----"
        try do
          jwk = JOSE.JWK.from_pem(cert)
          {:ok, jwk, token}
        rescue
          e in ArgumentError ->
            {:error, "Failed to create cert."}
        end
      {:error, reason} -> {:error, reason}
    end
  end

  def verify_token?(arg) do
    case arg do
      {:ok, jwk, token} ->
        case JOSE.JWT.verify_strict(jwk, ["RS256"], token) do
          {ok, claims, _} ->
            if ok == false do
              {:error, "Token is not valid"}
            else
              {:ok, claims}
                |> valid_issuer?
                |> valid_audience?
                |> valid_expiration?
            end
          {:error, error} ->
            {:error, error}
        end
      {:error, reason} -> {:error, reason}
    end
  end
  
  def verify_cascade_token?(arg) do
    case arg do
      {:ok, jwk, token} ->
        case JOSE.JWT.verify_strict(jwk, ["RS256"], token) do
          {ok, claims, _} ->
            if ok == false do
              {:error, "Token is not valid"}
            else
              {:ok, claims}
                |> valid_cascade_issuer?
                |> validCascadeAudience?
                |> valid_cascade_expiration?
            end
          {:error, error} ->
            {:error, error}
        end
      {:error, reason} -> {:error, reason}
    end
  end

  def is_valid_aad_token?(arg) do
    arg
      |> get_aad_kid?
      |> find_aad_public_key?
      |> create_cert?
      |> verify_token?
  end
  
  def is_valid_cascade_token?(arg) do
    arg
      |> find_cascade_public_key?
      |> create_cert?
      |> verify_cascade_token?
  end

  def is_auth_header_present?(arg) do
    case arg do
      {:ok, conn} ->
        auth_header_list = conn |> get_req_header("authorization")
        len = auth_header_list |> length
        if len < 1 do
          {:error, "No authorization header set."}
        else
          auth_header = Enum.at(auth_header_list, 0)
          values = String.split(auth_header, " ")

          type = Enum.at(values, 0)
          token = Enum.at(values, 1)
          if token == nil do
            {:error, "No authorization token found."}
          else
            {:ok, token}
          end
        end
      {:error, reason} -> {:error, reason}
    end
  end
  
  def is_valid_token?(arg) do
    case arg do
      {:ok, token} ->
        try do
          payload = JOSE.JWT.peek_payload(token)
          iss = payload.fields["iss"]
          if iss == "https://insiders.liveshare.vsengsaas.visualstudio.com/" do
            {:ok, token} |> is_valid_cascade_token?
          else
            {:ok, token} |> is_valid_aad_token?
          end
        rescue
          e in Poison.ParseError ->
            {:error, "Failed to parse payload."}
          e in ArgumentError ->
            {:error, "Failed to parse payload."}
        end
      {:error, reason} -> {:error, reason}
    end
  end

  def authenticated?(conn) do
    {:ok, conn}
      |> is_auth_header_present?
      |> is_valid_token?
  end

  def authenticateRoute(conn) do
    case authenticated?(conn) do
      {:ok, claims} ->
        conn
      {:error, reason} ->
        IO.inspect reason
        conn
          |> send_resp(401, "")
          |> halt
    end
  end

  def call(conn, _opts) do
    authed_routes = ["v0"]
    prefix = Enum.at(conn.path_info, 0)

    if prefix == nil or !Enum.member?(authed_routes, prefix) do
      conn
    else
      conn
       |> authenticateRoute
    end
  end
end
