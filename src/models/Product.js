const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Ürün adı zorunludur'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Fiyat zorunludur'],
        min: [0, 'Fiyat 0\'dan küçük olamaz']
    },
    stock: {
        type: Number,
        required: [true, 'Stok miktarı zorunludur'],
        min: [0, 'Stok miktarı 0\'dan küçük olamaz']
    },
    description: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Güncelleme tarihini otomatik güncelle
productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Product', productSchema); 