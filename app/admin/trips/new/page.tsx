import { TripForm } from "@/components/TripForm";

export default function NewTripPage() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="admin-page-title mb-6">New Trip</h1>
      <TripForm />
    </div>
  );
}
