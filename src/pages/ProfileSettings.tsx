import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/authContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Save } from "lucide-react";
import { toast } from "sonner";

export default function ProfileSettings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState("Professional bodybuilder competing in Men's Open. 5x national qualifier.");
  const [weight, setWeight] = useState("97.6");
  const [height, setHeight] = useState("5'11\"");
  const [age, setAge] = useState("28");

  const handleSave = () => toast.success("Profile updated successfully!");

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold font-heading">Profile Settings</h1>

        <div className="bg-card rounded-3xl p-8 border border-border space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-pastel-lavender flex items-center justify-center text-2xl font-bold">
              {user?.avatar}
            </div>
            <Button variant="outline" className="rounded-2xl gap-2">
              <Camera className="w-4 h-4" /> Change Photo
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-2xl" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-2xl" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Bio</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="rounded-2xl min-h-[100px]" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Weight (kg)</label>
              <Input value={weight} onChange={(e) => setWeight(e.target.value)} className="h-12 rounded-2xl" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Height</label>
              <Input value={height} onChange={(e) => setHeight(e.target.value)} className="h-12 rounded-2xl" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Age</label>
              <Input value={age} onChange={(e) => setAge(e.target.value)} className="h-12 rounded-2xl" />
            </div>
          </div>

          <Button onClick={handleSave} className="rounded-2xl h-12 gap-2 w-full">
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>

        <div className="bg-card rounded-3xl p-8 border border-border space-y-4">
          <h3 className="font-bold font-heading">Notifications</h3>
          {["Meal reminders", "Hydration alerts", "Trainer messages", "Weekly reports", "Weigh-in reminders"].map((item) => (
            <label key={item} className="flex items-center justify-between py-2">
              <span className="text-sm">{item}</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-foreground" />
            </label>
          ))}
        </div>

        <div className="bg-pastel-mint pastel-card space-y-3">
          <h3 className="font-bold font-heading">Supplement Notes</h3>
          <Textarea placeholder="Log your supplement stack..." className="rounded-2xl" defaultValue="Creatine 5g daily, BCAAs 10g intra-workout, Glutamine 5g post-workout, Multivitamin AM" />
        </div>

        <div className="bg-pastel-peach pastel-card space-y-3">
          <h3 className="font-bold font-heading">Performance Notes (Trainer Only)</h3>
          <Textarea placeholder="Private performance notes..." className="rounded-2xl" defaultValue="Week 8 prep notes: Condition improving, vascularity visible. Maintain current protocol." />
        </div>
      </div>
    </DashboardLayout>
  );
}
