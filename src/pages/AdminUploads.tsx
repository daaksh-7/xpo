import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ImageIcon, LogOut, RefreshCcw, Trash2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { clearAuthSession, getAuthSession } from "@/lib/auth";

type UploadedPhoto = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  category?: string;
};

const categories = [
  { label: "All", value: "all" },
  { label: "Uncategorized", value: "uncategorized" },
  { label: "Workshops", value: "workshops" },
  { label: "Hackathons", value: "hackathons" },
  { label: "Technical Events", value: "technical-events" },
  { label: "Projects", value: "projects" },
  { label: "Fun Activities", value: "fun-activities" },
];

const AdminUploads = () => {
  const session = useMemo(() => getAuthSession(), []);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [activeCategory, setActiveCategory] = useState(categories[0].value);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isAdmin = session?.user.role === "admin";

  const loadPhotos = async () => {
    setLoading(true);
    try {
      if (!session) {
        navigate("/login");
        return;
      }
      if (!isAdmin) {
        toast({
          title: "Access denied",
          description: "Only admin users can open this panel.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      const query = activeCategory !== "all" ? `?category=${encodeURIComponent(activeCategory)}` : "";
      const data = await api.get<{ photos: UploadedPhoto[] }>(`/api/gallery${query}`);
      setPhotos(Array.isArray(data.photos) ? data.photos : []);
    } catch (error) {
      toast({
        title: "Could not load uploads",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [activeCategory]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  const handleDelete = async (photo: UploadedPhoto) => {
    if (!session) {
      navigate("/login");
      return;
    }
    setDeletingId(photo.id);
    try {
      const response = await fetch(`/api/gallery/${encodeURIComponent(photo.id)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "Could not delete photo.");
      }
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      toast({ title: "Deleted", description: "Photo removed successfully." });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                  <ImageIcon className="h-7 w-7 text-primary" />
                  Uploads Admin
                </h1>
                <p className="text-muted-foreground mt-2">Review and delete uploaded images.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={loadPhotos} disabled={loading}>
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="hero-outline" asChild>
                  <Link to="/uploads">Open Uploads</Link>
                </Button>
                <Button variant="hero-outline" asChild>
                  <Link to="/admin">Admin Home</Link>
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>

            <div className="glass border border-border/50 rounded-2xl p-6 md:p-8 mb-8">
              <div className="flex flex-wrap items-center gap-3">
                {categories.map((category) => (
                  <Button
                    key={category.value}
                    type="button"
                    variant={category.value === activeCategory ? "gradient" : "hero-outline"}
                    size="sm"
                    className="rounded-full px-6"
                    onClick={() => setActiveCategory(category.value)}
                    disabled={loading}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">{photos.length} photos shown</p>
            </div>

            {loading ? (
              <div className="text-center text-sm text-muted-foreground py-12">Loading uploads...</div>
            ) : photos.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-12">No uploads found.</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map((photo, index) => (
                  <article
                    key={photo.id}
                    className="gradient-border p-3 card-hover animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="relative rounded-lg overflow-hidden bg-card">
                      <img src={photo.url} alt={photo.name} className="w-full h-56 object-cover" loading="lazy" />
                      <button
                        type="button"
                        onClick={() => void handleDelete(photo)}
                        disabled={deletingId === photo.id}
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/90 hover:bg-background flex items-center justify-center border border-border/60 disabled:opacity-60"
                        aria-label={`Delete ${photo.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AdminUploads;

