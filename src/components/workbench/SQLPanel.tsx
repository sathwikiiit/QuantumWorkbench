
"use client";

import { Button } from '@/components/ui/button';
import { Copy, Check, Terminal, ExternalLink, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function SQLPanel({ sql }: { sql: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSql = (code: string) => {
    // Very basic syntax highlighting logic for visualization
    const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'ON', 'AS', 'AND', 'OR', 'ORDER BY', 'LIMIT', 'GROUP BY'];
    let highlighted = code;
    keywords.forEach(word => {
      const reg = new RegExp(`\\b${word}\\b`, 'g');
      highlighted = highlighted.replace(reg, `<span class="text-primary font-bold">${word}</span>`);
    });
    return highlighted;
  };

  return (
    <div className="flex flex-col h-full bg-card border-l overflow-hidden">
      <div className="p-3 border-b flex items-center justify-between bg-background/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-bold font-headline tracking-widest text-muted-foreground">SQL GENERATOR</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4 bg-[#0d1117]">
        <pre 
          className="text-xs code-block leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatSql(sql) }}
        />
      </ScrollArea>
      <div className="p-3 border-t bg-background/50 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
        <div className="flex items-center gap-3">
          <span>PARSED: SUCCESS</span>
          <span className="text-accent">VERSION: 2.1.0-RC</span>
        </div>
        <button className="hover:text-destructive flex items-center gap-1">
          <Trash2 className="w-3 h-3" /> CLEAR
        </button>
      </div>
    </div>
  );
}
