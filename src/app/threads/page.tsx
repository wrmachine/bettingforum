import { ThreadsIndex } from "@/components/ThreadsIndex";

export default function ThreadsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Threads</h1>
      <p className="mt-2 text-slate-600">
        Community discussions and topics. Vote, comment, and start new threads.
      </p>
      <ThreadsIndex />
    </div>
  );
}
