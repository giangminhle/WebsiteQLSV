const sql = require('mssql');

const config = {
    user: 'sa',
    password: '25022005',
    server: 'localhost\\SQLEXPRESS',
    database: 'QuanLySinhVien',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

console.log('🔄 Đang kết nối DB...');

sql.connect(config).then(pool => {
    console.log('✅ Kết nối thành công!');
    return pool.close();
}).catch(err => {
    console.error('❌ Lỗi kết nối:', err.message);
});
