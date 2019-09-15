import * as redux from "redux";
import { TextDecoder, TextEncoder } from "util";
import {
  commands,
  Disposable,
  Event,
  EventEmitter,
  FileChangeEvent,
  FileStat,
  FileSystemProvider,
  FileType,
  Uri,
  window,
  workspace
} from "vscode";
import { updateReadme } from "./store/actions";
import { ISpace } from "./store/model";

const SPACE_SCHEME = "space";
const README_EXTENSION = "md";
const PATH_PATTERN = /\/(?<space>\w+)\.md/;

function getSpaceFromUri(uri: Uri) {
  const match = PATH_PATTERN.exec(uri.path);
  return match && match.groups!.space;
}

function getUriForSpace(space: string) {
  return Uri.parse(`${SPACE_SCHEME}:/${space}.${README_EXTENSION}`);
}

export function openSpaceReadme(space: string) {
  const readme = getUriForSpace(space);
  window.showTextDocument(readme);
}

export function previewSpaceReadme(space: string) {
  const readme = getUriForSpace(space);
  commands.executeCommand("markdown.showPreview", readme);
}

class ReadmeFileSystemProvider implements FileSystemProvider {
  constructor(private store: redux.Store) {}

  stat(uri: Uri): FileStat {
    return {
      ctime: 0,
      mtime: 0,
      size: 20,
      type: FileType.File
    };
  }

  readFile(uri: Uri): Uint8Array {
    const spaceName = getSpaceFromUri(uri);

    if (!spaceName) {
      throw new Error("File not found");
    }

    const { spaces } = this.store.getState();
    const space = spaces.find((space: ISpace) => space.name === spaceName);
    const readme = space.readme || "";
    return new TextEncoder().encode(readme);
  }

  writeFile(
    uri: Uri,
    content: Uint8Array,
    options: { create: boolean; overwrite: boolean }
  ): void {
    const space = getSpaceFromUri(uri);
    const readme = new TextDecoder().decode(content);
    this.store.dispatch(updateReadme({ space, readme }));
  }

  /* Unimplimented methods */

  private _onDidChangeFile = new EventEmitter<FileChangeEvent[]>();
  public readonly onDidChangeFile: Event<FileChangeEvent[]> = this
    ._onDidChangeFile.event;

  createDirectory(uri: Uri): void {
    throw new Error("Method not implemented.");
  }

  readDirectory(uri: Uri): [string, FileType][] {
    throw new Error("Method not implemented.");
  }

  delete(uri: Uri, options: { recursive: boolean }): void {
    throw new Error("Method not implemented.");
  }

  rename(oldUri: Uri, newUri: Uri, options: { overwrite: boolean }): void {
    throw new Error("Method not implemented.");
  }

  copy?(source: Uri, destination: Uri, options: { overwrite: boolean }): void {
    throw new Error("Method not implemented.");
  }

  watch(
    uri: Uri,
    options: { recursive: boolean; excludes: string[] }
  ): Disposable {
    throw new Error("Method not implemented.");
  }
}

export function registerFileSystemProvider(store: redux.Store) {
  const provider = new ReadmeFileSystemProvider(store);
  workspace.registerFileSystemProvider(SPACE_SCHEME, provider);
}
