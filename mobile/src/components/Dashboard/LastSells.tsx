import type { Article } from "@/types"
import { Card, CardContent, CardHeader } from "../ui/card"

export const LastSells = ({items} : {items: Article[]}) => {
    return (
        <Card>
            <CardHeader>
                Dernières Ventes
            </CardHeader>
            <CardContent>
                {items.map(item => (
                    <div>
                        
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}