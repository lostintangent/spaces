defmodule LiveShareCommunities.Authentication do
  import Plug.Conn
  use Memoize

  @aad_keys_file "./aad-public-keys.json"
  @cascade_keys_file "./cascade-public-keys.json"

  @aad_keys_url "https://login.microsoftonline.com/common/discovery/v2.0/keys"
  @cascade_keys_url "https://prod.liveshare.vsengsaas.visualstudio.com/api/authenticatemetadata"

  def init(opts), do: opts

  def save_keys(url, fileName) do
    response = HTTPotion.get url
    File.write!(Path.absname(fileName), response.body)
  end

  defmemo read_keys(file) do
    contents = File.read!(file)
    Poison.decode!(contents)
  end

  defmemo get_aad_keys?(arg) do
    case arg do
      {:ok, kid, token} ->
        dt1 = DateTime.utc_now()

        if !File.exists?(@aad_keys_file) do
          save_keys(@aad_keys_url, @aad_keys_file)
        end

        jsonBody = read_keys(@aad_keys_file)
        keys = jsonBody["keys"]

        dt2 = DateTime.utc_now()
        IO.inspect "** Get AAD public key: #{DateTime.diff(dt2, dt1, :milliseconds)}"

        {:ok, kid, token, keys}
      {:error, reason} -> {:error, reason}
    end
  end
  
  defmemo find_cascade_public_key?(arg) do
    case arg do
      {:ok, token} ->

        dt1 = DateTime.utc_now()

        if !File.exists?(@cascade_keys_file) do
          save_keys(@cascade_keys_url, @cascade_keys_file)
        end

        jsonBody = read_keys(@cascade_keys_file)
        keys = jsonBody["jwtPublicKeys"]
        certKey = Enum.at(keys, 0)
        keys = jsonBody["keys"]

        dt2 = DateTime.utc_now()
        IO.inspect "** Get Cascade public key: #{DateTime.diff(dt2, dt1, :milliseconds)}"

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

  defmemo find_aad_public_key?(arg) do
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


        if DateTime.diff(expDate, DateTime.utc_now) <= 0 do
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
        case is_cascade_token?(token) do
          {:ok, is_cascade} ->
            if is_cascade do
              {:ok, token} |> is_valid_cascade_token?
            else
              {:ok, token} |> is_valid_aad_token?
            end
          {:error, reason} -> {:error, reason}
        end
    end
  end

  def get_token?(arg) do
    case arg do
      {:ok, conn} ->
        {:ok, conn}
          |> is_auth_header_present?
      {:error, reason} -> {:error, reason}
    end
  end

  def authenticated?(conn) do
    {:ok, conn}
      |> get_token?
      |> is_valid_token?
  end

  def set_user_claims?(conn) do
    result = {:ok, conn}
      |> get_token?
      |> get_user_claims?

    case result do
      {:ok, claims} ->
        Map.merge(conn, %{ auth_context: claims })
      {:error, reason} -> {:error, reason}
    end
  end

  def is_cascade_token?(token) do
    try do
      payload = JOSE.JWT.peek_payload(token)
      iss = payload.fields["iss"]
      is_cascade = (iss == "https://insiders.liveshare.vsengsaas.visualstudio.com/")
      {:ok, is_cascade}
    rescue
      e in Poison.ParseError ->
        {:error, "Failed to parse payload."}
      e in ArgumentError ->
        {:error, "Failed to parse payload."}
    end
  end

  def get_user_claims?(arg) do
    case arg do
      {:ok, token} ->
        case is_cascade_token?(token) do
          {:ok, true} ->
            {:ok, token} |> get_cascade_claims?
          {:ok, false} ->
            {:ok, token} |> get_aad_claims?
          {:error, reason} -> {:error, reason}
        end
          
      {:error, reason} -> {:error, reason}
    end
  end

  def get_cascade_claims?(arg) do
    case arg do
      {:ok, token} ->
        payload = JOSE.JWT.peek_payload(token)
        IO.inspect payload
        # name = payload.fields["name"]
        # email = payload.fields["preferred_username"]
        name = ""
        email = ""
        id = payload.fields["userId"]

        claims = create_user_payload(id, name, email, "cascade")

        {:ok, claims}

      {:error, reason} -> {:error, reason}
    end
  end

  def create_user_payload(id, name, email, type) do
    %{
      id: id,
      name: name,
      email: email,
      type: type
    }
  end

  def get_aad_claims?(arg) do
    case arg do
      {:ok, token} ->
        payload = JOSE.JWT.peek_payload(token)
        name = payload.fields["name"]
        email = payload.fields["preferred_username"]
        tid = payload.fields["tid"]
        oid = payload.fields["oid"]
        id = "#{oid}_#{tid}"

        claims = create_user_payload(id, name, email, "aad")

        {:ok, claims}
      {:error, reason} -> {:error, reason}
    end
  end

  def authenticateRoute(conn) do
    dt1 = DateTime.utc_now()
    res = authenticated?(conn)
    dt2 = DateTime.utc_now()
    
    IO.inspect "** Auth total time: #{DateTime.diff(dt2, dt1, :milliseconds)}"

    case res do
      {:ok, claims} ->
        set_user_claims?(conn)
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

    # set the `auth_context` to `nil` initially,
    # update to real one if user is authenticated
    conn = Map.merge(conn, %{ auth_context: nil })

    if prefix == nil or !Enum.member?(authed_routes, prefix) do
      conn
    else
      conn
       |> authenticateRoute
    end
  end
end
