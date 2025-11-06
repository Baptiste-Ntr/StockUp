import type { Article, Category } from "@/types";
import { ArticleItem } from "./ArticleItem";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "stock-asc" | "stock-desc" | "date-asc" | "date-desc";

export const ListArticles = ({ 
  articles,
  categories = []
}: { 
  articles: Article[];
  categories?: Category[];
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");

  // Filtrer et trier les articles
  const filteredAndSortedArticles = useMemo(() => {
    let result = [...articles];

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(article => 
        article.name.toLowerCase().includes(query) ||
        article.description?.toLowerCase().includes(query)
      );
    }

    // Filtrer par catégorie
    if (selectedCategory !== "all") {
      result = result.filter(article => article.categoryId === selectedCategory);
    }

    // Trier
    result.sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return (a.price || 0) - (b.price || 0);
        case "price-desc":
          return (b.price || 0) - (a.price || 0);
        case "stock-asc":
          return (a.stock || 0) - (b.stock || 0);
        case "stock-desc":
          return (b.stock || 0) - (a.stock || 0);
        case "date-asc":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "date-desc":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [articles, searchQuery, selectedCategory, sortOption]);

  return (
    <div className="flex flex-col gap-4">
      {/* Barre de filtres et recherche */}
      <div className="px-4 space-y-3">
        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
          <Input
            placeholder="Rechercher un article par nom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtres et tri */}
        <div className="grid grid-cols-2 gap-3">
          {/* Filtre par catégorie */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 flex items-center gap-1">
              <Filter className="size-3" />
              Catégorie
            </Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tri */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 flex items-center gap-1">
              <ArrowUpDown className="size-3" />
              Trier par
            </Label>
            <Select value={sortOption} onValueChange={(value: string) => setSortOption(value as SortOption)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Plus récent</SelectItem>
                <SelectItem value="date-asc">Plus ancien</SelectItem>
                <SelectItem value="name-asc">Nom (A-Z)</SelectItem>
                <SelectItem value="name-desc">Nom (Z-A)</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
                <SelectItem value="stock-asc">Stock croissant</SelectItem>
                <SelectItem value="stock-desc">Stock décroissant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Compteur de résultats */}
        <div className="text-xs text-gray-500 px-1">
          {filteredAndSortedArticles.length} article{filteredAndSortedArticles.length !== 1 ? 's' : ''} 
          {searchQuery && ` trouvé${filteredAndSortedArticles.length !== 1 ? 's' : ''}`}
          {selectedCategory !== "all" && ` dans cette catégorie`}
        </div>
      </div>

      {/* Liste des articles */}
      <div className="flex flex-col px-4 gap-2">
        {filteredAndSortedArticles.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Search className="size-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucun article trouvé</p>
            {(searchQuery || selectedCategory !== "all") && (
              <p className="text-xs mt-1">Essayez de modifier vos critères de recherche</p>
            )}
          </div>
        ) : (
          filteredAndSortedArticles.map((article) => (
            <ArticleItem key={article.id} data={article} categories={categories} />
          ))
        )}
      </div>
    </div>
  );
};
