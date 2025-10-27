import { articlesClubQuery, categoriesQuery, userClubQuery } from '@/lib/queries';
import { createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '@/lib/auth-middleware';
import { requireClub } from '@/lib/club-middleware';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { PlusCircle, ScanBarcodeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSuspenseQuery } from '@tanstack/react-query';
import { CreateArticle } from '@/components/Article/CreateArticle';
import { useState } from 'react';
import { ListArticles } from '@/components/Article/ListArticles';

export const Route = createFileRoute("/inventory/")({
  beforeLoad: async ({ context: { queryClient } }) => {
    // Inventory nécessite l'authentification ET un club
    await requireAuth(queryClient);
    await requireClub(queryClient);
  },
  // ✅ Loader optionnel mais recommandé pour pré-charger les données
  loader: async ({context: {queryClient}}) => {
    const userClub = await queryClient.ensureQueryData(userClubQuery);
    await queryClient.ensureQueryData(categoriesQuery(userClub.id));
    await queryClient.ensureQueryData(articlesClubQuery(userClub.id));
    // Pas besoin de return, les données sont dans le cache
  },
  component: RouteComponent,
});

function RouteComponent() {
  // ✅ Utiliser useSuspenseQuery pour des données RÉACTIVES qui se rafraîchissent automatiquement
  const { data: userClub } = useSuspenseQuery(userClubQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery(userClub.id));
  const { data: articles } = useSuspenseQuery(articlesClubQuery(userClub.id));

  const [isCreateArticleOpen, setIsCreateArticleOpen] = useState<boolean>(false);

  if (articles.length < 1) return (
    <div className='w-full h-full flex items-center justify-center'>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ScanBarcodeIcon />
            </EmptyMedia>
            <EmptyTitle>Pas encore d'articles</EmptyTitle>
            <EmptyDescription>Vous n'avez pas encore renseigné d'articles dans votre boutique</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setIsCreateArticleOpen(true)}>Créer votre premier article</Button>
          </EmptyContent>
        </Empty>
        <CreateArticle open={isCreateArticleOpen} setOpen={setIsCreateArticleOpen} categories={categories} clubId={userClub.id}/>
    </div>
  )

  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="flex justify-center">
        <Button className="p-2" onClick={() => setIsCreateArticleOpen(true)}>
          <PlusCircle />
          Ajouter un nouvel article
        </Button>
      </div>
      <ListArticles articles={articles} />
      <CreateArticle
        open={isCreateArticleOpen}
        setOpen={setIsCreateArticleOpen}
        categories={categories}
        clubId={userClub.id}
      />
    </div>
  );
}
