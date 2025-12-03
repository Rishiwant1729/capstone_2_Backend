import prisma from "../prismaClient.js";
import summarizeText from "../utils/summarizer.js";

export const getSummaries = async (req, res, next) => {
  try {
    const summaries = await prisma.summary.findMany({
      where: { createdById: req.user.id },
      include: {
        book: {
          select: { id: true, title: true, author: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(summaries);
  } catch (error) {
    return next(error);
  }
};

export const getSummaryById = async (req, res, next) => {
  try {
    const summary = await prisma.summary.findFirst({
      where: {
        id: Number(req.params.summaryId),
        createdById: req.user.id,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });

    if (!summary) {
      return res.status(404).json({ error: "Summary not found" });
    }

    return res.json(summary);
  } catch (error) {
    return next(error);
  }
};

export const regenerateSummary = async (req, res, next) => {
  try {
    const book = await prisma.book.findFirst({
      where: { id: Number(req.params.bookId), ownerId: req.user.id },
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const content = await summarizeText(
      `${book.description || book.title} ${req.body.notes || ""}`.trim()
    );

    const summary = await prisma.summary.upsert({
      where: { bookId: book.id },
      update: {
        content,
        highlights: content.slice(0, 180),
      },
      create: {
        content,
        highlights: content.slice(0, 180),
        bookId: book.id,
        createdById: req.user.id,
      },
    });

    return res.json(summary);
  } catch (error) {
    return next(error);
  }
};

