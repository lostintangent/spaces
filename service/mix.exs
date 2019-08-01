defmodule LiveShareCommunities.MixProject do
  use Mix.Project

  def project do
    [
      app: :communities,
      version: "0.1.0",
      elixir: "~> 1.8",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      extra_applications: [:logger],
      mod: {LiveShareCommunities, []}
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:cowboy, "~> 2.4"},
      {:plug, "~> 1.3"},
      {:plug_cowboy, "~> 2.0"},
      {:poison, "~> 4.0.1"},
      {:timex, "~> 3.0"},

      # distillery to create release
      {:distillery, "~> 2.1"}
    ]
  end
end
