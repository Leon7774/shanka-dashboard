import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { Loader2, PlusCircle, CheckCircle } from "lucide-react";

export default function AddSale() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [availableCountries, setAvailableCountries] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        InvoiceNo: "",
        StockCode: "",
        Description: "",
        Quantity: "",
        InvoiceDate: new Date().toISOString().split("T")[0],
        UnitPrice: "",
        CustomerID: "",
        Country: "",
    });

    useEffect(() => {
        async function fetchCountries() {
            const { data, error } = await supabase.rpc("get_unique_countries");
            if (error) {
                console.error("Error fetching countries:", error);
                return;
            }
            if (data) {
                const countries = data.map(
                    (item: { country: string }) => item.country
                );
                // Sort countries alphabetically
                countries.sort();
                setAvailableCountries(countries);
            }
        }
        fetchCountries();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCountryChange = (value: string) => {
        setFormData((prev) => ({ ...prev, Country: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Basic validation
            if (
                !formData.InvoiceNo ||
                !formData.Description ||
                !formData.Quantity ||
                !formData.UnitPrice ||
                !formData.Country
            ) {
                throw new Error("Please fill in all required fields");
            }

            // Prepare payload
            const payload = {
                InvoiceNo: formData.InvoiceNo,
                StockCode: formData.StockCode || "MANUAL", // Default if empty
                Description: formData.Description,
                Quantity: parseInt(formData.Quantity),
                InvoiceDate: new Date(formData.InvoiceDate).toISOString(),
                UnitPrice: parseFloat(formData.UnitPrice),
                CustomerID: formData.CustomerID
                    ? parseInt(formData.CustomerID)
                    : null,
                Country: formData.Country,
            };

            const { error: insertError } = await supabase
                .from("sales")
                .insert([payload]);

            if (insertError) throw insertError;

            setSuccess(true);
            setFormData({
                InvoiceNo: "",
                StockCode: "",
                Description: "",
                Quantity: "",
                InvoiceDate: new Date().toISOString().split("T")[0],
                UnitPrice: "",
                CustomerID: "",
                Country: "",
            });

            // Reset success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            console.error("Error adding sale:", err);
            setError(err.message || "Failed to add sale");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Add New Sale
                </h1>
                <p className="text-muted-foreground">
                    Enter the details of the new transaction manually.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Sale Details</CardTitle>
                    <CardDescription>
                        Fill in all required fields to record the transaction.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="InvoiceNo">
                                    Invoice Number
                                </Label>
                                <Input
                                    id="InvoiceNo"
                                    name="InvoiceNo"
                                    placeholder="e.g. 536365"
                                    value={formData.InvoiceNo}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="InvoiceDate">
                                    Invoice Date
                                </Label>
                                <Input
                                    id="InvoiceDate"
                                    name="InvoiceDate"
                                    type="date"
                                    value={formData.InvoiceDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="StockCode">Stock Code</Label>
                                <Input
                                    id="StockCode"
                                    name="StockCode"
                                    placeholder="e.g. 85123A"
                                    value={formData.StockCode}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="Description">
                                    Product Description
                                </Label>
                                <Input
                                    id="Description"
                                    name="Description"
                                    placeholder="e.g. WHITE HANGING HEART T-LIGHT HOLDER"
                                    value={formData.Description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="Quantity">Quantity</Label>
                                <Input
                                    id="Quantity"
                                    name="Quantity"
                                    type="number"
                                    min="1"
                                    placeholder="0"
                                    value={formData.Quantity}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="UnitPrice">
                                    Unit Price ($)
                                </Label>
                                <Input
                                    id="UnitPrice"
                                    name="UnitPrice"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.UnitPrice}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="CustomerID">Customer ID</Label>
                                <Input
                                    id="CustomerID"
                                    name="CustomerID"
                                    type="number"
                                    placeholder="e.g. 17850"
                                    value={formData.CustomerID}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="Country">Country</Label>
                                <Select
                                    value={formData.Country}
                                    onValueChange={handleCountryChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCountries.map((country) => (
                                            <SelectItem
                                                key={country}
                                                value={country}
                                            >
                                                {country}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Sale added successfully!
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Adding Sale...
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Sale
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
