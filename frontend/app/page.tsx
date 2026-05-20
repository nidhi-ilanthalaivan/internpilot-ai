import ResumeUpload from "@/components/ResumeUpload";
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans p-6 dark:bg-black">
      <main className="w-full max-w-3xl rounded-xl bg-white p-8 shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
          InternPilot Dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
          Upload your resume below to parse its contents.
        </p>
        
        {/* Your functional component goes here */}
        <ResumeUpload />
      </main>
    </div>
  );
}