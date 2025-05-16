const bcrypt = require('bcrypt');

async function checkPassword() {
    const plainPassword = '12345'; // Mật khẩu gốc
    const hashedPassword = '$2b$10$HqCcpQtVTi0B5IGMURNWs.Pp8.jJQSXpmUiSCBT.sgvxaoS4yzG6.'; // Mật khẩu đã mã hóa từ cơ sở dữ liệu

    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Mật khẩu khớp:', isMatch);
}

checkPassword();