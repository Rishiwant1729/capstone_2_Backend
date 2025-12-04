import prisma from "../prismaClient.js";
import extractPdfText from "../utils/pdfExtract.js";
import summarizeText, { generateHighlights } from "../utils/summarizer.js";

export const uploadBook = async (req, res, next) => {
  const { title, author, description } = req.body;

  console.log("📚 Book upload request:", { title, author, hasFile: !!req.file });

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const pdfPath = req.file?.path;

    // Create book record first
    const book = await prisma.book.create({
      data: {
        title,
        author,
        description,
        pdfPath,
        status: pdfPath ? "processing" : "uploaded",
        ownerId: req.user.id,
      },
    });

    let summaryRecord = null;

    if (pdfPath) {
      try {
        // Extract text from PDF (with OCR support)
        console.log("📄 Extracting text from PDF...");
        const rawText = await extractPdfText(pdfPath);
        
        if (!rawText || rawText.trim().length === 0) {
          throw new Error("No text could be extracted from the PDF");
        }

        console.log("✅ Text extracted successfully:", rawText.length, "characters");

        // Generate AI-powered summary using Gemini
        console.log("🤖 Generating AI summary...");
        const summary = await summarizeText(rawText);
        
        // Generate highlights
        const highlights = generateHighlights(summary, 180);

        // Create summary record
        summaryRecord = await prisma.summary.create({
          data: {
            content: summary,
            highlights: highlights,
            bookId: book.id,
            createdById: req.user.id,
          },
        });

        // Update book status to completed
        await prisma.book.update({
          where: { id: book.id },
          data: { status: "completed" },
        });

        console.log("✅ Summary generated and saved successfully");
      } catch (extractError) {
        console.error("❌ Error during text extraction or summarization:", extractError);
        
        // Update book status to failed
        await prisma.book.update({
          where: { id: book.id },
          data: { status: "failed" },
        });

        // Create a fallback summary
        const fallbackSummary = description || `Book: ${title}${author ? ` by ${author}` : ""}`;
        summaryRecord = await prisma.summary.create({
          data: {
            content: `Unable to extract text from PDF. ${fallbackSummary}`,
            highlights: fallbackSummary.slice(0, 180),
            bookId: book.id,
            createdById: req.user.id,
          },
        });
      }
    }

    // Fetch the updated book with summary
    const bookWithSummary = await prisma.book.findUnique({
      where: { id: book.id },
      include: { summaries: true },
    });

    return res.status(201).json({ 
      book: bookWithSummary, 
      summary: summaryRecord,
      message: "Book uploaded and processed successfully"
    });
  } catch (error) {
    console.error("❌ Error in uploadBook:", error);
    return next(error);
  }
};

export const getBooks = async (req, res, next) => {
  try {
    const books = await prisma.book.findMany({
      where: { ownerId: req.user.id },
      include: { 
        summaries: {
          include: {
            notes: {
              orderBy: { createdAt: "desc" },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(books);
  } catch (error) {
    return next(error);
  }
};

export const getBookSummary = async (req, res, next) => {
  try {
    const book = await prisma.book.findFirst({
      where: { id: Number(req.params.id), ownerId: req.user.id },
      include: { 
        summaries: {
          include: {
            notes: {
              orderBy: { createdAt: "desc" },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
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
      where: { id: Number(req.params.id), ownerId: req.user.id },
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

/**
 * Update/Edit a summary
 */
export const updateSummary = async (req, res, next) => {
  const { id } = req.params; // Book ID
  const { content, highlights } = req.body;

  console.log("✏️ Update summary request:", { bookId: id, hasContent: !!content });

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: "Summary content is required" });
  }

  try {
    // Check if book exists and user owns it
    const book = await prisma.book.findFirst({
      where: { id: Number(id), ownerId: req.user.id },
      include: { summaries: true },
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    if (!book.summaries) {
      return res.status(404).json({ error: "Summary not found for this book" });
    }

    // Update the summary
    const updatedSummary = await prisma.summary.update({
      where: { id: book.summaries.id },
      data: {
        content: content.trim(),
        highlights: highlights ? highlights.trim() : generateHighlights(content, 180),
      },
    });

    console.log("✅ Summary updated successfully");

    return res.json({
      summary: updatedSummary,
      message: "Summary updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating summary:", error);
    return next(error);
  }
};

/**
 * Delete a summary
 */
export const deleteSummary = async (req, res, next) => {
  const { id } = req.params; // Book ID

  console.log("🗑️ Delete summary request:", { bookId: id });

  try {
    // Check if book exists and user owns it
    const book = await prisma.book.findFirst({
      where: { id: Number(id), ownerId: req.user.id },
      include: { summaries: true },
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    if (!book.summaries) {
      return res.status(404).json({ error: "Summary not found for this book" });
    }

    // Delete the summary
    await prisma.summary.delete({
      where: { id: book.summaries.id },
    });

    // Update book status
    await prisma.book.update({
      where: { id: book.id },
      data: { status: "uploaded" },
    });

    console.log("✅ Summary deleted successfully");

    return res.status(204).send();
  } catch (error) {
    console.error("❌ Error deleting summary:", error);
    return next(error);
  }
};

/**
 * Regenerate summary using AI
 */
export const regenerateSummary = async (req, res, next) => {
  const { id } = req.params; // Book ID

  console.log("🔄 Regenerate summary request:", { bookId: id });

  try {
    // Check if book exists and user owns it
    const book = await prisma.book.findFirst({
      where: { id: Number(id), ownerId: req.user.id },
      include: { summaries: true },
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    if (!book.pdfPath) {
      return res.status(400).json({ error: "No PDF file found for this book" });
    }

    // Update book status to processing
    await prisma.book.update({
      where: { id: book.id },
      data: { status: "processing" },
    });

    try {
      // Extract text from PDF
      console.log("📄 Re-extracting text from PDF...");
      const rawText = await extractPdfText(book.pdfPath);

      if (!rawText || rawText.trim().length === 0) {
        throw new Error("No text could be extracted from the PDF");
      }

      console.log("✅ Text re-extracted successfully:", rawText.length, "characters");

      // Generate AI-powered summary
      console.log("🤖 Regenerating AI summary...");
      const summary = await summarizeText(rawText);

      // Generate highlights
      const highlights = generateHighlights(summary, 180);

      let updatedSummary;

      if (book.summaries) {
        // Update existing summary
        updatedSummary = await prisma.summary.update({
          where: { id: book.summaries.id },
          data: {
            content: summary,
            highlights: highlights,
          },
        });
      } else {
        // Create new summary if it doesn't exist
        updatedSummary = await prisma.summary.create({
          data: {
            content: summary,
            highlights: highlights,
            bookId: book.id,
            createdById: req.user.id,
          },
        });
      }

      // Update book status to completed
      await prisma.book.update({
        where: { id: book.id },
        data: { status: "completed" },
      });

      console.log("✅ Summary regenerated successfully");

      return res.json({
        summary: updatedSummary,
        message: "Summary regenerated successfully",
      });
    } catch (regenerateError) {
      console.error("❌ Error during regeneration:", regenerateError);

      // Update book status to failed
      await prisma.book.update({
        where: { id: book.id },
        data: { status: "failed" },
      });

      return res.status(500).json({
        error: "Failed to regenerate summary",
        details: regenerateError.message,
      });
    }
  } catch (error) {
    console.error("❌ Error in regenerateSummary:", error);
    return next(error);
  }
};

