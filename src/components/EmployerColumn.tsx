import { EmployerView } from './EmployerView';
import { EmployerStats } from './EmployerStats';
import { FloatingTextLayer } from './FloatingTextLayer';
import { useDismalFlash } from '../hooks/useDismalFlash';

export function EmployerColumn()
{
  const dismayFlash = useDismalFlash('employer');

  return (
    <div
      className={`column-panel employer-dismal relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded border border-corp-border bg-corp-panel/50 p-2 lg:p-3 ${
        dismayFlash ? 'employer-dismay-flash' : ''
      }`}
    >
      <div className="employer-dismal-vignette pointer-events-none absolute inset-0" />
      <FloatingTextLayer column="employer" />
      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <div className="shrink-0 text-center">
          <i className="fa-solid fa-building employer-lean mb-1 text-2xl text-corp-text lg:text-3xl" />
          <h2 className="font-pixel text-[10px] text-corp-green lg:text-xs">Hiring Manager</h2>
          <p className="employer-bleed-text text-[10px] text-corp-red lg:text-xs">role still open</p>
        </div>
        <div className="mt-2 shrink-0">
          <EmployerStats />
        </div>
        <div className="mt-2 min-h-0 flex-1">
          <EmployerView />
        </div>
      </div>
    </div>
  );
}
