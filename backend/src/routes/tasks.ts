import { Router } from "express";
import { prisma } from "../prisma";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", async (req: AuthRequest, res) => {
  const userId = req.user!.userId;

  const page = parseInt((req.query.page as string) || "1", 10);
  const pageSize = parseInt((req.query.pageSize as string) || "10", 10);
  const status = (req.query.status as string | undefined) || undefined;
  const search = (req.query.search as string | undefined) || undefined;

  const where: any = { userId };
  if (status) {
    where.status = status;
  }
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.task.count({ where }),
  ]);

  return res.json({
    items,
    page,
    pageSize,
    total,
  });
});

router.post("/", async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const { title, description } = req.body as { title?: string; description?: string };

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      userId,
    },
  });

  return res.status(201).json(task);
});

router.get("/:id", async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const id = parseInt(req.params.id as string, 10);

  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  return res.json(task);
});

router.patch("/:id", async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const id = parseInt(req.params.id as string, 10);
  const { title, description, status } = req.body as {
    title?: string;
    description?: string | null;
    status?: "PENDING" | "COMPLETED";
  };

  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) {
    return res.status(404).json({ message: "Task not found" });
  }

  const updated = await prisma.task.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      description: description ?? existing.description,
      status: status ?? existing.status,
    },
  });

  return res.json(updated);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const id = parseInt(req.params.id as string, 10);

  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) {
    return res.status(404).json({ message: "Task not found" });
  }

  await prisma.task.delete({ where: { id } });
  return res.status(204).send();
});

router.post("/:id/toggle", async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const id = parseInt(req.params.id as string, 10);

  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) {
    return res.status(404).json({ message: "Task not found" });
  }

  const nextStatus = existing.status === "COMPLETED" ? "PENDING" : "COMPLETED";

  const updated = await prisma.task.update({
    where: { id },
    data: { status: nextStatus },
  });

  return res.json(updated);
});

export const tasksRouter = router;


