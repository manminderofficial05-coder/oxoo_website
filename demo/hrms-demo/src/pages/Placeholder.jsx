export default function Placeholder({ title }) {
  return (
    <main className="w-full px-4 py-10 sm:px-6">
      <div className="rounded-3xl bg-white p-8">
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <p className="mt-2 text-sm text-black/50">This module is coming in an upcoming step.</p>
      </div>
    </main>
  );
}