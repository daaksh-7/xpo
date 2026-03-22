import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Users, LogOut, RefreshCcw } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { clearAuthSession, getAuthSession } from "@/lib/auth";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "member";
  createdAt: string;
};

const Admin = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const session = getAuthSession();
      if (!session) {
        navigate("/login");
        return;
      }

      if (session.user.role !== "admin") {
        toast({
          title: "Access denied",
          description: "Only admin users can open this panel.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      const data = await api.get<{ users: AdminUser[] }>("/api/admin/users");
      setUsers(data.users);
    } catch (error) {
      toast({
        title: "Could not load users",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                  <Shield className="h-7 w-7 text-primary" />
                  Admin Panel
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage member signups and login records.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={loadUsers} disabled={loading}>
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="hero-outline" asChild>
                  <Link to="/events">View Events</Link>
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>

            <div className="glass rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Registered Users</h2>
                <span className="text-xs text-muted-foreground">({users.length})</span>
              </div>

              {loading ? (
                <div className="p-10 text-center text-muted-foreground">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground">No users registered yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-card/60">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium">Name</th>
                        <th className="text-left px-4 py-3 font-medium">Email</th>
                        <th className="text-left px-4 py-3 font-medium">Role</th>
                        <th className="text-left px-4 py-3 font-medium">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-t border-border/70">
                          <td className="px-4 py-3">{user.name}</td>
                          <td className="px-4 py-3">{user.email}</td>
                          <td className="px-4 py-3 capitalize">{user.role}</td>
                          <td className="px-4 py-3">{new Date(user.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Admin;
