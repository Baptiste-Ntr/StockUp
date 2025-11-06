import type { Article } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Minus, Pencil, Plus, Trash, Package } from "lucide-react";
import { Badge } from "../ui/badge";
import { useState } from "react";
import { EditArticle } from "./EditArticle";
import { useMutationWithInvalidation } from "@/hooks/useMutationWithInvalidation";
import { api } from "@/lib/api";

export const ArticleItem = ({ 
  data 
}: { 
  data: Article;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const updateStockMutation = useMutationWithInvalidation({
    mutationFn: (newStock: number) => 
      api.articles.update(data.id, { stock: newStock }),
    invalidateKeys: [["articles"]],
    successMessage: "Stock mis à jour",
    errorMessage: "Erreur lors de la mise à jour du stock",
  });

  const deleteArticleMutation = useMutationWithInvalidation({
    mutationFn: () => api.articles.delete(data.id),
    invalidateKeys: [["articles"]],
    loadingMessage: "Suppression de l'article en cours...",
    successMessage: "L'article a bien été supprimé",
    errorMessage: "Erreur lors de la suppression de l'article",
  });

  const handleDecrement = () => {
    const newStock = Math.max(0, (data.stock ?? 0) - 1);
    updateStockMutation.mutate(newStock);
  };

  const handleIncrement = () => {
    const newStock = (data.stock ?? 0) + 1;
    updateStockMutation.mutate(newStock);
  };

  const handleDelete = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      deleteArticleMutation.mutate(undefined);
    }
  };

  if (isEditing) {
    return (
      <EditArticle 
        data={data} 
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Card key={data.id}>
      <CardContent>
        <div className="flex gap-5">
          <div className="h-15 w-15">
            {data.imageUrl ? (
              <img
                className="rounded-xl"
                src={`${data.imageUrl}/-/preview/736x736/`}
                alt={data.name}
              />
            ) : (
              <div className="h-15 w-15 rounded-xl bg-gray-200 flex items-center justify-center">
                <Package className="text-gray-400" size={32} />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <CardTitle>{data.name}</CardTitle>
            <CardDescription>{data.description}</CardDescription>
            <CardDescription className="flex items-center gap-4">
              Stock :{" "}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="rounded-full"
                  onClick={handleDecrement}
                  disabled={updateStockMutation.isPending || deleteArticleMutation.isPending}
                >
                  <Minus />
                </Button>
                <Badge variant="secondary" className="text-sm">
                  {data.stock ? data.stock : 0}
                </Badge>
                <Button 
                  variant="outline" 
                  className="rounded-full"
                  onClick={handleIncrement}
                  disabled={updateStockMutation.isPending || deleteArticleMutation.isPending}
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
        <div className="flex justify-between w-full">
          <p>
            Prix: <span className="font-bold">{data.price}€</span>
          </p>
          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={() => setIsEditing(true)}
              disabled={updateStockMutation.isPending || deleteArticleMutation.isPending}
            >
              <Pencil />
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={updateStockMutation.isPending || deleteArticleMutation.isPending}
            >
              <Trash />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
