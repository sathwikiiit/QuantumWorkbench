"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Connection, DBType } from '@/lib/types';
import { Database, Shield, Globe, Terminal, Loader2, Lock } from 'lucide-react';

interface ConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection?: Connection;
  onSave: (conn: Omit<Connection, 'id' | 'status'>) => void;
  onTest: (conn: Connection) => Promise<boolean>;
}

export function ConnectionDialog({ open, onOpenChange, connection, onSave, onTest }: ConnectionDialogProps) {
  const [formData, setFormData] = useState<Omit<Connection, 'id' | 'status'>>({
    name: '',
    type: 'PostgreSQL',
    host: '',
    port: 5432,
    databaseName: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    if (connection) {
      setFormData({
        name: connection.name || '',
        type: connection.type || 'PostgreSQL',
        host: connection.host || '',
        port: connection.port || 5432,
        databaseName: connection.databaseName || '',
        username: connection.username || '',
        password: connection.password || '',
      });
    } else {
      setFormData({
        name: '',
        type: 'PostgreSQL',
        host: '',
        port: 5432,
        databaseName: '',
        username: '',
        password: '',
      });
    }
  }, [connection, open]);

  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    setIsTesting(true);
    await onTest({ ...formData, id: connection?.id || 'temp', status: 'disconnected' });
    setIsTesting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            {connection ? 'Edit Connection' : 'New Connection'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-xs font-bold uppercase">Name</Label>
            <Input id="name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="col-span-3 h-8 text-xs" placeholder="Production v1" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right text-xs font-bold uppercase">Type</Label>
            <Select value={formData.type} onValueChange={(v: DBType) => setFormData({...formData, type: v})}>
              <SelectTrigger className="col-span-3 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                <SelectItem value="MySQL">MySQL</SelectItem>
                <SelectItem value="SQLite">SQLite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="host" className="text-right text-xs font-bold uppercase">Host</Label>
            <Input id="host" value={formData.host || ''} onChange={e => setFormData({...formData, host: e.target.value})} className="col-span-3 h-8 text-xs font-mono" placeholder="db.prod.internal" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="port" className="text-right text-xs font-bold uppercase">Port</Label>
            <Input id="port" type="number" value={formData.port || 5432} onChange={e => setFormData({...formData, port: parseInt(e.target.value) || 0})} className="col-span-3 h-8 text-xs font-mono" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="db" className="text-right text-xs font-bold uppercase">Database</Label>
            <Input id="db" value={formData.databaseName || ''} onChange={e => setFormData({...formData, databaseName: e.target.value})} className="col-span-3 h-8 text-xs font-mono" placeholder="main_db" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="user" className="text-right text-xs font-bold uppercase">Username</Label>
            <Input id="user" value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} className="col-span-3 h-8 text-xs font-mono" placeholder="admin" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pass" className="text-right text-xs font-bold uppercase">Password</Label>
            <Input id="pass" type="password" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} className="col-span-3 h-8 text-xs font-mono" placeholder="••••••••" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={handleTest} disabled={isTesting} className="text-[10px] font-black uppercase">
            {isTesting ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Terminal className="w-3 h-3 mr-2" />}
            Test Connection
          </Button>
          <Button size="sm" onClick={() => onSave(formData)} className="text-[10px] font-black uppercase">Save Connection</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}