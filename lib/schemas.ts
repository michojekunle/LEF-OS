/**
 * lib/schemas.ts
 * Single source of truth for all API request validation schemas (Zod).
 * Import these in API routes instead of defining inline schemas.
 */

import { z } from 'zod';

// ── Shared base types ─────────────────────────────────────────────────────────

export const DomainEnum = z.enum(['law', 'economics', 'finance']);
export const ResourceTypeEnum = z.enum(['video', 'article', 'tool', 'other']);

// ── Community resources ───────────────────────────────────────────────────────

export const ResourceSubmitSchema = z.object({
  day_number: z.number().int().min(1).max(111),
  domain: DomainEnum,
  type: ResourceTypeEnum.default('article'),
  title: z.string().min(3).max(200).trim(),
  url: z.string().url().max(2000),
  note: z.string().max(500).trim().optional(),
});

export const ResourceReviewSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'remove']),
});

// ── Resource flags (community submissions) ────────────────────────────────────

export const ResourceFlagSchema = z.object({
  submission_id: z.string().uuid(),
  reason: z.string().max(300).trim().optional(),
});

// ── Content flags (enriched study content) ────────────────────────────────────

export const ContentFlagCreateSchema = z.object({
  url: z.string().url().max(2000),
  title: z.string().min(1).max(300).trim(),
  day_number: z.number().int().min(1).max(111).optional(),
  domain: DomainEnum.optional(),
  content_type: z.enum(['video', 'article']),
  reason: z.string().max(300).trim().optional(),
});

export const ContentFlagResolveSchema = z.object({
  id: z.string().uuid(),
});

// ── Question answers ──────────────────────────────────────────────────────────

export const QuestionAnswerUpsertSchema = z.object({
  day_number: z.number().int().min(1).max(111),
  domain: DomainEnum,
  question_index: z.number().int().min(0).max(9),
  answer: z.string().min(1).max(5000).trim(),
});

export const QuestionAnswerDeleteSchema = z.object({
  day_number: z.number().int().min(1).max(111),
  domain: DomainEnum,
  question_index: z.number().int().min(0).max(9),
});

// ── Inferred TypeScript types ─────────────────────────────────────────────────

export type ResourceSubmitInput = z.infer<typeof ResourceSubmitSchema>;
export type ResourceReviewInput = z.infer<typeof ResourceReviewSchema>;
export type ResourceFlagInput = z.infer<typeof ResourceFlagSchema>;
export type ContentFlagCreateInput = z.infer<typeof ContentFlagCreateSchema>;
export type ContentFlagResolveInput = z.infer<typeof ContentFlagResolveSchema>;
export type QuestionAnswerUpsertInput = z.infer<typeof QuestionAnswerUpsertSchema>;
export type QuestionAnswerDeleteInput = z.infer<typeof QuestionAnswerDeleteSchema>;
