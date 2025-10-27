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
import { Minus, MinusCircle, Pencil, Plus, Trash } from "lucide-react";
import { Badge } from "../ui/badge";

export const ListArticles = ({ articles }: { articles: Article[] }) => {
  return (
    <div className="flex flex-col px-4 gap-2">
      {articles.map((article) => (
        <Card key={article.id}>
          <CardContent>
            <div className="flex gap-5">
              <div className="h-15 w-15">
                <img
                  className="rounded-xl"
                  src={`${article.imageUrl}/-/preview/736x736/`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <CardTitle>{article.name}</CardTitle>
                <CardDescription>{article.description}</CardDescription>
                <CardDescription className="flex items-center gap-4">
                  Stock :{" "}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-full">
                      <Minus />
                    </Button>
                    <Badge variant="secondary" className="text-sm">
                      {article.stock ? article.stock : 1}
                    </Badge>
                    <Button variant="outline" className="rounded-full">
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
                Prix: <span className="font-bold">{article.price}€</span>
              </p>
              <div className="flex gap-4">
                <Button variant="outline">
                  <Pencil />
                </Button>
                <Button variant="destructive">
                  <Trash />
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
