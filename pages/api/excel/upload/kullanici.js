import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import formidable from 'formidable';
import XLSX from 'xlsx';
import bcrypt from 'bcryptjs';

export const config = { api: { bodyParser: false } };

function parseForm(req) {
    return new Promise((resolve, reject) => {
        const form = formidable({ multiples: false });
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
    if (!file) {
        return res.status(400).json({ error: 'Excel dosyası gerekli.' });
    }
    let workbook;
    try {
        const fileBuffer = require('fs').readFileSync(file.filepath || file.path);
        workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    } catch (e) {
        return res.status(400).json({ error: 'Excel dosyası okunamadı.' });
    }
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rowsRaw = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    const requiredHeaders = [
        'ADI SOYADI',
        'ROL',
        'ŞİFRE'
    ];
    const results = [];
    for (const row of rowsRaw) {
        const ad = row['ADI SOYADI']?.trim();
        const email = row['EMAIL']?.trim() || null;
        const rol = row['ROL']?.trim() || 'user';
        let sifre = row['ŞİFRE']?.trim();
        const sgkDurumu = row['SGK DURUMU']?.trim() || null;
        const girisYili = row['GİRİŞ YILI'] ? parseInt(row['GİRİŞ YILI']) : null;
        const sube = row['ŞUBE']?.trim() || null;
        let erpPasifAktif = row['ERP PASİF AKTİF'];
        if (typeof erpPasifAktif === 'string') {
            erpPasifAktif = erpPasifAktif.trim().toLowerCase();
            erpPasifAktif = erpPasifAktif === 'aktif' || erpPasifAktif === 'true' ? true : false;
        } else if (typeof erpPasifAktif !== 'boolean') {
            erpPasifAktif = true;
        }
        const gunlukUcret = row['GÜNLÜK ÜCRET'] ? parseFloat(row['GÜNLÜK ÜCRET']) : null;
        if (!ad) {
            results.push({ email, ad, status: 'error', message: 'ADI SOYADI zorunlu.' });
            continue;
        }
        if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            results.push({ email, ad, status: 'error', message: 'Geçersiz email.' });
            continue;
        }
        if (email) {
            const existing = await prisma.user.findFirst({ where: { email } });
            if (existing) {
                results.push({ email, ad, status: 'skipped', message: 'Zaten mevcut.' });
                continue;
            }
        }
        if (!sifre) {
            const adArr = ad.split(' ');
            const soyad = adArr.length > 1 ? adArr[adArr.length - 1] : adArr[0];
            const isim = adArr[0];
            const isim3 = isim.substring(0, 3).toUpperCase();
            const soyadUp = soyad.toUpperCase();
            const randomDigits = Math.floor(100 + Math.random() * 900);
            sifre = `${soyadUp}.${isim3}${randomDigits}`;
        }
        const passwordHash = await bcrypt.hash(sifre, 10);
        await prisma.user.create({
            data: {
                ad,
                email,
                rol: rol,
                passwordHash,
                sgkDurumu,
                girisYili,
                sube,
                erpPasifAktif,
                gunlukUcret
            }
        });
        results.push({ email, ad, status: 'ok', generatedPassword: !row['ŞİFRE'] ? sifre : undefined });
    }
    return res.status(200).json({ results });
} 