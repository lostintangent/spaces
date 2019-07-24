defmodule LiveShareCAN.MixProject do
  use Mix.Project

  def project do
    [
      app: :live_share_can,
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
      mod: {LiveShareCAN, []}
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:cowboy, "~> 1.1"},
      {:plug, "~> 1.3"},
      {:poison, "~> 3.0"},
      {:plug_cowboy, "~> 1.0"},

      # distillery to create release
      {:distillery, "~> 2.1"}
    ]
  end
end
