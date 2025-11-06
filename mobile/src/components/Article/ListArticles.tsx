import type { Article } from "@/types";
import { ArticleItem } from "./ArticleItem";


export const ListArticles = ({ 
  articles 
}: { 
  articles: Article[];
}) => {
  return (
    <div className="flex flex-col px-4 gap-2">
      {articles.map((article) => (
        <ArticleItem key={article.id} data={article} />
      ))}
    </div>
  );
};
