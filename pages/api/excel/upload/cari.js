import XLSX from 'xlsx';
import formidable from 'formidable';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { validateHeaders, cleanRow, validateRequiredFields } from '../../../../src/utils/excel';

export const config = {
    api: {
        bodyParser: false,
    },
};

const prisma = new PrismaClient();

function parseForm(req) {
    return new Promise((resolve, reject) => {
        const form = formidable();
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
        });
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let fields, files;
    try {
        ({ fields, files } = await parseForm(req));
    } catch (err) {
        return res.status(500).json({ error: 'Dosya yüklenemedi.' });
    }
    let file = files.file;
    if (Array.isArray(file)) file = file[0];
    console.log('FILE:', file);
    if (!file) {
        return res.status(400).json({ error: 'Excel dosyası gerekli.' });
    }
    const filePath = file.filepath || file.path;
    let workbook;
    try {
        const fileBuffer = fs.readFileSync(filePath);
        console.log('BUFFER LENGTH:', fileBuffer.length, 'FIRST BYTES:', fileBuffer.slice(0, 8));
        workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    } catch (e) {
        console.error('XLSX read error:', e);
        return res.status(400).json({ error: 'Excel dosyası okunamadı.' });
    }
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rowsRaw = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    console.log('HEADERS:', Object.keys(rowsRaw[0] || {}));
    const requiredHeaders = ['CARİ ADI', 'MÜŞTERİ KODU', 'ŞUBE ADI', 'TEL'];
    const missingHeaders = validateHeaders(rowsRaw[0] || {}, requiredHeaders);
    if (missingHeaders.length > 0) {
        return res.status(400).json({ error: `Excel başlığı eksik: ${missingHeaders.join(', ')}` });
    }
    // Şubeleri önceden çek
    const subeler = await prisma.sube.findMany();
    const subeMap = {};
    subeler.forEach(s => { subeMap[s.ad.trim().toUpperCase()] = s.id; });
    // SALON şubesi yoksa oluştur
    let salonSubeId = subeMap['SALON'];
    if (!salonSubeId) {
        const salon = await prisma.sube.create({ data: { ad: 'SALON' } });
        salonSubeId = salon.id;
        subeMap['SALON'] = salon.id;
    }
    const results = [];
    for (const rowRaw of rowsRaw) {
        const rec = cleanRow(rowRaw);
        const missingFields = validateRequiredFields(rec, ['CARİ ADI', 'MÜŞTERİ KODU']);
        if (missingFields.length > 0) {
            results.push({ musteriKodu: rec['MÜŞTERİ KODU'], ad: rec['CARİ ADI'], status: 'error', message: `Zorunlu alan eksik: ${missingFields.join(', ')}` });
            continue;
        }
        const ad = rec['CARİ ADI'];
        const musteriKodu = rec['MÜŞTERİ KODU'];
        const telefon = rec['TEL'] !== undefined && rec['TEL'] !== null ? String(rec['TEL']) : null;
        const subeAd = rec['ŞUBE ADI']?.toUpperCase() || 'SALON';
        let subeId = subeMap[subeAd];
        if (!subeId) {
            const sube = await prisma.sube.create({ data: { ad: subeAd } });
            subeId = sube.id;
            subeMap[subeAd] = subeId;
        }
        // Unique constraint için önce var mı bak
        const existing = await prisma.cari.findUnique({ where: { musteriKodu } });
        if (!existing) {
            await prisma.cari.create({
                data: {
                    ad,
                    musteriKodu,
                    telefon,
                    subeId,
                }
            });
            results.push({ musteriKodu, ad, status: 'ok' });
        } else {
            results.push({ musteriKodu, ad, status: 'skipped', message: 'Zaten mevcut.' });
        }
    }
    return res.status(200).json({ results });
} 