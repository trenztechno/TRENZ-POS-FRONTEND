// src/services/printer.ts
import { NativeModules, Platform } from 'react-native';
import type { GSTBillData } from '../components/templates/GSTBillTemplate';
import type { NonGSTBillData } from '../components/templates/NonGSTBillTemplate';
import { getBusinessSettings } from './storage';

const { XprinterModule } = NativeModules;

export interface BluetoothDevice {
  name: string;
  address: string;
}

export interface PrinterService {
  getPairedDevices(): Promise<BluetoothDevice[]>;
  connectBluetooth(macAddress: string): Promise<boolean>;
  isConnected(): Promise<boolean>;
  disconnect(): Promise<void>;
  printBill(billData: GSTBillData | NonGSTBillData, isGST: boolean): Promise<boolean>;
  printTestPage(): Promise<boolean>;
  openCashDrawer(): Promise<boolean>;
  cutPaper(): Promise<boolean>;
}

// ESC/POS Commands
const ESC = '\x1B';
const GS = '\x1D';
const CUT_CMD = '\n\n\x1dV\x01'; // Paper cut

class PrinterServiceImpl implements PrinterService {
  /**
   * Send print data to network relay (for emulator / WiFi printer)
   */
  private async sendToNetworkPrinter(baseUrl: string, printData: string): Promise<void> {
    const url = baseUrl.replace(/\/$/, '') + '/print';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: printData,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Print server returned ${res.status}`);
    }
  }

  /**
   * Use network printing only when user explicitly chose it (no emulator default).
   * Docs: connect via Bluetooth — pair in Settings first, then select and connect in app.
   */
  private async isNetworkPrintMode(): Promise<{ url: string } | null> {
    const settings = await getBusinessSettings();
    if (settings?.printer_connection_type === 'network' && settings?.printer_network_url) {
      return { url: settings.printer_network_url };
    }
    return null;
  }

  /**
   * Build GST bill print string (no native send)
   */
  private getGSTBillPrintData(data: GSTBillData, paperWidth: 58 | 80): string {
    let printData = '';
    printData += ESC + '@';
    printData += this.leftAlign();
    printData += this.setFontSize(2, 2);
    printData += this.boldOn();
    printData += this.formatCenterLine((data.restaurantName || 'Store').toUpperCase(), paperWidth);
    printData += this.boldOff();
    printData += this.setFontSize(1, 1);
    printData += this.formatCenterLine(data.address || '', paperWidth);
    printData += this.formatCenterLine(`GSTIN: ${data.gstin || ''}`, paperWidth);
    printData += this.formatCenterLine(`FSSAI No: ${data.fssaiLicense || 'N/A'}`, paperWidth);
    if (data.phone) printData += this.formatCenterLine(`Ph: ${data.phone}`, paperWidth);
    printData += '\n';
    printData += this.lineSeparator(paperWidth);
    printData += this.formatLabelValueRow('Bill No:', data.billNumber, paperWidth);
    printData += this.formatLabelValueRow('Date:', `${data.billDate}${data.billTime ? ` | ${data.billTime}` : ''}`, paperWidth);
    printData += this.formatLabelValueRow('Invoice No:', data.invoiceNumber, paperWidth);
    if (data.tableNumber) printData += this.formatLine(`Table: ${data.tableNumber}`, paperWidth);
    printData += '\n';
    printData += this.lineSeparator(paperWidth);
    printData += this.boldOn();
    printData += this.formatItemHeaderRow(paperWidth);
    printData += this.boldOff();
    printData += this.lineSeparator(paperWidth);
    data.items.forEach((item, idx) => {
      const name = idx === 0 ? ' ' + item.name : item.name;
      printData += this.formatItemRow(name, item.quantity.toString(), item.rate.toFixed(2), item.amount.toFixed(2), paperWidth);
      printData += '\n';
    });
    printData += this.lineSeparator(paperWidth);
    printData += this.formatAmountRow('Subtotal:', data.subtotal, paperWidth);
    printData += this.formatAmountRow(`CGST (${data.cgstPercentage}%):`, data.cgstAmount, paperWidth);
    printData += this.formatAmountRow(`SGST (${data.sgstPercentage}%):`, data.sgstAmount, paperWidth);
    printData += '\n';
    printData += this.boldOn();
    printData += this.formatAmountRow('Total:', data.totalAmount, paperWidth);
    printData += this.boldOff();
    printData += '\n';
    printData += this.lineSeparator(paperWidth);
    printData += this.formatLine(`Payment Mode: ${data.paymentMode}`, paperWidth);
    if (data.amountPaid) printData += this.formatAmountRow('Amount Paid:', data.amountPaid, paperWidth);
    if (data.changeAmount && data.changeAmount > 0) printData += this.formatAmountRow('Change:', data.changeAmount, paperWidth);
    printData += '\n';
    const totalGstPct = (data.cgstPercentage || 0) + (data.sgstPercentage || 0);
    printData += this.formatCenterLine(`GST @${totalGstPct}% | ITC Applicable`, paperWidth);
    printData += this.formatCenterLine(data.footerNote || 'Thank You! Visit Again', paperWidth);
    printData += '\n\n';
    return printData;
  }

  /**
   * Build Non-GST bill print string (no native send)
   */
  private getNonGSTBillPrintData(data: NonGSTBillData, paperWidth: 58 | 80): string {
    let printData = '';
    printData += ESC + '@';
    printData += this.leftAlign();
    printData += this.setFontSize(2, 2);
    printData += this.boldOn();
    printData += this.formatCenterLine((data.restaurantName || 'Store').toUpperCase(), paperWidth);
    printData += this.boldOff();
    printData += this.setFontSize(1, 1);
    printData += this.formatCenterLine(data.address || '', paperWidth);
    if (data.phone) printData += this.formatCenterLine(`Ph: ${data.phone}`, paperWidth);
    printData += '\n';
    printData += this.lineSeparator(paperWidth);
    printData += this.formatLabelValueRow('Bill No:', data.billNumber, paperWidth);
    printData += this.formatLabelValueRow('Date:', `${data.billDate}${data.billTime ? ` | ${data.billTime}` : ''}`, paperWidth);
    if (data.tableNumber) printData += this.formatLabelValueRow('Table:', data.tableNumber, paperWidth);
    printData += '\n';
    printData += this.lineSeparator(paperWidth);
    printData += this.boldOn();
    printData += this.formatItemHeaderRowNonGST(paperWidth);
    printData += this.boldOff();
    printData += this.lineSeparator(paperWidth);
    data.items.forEach((item, idx) => {
      const name = idx === 0 ? ' ' + item.name : item.name;
      printData += this.formatItemRowNonGST(name, item.quantity.toString(), item.amount.toFixed(2), paperWidth);
      printData += '\n';
    });
    printData += this.lineSeparator(paperWidth);
    printData += this.formatAmountRow('Subtotal:', data.subtotal, paperWidth);
    printData += '\n';
    printData += this.boldOn();
    printData += this.formatAmountRow('Total:', data.totalAmount, paperWidth);
    printData += this.boldOff();
    printData += '\n';
    printData += this.lineSeparator(paperWidth);
    printData += this.formatLine(`Payment Mode: ${data.paymentMode}`, paperWidth);
    if (data.amountPaid) printData += this.formatAmountRow('Amount Paid:', data.amountPaid, paperWidth);
    if (data.changeAmount && data.changeAmount > 0) printData += this.formatAmountRow('Change:', data.changeAmount, paperWidth);
    printData += '\n';
    printData += this.formatCenterLine(data.footerNote || 'Thank You! Visit Again', paperWidth);
    printData += '\n\n';
    return printData;
  }

  /**
   * Build test print string (no native send)
   */
  private getTestPrintData(): string {
    let printData = '';
    printData += ESC + '@';
    printData += this.centerText();
    printData += this.setFontSize(2, 2);
    printData += this.boldOn();
    printData += 'TEST PRINT\n';
    printData += this.boldOff();
    printData += this.setFontSize(1, 1);
    printData += this.leftAlign();
    printData += '\nThis is a test print from\nTRENZ POS Mobile App\n\n';
    printData += `Date: ${new Date().toLocaleString()}\n\n`;
    printData += this.lineSeparator(58);
    printData += '\n';
    printData += this.centerText();
    printData += 'If you can read this,\nyour printer is working!\n\n\n';
    return printData;
  }

  /**
   * Get list of paired Bluetooth devices
   */
  async getPairedDevices(): Promise<BluetoothDevice[]> {
    if (Platform.OS !== 'android') {
      throw new Error('Printer is only supported on Android');
    }
    
    if (!XprinterModule) {
      throw new Error('XprinterModule is not available');
    }
    
    try {
      const devices = await XprinterModule.getPairedDevices();
      return devices.map((d: any) => ({
        name: d.name || 'Unknown Device',
        address: d.address,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get paired devices: ${error.message}`);
    }
  }

  /**
   * Connect to Bluetooth printer
   */
  async connectBluetooth(macAddress: string): Promise<boolean> {
    if (Platform.OS !== 'android') {
      throw new Error('Printer is only supported on Android');
    }
    
    if (!XprinterModule) {
      throw new Error('XprinterModule is not available');
    }
    
    try {
      const result = await XprinterModule.connectBluetooth(macAddress);
      return result === true;
    } catch (error: any) {
      throw new Error(`Failed to connect: ${error.message}`);
    }
  }

  /**
   * Check if printer is connected (Bluetooth) or network print is configured
   */
  async isConnected(): Promise<boolean> {
    const network = await this.isNetworkPrintMode();
    if (network) return true;
    if (Platform.OS !== 'android' || !XprinterModule) return false;
    try {
      return await XprinterModule.isConnected();
    } catch {
      return false;
    }
  }

  /**
   * Disconnect from printer
   */
  async disconnect(): Promise<void> {
    if (Platform.OS !== 'android' || !XprinterModule) {
      return;
    }
    
    try {
      await XprinterModule.disconnect();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }

  /**
   * Print ESC/POS command to center text
   */
  private centerText(): string {
    return ESC + 'a' + '\x01'; // Center alignment
  }

  /**
   * Print ESC/POS command to left align text
   */
  private leftAlign(): string {
    return ESC + 'a' + '\x00'; // Left alignment
  }

  /**
   * Print ESC/POS command to set font size
   */
  private setFontSize(width: number, height: number): string {
    // ESC ! n where n = (width-1) | ((height-1) << 4)
    const n = (width - 1) | ((height - 1) << 4);
    return ESC + '!' + String.fromCharCode(n);
  }

  /**
   * Print ESC/POS command to bold text
   */
  private boldOn(): string {
    return ESC + 'E' + '\x01';
  }

  /**
   * Print ESC/POS command to bold off
   */
  private boldOff(): string {
    return ESC + 'E' + '\x00';
  }

  /**
   * Print line separator
   */
  private lineSeparator(paperWidth: 58 | 80): string {
    const chars = paperWidth === 58 ? 32 : 48;
    return '-'.repeat(chars) + '\n';
  }

  /**
   * Format line to paper width: left-aligned (as in UI). Pad on right only.
   * 58mm = 32 chars, 80mm = 48 chars.
   */
  private formatLine(text: string, paperWidth: 58 | 80): string {
    const maxChars = paperWidth === 58 ? 32 : 48;
    const line = text.length <= maxChars ? text : text.substring(0, maxChars - 3) + '...';
    return line + ' '.repeat(Math.max(0, maxChars - line.length)) + '\n';
  }

  /**
   * Center text on line with equal left and right padding (like UI) — no ESC/POS center.
   */
  private formatCenterLine(text: string, paperWidth: 58 | 80): string {
    const maxChars = paperWidth === 58 ? 32 : 48;
    const t = text.length <= maxChars ? text : text.substring(0, maxChars - 3) + '...';
    const leftPad = Math.floor((maxChars - t.length) / 2);
    const rightPad = maxChars - t.length - leftPad;
    return ' '.repeat(leftPad) + t + ' '.repeat(rightPad) + '\n';
  }

  /**
   * Format amount row like UI: label left-aligned, amount right-aligned (spaces between).
   */
  private formatAmountRow(label: string, amount: number, paperWidth: 58 | 80): string {
    const maxChars = paperWidth === 58 ? 32 : 48;
    const amountText = `Rs ${amount.toFixed(2)}`;
    const spaces = Math.max(1, maxChars - label.length - amountText.length);
    const line = label + ' '.repeat(spaces) + amountText;
    return line.length <= maxChars ? line + ' '.repeat(maxChars - line.length) + '\n' : line.substring(0, maxChars) + '\n';
  }

  /**
   * Label left, value right (same style as CGST/SGST) for Bill No, Date, Invoice No.
   */
  private formatLabelValueRow(label: string, value: string, paperWidth: 58 | 80): string {
    const maxChars = paperWidth === 58 ? 32 : 48;
    const spaces = Math.max(1, maxChars - label.length - value.length);
    const line = label + ' '.repeat(spaces) + value;
    return line.length <= maxChars ? line + ' '.repeat(maxChars - line.length) + '\n' : line.substring(0, maxChars) + '\n';
  }

  /** Column widths for item table: Item (left), Qty, Rate, Amount (right). 80mm=48, 58mm=32. */
  private getItemColumnWidths(paperWidth: 58 | 80): { item: number; qty: number; rate: number; amount: number } {
    if (paperWidth === 80) return { item: 18, qty: 4, rate: 10, amount: 12 };
    return { item: 10, qty: 3, rate: 8, amount: 9 };
  }

  /**
   * One row per product like UI: Item (left) | Qty | Rate | Amount (right-aligned in columns).
   */
  private formatItemRow(
    name: string,
    qty: string,
    rate: string,
    amount: string,
    paperWidth: 58 | 80
  ): string {
    const w = this.getItemColumnWidths(paperWidth);
    const itemPart = (name.length > w.item ? name.substring(0, w.item - 1) + '…' : name).padEnd(w.item);
    const qtyPart = qty.padStart(w.qty);
    const ratePart = rate.padStart(w.rate);
    const amountPart = amount.padStart(w.amount);
    return itemPart + qtyPart + ratePart + amountPart + '\n';
  }

  /** Header line for item table (Item, Qty, Rate, Amount) same column widths. */
  private formatItemHeaderRow(paperWidth: 58 | 80): string {
    const w = this.getItemColumnWidths(paperWidth);
    return 'Item'.padEnd(w.item) + 'Qty'.padStart(w.qty) + 'Rate'.padStart(w.rate) + 'Amount'.padStart(w.amount) + '\n';
  }

  /** Non-GST: one row per product — Item (left) | Qty | Amount (right). No Rate column. */
  private formatItemRowNonGST(name: string, qty: string, amount: string, paperWidth: 58 | 80): string {
    const itemW = paperWidth === 80 ? 28 : 16;
    const qtyW = paperWidth === 80 ? 6 : 4;
    const amountW = paperWidth === 80 ? 14 : 12;
    const itemPart = (name.length > itemW ? name.substring(0, itemW - 1) + '…' : name).padEnd(itemW);
    const qtyPart = qty.padStart(qtyW);
    const amountPart = amount.padStart(amountW);
    return itemPart + qtyPart + amountPart + '\n';
  }

  private formatItemHeaderRowNonGST(paperWidth: 58 | 80): string {
    const itemW = paperWidth === 80 ? 28 : 16;
    const qtyW = paperWidth === 80 ? 6 : 4;
    const amountW = paperWidth === 80 ? 14 : 12;
    return 'Item'.padEnd(itemW) + 'Qty'.padStart(qtyW) + 'Amount'.padStart(amountW) + '\n';
  }

  /** Strip to ASCII so printer never gets garbage (no encoding/random chars). */
  private toAscii(s: string): string {
    return s.replace(/₹/g, 'Rs ').replace(/[^\x00-\x7F]/g, '?');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  /**
   * Send line-by-line so printer buffer doesn't drop the middle (items).
   */
  private async sendToBluetooth(printData: string): Promise<void> {
    const safe = this.toAscii(printData);
    const lines = safe.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const withNewline = i < lines.length - 1 ? line + '\n' : (line ? line + '\n' : '');
      if (!withNewline) continue;
      await XprinterModule.printBillStart();
      await XprinterModule.printBillChunk(withNewline);
      await XprinterModule.printBillFlush();
      await this.delay(50);
    }
  }

  /**
   * Print GST Bill
   */
  private async printGSTBill(data: GSTBillData, paperWidth: 58 | 80): Promise<void> {
    let printData = '';
    
    // Initialize printer
    printData += ESC + '@'; // Reset printer
    printData += this.leftAlign();

    // Header — store name, GSTIN, FSSAI: centered (always print all with fallbacks so they show)
    printData += this.setFontSize(2, 2);
    printData += this.boldOn();
    printData += this.formatCenterLine((data.restaurantName || 'Store').toUpperCase(), paperWidth);
    printData += this.boldOff();
    printData += this.setFontSize(1, 1);
    printData += this.formatCenterLine(data.address || '', paperWidth);
    printData += this.formatCenterLine(`GSTIN: ${data.gstin || ''}`, paperWidth);
    printData += this.formatCenterLine(`FSSAI No: ${data.fssaiLicense || 'N/A'}`, paperWidth);
    if (data.phone) {
      printData += this.formatCenterLine(`Ph: ${data.phone}`, paperWidth);
    }
    printData += '\n';

    // Line separator
    printData += this.lineSeparator(paperWidth);

    // Bill details — label left, value right (like CGST/SGST)
    printData += this.formatLabelValueRow('Bill No:', data.billNumber, paperWidth);
    printData += this.formatLabelValueRow('Date:', `${data.billDate}${data.billTime ? ` | ${data.billTime}` : ''}`, paperWidth);
    printData += this.formatLabelValueRow('Invoice No:', data.invoiceNumber, paperWidth);
    if (data.tableNumber) {
      printData += this.formatLabelValueRow('Table:', data.tableNumber, paperWidth);
    }
    printData += '\n';

    // Line separator
    printData += this.lineSeparator(paperWidth);

    // Items Header (Item | Qty | Rate | Amount)
    printData += this.boldOn();
    printData += this.formatItemHeaderRow(paperWidth);
    printData += this.boldOff();
    printData += this.lineSeparator(paperWidth);

    // Items — one row per product, one line gap; first item gets leading space so first char prints
    data.items.forEach((item, idx) => {
      const name = idx === 0 ? ' ' + item.name : item.name;
      const qty = item.quantity.toString();
      const rate = item.rate.toFixed(2);
      const amount = item.amount.toFixed(2);
      printData += this.formatItemRow(name, qty, rate, amount, paperWidth);
      printData += '\n'; // one line gap between each item
    });

    // Line separator
    printData += this.lineSeparator(paperWidth);
    
    // Amounts
    printData += this.formatAmountRow('Subtotal:', data.subtotal, paperWidth);
    printData += this.formatAmountRow(`CGST (${data.cgstPercentage}%):`, data.cgstAmount, paperWidth);
    printData += this.formatAmountRow(`SGST (${data.sgstPercentage}%):`, data.sgstAmount, paperWidth);
    printData += '\n';
    printData += this.boldOn();
    printData += this.formatAmountRow('Total:', data.totalAmount, paperWidth);
    printData += this.boldOff();
    printData += '\n';
    
    // Payment Details
    printData += this.lineSeparator(paperWidth);
    printData += this.formatLine(`Payment Mode: ${data.paymentMode}`, paperWidth);
    if (data.amountPaid) {
      printData += this.formatAmountRow('Amount Paid:', data.amountPaid, paperWidth);
    }
    if (data.changeAmount && data.changeAmount > 0) {
      printData += this.formatAmountRow('Change:', data.changeAmount, paperWidth);
    }
    printData += '\n';
    
    // Footer — GST line and Thank You centered (equal left/right padding, like UI)
    const totalGstPct = (data.cgstPercentage || 0) + (data.sgstPercentage || 0);
    printData += this.formatCenterLine(`GST @${totalGstPct}% | ITC Applicable`, paperWidth);
    printData += this.formatCenterLine(data.footerNote || 'Thank You! Visit Again', paperWidth);
    printData += '\n\n';
    await this.sendToBluetooth(printData);
  }

  /**
   * Print Non-GST Bill
   */
  private async printNonGSTBill(data: NonGSTBillData, paperWidth: 58 | 80): Promise<void> {
    let printData = '';

    // Initialize printer
    printData += ESC + '@'; // Reset printer
    printData += this.leftAlign();

    // Header — store name, address, phone: centered (with fallbacks)
    printData += this.setFontSize(2, 2);
    printData += this.boldOn();
    printData += this.formatCenterLine((data.restaurantName || 'Store').toUpperCase(), paperWidth);
    printData += this.boldOff();
    printData += this.setFontSize(1, 1);
    printData += this.formatCenterLine(data.address || '', paperWidth);
    if (data.phone) {
      printData += this.formatCenterLine(`Ph: ${data.phone}`, paperWidth);
    }
    printData += '\n';

    // Line separator
    printData += this.lineSeparator(paperWidth);

    // Bill details — label left, value right (like UI)
    printData += this.formatLabelValueRow('Bill No:', data.billNumber, paperWidth);
    printData += this.formatLabelValueRow('Date:', `${data.billDate}${data.billTime ? ` | ${data.billTime}` : ''}`, paperWidth);
    if (data.tableNumber) {
      printData += this.formatLabelValueRow('Table:', data.tableNumber, paperWidth);
    }
    printData += '\n';

    // Line separator
    printData += this.lineSeparator(paperWidth);

    // Items Header (Item | Qty | Amount)
    printData += this.boldOn();
    printData += this.formatItemHeaderRowNonGST(paperWidth);
    printData += this.boldOff();
    printData += this.lineSeparator(paperWidth);

    // Items — one row per product, one line gap; first item leading space for first-char fix
    data.items.forEach((item, idx) => {
      const name = idx === 0 ? ' ' + item.name : item.name;
      printData += this.formatItemRowNonGST(name, item.quantity.toString(), item.amount.toFixed(2), paperWidth);
      printData += '\n';
    });

    // Line separator
    printData += this.lineSeparator(paperWidth);
    
    // Amounts
    printData += this.formatAmountRow('Subtotal:', data.subtotal, paperWidth);
    printData += '\n';
    printData += this.boldOn();
    printData += this.formatAmountRow('Total:', data.totalAmount, paperWidth);
    printData += this.boldOff();
    printData += '\n';
    
    // Payment Details
    printData += this.lineSeparator(paperWidth);
    printData += this.formatLine(`Payment Mode: ${data.paymentMode}`, paperWidth);
    if (data.amountPaid) {
      printData += this.formatAmountRow('Amount Paid:', data.amountPaid, paperWidth);
    }
    if (data.changeAmount && data.changeAmount > 0) {
      printData += this.formatAmountRow('Change:', data.changeAmount, paperWidth);
    }
    printData += '\n';
    
    // Footer — centered (equal left/right padding, like UI)
    printData += this.formatCenterLine(data.footerNote || 'Thank You! Visit Again', paperWidth);
    printData += '\n\n';
    await this.sendToBluetooth(printData);
  }

  /**
   * Print bill (Bluetooth or network/emulator)
   */
  async printBill(billData: GSTBillData | NonGSTBillData, isGST: boolean): Promise<boolean> {
    try {
      const settings = await getBusinessSettings();
      const paperWidth: 58 | 80 = (settings?.paper_size === '58mm' ? 58 : 80) as 58 | 80;

      const network = await this.isNetworkPrintMode();
      if (network) {
        const printData = isGST
          ? this.getGSTBillPrintData(billData as GSTBillData, paperWidth)
          : this.getNonGSTBillPrintData(billData as NonGSTBillData, paperWidth);
        await this.sendToNetworkPrinter(network.url, printData + CUT_CMD);
        return true;
      }

      if (Platform.OS !== 'android' || !XprinterModule) {
        throw new Error('Set up your Bluetooth printer in Printer Setup first.');
      }
      let connected = await XprinterModule.isConnected();
      if (!connected && settings?.printer_mac_address) {
        await this.connectBluetooth(settings.printer_mac_address);
        connected = await XprinterModule.isConnected();
      }
      if (!connected) {
        throw new Error('Set up printer once in Printer Setup: pair in Bluetooth, then select printer and tap Connect.');
      }
      if (isGST) {
        await this.printGSTBill(billData as GSTBillData, paperWidth);
      } else {
        await this.printNonGSTBill(billData as NonGSTBillData, paperWidth);
      }
      await this.cutPaper(); // Tell auto-cut machine to cut after bill
      return true;
    } catch (error: any) {
      throw new Error(`Failed to print bill: ${error.message}`);
    }
  }

  /**
   * Print test page (Bluetooth or network/emulator)
   */
  async printTestPage(): Promise<boolean> {
    try {
      const network = await this.isNetworkPrintMode();
      if (network) {
        await this.sendToNetworkPrinter(network.url, this.getTestPrintData() + CUT_CMD);
        return true;
      }
      if (Platform.OS !== 'android' || !XprinterModule) {
        throw new Error('Print is only supported on Android. Connect your Bluetooth printer in Printer Setup.');
      }
      let connected = await XprinterModule.isConnected();
      if (!connected) {
        const settings = await getBusinessSettings();
        if (settings?.printer_mac_address) {
          await this.connectBluetooth(settings.printer_mac_address);
          connected = await XprinterModule.isConnected();
        }
      }
      if (!connected) throw new Error('Printer not connected. Go to Printer Setup, select XP-v320m and tap Connect.');
      const printData = this.getTestPrintData();
      await XprinterModule.printText(printData);
      await this.cutPaper();
      return true;
    } catch (error: any) {
      throw new Error(`Failed to print test page: ${error.message}`);
    }
  }

  /**
   * Open cash drawer
   */
  async openCashDrawer(): Promise<boolean> {
    if (Platform.OS !== 'android' || !XprinterModule) {
      throw new Error('Printer is only supported on Android');
    }
    
    try {
      await XprinterModule.openCashDrawer();
      return true;
    } catch (error: any) {
      throw new Error(`Failed to open cash drawer: ${error.message}`);
    }
  }

  /**
   * Cut paper
   */
  async cutPaper(): Promise<boolean> {
    if (Platform.OS !== 'android' || !XprinterModule) {
      throw new Error('Printer is only supported on Android');
    }
    
    try {
      await XprinterModule.cutPaper();
      return true;
    } catch (error: any) {
      throw new Error(`Failed to cut paper: ${error.message}`);
    }
  }
}

// Export singleton instance
export const PrinterService = new PrinterServiceImpl();

