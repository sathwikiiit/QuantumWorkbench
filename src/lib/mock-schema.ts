
import { TableSchema } from './types';

export const REALISTIC_SCHEMA: TableSchema[] = [
  {
    id: 'customers',
    name: 'customers',
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true },
      { name: 'email', type: 'varchar' },
      { name: 'first_name', type: 'varchar' },
      { name: 'last_name', type: 'varchar' },
      { name: 'created_at', type: 'timestamp' }
    ]
  },
  {
    id: 'addresses',
    name: 'addresses',
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true },
      { name: 'customer_id', type: 'uuid', isForeignKey: true, references: { table: 'customers', column: 'id' } },
      { name: 'street', type: 'varchar' },
      { name: 'city', type: 'varchar' },
      { name: 'country', type: 'varchar' }
    ]
  },
  {
    id: 'orders',
    name: 'orders',
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true },
      { name: 'customer_id', type: 'uuid', isForeignKey: true, references: { table: 'customers', column: 'id' } },
      { name: 'status', type: 'varchar' },
      { name: 'total_amount', type: 'decimal' },
      { name: 'ordered_at', type: 'timestamp' }
    ]
  },
  {
    id: 'order_items',
    name: 'order_items',
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true },
      { name: 'order_id', type: 'uuid', isForeignKey: true, references: { table: 'orders', column: 'id' } },
      { name: 'product_id', type: 'uuid', isForeignKey: true, references: { table: 'products', column: 'id' } },
      { name: 'quantity', type: 'integer' },
      { name: 'unit_price', type: 'decimal' }
    ]
  },
  {
    id: 'products',
    name: 'products',
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true },
      { name: 'name', type: 'varchar' },
      { name: 'sku', type: 'varchar' },
      { name: 'price', type: 'decimal' },
      { name: 'stock_level', type: 'integer' }
    ]
  },
  {
    id: 'payments',
    name: 'payments',
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true },
      { name: 'order_id', type: 'uuid', isForeignKey: true, references: { table: 'orders', column: 'id' } },
      { name: 'method', type: 'varchar' },
      { name: 'amount', type: 'decimal' },
      { name: 'paid_at', type: 'timestamp' }
    ]
  }
];
