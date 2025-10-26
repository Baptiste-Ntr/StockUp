// import { LastSells } from "@/components/Dashboard/lastSells";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col justify-between items-center px-4 py-4">
      <Button className="w-full">
        <Plus />
        <p>Ajouter une vente</p>
      </Button>
      
      {/* <LastSells /> */}
    </div>
  );
}
