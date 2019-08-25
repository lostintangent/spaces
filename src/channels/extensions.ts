import { buffers, eventChannel } from "redux-saga";
import { Extension, extensions } from "vscode";

const CONTRIBUTION_TYPE = "liveshare.communities";

export enum ExtensionEventType {
  extensionAdded,
  extensionRemoved
}

export interface IExtensionEvent {
  type: ExtensionEventType;
  communities: string[];
}

const extensionMap = new Map<string, string[]>();

function processExtensions(
  extensions: readonly Extension<any>[],
  emit: Function
) {
  const extensionsWithCommunities = extensions
    .filter(
      ({ packageJSON: { contributes } }) =>
        contributes && contributes[CONTRIBUTION_TYPE]
    )
    .map(({ id, packageJSON: { contributes } }) => ({
      id,
      communities: contributes[CONTRIBUTION_TYPE]
    }));

  const newExtensions = extensionsWithCommunities.filter(
    e => !extensionMap.has(e.id)
  );
  const removedExtensions = Array.from(extensionMap.entries()).filter(
    ([id, _]) => !extensions.find(e => e.id === id)
  );

  newExtensions.forEach(({ id, communities }) => {
    extensionMap.set(id, communities);
    emit({ type: ExtensionEventType.extensionAdded, communities });
  });

  removedExtensions.forEach(([id, communities]) => {
    extensionMap.delete(id);
    emit({ type: ExtensionEventType.extensionRemoved, communities });
  });
}

export function createExtensionsChannel() {
  return eventChannel((emit: Function) => {
    processExtensions(extensions.all, emit);

    const onDidChangehandler = extensions.onDidChange(e => {
      processExtensions(extensions.all, emit);
    });

    return () => {
      onDidChangehandler.dispose();
    };
  }, buffers.expanding());
}
