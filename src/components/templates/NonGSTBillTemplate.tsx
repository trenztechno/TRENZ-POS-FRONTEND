// src/components/templates/NonGSTBillTemplate.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface NonGSTBillData {
  // Business Details
  invoiceNumber: string;
  restaurantName: string;
  address: string;
  gstin?: string;
  fssaiLicense?: string;
  phone: string;
  logoUri?: string;

  // Bill Details
  billNumber: string;
  billDate: string;
  billTime?: string;
  tableNumber?: string;

  // Items
  items: Array<{
    name: string;
    quantity: number;
    rate?: number;
    amount: number;
  }>;

  // Amounts
  subtotal: number;
  totalAmount: number;

  // Payment
  paymentMode: string;
  paymentReference?: string;
  amountPaid?: number;
  changeAmount?: number;

  // Optional
  footerNote?: string;
  customerName?: string;
  customerPhone?: string;
}

interface NonGSTBillTemplateProps {
  data: NonGSTBillData;
  paperWidth?: 58 | 80;
}

const NonGSTBillTemplate: React.FC<NonGSTBillTemplateProps> = ({
  data,
}) => {
  return (
    <View style={styles.container}>
      {/* Business Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.businessName}>
          {data.restaurantName.toUpperCase()}
        </Text>
        <Text style={styles.address}>
          {data.address}
        </Text>
        <Text style={styles.businessDetail}>
          Ph: {data.phone}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Bill Details */}
      <View style={styles.row}>
        <Text style={styles.label}>Bill No:</Text>
        <Text style={styles.value}>{data.billNumber}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>
          {data.billDate}{data.billTime ? ` | ${data.billTime}` : ''}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Invoice No:</Text>
        <Text style={styles.value}>{data.invoiceNumber}</Text>
      </View>
      {data.tableNumber && (
        <View style={styles.row}>
          <Text style={styles.label}>Table:</Text>
          <Text style={styles.value}>{data.tableNumber}</Text>
        </View>
      )}

      <View style={styles.divider} />

      {/* Items Header */}
      <View style={styles.itemsHeader}>
        <Text style={[styles.itemsHeaderText, { flex: 2, textAlign: 'left' }]}>Item</Text>
        <Text style={[styles.itemsHeaderText, { flex: 0.8, textAlign: 'center' }]}>Qty</Text>
        <Text style={[styles.itemsHeaderText, { flex: 1.5, textAlign: 'right' }]}>Amount</Text>
      </View>

      <View style={styles.divider} />

      {/* Items List */}
      {data.items.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          <Text style={[styles.itemName, { flex: 2, textAlign: 'left' }]}>
            {item.name}
          </Text>
          <Text style={[styles.itemQuantity, { flex: 0.8, textAlign: 'center' }]}>
            {item.quantity}
          </Text>
          <Text style={[styles.itemAmount, { flex: 1.5, textAlign: 'right' }]}>
            {item.amount.toFixed(2)}
          </Text>
        </View>
      ))}

      <View style={styles.divider} />

      {/* Totals */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Subtotal</Text>
        <Text style={styles.totalValue}>{data.subtotal.toFixed(2)}</Text>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>GST</Text>
        <Text style={styles.totalValue}>0.00</Text>
      </View>

      <View style={styles.divider} />

      {/* Grand Total */}
      <View style={[styles.totalRow, styles.grandTotalRow]}>
        <Text style={styles.grandTotalLabel}>TOTAL</Text>
        <Text style={styles.grandTotalValue}>₹{data.totalAmount.toFixed(2)}</Text>
      </View>

      <View style={styles.divider} />

      {/* Payment Details */}
      <View style={styles.row}>
        <Text style={styles.label}>Payment:</Text>
        <Text style={styles.value}>{data.paymentMode.toUpperCase()}</Text>
      </View>
      {data.paymentReference && (
        <View style={styles.row}>
          <Text style={styles.label}>Ref:</Text>
          <Text style={styles.value}>{data.paymentReference}</Text>
        </View>
      )}
      {data.amountPaid !== undefined && (
        <>
          <View style={styles.row}>
            <Text style={styles.label}>Amount Paid:</Text>
            <Text style={styles.value}>₹{data.amountPaid.toFixed(2)}</Text>
          </View>
          {data.changeAmount !== undefined && data.changeAmount > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Change:</Text>
              <Text style={styles.value}>₹{data.changeAmount.toFixed(2)}</Text>
            </View>
          )}
        </>
      )}

      {/* Customer Details */}
      {(data.customerName || data.customerPhone) && (
        <>
          <View style={styles.divider} />
          {data.customerName && (
            <View style={styles.row}>
              <Text style={styles.label}>Customer:</Text>
              <Text style={styles.value}>{data.customerName}</Text>
            </View>
          )}
          {data.customerPhone && (
            <View style={styles.row}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{data.customerPhone}</Text>
            </View>
          )}
        </>
      )}

      <View style={styles.divider} />

      {/* Non-GST Notice */}
      <Text style={styles.gstNotice}>
        GST NOT APPLICABLE
      </Text>
      <Text style={styles.gstNotice}>
        (Non-GST Registered Hotel)
      </Text>

      {/* Footer Note */}
      {data.footerNote && (
        <>
          <View style={styles.divider} />
          <Text style={styles.footerNote}>
            {data.footerNote}
          </Text>
        </>
      )}

      <View style={styles.bottomSpacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    width: '100%',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 2,
  },
  businessDetail: {
    fontSize: 13,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 2,
  },
  divider: {
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    borderStyle: 'dashed',
    marginVertical: 12,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  itemsHeader: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  itemsHeaderText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
  },
  itemRow: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 14,
    color: '#000000',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#000000',
  },
  itemAmount: {
    fontSize: 14,
    color: '#000000',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: '#333333',
  },
  totalValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
    textAlign: 'right',
  },
  grandTotalRow: {
    marginTop: 4,
    marginBottom: 4,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'right',
  },
  gstNotice: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    fontWeight: '600',
    marginVertical: 2,
  },
  footerNote: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: 12,
  },
});

export default NonGSTBillTemplate;
