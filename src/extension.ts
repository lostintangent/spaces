import { ExtensionContext } from 'vscode';
import * as vsls from "vsls";
import { registerContactProvider } from "./ContactProvider";

export async function activate(context: ExtensionContext) {
	const api = await vsls.getApi();
	registerContactProvider(api!);
}
