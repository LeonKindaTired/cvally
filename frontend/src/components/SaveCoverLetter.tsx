import { supabase } from "@/supabase/supabase-client";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface SaveCoverLetterProps {
  content: string;
  jobTitle: string;
  company: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SaveCoverLetter = ({
  content,
  jobTitle,
  company,
  open,
  onOpenChange,
}: SaveCoverLetterProps) => {
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please Enter a title");
      return;
    }

    setIsSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to save cover letters");
        return;
      }

      const { error } = await supabase.from("cover_letters").insert({
        user_id: user.id,
        title,
        content,
        job_title: jobTitle,
        company,
      });

      if (error) throw error;

      toast.success("Cover letter saved successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving cover letter: ", error);
      toast.error("Failed to save cover letter");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Cover Letter</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Cover letter title"
            />
          </div>
          <div className="space-y-2">
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium">Job Title</p>
                <p className="text-sm text-muted-foreground">{jobTitle}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Company</p>
                <div className="text-sm text-muted-foreground">{company}</div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveCoverLetter;
