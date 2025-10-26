import { Card, CardContent } from "@/components/ui/card";
import type { Article } from "@/types";
import { Edit2, Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductListProps {
  articles: Article[];
  categoryName: string;
}

export function ProductList({ articles, categoryName }: ProductListProps) {
  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package className="size-12 mx-auto mb-2 opacity-20" />
        <p className="text-sm">Aucun produit dans cette catégorie</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <Card key={article.id} className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {article.name}
                  </h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full shrink-0">
                    {categoryName}
                  </span>
                </div>
                
                {article.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {article.description}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>
                    Créé le {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-gray-600 hover:text-blue-600"
                  title="Modifier"
                >
                  <Edit2 className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-gray-600 hover:text-red-600"
                  title="Supprimer"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

