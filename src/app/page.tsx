"use client";

import { useWorkbench } from '@/context/WorkbenchContext';
import { TableNode } from '@/components/workbench/TableNode';
import { Toolbar } from '@/components/workbench/Toolbar';
import { SQLPanel } from '@/components/workbench/SQLPanel';
import { BottomPanel } from '@/components/workbench/BottomPanel';
import { LeftSidebar } from '@/components/workbench/LeftSidebar';
import { Toaster } from '@/components/ui/toaster';
import { Anchor, Info } from 'lucide-react';

export default function WorkbenchPage() {
  const { 
    connections,
    activeConnectionId,
    setActiveConnectionId,
    addConnection,
    testConnection,
    deleteConnection,
    profiles,
    activeProfileId,
    setActiveProfileId,
    addProfile,
    deleteProfile,
    duplicateProfile,
    saveCurrentToProfile,
    tables, 
    joins,
    updateTablePosition, 
    togglePin, 
    handleColumnClick,
    pendingJoin,
    toggleJoinActive,
    generatedSql, 
    executeQuery, 
    isExecuting,
    queryResult,
    history,
    addTableToCanvas,
    removeTableFromCanvas,
    setAsRoot,
    rootTableId,
    reachableTables,
    filters,
    updateFilter,
    removeFilter,
    sorting,
    removeSort,
    limit,
    setLimit,
    addFilter,
    addSort
  } = useWorkbench();

  return (
    <div className="h-screen flex flex-col bg-background selection:bg-primary/30 select-none overflow-hidden">
      <Toolbar 
        connections={connections}
        activeConnectionId={activeConnectionId}
        onConnectionChange={setActiveConnectionId}
        onAddConnection={addConnection}
        onTestConnection={(conn) => testConnection(conn.id)}
        onDeleteConnection={deleteConnection}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onProfileChange={setActiveProfileId}
        onAddProfile={addProfile}
        onDeleteProfile={deleteProfile}
        onDuplicateProfile={duplicateProfile}
        onSaveProfile={saveCurrentToProfile}
        onExecute={executeQuery} 
        isExecuting={isExecuting} 
      />
      
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar onAddTable={addTableToCanvas} />

        <div className="flex-1 relative overflow-hidden flex flex-col">
          <div className="flex-1 relative overflow-hidden canvas-grid bg-[#0a0c10]">
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
                  onAddFilter={addFilter}
                  onAddSort={addSort}
                  isPendingSource={pendingJoin?.tableId === table.id}
                  pendingColumn={pendingJoin?.tableId === table.id ? pendingJoin.column : null}
                />
              ))}

              <svg className="absolute inset-0 pointer-events-none w-full h-full">
                {joins.map((join) => {
                  const source = tables.find(t => t.id === join.sourceTableId);
                  const target = tables.find(t => t.id === join.targetTableId);
                  
                  if (!source || !target) return null;

                  const sIdx = Math.max(0, source.pinnedColumns.indexOf(join.sourceColumn));
                  const tIdx = Math.max(0, target.pinnedColumns.indexOf(join.targetColumn));

                  const startX = source.position.x + 256; 
                  const startY = source.position.y + 110 + (sIdx * 27);
                  const endX = target.position.x;
                  const endY = target.position.y + 110 + (tIdx * 27);

                  const cp1x = startX + (endX - startX) / 2;
                  const pathData = `M ${startX} ${startY} C ${cp1x} ${startY}, ${cp1x} ${endY}, ${endX} ${endY}`;

                  const isReachableJoin = join.active && reachableTables.has(join.sourceTableId) && reachableTables.has(join.targetTableId);

                  return (
                    <g key={join.id} className="transition-all duration-500">
                      <path 
                        d={pathData} 
                        fill="none" 
                        stroke={isReachableJoin ? "hsl(var(--accent))" : "hsl(var(--muted-foreground) / 0.15)"} 
                        strokeWidth={isReachableJoin ? "2.5" : "1.5"} 
                        strokeDasharray={isReachableJoin ? "none" : "5 5"}
                        className="transition-all duration-300"
                      />
                      <circle cx={startX} cy={startY} r="3.5" fill={isReachableJoin ? "hsl(var(--accent))" : "#333"} />
                      <circle cx={endX} cy={endY} r="3.5" fill={isReachableJoin ? "hsl(var(--accent))" : "#333"} />
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="absolute bottom-6 left-6 flex flex-col gap-3">
              <div className="px-5 py-3 bg-black/80 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Active Graph</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-headline font-bold">{tables.length}</span>
                    <span className="text-[10px] text-primary font-black uppercase">Nodes</span>
                  </div>
                </div>
                <div className="h-10 w-[1px] bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Reachable</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-headline font-bold text-accent">{reachableTables.size}</span>
                    <span className="text-[10px] text-accent font-black uppercase">Nodes</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3">
              {pendingJoin && (
                <div className="px-6 py-4 bg-accent text-accent-foreground rounded-2xl shadow-2xl text-[10px] font-black uppercase tracking-[0.2em] animate-pulse flex items-center gap-3 border-4 border-white/30">
                  <div className="w-3 h-3 bg-white rounded-full animate-ping" />
                  SELECT TARGET COLUMN TO ESTABLISH LINK
                </div>
              )}
              {!rootTableId && tables.length > 0 && (
                <div className="px-5 py-3 bg-destructive/90 text-white rounded-xl flex items-center gap-3 text-xs font-black tracking-widest animate-bounce shadow-2xl">
                  <Anchor className="w-4 h-4" />
                  ANCHOR A ROOT TABLE TO ENABLE SQL
                </div>
              )}
              <div className="px-4 py-2 bg-card/40 backdrop-blur-md rounded-full border border-white/5 shadow-xl text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />
                QUANTUM ENGINE ACTIVE
                <Info className="w-3.5 h-3.5 ml-2 opacity-50" />
              </div>
            </div>
          </div>

          <div className="h-[40%] border-t bg-background shadow-2xl z-10">
            <BottomPanel 
              result={queryResult} 
              history={history}
              filters={filters}
              onUpdateFilter={updateFilter}
              onRemoveFilter={removeFilter}
              sorting={sorting}
              onRemoveSort={removeSort}
              joins={joins}
              onToggleJoin={toggleJoinActive}
              tables={tables}
              limit={limit}
              onLimitChange={setLimit}
            />
          </div>
        </div>

        <div className="w-[340px] h-full flex flex-col border-l">
           <SQLPanel sql={generatedSql} />
        </div>
      </div>
      <Toaster />
    </div>
  );
}
