import { buffers, eventChannel } from "redux-saga";
import { Extension, extensions } from "vscode";

const CONTRIBUTION_TYPE = "liveshare.spaces";

export enum ExtensionEventType {
  extensionAdded,
  extensionRemoved
}

export interface IExtensionEvent {
  id: string;
  type: ExtensionEventType;
  spaces: string[];
}

function extensionAddedEvent(id: string, spaces: string[]) {
  return { id, type: ExtensionEventType.extensionAdded, spaces };
}

function extensionRemovedEvent(id: string, spaces: string[]) {
  return { id, type: ExtensionEventType.extensionRemoved, spaces };
}

const extensionMap = new Map<string, string[]>();

function processExtensions(
  extensions: readonly Extension<any>[],
  emit: Function
) {
  const extensionsWithSpaces = extensions
    .filter(
      ({ packageJSON: { contributes } }) =>
        contributes && contributes[CONTRIBUTION_TYPE]
    )
    .map(({ id, packageJSON: { contributes } }) => ({
      id,
      spaces: contributes[CONTRIBUTION_TYPE]
    }));

  const newExtensions = extensionsWithSpaces.filter(
    e => !extensionMap.has(e.id)
  );
  const removedExtensions = Array.from(extensionMap.entries()).filter(
    ([id, _]) => !extensions.find(e => e.id === id)
  );

  newExtensions.forEach(({ id, spaces = [] }) => {
    extensionMap.set(id, spaces);
    emit(extensionAddedEvent(id, spaces));
  });

  removedExtensions.forEach(([id, spaces = []]) => {
    extensionMap.delete(id);
    emit(extensionRemovedEvent(id, spaces));
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
