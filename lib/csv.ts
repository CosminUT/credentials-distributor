import { parse } from 'csv-parse/sync';
import { z } from 'zod';

const rowSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  label: z.string().optional().nullable(),
});

export type ParsedAccountRow = z.infer<typeof rowSchema>;

export function parseAccountsCsv(csvText: string): ParsedAccountRow[] {
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  return records.map((record, index) => {
    try {
      return rowSchema.parse({
        username: record.username,
        password: record.password,
        label: record.label || null,
      });
    } catch {
      throw new Error(`Invalid CSV row at line ${index + 2}. Expected columns: username,password,label`);
    }
  });
}
