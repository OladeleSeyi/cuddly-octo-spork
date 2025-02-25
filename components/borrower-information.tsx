import { Loan } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";

export function BorrowerInfo({ loan }: { loan: Loan }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Borrower Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <img
            src={
              (loan?.borrower?.image ||
                "https://docs.material-tailwind.com/img/face-2.jpg") as string
            }
            alt="avatar"
            className="w-200 h-200 rounded-lg"
          />
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
