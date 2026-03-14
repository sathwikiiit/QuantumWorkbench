
"use client";

import { useWorkbenchState } from '@/hooks/use-workbench-state';
import { TableNode } from '@/components/workbench/TableNode';
import { Toolbar } from '@/components/workbench/Toolbar';
import { SQLPanel } from '@/components/workbench/SQLPanel';
import { BottomPanel } from '@/components/workbench/BottomPanel';
import { LeftSidebar } from '@/components/workbench/LeftSidebar';
import { Toaster } from '@/components/ui/toaster';

export default function WorkbenchPage() {
  const { 
    tables, 
    updateTablePosition, 
    togglePin, 
    generatedSql, 
    executeQuery, 
    isExecuting,
    queryResult,
    history
  } = useWorkbenchState();

  return (
    <div className="h-screen flex flex-col bg-background selection:bg-primary/30">
      <Toolbar onExecute={executeQuery} isExecuting={isExecuting} />
      
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar />

        <div className="flex-1 relative overflow-hidden flex flex-col">
          {/* Main Workspace Canvas */}
          <div className="flex-1 relative overflow-hidden canvas-grid bg-[#1a1c22]">
            <div className="absolute inset-0 p-10">
              {tables.map(table => (
                <TableNode 
                  key={table.id} 
                  table={table} 
                  onMove={updateTablePosition}
                  onTogglePin={togglePin}
                />
              ))}

              {/* Join Lines visualization SVG Layer would go here */}
              <svg className="absolute inset-0 pointer-events-none w-full h-full">
                {/* Simplified static join rendering */}
                <path 
                  d="M 314 110 L 400 200" 
                  fill="none" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth="2" 
                  strokeDasharray="4 2"
                  className="animate-pulse"
                />
              </svg>
            </div>

            {/* Canvas Controls Overlay */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <div className="px-3 py-1.5 bg-card/80 backdrop-blur rounded-full border shadow-lg text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Live Schema Engine Active
              </div>
            </div>
          </div>

          {/* Bottom Results Area */}
          <div className="h-1/3 border-t">
            <BottomPanel result={queryResult} history={history} />
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="w-80 h-full">
          <SQLPanel sql={generatedSql} />
        </div>
      </div>
      <Toaster />
    </div>
  );
}
