import * as path from "path";
import { window, WebviewPanel, Uri, ViewColumn } from "vscode";

export function createWebView(extensionPath: string): WebviewPanel {
  const staticResourcePath = path.join(extensionPath, "webView/static");
  const webViewBaseUri = Uri.file(staticResourcePath).with({
    scheme: "vscode-resource"
  });

  const panel = window.createWebviewPanel(
    "vsls-communities",
    "Live Share Communities",
    ViewColumn.Active,
    {
      enableScripts: true,
      localResourceRoots: [webViewBaseUri],
      retainContextWhenHidden: true
    }
  );

  panel.webview.html = getWebViewContents(webViewBaseUri);
  return panel;
}

function getWebViewContents(webViewBaseUri: Uri): string {
  return `<!DOCTYPE html>
<html>
	<head>
		<base href="${webViewBaseUri.toString()}/" />
    <link rel="stylesheet" href="main.css" />
    <script src="Main.js"></script>
	</head>
	<body>
    <div id="root"></div>
		<script>Elm.Main.init({ node: document.getElementById("root") });</script>
	</body>
</html>`;
}