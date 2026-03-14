
"use client";

import { useWorkbenchState } from '@/hooks/use-workbench-state';
import { TableNode } from '@/components/workbench/TableNode';
import { Toolbar } from '@/components/workbench/Toolbar';
import { SQLPanel } from '@/components/workbench/SQLPanel';
import { BottomPanel } from '@/components/workbench/BottomPanel';
import { LeftSidebar } from '@/components/workbench/LeftSidebar';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { Anchor, Info } from 'lucide-react';

export default function WorkbenchPage() {
  const { 
    connections,
    activeConnectionId,
    setActiveConnectionId,
    profiles,
    activeProfileId,
    setActiveProfileId,
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
    history,
    addTableToCanvas,
    removeTableFromCanvas,
    setAsRoot,
    rootTableId,
    reachableTables
  } = useWorkbenchState();

  return (
    <div className="h-screen flex flex-col bg-background selection:bg-primary/30 select-none">
      <Toolbar 
        connections={connections}
        activeConnectionId={activeConnectionId}
        onConnectionChange={setActiveConnectionId}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onProfileChange={setActiveProfileId}
        onExecute={executeQuery} 
        isExecuting={isExecuting} 
      />
      
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar onAddTable={addTableToCanvas} />

        <div className="flex-1 relative overflow-hidden flex flex-col">
          {/* Main Workspace Canvas */}
          <div className="flex-1 relative overflow-hidden canvas-grid bg-[#12141a]">
            <div className="absolute inset-0 p-20">
              {tables.map(table => (
                <TableNode 
                  key={table.id} 
                  table={table} 
                  isRoot={rootTableId === table.id}
                  isReachable={reachableTables.has(table.id)}
                  onMove={updateTablePosition}
                  onTogglePin={togglePin}
                  onColumnClick={handleColumnClick}
                  onRemove={removeTableFromCanvas}
                  onSetRoot={setAsRoot}
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

                  const sourceColIdx = source.pinnedColumns.indexOf(join.sourceColumn);
                  const targetColIdx = target.pinnedColumns.indexOf(join.targetColumn);
                  
                  // If columns aren't pinned, default to top
                  const sIdx = sourceColIdx !== -1 ? sourceColIdx : 0;
                  const tIdx = targetColIdx !== -1 ? targetColIdx : 0;

                  const startX = source.position.x + 256; 
                  const startY = source.position.y + 110 + (sIdx * 27);
                  const endX = target.position.x;
                  const endY = target.position.y + 110 + (tIdx * 27);

                  const cp1x = startX + (endX - startX) / 2;
                  const pathData = `M ${startX} ${startY} C ${cp1x} ${startY}, ${cp1x} ${endY}, ${endX} ${endY}`;

                  const isReachableJoin = reachableTables.has(join.sourceTableId) && reachableTables.has(join.targetTableId);

                  return (
                    <g key={join.id}>
                      <path 
                        d={pathData} 
                        fill="none" 
                        stroke={isReachableJoin ? "hsl(var(--accent))" : "hsl(var(--muted-foreground) / 0.3)"} 
                        strokeWidth={isReachableJoin ? "2" : "1"} 
                        strokeDasharray={isReachableJoin ? "none" : "4 4"}
                        className="transition-all duration-500"
                      />
                      <circle cx={startX} cy={startY} r="3" fill={isReachableJoin ? "hsl(var(--accent))" : "gray"} />
                      <circle cx={endX} cy={endY} r="3" fill={isReachableJoin ? "hsl(var(--accent))" : "gray"} />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Canvas Info Overlay */}
            <div className="absolute bottom-6 left-6 flex flex-col gap-3">
              <div className="px-4 py-2 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Active Tables</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-headline font-bold">{tables.length}</span>
                    <span className="text-[10px] text-primary font-bold">({reachableTables.size} Reachable)</span>
                  </div>
                </div>
                <div className="h-8 w-[1px] bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Joins</span>
                  <span className="text-xl font-headline font-bold">{joins.length}</span>
                </div>
              </div>
            </div>

            {/* Canvas Controls Overlay */}
            <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3">
              {pendingJoin && (
                <div className="px-6 py-3 bg-accent text-accent-foreground rounded-2xl shadow-2xl text-[10px] font-black uppercase tracking-[0.2em] animate-bounce flex items-center gap-3 border-4 border-white/20">
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                  SELECT TARGET COLUMN TO JOIN
                </div>
              )}
              {!rootTableId && tables.length > 0 && (
                <div className="px-4 py-2 bg-destructive/80 text-white rounded-lg flex items-center gap-2 text-xs font-bold animate-pulse">
                  <Anchor className="w-4 h-4" />
                  SET A ROOT TABLE TO START QUERYING
                </div>
              )}
              <div className="px-4 py-2 bg-card/40 backdrop-blur-xl rounded-full border border-white/5 shadow-xl text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                NEURAL ENGINE LINKED
                <Info className="w-3 h-3 ml-2 opacity-50" />
              </div>
            </div>
          </div>

          {/* Bottom Results Area */}
          <div className="h-1/3 border-t bg-background shadow-2xl z-10">
            <BottomPanel result={queryResult} history={history} />
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="w-[320px] h-full flex flex-col border-l">
           <SQLPanel sql={generatedSql} />
        </div>
      </div>
      <Toaster />
    </div>
  );
}
