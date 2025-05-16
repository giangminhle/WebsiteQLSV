const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;
let db; // Biến kết nối SQL Server

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public')); // Phục vụ file tĩnh (HTML, CSS, JS)

// Cấu hình kết nối SQL Server
const config = {
    user: 'sa', // Tài khoản SQL Server
    password: '25022005', // Mật khẩu
    server: 'localhost',
    port: 1433,
    database: 'QuanLySinhVien',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// Kết nối SQL Server và khởi động server
async function startServer() {
    try {
        console.log('🔄 Đang kết nối SQL Server...');
        db = await sql.connect(config);
        console.log('✅ Kết nối SQL Server thành công!');
        app.listen(PORT, () => {
            console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ Lỗi kết nối SQL Server:', err.message);
    }
}

startServer();

// API: Lấy danh sách sinh viên
app.get('/students', async (req, res) => {
    try {
        const result = await db.request().query(`
            SELECT sv.MSSV, sv.HoTen, sv.NgaySinh, sv.DiaChi, sv.GioiTinh, sv.SoDienThoai, l.TenLop, k.TenKhoa
            FROM SinhVien sv
            JOIN Lop l ON sv.MaLop = l.MaLop
            JOIN Khoa k ON l.MaKhoa = k.MaKhoa
        `);
        res.json(result.recordset); // Trả về danh sách sinh viên
    } catch (err) {
        console.error('❌ Lỗi truy vấn sinh viên:', err.message);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// API: Thêm sinh viên
app.post('/students', async (req, res) => {
    const { MSSV, HoTen, NgaySinh, DiaChi, GioiTinh, SoDienThoai, MaLop } = req.body;

    try {
        await db.request()
            .input('MSSV', sql.NVarChar, MSSV)
            .input('HoTen', sql.NVarChar, HoTen)
            .input('NgaySinh', sql.Date, NgaySinh)
            .input('DiaChi', sql.NVarChar, DiaChi)
            .input('GioiTinh', sql.NVarChar, GioiTinh)
            .input('SoDienThoai', sql.NVarChar, SoDienThoai)
            .input('MaLop', sql.Int, MaLop)
            .query(`
                INSERT INTO SinhVien (MSSV, HoTen, NgaySinh, DiaChi, GioiTinh, SoDienThoai, MaLop)
                VALUES (@MSSV, @HoTen, @NgaySinh, @DiaChi, @GioiTinh, @SoDienThoai, @MaLop)
            `);
        res.json({ message: '✅ Thêm sinh viên thành công!' });
    } catch (err) {
        console.error('❌ Lỗi thêm sinh viên:', err.message);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// API: Xóa sinh viên
app.delete('/students/:mssv', async (req, res) => {
    const { mssv } = req.params;
    try {
        await db.request()
            .input('MSSV', sql.NVarChar, mssv)
            .query(`DELETE FROM SinhVien WHERE MSSV = @MSSV`);
        res.json({ message: '✅ Xóa sinh viên thành công!' });
    } catch (err) {
        console.error('❌ Lỗi xóa sinh viên:', err.message);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// API: Đăng nhập
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await db.request()
            .input('Username', sql.NVarChar, username)
            .query(`
                SELECT * FROM Users
                WHERE Username = @Username
            `);

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            const isMatch = await bcrypt.compare(password, user.PasswordHash);

            if (isMatch) {
                res.json({ success: true, message: '✅ Đăng nhập thành công!', role: user.Role });
            } else {
                res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng!' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng!' });
        }
    } catch (err) {
        console.error('❌ Lỗi đăng nhập:', err.message);
        res.status(500).json({ success: false, message: 'Lỗi server!' });
    }
});

// Route trang chính
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// API: Cập nhật sinh viên
app.put('/students/:mssv', async (req, res) => {
    const { mssv } = req.params;
    const { HoTen, NgaySinh, DiaChi, GioiTinh, SoDienThoai, MaLop } = req.body;
    try {
        await db.request()
            .input('MSSV', sql.NVarChar, mssv)
            .input('HoTen', sql.NVarChar, HoTen)
            .input('NgaySinh', sql.Date, NgaySinh)
            .input('DiaChi', sql.NVarChar, DiaChi)
            .input('GioiTinh', sql.NVarChar, GioiTinh)
            .input('SoDienThoai', sql.NVarChar, SoDienThoai)
            .input('MaLop', sql.Int, MaLop)
            .query(`
                UPDATE SinhVien
                SET HoTen=@HoTen, NgaySinh=@NgaySinh, DiaChi=@DiaChi, GioiTinh=@GioiTinh, SoDienThoai=@SoDienThoai, MaLop=@MaLop
                WHERE MSSV=@MSSV
            `);
        res.json({ message: 'Cập nhật sinh viên thành công!' });
    } catch (err) {
        console.error('❌ Lỗi cập nhật sinh viên:', err); // Thêm log chi tiết
        res.status(500).json({ error: 'Lỗi server', detail: err.message });
    }
});

// API lấy 1 sinh viên theo MSSV
app.get('/students/:mssv', async (req, res) => {
    const { mssv } = req.params;
    try {
        const result = await db.request()
            .input('MSSV', sql.NVarChar, mssv)
            .query(`SELECT * FROM SinhVien WHERE MSSV = @MSSV`);
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ error: 'Không tìm thấy sinh viên' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Lấy danh sách khoa
app.get('/khoa', async (req, res) => {
    try {
        const result = await db.request().query('SELECT MaKhoa, TenKhoa FROM Khoa');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Lấy danh sách lớp theo khoa
app.get('/lop', async (req, res) => {
    const { khoa } = req.query;
    try {
        const result = await db.request()
            .input('MaKhoa', sql.Int, khoa)
            .query('SELECT MaLop, TenLop FROM Lop WHERE MaKhoa = @MaKhoa');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Lấy thông tin lớp theo mã lớp
app.get('/lop-by-malop', async (req, res) => {
    const { malop } = req.query;
    try {
        const result = await db.request()
            .input('MaLop', sql.Int, malop)
            .query('SELECT MaLop, TenLop, MaKhoa FROM Lop WHERE MaLop = @MaLop');
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ error: 'Không tìm thấy lớp' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// API: Lấy danh sách môn học
app.get('/monhoc', async (req, res) => {
    try {
        const result = await db.request().query('SELECT MaMonHoc, TenMonHoc FROM MonHoc');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// API: Thêm hoặc cập nhật điểm sinh viên
app.post('/diem', async (req, res) => {
    const { MSSV, MaMonHoc, Diem: DiemSo } = req.body;
    try {
        // Kiểm tra đã có điểm chưa
        const check = await db.request()
            .input('MSSV', sql.NVarChar, MSSV)
            .input('MaMonHoc', sql.Int, MaMonHoc)
            .query('SELECT * FROM Diem WHERE MSSV = @MSSV AND MaMonHoc = @MaMonHoc');
        if (check.recordset.length > 0) {
            // Cập nhật điểm
            await db.request()
                .input('MSSV', sql.NVarChar, MSSV)
                .input('MaMonHoc', sql.Int, MaMonHoc)
                .input('Diem', sql.Float, DiemSo)
                .query('UPDATE Diem SET Diem = @Diem WHERE MSSV = @MSSV AND MaMonHoc = @MaMonHoc');
            res.json({ message: 'Cập nhật điểm thành công!' });
        } else {
            // Thêm mới điểm
            await db.request()
                .input('MSSV', sql.NVarChar, MSSV)
                .input('MaMonHoc', sql.Int, MaMonHoc)
                .input('Diem', sql.Float, DiemSo)
                .query('INSERT INTO Diem (MSSV, MaMonHoc, Diem) VALUES (@MSSV, @MaMonHoc, @Diem)');
            res.json({ message: 'Nhập điểm thành công!' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// API: Lấy điểm của sinh viên theo MSSV
app.get('/diem/:mssv', async (req, res) => {
    const { mssv } = req.params;
    try {
        const result = await db.request()
            .input('MSSV', sql.NVarChar, mssv)
            .query(`
                SELECT d.ID, d.MSSV, sv.HoTen AS TenSinhVien, mh.TenMonHoc, d.Diem
                FROM Diem d
                JOIN MonHoc mh ON d.MaMonHoc = mh.MaMonHoc
                JOIN SinhVien sv ON d.MSSV = sv.MSSV
                WHERE d.MSSV = @MSSV
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});
