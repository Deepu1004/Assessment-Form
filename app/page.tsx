import AssessmentForm from "@/components/AssessmentForm";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center p-4 sm:p-8 lg:p-12 min-h-screen">
      <AssessmentForm
        disclaimer="By submitting this form, you agree to receive relevant communications from Taylor & Francis."
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-snug">
          Take this short Research Integrity Challenge
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Test how you would respond to common research scenarios involving AI,
          data, authorship, peer review and responsible research practices.
        </p>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Put your research integrity knowledge to the test, discover your
          score, and access the Taylor &amp; Francis Research Integrity Toolkit —
          a collection of practical resources to help you navigate responsible
          research with confidence.
        </p>
        <p className="text-slate-700 text-sm sm:text-base font-semibold">
          It takes just a few minutes to complete.
        </p>
      </AssessmentForm>
    </div>
  );
}
