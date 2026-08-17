import { PageHeader } from "@/components/shared/PageHeader";
import { ComplaintForm } from "@/components/complaints/ComplaintForm";

export default function NewComplaintPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Submit a Complaint" description="Tell us about the issue you'd like to report." />
      <ComplaintForm />
    </div>
  );
}
