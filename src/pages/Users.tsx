import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Row {
  user_id: string;
  full_name: string;
  email: string;
  department: string | null;
  role: 'management_board' | 'high_board' | 'member';
}

export default function Users() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, department, role')
        .order('full_name');
      if (error) {
        toast({ title: 'Failed to load users', description: error.message, variant: 'destructive' });
      } else {
        setRows(data as Row[]);
      }
      setLoading(false);
    };
    load();
  }, [toast]);

  const removeUser = async (user_id: string) => {
    const { error } = await supabase.functions.invoke('user-admin', { body: { action: 'delete_user', user_id } });
    if (error) return toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    setRows((r) => r.filter((x) => x.user_id !== user_id));
    toast({ title: 'User deleted' });
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                {profile?.role === 'management_board' && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.user_id}>
                  <TableCell>{r.full_name}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.department ?? '-'}</TableCell>
                  <TableCell>{r.role}</TableCell>
                  {profile?.role === 'management_board' && (
                    <TableCell className="text-right">
                      <Button variant="destructive" size="sm" onClick={() => removeUser(r.user_id)}>Delete</Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {loading && <p className="text-sm text-muted-foreground mt-4">Loading...</p>}
        </CardContent>
      </Card>
    </div>
  );
}
