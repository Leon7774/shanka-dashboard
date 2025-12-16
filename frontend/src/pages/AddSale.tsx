import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

export default function AddSale() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Add New Sale
                </h1>
                <p className="text-muted-foreground">
                    Enter the details of the new transaction.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Sale Details</CardTitle>
                    <CardDescription>
                        Fill in the form below to record a new sale.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg text-muted-foreground">
                        Form Placeholder
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
