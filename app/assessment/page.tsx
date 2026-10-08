import AssessmentForm from "@/components/AssessmentForm";

export default function AssessmentPage() {
  return (
    <div className="flex-1 flex flex-col items-center p-4 sm:p-8 lg:p-12 min-h-screen">
      <AssessmentForm>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-snug">
          Take the Research Integrity Challenge
        </h1>
      </AssessmentForm>
    </div>
  );
}
