import prisma from "../prismaClient.js";
import extractPdfText from "../utils/pdfExtract.js";
import summarizeText from "../utils/summarizer.js";

export const createBook = async (req, res, next) => {
  const { title, author, description } = req.body;

  // Debug logging
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);
  console.log("req.files:", req.files);

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const pdfPath = req.file?.path;

    const book = await prisma.book.create({
      data: {
        title,
        author,
        description,
        pdfPath,
        ownerId: req.user.id,
      },
    });

    let summaryRecord = null;

    if (pdfPath) {
      const rawText = await extractPdfText(pdfPath);
      const summary = await summarizeText(rawText || description || title);

      summaryRecord = await prisma.summary.create({
        data: {
          content: summary,
          highlights: summary?.slice(0, 180),
          bookId: book.id,
          createdById: req.user.id,
        },
      });
    }

    return res.status(201).json({ book, summary: summaryRecord });
  } catch (error) {
    return next(error);
  }
};

export const getBooks = async (req, res, next) => {
  try {
    const books = await prisma.book.findMany({
      where: { ownerId: req.user.id },
      include: { summaries: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(books);
  } catch (error) {
    return next(error);
  }
};

export const getBookById = async (req, res, next) => {
  try {
    const book = await prisma.book.findFirst({
      where: { id: Number(req.params.bookId), ownerId: req.user.id },
      include: { summaries: true },
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    return res.json(book);
  } catch (error) {
    return next(error);
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const book = await prisma.book.findFirst({
      where: { id: Number(req.params.bookId), ownerId: req.user.id },
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    await prisma.book.delete({ where: { id: book.id } });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

