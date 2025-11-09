import { useEffect, useState, useRef } from "react";
import MakeupEditor from "@/components/MakeupEditor";
import { uploadImage, fetchFiles, deleteFile } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cloud, Download, Trash2, Image as ImageIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Index() {
  const [files, setFiles] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const logsRef = useRef<HTMLDivElement>(null);

  const log = (msg: string) => {
    setLogs((l) => [...l, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    if (logsRef.current) {
      setTimeout(() => {
        if (logsRef.current) {
          logsRef.current.scrollTop = logsRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  const handleSave = async (file: Blob) => {
    try {
      log("🚀 Uploading image to cloud...");
      toast.loading("Uploading your look...");
      await uploadImage(file);
      log("✅ Upload successful!");
      toast.success("Look saved to gallery!");
      loadFiles();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || err.message;
      log("❌ Upload failed: " + errorMsg);
      toast.error("Upload failed: " + errorMsg);
    }
  };

  const loadFiles = async () => {
    try {
      log("☁️ Fetching images...");
      const res = await fetchFiles();
      const imageFiles = res.filter((url: string) =>
        url.match(/\.(jpg|jpeg|png|gif)$/i)
      );
      setFiles(imageFiles);
      log(`📸 Found ${imageFiles.length} images.`);
    } catch (err: any) {
      log("⚠️ Fetch files error: " + err.message);
      toast.error("Failed to load gallery");
    }
  };

  const handleDelete = async (url: string) => {
    try {
      log("🗑️ Deleting image...");
      toast.loading("Deleting...");
      await deleteFile(url);
      log("✅ Image deleted successfully.");
      toast.success("Image deleted!");
      setPreview(null);
      loadFiles();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || err.message;
      log("❌ Delete failed: " + errorMsg);
      toast.error("Delete failed: " + errorMsg);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 animate-pulse" />
              Virtual Makeup Studio
            </h1>
            <p className="text-muted-foreground text-lg">
              AI-powered beauty preview & cloud gallery
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Makeup Editor - Takes 3 columns */}
          <div className="xl:col-span-3">
            <Card className="shadow-beauty border-primary/10">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardTitle className="text-2xl flex items-center gap-2">
                  🎥 Live Makeup Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <MakeupEditor onSave={handleSave} />
              </CardContent>
            </Card>
          </div>

          {/* Gallery - Takes 1 column */}
          <div className="xl:col-span-1">
            <Card className="shadow-card sticky top-24">
              <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  Cloud Gallery
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ScrollArea className="h-[600px] pr-4">
                  {files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center space-y-3 text-muted-foreground">
                      <ImageIcon className="w-12 h-12 opacity-50" />
                      <p className="text-sm">No saved looks yet</p>
                      <p className="text-xs">Save your first makeup look!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {files.map((url) => (
                        <button
                          key={url}
                          onClick={() => setPreview(url)}
                          className="relative group aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-all hover:scale-105 shadow-soft"
                        >
                          <img
                            src={url}
                            alt="Saved makeup look"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              View
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Preview Dialog */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Saved Look</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-4">
              <img
                src={preview}
                alt="Preview"
                className="w-full rounded-lg shadow-beauty"
              />
              <div className="flex gap-3 justify-center">
                <Button asChild variant="default">
                  <a href={preview} download>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(preview)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Log Console */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Card className="shadow-card">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Activity Log</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea
                ref={logsRef}
                className="h-32 px-4 py-2 font-mono text-xs"
              >
                {logs.length === 0 ? (
                  <p className="text-muted-foreground">No activity yet...</p>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="text-muted-foreground py-1">
                      {log}
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </footer>
    </div>
  );
}
