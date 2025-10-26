import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { CreateCategoryDialog } from '@/components/inventory/CreateCategoryDialog';
import { CreateArticleDialog } from '@/components/inventory/CreateArticleDialog';
import { ProductList } from '@/components/inventory/ProductList';
import { categoriesQuery, userClubQuery } from '@/lib/queries';
import { createFileRoute } from '@tanstack/react-router';
import { FolderOpen, Grid3x3, List, Package } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute("/inventory/")({
  loader: async ({context: {queryClient}}) => {
    // Récupérer le club de l'utilisateur
    const userClub = await queryClient.ensureQueryData(userClubQuery);
    
    // Charger les catégories du club
    const categories = await queryClient.ensureQueryData(categoriesQuery(userClub.id));

    return { categories, clubId: userClub.id }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { categories, clubId } = Route.useLoaderData();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Compter le nombre total d'articles
  const totalArticles = categories?.reduce((acc, cat) => acc + (cat.articles?.length || 0), 0) || 0;

  // État vide : pas de catégories
  if (!categories || categories.length === 0) {
    return (
      <div className="mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Inventaire</h1>
          <p className="text-gray-600 mt-2">Gérez vos produits et catégories</p>
        </div>

        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderOpen className="size-6" />
            </EmptyMedia>
            <EmptyTitle>Aucune catégorie</EmptyTitle>
            <EmptyDescription>
              Commencez par créer une catégorie pour organiser vos produits
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateCategoryDialog clubId={clubId} />
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  // Affichage avec catégories
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventaire</h1>
            <p className="text-gray-600 mt-1">
              {categories.length} catégorie{categories.length > 1 ? 's' : ''} · {totalArticles} produit{totalArticles > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <CreateCategoryDialog clubId={clubId} />
          </div>
        </div>

        {/* Barre d'outils */}
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-2">
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="size-4" />
              <span className="hidden sm:inline">Catégories</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="size-4" />
              <span className="hidden sm:inline">Liste des produits</span>
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            <span className="hidden sm:inline">Affichage : </span>
            {viewMode === 'grid' ? 'Par catégorie' : 'Liste complète'}
          </div>
        </div>
      </div>

      {/* Vue en grille - Catégories */}
      {viewMode === 'grid' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="size-5 text-blue-600" />
                  <span className="truncate">{category.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {category.description || 'Aucune description'}
                </p>
                
                {/* Articles dans la catégorie */}
                {category.articles && category.articles.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Package className="size-4" />
                      <span>{category.articles.length} produit{category.articles.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="space-y-1">
                      {category.articles.slice(0, 3).map((article) => (
                        <div key={article.id} className="text-sm text-gray-600 pl-6 truncate">
                          • {article.name}
                        </div>
                      ))}
                      {category.articles.length > 3 && (
                        <div className="text-sm text-gray-500 pl-6">
                          ... et {category.articles.length - 3} autre{category.articles.length - 3 > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic py-2">
                    Aucun produit dans cette catégorie
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <CreateArticleDialog
                    categoryId={category.id}
                    categoryName={category.name}
                    clubId={clubId}
                    trigger={
                      <Button variant="outline" size="sm" className="w-full">
                        <Package className="size-4" />
                        Ajouter un produit
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vue en liste - Tous les produits */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FolderOpen className="size-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    {category.name}
                  </h2>
                  <span className="text-sm text-gray-500">
                    ({category.articles?.length || 0})
                  </span>
                </div>
                <CreateArticleDialog
                  categoryId={category.id}
                  categoryName={category.name}
                  clubId={clubId}
                />
              </div>

              {category.description && (
                <p className="text-sm text-gray-600 mb-4">{category.description}</p>
              )}

              <ProductList
                articles={category.articles || []}
                categoryName={category.name}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
