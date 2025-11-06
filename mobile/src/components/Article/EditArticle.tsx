import type { Article, Category, UpdateArticleDto } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from "../ui/card";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Check, X, Minus, Plus, Package, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useState } from "react";
import { useMutationWithInvalidation } from "@/hooks/useMutationWithInvalidation";
import { api } from "@/lib/api";
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";

export const EditArticle = ({ 
  data, 
  categories = [],
  onCancel 
}: { 
  data: Article;
  categories?: Category[];
  onCancel: () => void;
}) => {
  const [name, setName] = useState<string>(data.name);
  const [description, setDescription] = useState<string>(data.description);
  const [price, setPrice] = useState<string>(data.price.toString());
  const [stock, setStock] = useState<number>(data.stock ?? 0);
  const [imageUrl, setImageUrl] = useState<string | undefined>(data.imageUrl);
  const [categoryId, setCategoryId] = useState<string | undefined>(data.categoryId);

  const updateArticleMutation = useMutationWithInvalidation({
    mutationFn: (updateData: UpdateArticleDto) => 
      api.articles.update(data.id, updateData),
    invalidateKeys: [["articles"]],
    loadingMessage: "Mise à jour de l'article en cours...",
    successMessage: "L'article a bien été mis à jour",
    errorMessage: "Erreur lors de la mise à jour de l'article",
    onSuccess: () => {
      onCancel();
    },
  });

  const handleSave = () => {
    updateArticleMutation.mutate({ 
      name, 
      description, 
      stock,
      price: price === "" ? 0 : Number(price),
      imageUrl,
      categoryId
    });
  };

  const handleRemoveImage = () => {
    setImageUrl(undefined);
  };

  const handleDecrement = () => {
    setStock((prev) => Math.max(0, prev - 1));
  };

  const handleIncrement = () => {
    setStock((prev) => prev + 1);
  };

  return (
    <Card key={data.id}>
      <CardContent>
        <div className="flex gap-5">
          <div className="flex flex-col gap-2">
            <div className="h-15 w-15">
              {imageUrl ? (
                <img
                  className="rounded-xl"
                  src={`${imageUrl}/-/preview/736x736/`}
                  alt={data.name}
                />
              ) : (
                <div className="h-15 w-15 rounded-xl bg-gray-200 flex items-center justify-center">
                  <Package className="text-gray-400" size={32} />
                </div>
              )}
            </div>
            {imageUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveImage}
                disabled={updateArticleMutation.isPending}
                className="w-15"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex flex-col gap-1">
              <Label htmlFor="edit-name">Nom</Label>
              <Input 
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={updateArticleMutation.isPending}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="edit-description">Description</Label>
              <Input 
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={updateArticleMutation.isPending}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="edit-price">Prix (€)</Label>
              <Input 
                id="edit-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={updateArticleMutation.isPending}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Image de l'article</Label>
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
            <div className="flex flex-col gap-1">
              <Label htmlFor="edit-category">Catégorie</Label>
              {categories.length < 1 ? (
                <div className="text-xs text-gray-500 p-2 border border-dashed rounded-md">
                  Aucune catégorie disponible
                </div>
              ) : (
                <Select 
                  value={categoryId || "none"} 
                  onValueChange={(value: string) => 
                    setCategoryId(value === "none" ? undefined : value)
                  }
                  disabled={updateArticleMutation.isPending}
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
            <CardDescription className="flex items-center gap-4">
              Stock :{" "}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="rounded-full"
                  onClick={handleDecrement}
                  disabled={updateArticleMutation.isPending}
                >
                  <Minus />
                </Button>
                <Badge variant="secondary" className="text-sm">
                  {stock}
                </Badge>
                <Button 
                  variant="outline" 
                  className="rounded-full"
                  onClick={handleIncrement}
                  disabled={updateArticleMutation.isPending}
                >
                  <Plus />
                </Button>
              </div>
            </CardDescription>
          </div>
        </div>
      </CardContent>
      <div className="px-5">
        <Separator />
      </div>
      <CardFooter>
        <div className="flex justify-end w-full">
          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={handleSave}
              disabled={updateArticleMutation.isPending}
            >
              <Check />
            </Button>
            <Button 
              variant="destructive"
              onClick={onCancel}
              disabled={updateArticleMutation.isPending}
            >
              <X />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
