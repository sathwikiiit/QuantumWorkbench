
import { TableSchema } from './types';

export const REALISTIC_SCHEMA: TableSchema[] = [
  {
    id: 'customers',
    name: 'customers',
    schemaName: 'public',
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true, isNullable: false },
      { name: 'email', type: 'varchar', isNullable: false },
      { name: 'first_name', type: 'varchar', isNullable: true },
      { name: 'last_name', type: 'varchar', isNullable: true },
      { name: 'created_at', type: 'timestamp', isNullable: false }
    ],
    foreignKeys: []
  },
  {
    id: 'addresses',
    name: 'addresses',
    schemaName: 'public',
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true, isNullable: false },
      { name: 'customer_id', type: 'uuid', isForeignKey: true, isNullable: false, references: { table: 'customers', column: 'id' } },
      { name: 'street', type: 'varchar', isNullable: false },
      { name: 'city', type: 'varchar', isNullable: false },
      { name: 'country', type: 'varchar', isNullable: false }
    ],
    foreignKeys: [
      { column: 'customer_id', referencesTable: 'customers', referencesColumn: 'id' }
    ]
  },
  {
    id: 'orders',
    name: 'orders',
    schemaName: 'public',
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true, isNullable: false },
      { name: 'customer_id', type: 'uuid', isForeignKey: true, isNullable: false, references: { table: 'customers', column: 'id' } },
      { name: 'status', type: 'varchar', isNullable: false },
      { name: 'total_amount', type: 'decimal', isNullable: false },
      { name: 'ordered_at', type: 'timestamp', isNullable: false }
    ],
    foreignKeys: [
      { column: 'customer_id', referencesTable: 'customers', referencesColumn: 'id' }
    ]
  },
  {
    id: 'order_items',
    name: 'order_items',
    schemaName: 'public',
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true, isNullable: false },
      { name: 'order_id', type: 'uuid', isForeignKey: true, isNullable: false, references: { table: 'orders', column: 'id' } },
      { name: 'product_id', type: 'uuid', isForeignKey: true, isNullable: false, references: { table: 'products', column: 'id' } },
      { name: 'quantity', type: 'integer', isNullable: false },
      { name: 'unit_price', type: 'decimal', isNullable: false }
    ],
    foreignKeys: [
      { column: 'order_id', referencesTable: 'orders', referencesColumn: 'id' },
      { column: 'product_id', referencesTable: 'products', referencesColumn: 'id' }
    ]
  },
  {
    id: 'products',
    name: 'products',
    schemaName: 'public',
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true, isNullable: false },
      { name: 'name', type: 'varchar', isNullable: false },
      { name: 'sku', type: 'varchar', isNullable: false },
      { name: 'price', type: 'decimal', isNullable: false },
      { name: 'stock_level', type: 'integer', isNullable: false }
    ],
    foreignKeys: []
  },
  {
    id: 'payments',
    name: 'payments',
    schemaName: 'public',
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true, isNullable: false },
      { name: 'order_id', type: 'uuid', isForeignKey: true, isNullable: false, references: { table: 'orders', column: 'id' } },
      { name: 'method', type: 'varchar', isNullable: false },
      { name: 'amount', type: 'decimal', isNullable: false },
      { name: 'paid_at', type: 'timestamp', isNullable: false }
    ],
    foreignKeys: [
      { column: 'order_id', referencesTable: 'orders', referencesColumn: 'id' }
    ]
  },
  {
    id: 'sales_stats',
    name: 'sales_stats',
    schemaName: 'analytics',
    columns: [
      { name: 'region', type: 'varchar', isNullable: false },
      { name: 'total_sales', type: 'decimal', isNullable: false },
      { name: 'period', type: 'varchar', isNullable: false }
    ]
  },
  {
    id: 'user_growth',
    name: 'user_growth',
    schemaName: 'analytics',
    columns: [
      { name: 'month', type: 'varchar', isNullable: false },
      { name: 'new_users', type: 'integer', isNullable: false }
    ]
  }
];
