
import * as XLSX from 'xlsx';

/**
 * Exports data to an Excel file (.xlsx)
 * @param data Array of objects to export
 * @param fileName Name of the file (without extension)
 * @param sheetName Name of the sheet inside the workbook
 */
export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Exports data to a CSV file
 * @param data Array of objects to export
 * @param fileName Name of the file (without extension)
 */
export const exportToCSV = (data: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${fileName}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

/**
 * Flattens nested objects for easier export (useful for quotes/invoices with items)
 * @param data Array of objects
 * @returns Array of flattened objects
 */
export const flattenData = (data: any[]) => {
    return data.map(item => {
        const flat: any = { ...item };
        // Handle items if present
        if (Array.isArray(flat.items)) {
            flat.items_count = flat.items.length;
            flat.items_list = flat.items.map((i: any) => `${i.description} (${i.quantity}x${i.unitPrice})`).join(' | ');
            delete flat.items;
        }
        // Remove complex nested objects that don't export well
        delete flat.company;
        delete flat.contactCrm;
        return flat;
    });
};
