import { BackToTasks } from "@/components/tasks/task-ui";
export default function NotFound() {
  return <div className="space-y-5 rounded-2xl bg-surface-container-lowest p-8 shadow-sm"><h1 className="font-display-md text-3xl text-primary">Task not found</h1><p className="text-on-surface-variant">This task is unavailable in your wedding workspace. It may have been removed.</p><BackToTasks /></div>;
}
