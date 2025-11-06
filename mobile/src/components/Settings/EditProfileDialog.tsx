import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { User } from "@/types";
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";
import { toast } from "sonner";

interface EditProfileDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  user: User;
  onSave: (data: { name: string; imageUrl?: string }) => void;
}

export const EditProfileDialog = ({ open, setOpen, user, onSave }: EditProfileDialogProps) => {
  const [name, setName] = useState(user.name);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Le nom ne peut pas être vide");
      return;
    }
    onSave({ name, imageUrl });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier mon profil</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-6">
          <div className="flex flex-col gap-3">
            <Label>Nom</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
            />
          </div>
          <div className="flex flex-col gap-3">
            <Label>Email</Label>
            <Input
              value={user.email}
              disabled
              className="opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">L'email ne peut pas être modifié</p>
          </div>
          <div className="flex flex-col gap-3">
            <Label>Photo de profil</Label>
            <FileUploaderRegular
              sourceList="local, camera"
              classNameUploader="uc-dark"
              pubkey={import.meta.env.VITE_UPLOADCARE_KEY}
              onChange={(e) => {
                const files = e.successEntries;
                if (files && files.length > 0 && files[0].cdnUrl) {
                  setImageUrl(files[0].cdnUrl);
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <div className="flex gap-3 justify-end">
            <Button onClick={handleSave}>
              Enregistrer
            </Button>
            <Button variant="destructive" onClick={() => { setOpen(false); toast.dismiss(); }}>
              Annuler
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

