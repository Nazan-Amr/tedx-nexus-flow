import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const departments = [
  "IT",
  "Organizing",
  "Graphic Design",
  "Public Relations",
  "Treasury",
  "Marketing & Social Media",
  "Content Writing",
  "HR",
] as const;

export default function Profile() {
  const { user, profile, signOut, deleteAccount } = useAuth() as any;
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState<string | undefined>(undefined);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setEmail(profile.email || "");
      setRole(profile.role || "");
      setDepartment((profile.department as string) || undefined);
      setPhone(profile.phone_number || "");
      setAvatarUrl(profile.avatar_url || undefined);
    }
  }, [profile]);

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(filePath, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    setAvatarUrl(data.publicUrl);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, department: (department as any), avatar_url: avatarUrl, phone_number: phone })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) return toast({ title: "Save failed", description: error.message, variant: "destructive" });
    toast({ title: "Profile updated" });
  };

  return (
    <div className="p-6">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Avatar</Label>
            <div className="flex items-center gap-4 mt-2">
              {avatarUrl && <img src={avatarUrl} alt="avatar" className="h-14 w-14 rounded-full object-cover" />}
              <Input type="file" accept="image/*" onChange={handleAvatar} />
            </div>
          </div>
          <div>
            <Label>Full name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={email} readOnly />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label>Role</Label>
            <Input value={role} readOnly />
          </div>
          <div>
            <Label>Department</Label>
            <Select value={department} onValueChange={(v) => setDepartment(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            <Button variant="secondary" onClick={signOut}>Sign out</Button>
            <Button variant="destructive" onClick={deleteAccount}>Delete account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
