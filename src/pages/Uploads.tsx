import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth";

type UploadedPhoto = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  category?: string;
};

const MAX_FILE_SIZE_MB = 8;

const uploadCategories = [
  { label: "Uncategorized", value: "uncategorized" },
  { label: "Workshops", value: "workshops" },
  { label: "Hackathons", value: "hackathons" },
  { label: "Technical Events", value: "technical-events" },
  { label: "Projects", value: "projects" },
  { label: "Fun Activities", value: "fun-activities" },
];

const Uploads = () => {
  const session = useMemo(() => getAuthSession(), []);
  const isAdmin = session?.user.role === "admin";

  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(uploadCategories[0].value);
  const [moveTargetCategory, setMoveTargetCategory] = useState("hackathons");

  const loadPhotos = async (category: string) => {
    setIsLoading(true);
    setPhotos([]);
    try {
      const response = await fetch(`/api/gallery?category=${encodeURIComponent(category)}`);
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load uploads.");
      }

      setPhotos(Array.isArray(payload?.photos) ? payload.photos : []);
      setErrorMessage("");
    } catch (error) {
      setPhotos([]);
      setErrorMessage(error instanceof Error ? error.message : "Could not load uploads.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPhotos(activeCategory);
  }, [activeCategory]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) {
      return;
    }

    if (activeCategory === "uncategorized") {
      setErrorMessage("Choose a category above before uploading.");
      event.target.value = "";
      return;
    }

    const oversized = selectedFiles.find((file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversized) {
      setErrorMessage(`${oversized.name} is too large. Max size is ${MAX_FILE_SIZE_MB}MB per image.`);
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("photos", file));

    setIsUploading(true);
    try {
      const response = await fetch(`/api/gallery?category=${encodeURIComponent(activeCategory)}`, {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Upload failed. Please try again.");
      }

      const newPhotos = Array.isArray(payload?.photos) ? payload.photos : [];
      setPhotos((prev) => [...newPhotos, ...prev]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not upload photos.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleDeletePhoto = async (id: string) => {
    setErrorMessage("");
    try {
      if (!isAdmin || !session?.token) {
        throw new Error("Admin access required to delete photos.");
      }

      const response = await fetch(`/api/gallery/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Could not delete photo.");
      }

      setPhotos((prev) => prev.filter((photo) => photo.id !== id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not delete photo.");
    }
  };

  const handleMoveAllUncategorized = async () => {
    setErrorMessage("");
    if (activeCategory !== "uncategorized") {
      return;
    }
    if (!photos.length) {
      return;
    }
    if (!isAdmin || !session?.token) {
      setErrorMessage("Admin access required to move photos.");
      return;
    }

    setIsUploading(true);
    try {
      for (const photo of photos) {
        const response = await fetch("/api/gallery/assign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
          body: JSON.stringify({ id: photo.id, category: moveTargetCategory }),
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.message || "Could not move some photos.");
        }
      }

      await loadPhotos(activeCategory);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not move photos.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Layout>
      <section className="pt-20 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-40" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              <span className="text-gradient">Uploads</span>
            </h1>
            <p className="text-lg text-muted-foreground mt-4">Upload event photos to the shared folder</p>
            <div className="h-1 w-28 rounded-full bg-gradient-to-r from-primary to-accent mx-auto mt-6" />

            <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
              {uploadCategories.map((category) => {
                const isActive = category.value === activeCategory;
                return (
                  <Button
                    key={category.value}
                    type="button"
                    variant={isActive ? "gradient" : "hero-outline"}
                    size="sm"
                    className="rounded-full px-6"
                    onClick={() => setActiveCategory(category.value)}
                    disabled={isUploading}
                  >
                    {category.label}
                  </Button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-3">
              <div className="flex items-center justify-center gap-3">
                <label
                  htmlFor="uploads-upload"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <ImagePlus className="h-4 w-4" />
                  {isUploading ? "Uploading..." : "Upload Photos"}
                </label>
                <input
                  id="uploads-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleUpload}
                  disabled={isUploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void loadPhotos(activeCategory)}
                  disabled={isUploading}
                  className="rounded-full px-6"
                >
                  Refresh
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Files are saved to the server and become visible in the Gallery automatically.
              </p>

              {isAdmin && activeCategory === "uncategorized" && photos.length > 0 && (
                <div className="flex flex-col items-center gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Move all to</span>
                    <select
                      className="h-9 px-3 rounded-md bg-background border border-input text-sm"
                      value={moveTargetCategory}
                      onChange={(e) => setMoveTargetCategory(e.target.value)}
                      disabled={isUploading}
                    >
                      <option value="workshops">Workshops</option>
                      <option value="hackathons">Hackathons</option>
                      <option value="technical-events">Technical Events</option>
                      <option value="projects">Projects</option>
                      <option value="fun-activities">Fun Activities</option>
                    </select>
                    <Button type="button" variant="hero-outline" onClick={handleMoveAllUncategorized} disabled={isUploading}>
                      Move
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center max-w-lg">
                    Older uploads saved before category folders existed may appear here. Move them to the correct category once.
                  </p>
                </div>
              )}
            </div>

            {errorMessage && <p className="text-sm text-destructive mt-6">{errorMessage}</p>}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center text-sm text-muted-foreground py-12">Loading uploads...</div>
          ) : photos.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-12">No uploads yet.</div>
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
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => void handleDeletePhoto(photo.id)}
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/90 hover:bg-background flex items-center justify-center border border-border/60"
                        aria-label={`Delete ${photo.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 truncate" title={photo.name}>
                    {photo.name}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Uploads;

