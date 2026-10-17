// Built-in replacements for window.alert / confirm / prompt.
// Each function returns a Promise:
//   showAlert   -> resolves true when dismissed
//   showConfirm -> resolves true (confirm) or false (cancel)
//   showPrompt  -> resolves the entered string, or null when cancelled
import { reactive } from 'vue';

const defaults = {
  kind: 'alert',
  title: '',
  message: '',
  confirmText: 'OK',
  cancelText: 'Annuller',
  danger: false,
  value: '',
  placeholder: '',
};

export const dialogState = reactive({ open: false, resolve: null, ...defaults });

function cancelResult(kind) {
  if (kind === 'prompt') return null;
  return kind === 'alert';
}

function openDialog(options) {
  return new Promise((resolve) => {
    // If another dialog is still open, cancel it first.
    if (dialogState.resolve) dialogState.resolve(cancelResult(dialogState.kind));
    Object.assign(dialogState, defaults, options, { open: true, resolve });
  });
}

export const showAlert = (message, options = {}) => openDialog({ kind: 'alert', message, ...options });
export const showConfirm = (message, options = {}) => openDialog({ kind: 'confirm', message, ...options });
export const showPrompt = (message, options = {}) => openDialog({ kind: 'prompt', message, ...options });

export function closeDialog(confirmed) {
  const { resolve, kind, value } = dialogState;
  dialogState.open = false;
  dialogState.resolve = null;
  if (!resolve) return;
  if (!confirmed) resolve(cancelResult(kind));
  else resolve(kind === 'prompt' ? value : true);
}
