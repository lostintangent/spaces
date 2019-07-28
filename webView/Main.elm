module Main exposing (..)

import Browser
import Html exposing (Html, text, div, h1, img)
import Html.Attributes exposing (src)

type alias Member = 
    {
        name: String,
        email: String
    }

type alias HelpRequest =
    {
        member: Member,
        description: String,
        liveShareUrl: String
    }

type alias Broadcast =
    {
        member: Member,
        description: String,
        liveShareUrl: String
    }

type alias Community =
    {
        name: String,
        members: List Member,
        helpRequests: List HelpRequest,
        broadcasts: List Broadcast
    }

type alias Model =
    {
        communities: List Community
    }

init : (Model, Cmd Msg)
init = (Model [], Cmd.none)

type Msg
    = NoOp

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    ( model, Cmd.none )

view : Model -> Html Msg
view model =
    div []
        [
            h1 [] [ text "Your Elm App is working!" ]
        ]

main : Program () Model Msg
main =
    Browser.element
        { view = view
        , init = \_ -> init
        , update = update
        , subscriptions = always Sub.none
        }
