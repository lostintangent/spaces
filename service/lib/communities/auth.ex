defmodule LiveShareCommunities.Authentication do
  import Plug.Conn
  use Memoize

  def init(opts), do: opts

  defmemo getKeys?(arg) do
    case arg do
      {:ok, kid, token} ->
        response = HTTPotion.get "https://login.microsoftonline.com/common/discovery/v2.0/keys"
        jsonBody = Poison.decode!(response.body)
        keys = jsonBody["keys"]
        {:ok, kid, token, keys}
      {:error, reason} -> {:error, reason}
    end
  end
  
  defmemo findCascadePublicKey?(arg) do
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

  def findPublicKeyInKeys?(arg) do
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

  def findPublicKey?(arg) do
    case arg do
      {:ok, kid, token} ->
        {:ok, kid, token}
          |> getKeys?
          |> findPublicKeyInKeys?
      {:error, reason} -> {:error, reason}
    end
  end

  def validIssuer?(arg) do
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
  
  def validCascadeIssuer?(arg) do
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

  def validAudience?(arg) do
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

  def validExpiration?(arg) do
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
  
  def validCascadeExpiration?(arg) do
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

  def getKid?(arg) do
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

  def createCert?(arg) do
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

  def verifyToken?(arg) do
    case arg do
      {:ok, jwk, token} ->
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
            {:error, error}
        end
      {:error, reason} -> {:error, reason}
    end
  end
  
  def verifyCascadeToken?(arg) do
    case arg do
      {:ok, jwk, token} ->
        case JOSE.JWT.verify_strict(jwk, ["RS256"], token) do
          {ok, claims, _} ->
            if ok == false do
              {:error, "Token is not valid"}
            else
              {:ok, claims}
                |> validCascadeIssuer?
                |> validCascadeAudience?
                |> validCascadeExpiration?
            end
          {:error, error} ->
            {:error, error}
        end
      {:error, reason} -> {:error, reason}
    end
  end

  def isValidAADToken?(arg) do
    arg
      |> getKid?
      |> findPublicKey?
      |> createCert?
      |> verifyToken?
  end
  
  def isValidCascadeToken?(arg) do
    arg
      |> findCascadePublicKey?
      |> createCert?
      |> verifyCascadeToken?
  end

  def isAuthHeaderPresent?(arg) do
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
  
  def isValidToken?(arg) do
    case arg do
      {:ok, token} ->
        try do
          payload = JOSE.JWT.peek_payload(token)
          iss = payload.fields["iss"]
          if iss == "https://insiders.liveshare.vsengsaas.visualstudio.com/" do
            {:ok, token} |> isValidCascadeToken?
          else
            {:ok, token} |> isValidAADToken?
          end
        rescue
          e in ArgumentError ->
            {:error, "Failed to parse kid."}
        end
      {:error, reason} -> {:error, reason}
    end
  end

  def authenticated?(conn) do
    {:ok, conn}
      |> isAuthHeaderPresent?
      |> isValidToken?
  end

  def call(conn, _opts) do
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
end
