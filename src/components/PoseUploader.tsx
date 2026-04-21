import { useState } from "react";
import { Camera, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/authContext";

export default function PoseUploader({ onUploaded }: { onUploaded?: () => void }) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleMime = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);

    try {
      const ext = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("progress-images")
        .upload(fileName, file);

      if (uploadErr) throw new Error("Image upload failed");

      const { data: { publicUrl } } = supabase.storage
        .from("progress-images")
        .getPublicUrl(fileName);

      const { error: dbErr } = await supabase
        .from("progress_photos")
        .insert({
          athlete_id: user.id,
          image_url: publicUrl,
          notes: notes,
          weight: weight ? parseFloat(weight) : null,
        });

      if (dbErr) throw new Error("Database insertion failed");

      toast.success("Progress pose logged successfully!");
      setFile(null);
      setPreview(null);
      setWeight("");
      setNotes("");
      if (onUploaded) onUploaded();

    } catch (err: any) {
      toast.error(err.message || "Failed to upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-card rounded-3xl p-6 border border-border">
      <h3 className="font-bold font-heading mb-4 text-lg">Upload Progress Pose</h3>
      
      {!preview ? (
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-2xl cursor-pointer bg-muted/20 hover:bg-muted/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Camera className="w-8 h-8 mb-3 text-foreground/50" />
            <p className="mb-2 text-sm text-foreground/70 font-medium">Click to capture or upload</p>
          </div>
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleMime} />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-2xl" />
            <button 
              onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 text-xs"
            >
              Change
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Input 
              type="number" 
              placeholder="Current Weight (kg)" 
              value={weight} 
              onChange={e => setWeight(e.target.value)}
              className="rounded-xl h-11"
            />
            <Input 
              type="text" 
              placeholder="Notes (optional)" 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <Button 
            className="w-full h-11 rounded-xl" 
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            {uploading ? "Saving..." : "Log Progress"}
          </Button>
        </div>
      )}
    </div>
  );
}
