import { NextApiRequest, NextApiResponse } from 'next';
import XLSX from 'xlsx';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    // Şablon başlıkları
    const headers = [
        'ADI SOYADI',
        'SGK DURUMU',
        'GİRİŞ YILI',
        'ŞUBE',
        'ERP PASİF AKTİF',
        'ROL',
        'GÜNLÜK ÜCRET',
        'ŞİFRE',
        'EMAIL',
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kullanıcılar');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="kullanici-sablon.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.status(200).send(buf);
} 