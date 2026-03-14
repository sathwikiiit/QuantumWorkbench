
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
    joins,
    updateTablePosition, 
    togglePin, 
    handleColumnClick,
    pendingJoin,
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
                  onColumnClick={handleColumnClick}
                  isPendingSource={pendingJoin?.tableId === table.id}
                  pendingColumn={pendingJoin?.tableId === table.id ? pendingJoin.column : null}
                />
              ))}

              {/* Dynamic Join Lines */}
              <svg className="absolute inset-0 pointer-events-none w-full h-full">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="0"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--accent))" />
                  </marker>
                </defs>
                {joins.map((join) => {
                  const source = tables.find(t => t.id === join.sourceTableId);
                  const target = tables.find(t => t.id === join.targetTableId);
                  
                  if (!source || !target) return null;

                  // Heuristic for column vertical position (CardHeader is ~45px, each row is ~33px)
                  const sourceColIdx = source.columns.findIndex(c => c.name === join.sourceColumn);
                  const targetColIdx = target.columns.findIndex(c => c.name === join.targetColumn);
                  
                  const startX = source.position.x + 256; // Card width
                  const startY = source.position.y + 45 + (sourceColIdx * 33) + 16;
                  const endX = target.position.x;
                  const endY = target.position.y + 45 + (targetColIdx * 33) + 16;

                  // Quadratic Bezier Curve for smoother lines
                  const cp1x = startX + (endX - startX) / 2;
                  const pathData = `M ${startX} ${startY} C ${cp1x} ${startY}, ${cp1x} ${endY}, ${endX} ${endY}`;

                  return (
                    <g key={join.id}>
                      <path 
                        d={pathData} 
                        fill="none" 
                        stroke="hsl(var(--accent))" 
                        strokeWidth="2" 
                        strokeDasharray="4 2"
                        className="opacity-60 transition-all"
                      />
                      <circle cx={startX} cy={startY} r="3" fill="hsl(var(--accent))" />
                      <circle cx={endX} cy={endY} r="3" fill="hsl(var(--accent))" />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Canvas Controls Overlay */}
            <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
              {pendingJoin && (
                <div className="px-4 py-2 bg-accent text-accent-foreground rounded-md shadow-xl text-xs font-bold animate-bounce flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  SELECT TARGET COLUMN IN ANOTHER TABLE
                </div>
              )}
              <div className="px-3 py-1.5 bg-card/80 backdrop-blur rounded-full border shadow-lg text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Schema Engine Ready
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
