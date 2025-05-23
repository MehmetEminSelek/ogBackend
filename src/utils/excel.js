// Excel yardımcı fonksiyonları

/**
 * Excel başlıklarını kontrol eder
 * @param {object} row İlk satır (header)
 * @param {string[]} requiredHeaders Gerekli başlıklar
 * @returns {string[]} Eksik başlıklar
 */
export function validateHeaders(row, requiredHeaders) {
    const missing = [];
    for (const h of requiredHeaders) {
        if (!(h in row)) missing.push(h);
    }
    return missing;
}

/**
 * Satırdaki tüm string alanları trimler
 */
export function cleanRow(row) {
    const cleaned = {};
    for (const key in row) {
        cleaned[key] = typeof row[key] === 'string' ? row[key].trim() : row[key];
    }
    return cleaned;
}

/**
 * Zorunlu alanları kontrol eder
 * @param {object} row Satır
 * @param {string[]} requiredFields Zorunlu alanlar
 * @returns {string[]} Eksik alanlar
 */
export function validateRequiredFields(row, requiredFields) {
    const missing = [];
    for (const f of requiredFields) {
        if (!row[f]) missing.push(f);
    }
    return missing;
} 