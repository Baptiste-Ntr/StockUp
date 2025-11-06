import { api } from "@/lib/api";
import { type Category, type Club, type CreateArticleDto } from "@/types";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useMutationWithInvalidation } from "@/hooks/useMutationWithInvalidation";
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";

export const CreateArticle = ({
  open,
  setOpen,
  categories,
  clubId
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  categories: Category[];
  clubId: Club["id"];
}) => {
  const [articleData, setArticleData] = useState<CreateArticleDto>({
    name: "",
    description: "",
    price: 0,
    clubId
  });

  const [priceInput, setPriceInput] = useState<string>("");

  const createArticleMutation = useMutationWithInvalidation({
    mutationFn: (data: CreateArticleDto) => api.articles.create(data),
    
    // Spécifier quelles queries invalider après la mutation
    invalidateKeys: [["articles"], ["categories"]],
    
    // Messages de toast
    loadingMessage: "Création de l'article en cours...",
    successMessage: "L'article a bien été créé",
    errorMessage: "Erreur lors de la création de l'article",
    
    // Actions supplémentaires après succès
    onSuccess: (newArticle) => {
      console.log("✅ Article créé:", newArticle);
      
      // Fermer le dialogue et réinitialiser le formulaire
      setOpen(false);
      setArticleData({
        name: "",
        description: "",
        price: 0,
        clubId,
        categoryId: undefined
      });
      setPriceInput("");
    },
  });

  console.log(categories)

  return (
    <Dialog open={open} >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Création de l'article</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-start gap-4 py-6">
          <div className="flex flex-col gap-3">
            <Label>Nom</Label>
            <Input
              value={articleData.name}
              onChange={(e) =>
                setArticleData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex flex-col gap-3">
            <Label>Description</Label>
            <Input
              value={articleData.description}
              onChange={(e) =>
                setArticleData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            ></Input>
          </div>
          <div className="flex flex-col gap-3">
            <Label>Prix</Label>
            <Input
              type="number"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
            ></Input>
          </div>
          <div className="flex flex-col gap-3">
            <Label>Image de l'article</Label>
            <FileUploaderRegular
              sourceList="local, camera"
              classNameUploader="uc-dark"
              pubkey={import.meta.env.VITE_UPLOADCARE_KEY}
              onChange={(e) => {
                const files = e.successEntries;
                if (files && files.length > 0 && files[0].cdnUrl) {
                  setArticleData((prev) => ({
                    ...prev,
                    imageUrl: files[0].cdnUrl,
                  }));
                }
              }}
            />
          </div>
          <div className="flex flex-col gap-3 w-full">
            <Label>Catégorie {categories.length < 1 && "(optionnel)"}</Label>
            {categories.length < 1 ? (
              <div className="text-sm text-gray-500 p-3 border border-dashed rounded-md">
                Aucune catégorie disponible. Créez-en une pour organiser vos articles.
              </div>
            ) : (
              <Select 
                value={articleData.categoryId || "none"} 
                onValueChange={(value: string) => 
                  setArticleData((prev) => ({
                    ...prev,
                    categoryId: value === "none" ? undefined : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune catégorie</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <DialogFooter>
          <div className="flex gap-3 justify-end">
            <Button 
              onClick={() => 
                createArticleMutation.mutate({
                  ...articleData,
                  price: priceInput === "" ? 0 : Number(priceInput),
                })
              }
            >
              Créer l'article
            </Button>
            <Button variant="destructive" onClick={() => {setOpen(false); toast.dismiss()}}>
              Annuler
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 