const bcrypt = require('bcrypt');

async function hashPassword() {
    const plainPassword = '12345'; // Mật khẩu gốc
    const hashedPassword = await bcrypt.hash(plainPassword, 10); // Mã hóa mật khẩu
    console.log('Mật khẩu đã mã hóa:', hashedPassword);
}

hashPassword();