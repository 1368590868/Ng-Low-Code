// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Quill from 'quill';
import QuillToggleFullscreenButton from 'quill-toggle-fullscreen-button';
import BlotFormatter from 'quill-blot-formatter';

export function registerQuill() {
  Quill.register('modules/blotFormatter', BlotFormatter);
  Quill.register('modules/toggleFullscreen', QuillToggleFullscreenButton);
}
