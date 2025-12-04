import prisma from "../prismaClient.js";

/**
 * Add a note to a summary
 */
export const addNote = async (req, res, next) => {
  const { summaryId } = req.params;
  const { content } = req.body;

  console.log("📝 Add note request:", { summaryId, hasContent: !!content, userId: req.user.id });

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: "Note content is required" });
  }

  try {
    // Check if summary exists and user has access to it
    const summary = await prisma.summary.findFirst({
      where: {
        id: Number(summaryId),
        book: {
          ownerId: req.user.id,
        },
      },
    });

    if (!summary) {
      return res.status(404).json({ error: "Summary not found or access denied" });
    }

    // Create the note
    const note = await prisma.note.create({
      data: {
        content: content.trim(),
        summaryId: Number(summaryId),
        userId: req.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log("✅ Note created successfully:", note.id);

    return res.status(201).json({
      note,
      message: "Note added successfully",
    });
  } catch (error) {
    console.error("❌ Error adding note:", error);
    return next(error);
  }
};

/**
 * Get all notes for a summary
 */
export const getNotes = async (req, res, next) => {
  const { summaryId } = req.params;

  try {
    // Check if summary exists and user has access to it
    const summary = await prisma.summary.findFirst({
      where: {
        id: Number(summaryId),
        book: {
          ownerId: req.user.id,
        },
      },
    });

    if (!summary) {
      return res.status(404).json({ error: "Summary not found or access denied" });
    }

    // Get all notes for the summary
    const notes = await prisma.note.findMany({
      where: {
        summaryId: Number(summaryId),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({ notes });
  } catch (error) {
    console.error("❌ Error fetching notes:", error);
    return next(error);
  }
};

/**
 * Update a note
 */
export const updateNote = async (req, res, next) => {
  const { noteId } = req.params;
  const { content } = req.body;

  console.log("✏️ Update note request:", { noteId, hasContent: !!content, userId: req.user.id });

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: "Note content is required" });
  }

  try {
    // Check if note exists and user owns it
    const existingNote = await prisma.note.findFirst({
      where: {
        id: Number(noteId),
        userId: req.user.id,
      },
    });

    if (!existingNote) {
      return res.status(404).json({ error: "Note not found or access denied" });
    }

    // Update the note
    const note = await prisma.note.update({
      where: {
        id: Number(noteId),
      },
      data: {
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log("✅ Note updated successfully:", note.id);

    return res.json({
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating note:", error);
    return next(error);
  }
};

/**
 * Delete a note
 */
export const deleteNote = async (req, res, next) => {
  const { noteId } = req.params;

  console.log("🗑️ Delete note request:", { noteId, userId: req.user.id });

  try {
    // Check if note exists and user owns it
    const existingNote = await prisma.note.findFirst({
      where: {
        id: Number(noteId),
        userId: req.user.id,
      },
    });

    if (!existingNote) {
      return res.status(404).json({ error: "Note not found or access denied" });
    }

    // Delete the note
    await prisma.note.delete({
      where: {
        id: Number(noteId),
      },
    });

    console.log("✅ Note deleted successfully:", noteId);

    return res.status(204).send();
  } catch (error) {
    console.error("❌ Error deleting note:", error);
    return next(error);
  }
};
