import { NextRequest } from "next/server";
import { requireUser } from "@/lib/api/guards";
import { apiSuccess, withApiErrorHandling } from "@/lib/api/response";
import { taskSchema } from "@/lib/validations/task";
import { listTasks, createTask } from "@/lib/services/task-service";

export const GET = withApiErrorHandling(async () => {
  const user = await requireUser();
  const tasks = await listTasks(user.id);
  return apiSuccess(tasks);
});

export const POST = withApiErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const body = await req.json();
  const input = taskSchema.parse(body);
  const task = await createTask(user.id, input);
  return apiSuccess(task, 201);
});
