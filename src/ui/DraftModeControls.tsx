'use client';

import { Loader2 } from 'lucide-react';
import { createDataAttribute, stegaClean } from 'next-sanity';
// import { useDraftModeEnvironment } from 'next-sanity/hooks'
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { VscBeakerStop, VscSymbolField } from 'react-icons/vsc';
import { disableDraftMode } from './actions/disableDraftMode';

export default function DraftModeControls({
  globalModules,
}: {
  globalModules?: Sanity.GlobalModule[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // const environment = useDraftModeEnvironment()
  // if (!['live', 'unknown'].includes(environment)) return null

  const pathname = usePathname();

  const filteredGlobalModules = globalModules
    ?.filter(({ path, excludePaths: ex }) => {
      const p = stegaClean(path);
      const curr = pathname.replace(/^\//, '');

      return p === '*' || (curr.startsWith(p) && !ex?.some((e) => curr.startsWith(e)));
    })
    .sort((a, b) => a.path.localeCompare(b.path));

  const disable = () =>
    startTransition(async () => {
      await disableDraftMode();
      router.refresh();
    });

  return (
    <details className="fixed right-4 bottom-0 rounded-t bg-amber-200/90 text-xs shadow-xl not-hover:opacity-50 open:opacity-100">
      <summary className="p-2">Draft Mode</summary>

      <menu className="anim-fade-to-r p-2 pt-0">
        {filteredGlobalModules?.map(({ _id, path }) => {
          const attr = createDataAttribute({
            id: _id,
            type: 'global-module',
            path: 'path',
          });

          return (
            <li key={_id}>
              <button
                type="button"
                className="inline-flex items-center gap-1 py-0.5"
                data-sanity={attr().toString()}
              >
                <VscSymbolField className="shrink-0" />
                Global modules (<code>{path}</code>)
              </button>
            </li>
          );
        })}

        <hr className="my-1" />

        <li>
          {pending ? (
            <div className="inline-flex items-center gap-1 py-0.5">
              <Loader2 className="size-3 shrink-0 animate-spin" />
              Disabling draft mode...
            </div>
          ) : (
            <button
              type="button"
              className="inline-flex items-center gap-1 py-0.5 hover:underline"
              onClick={disable}
              disabled={pending}
            >
              <VscBeakerStop className="shrink-0" />
              Disable Draft Mode
            </button>
          )}
        </li>
      </menu>
    </details>
  );
}
