import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function SalesDialog({ saleId }: { saleId: string }) {
  const [saleDetails, setSaleDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSaleDetails = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          `http://localhost:8000/api/sales/${saleId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setSaleDetails(response.data);
      } catch (error) {
        console.error("Failed to fetch sale details", error);
        toast.error("Failed to load sale details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSaleDetails();
  }, [saleId]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent>
        {isLoading ? (
          <p>Loading...</p>
        ) : saleDetails ? (
          <div>
            <h2 className="text-lg font-bold mb-4">Sale Details</h2>
            <p>
              <strong>Sale ID:</strong> {saleDetails.sales_id}
            </p>
            <p>
              <strong>User:</strong> {saleDetails.users?.name} (
              {saleDetails.users?.email})
            </p>
            <p>
              <strong>Sale Date:</strong>{" "}
              {new Date(saleDetails.sale_date).toLocaleString()}
            </p>
            <p>
              <strong>Payment Method:</strong> {saleDetails.payment?.method}
            </p>
            <p>
              <strong>Payment Status:</strong> {saleDetails.payment?.status}
            </p>
            <p>
              <strong>Amount:</strong> $
              {Number(saleDetails.payment?.amount || 0).toFixed(2)}
            </p>
            <h3 className="text-md font-semibold mt-4 mb-2">Products:</h3>
            <ul className="list-disc list-inside">
              {saleDetails.sales_product_quantities.map((item: any) => (
                <li key={item.id}>
                  {item.product?.name} - Quantity: {item.quantity}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No details available for this sale.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

{
  /* 
            {
  "sales_id": "7753d389-51c6-4d26-a416-c85fd79915b8",
  "sale_date": "2026-05-15T06:17:56.472Z",
  "user_id": "8edb62b3-3566-4b84-825a-280bc5f76829",
  "created_at": "2026-05-15T06:17:56.472Z",
  "updated_at": "2026-05-15T06:17:56.472Z",
  "payment_id": "5947fde6-52d9-4b06-a441-41dd7dc9c77e",
  "payment": {
    "payment_id": "5947fde6-52d9-4b06-a441-41dd7dc9c77e",
    "payment_date": "2026-05-15T06:17:56.471Z",
    "amount": "103500",
    "method": "cash",
    "status": "completed",
    "transaction_id": null,
    "created_at": "2026-05-15T06:17:56.471Z"
  },
  "users": {
    "user_id": "8edb62b3-3566-4b84-825a-280bc5f76829",
    "name": "Nuredin Fentaw",
    "username": "nurezf@gg.gg",
    "avatar_url": null,
    "email": "nuredinzfff1996@gmail.com",
    "password_hash": "$2b$10$qPm88ohIJtocp/HzdNXnHO5LJrHwihw8FcdLTYzMqMyNqiHYQIfB.",
    "role": "salesOfficer",
    "phone": "0989768577",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiOGVkYjYyYjMtMzU2Ni00Yjg0LTgyNWEtMjgwYmM1Zjc2ODI5Iiwicm9sZSI6InNhbGVzT2ZmaWNlciIsImlhdCI6MTc3ODgxOTY2MSwiZXhwIjoxNzc5NDI0NDYxfQ._eRFoT3ZKlSNC28bh-lxDgYKN9IbqhFOzqWUvHhRF1Q",
    "created_at": "2026-05-15T04:28:23.025Z",
    "updated_at": "2026-05-15T04:34:21.194Z"
  },
  "sales_product_quantities": [
    {
      "id": "d8983b7e-d01c-4020-b783-8270e8740142",
      "product_id": "8077cb56-ded7-44e5-b2c9-8f81f5121eb8",
      "quantity": 1,
      "created_at": "2026-05-15T06:17:56.478Z",
      "updated_at": "2026-05-15T06:17:56.478Z",
      "sales_id": "7753d389-51c6-4d26-a416-c85fd79915b8",
      "product": {
        "product_id": "8077cb56-ded7-44e5-b2c9-8f81f5121eb8",
        "name": "aaaaaaaa",
        "description": "aaaaa",
        "price": "100000",
        "original_price": "10000",
        "discount_percentage": "10",
        "stock": 9,
        "category_id": "84b1147c-47d1-4967-9dab-47b28299ce62",
        "specifications": {},
        "sku": "06cc810c-4ed8-4076-8181-eba809956ae4",
        "created_at": "2026-05-15T06:17:10.726Z",
        "updated_at": "2026-05-15T06:17:56.469Z"
      }
    }
  ]
} */
}
