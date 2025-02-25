import { Loan } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createAvatarFallback } from "@/lib/utils";

export function BorrowerInfo({ loan }: { loan: Loan }) {
  const fallbackText = createAvatarFallback(
    (loan.borrower?.name || loan.borrowerName) as string
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Borrower Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <Avatar className="w-200 h-200  rounded-lg">
            <AvatarImage
              src={loan.borrower?.image as string}
              alt={loan.borrower?.name as string}
            />
            <AvatarFallback className="w-48 h-48 rounded-lg">
              {fallbackText}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2">
            <div className="text-sm font-medium text-muted-foreground">
              Name:
            </div>
            <div className="font-medium">{loan.borrower?.name}</div>
          </div>
        </div>
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2">
            <div className="text-sm font-medium text-muted-foreground">
              Description:
            </div>
            <div className="text-sm whitespace-pre-wrap">{loan.notes}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
