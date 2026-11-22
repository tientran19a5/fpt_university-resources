import { seedCustomers } from "@/mocks/seedData";
import { CustomerDetailClient } from "./customer-detail-client";

export function generateStaticParams() {
  return seedCustomers.map((customer) => ({
    id: customer.id,
  }));
}

export default function CustomerDetailPage() {
  return <CustomerDetailClient />;
}
