const { z } = require("zod");

const registerSchema = z.object({
  fullName: z.string().min(1, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password")
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter a password")
});

const noteSchema = z.object({
  title: z.string().min(1, "Enter a title"),
  content: z.string().min(1, "Enter the content"),
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  isTrashed: z.boolean().optional(),
  color: z.string().optional(),
  attachmentUrl: z.string().nullable().optional()
});

const editNoteSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  isTrashed: z.boolean().optional(),
  color: z.string().optional(),
  attachmentUrl: z.string().nullable().optional()
});

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (err) {
    return res.status(400).json({
      error: true,
      message: err.errors[0].message
    });
  }
};

const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: true, message: "Internal Server Error" });
};

module.exports = { registerSchema, loginSchema, noteSchema, editNoteSchema, validate, errorHandler };
