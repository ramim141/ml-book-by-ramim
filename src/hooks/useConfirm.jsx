import { useCallback, useState } from 'react';
import ConfirmDialog from '../components/UI/ConfirmDialog';

/**
 * `confirm()` পুরো ট্যাব আটকে রাখে, দেখতে অ্যাপের সাথে মেলে না।
 * এটি promise ফেরত দেয়, তাই কল করার ধরন প্রায় একই থাকে:
 *
 *   const [confirm, confirmDialog] = useConfirm();
 *   if (!(await confirm({ title: '...', message: '...' }))) return;
 *   // ...JSX এর শেষে {confirmDialog}
 */
export function useConfirm() {
  const [request, setRequest] = useState(null);

  const confirm = useCallback(
    (options = {}) => new Promise((resolve) => setRequest({ ...options, resolve })),
    []
  );

  const close = useCallback((answer) => {
    setRequest((current) => {
      current?.resolve(answer);
      return null;
    });
  }, []);

  const dialog = request ? <ConfirmDialog {...request} onClose={close} /> : null;

  return [confirm, dialog];
}

