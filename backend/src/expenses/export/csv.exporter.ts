import { stringify } from 'csv-stringify/sync';
import type { Expense } from '../domain/expense.entity';

export class CsvExporter {
  toBuffer(rows: Expense[]) {
    const records = rows.map((r) => ({
      id: r.id,
      description: r.description,
      amount: r.amount,
      category: r.category,
      date: r.date instanceof Date ? r.date.toISOString() : String(r.date),
    }));

    const csv = stringify(records, {
      header: true,
      columns: [
        { key: 'id', header: 'id' },
        { key: 'description', header: 'description' },
        { key: 'amount', header: 'amount' },
        { key: 'category', header: 'category' },
        { key: 'date', header: 'date' },
      ],
    });

    return Buffer.from(csv, 'utf8');
  }
}
