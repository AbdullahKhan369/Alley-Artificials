import { Flower2 } from "lucide-react";

export default function SetupNeeded() {
  return (
    <div className="light-beam grid min-h-svh place-items-center p-6">
      <div className="w-full max-w-xl rounded-3xl border border-line bg-ivory p-8 shadow-soft">
        <Flower2 className="size-10 text-gold" />
        <h1 className="mt-4 text-4xl">One quick setup left</h1>
        <p className="mt-3 text-[15px] text-ink/75">The site is not connected to Supabase yet. Do these three things, then restart the dev server:</p>
        <ol className="mt-5 list-decimal space-y-2 pl-5 text-[15px] text-ink/85">
          <li>Create a free project on supabase.com</li>
          <li>Open SQL Editor, paste everything from <code className="rounded bg-sand px-1.5 py-0.5">supabase/schema.sql</code> and press Run</li>
          <li>Copy <code className="rounded bg-sand px-1.5 py-0.5">.env.example</code> to <code className="rounded bg-sand px-1.5 py-0.5">.env</code> and paste your Project URL and anon key</li>
        </ol>
        <p className="mt-5 text-[13px] text-mute">Full steps are in README.md.</p>
      </div>
    </div>
  );
}
