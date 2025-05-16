// Lấy danh sách khoa từ backend và render vào select-khoa
async function fetchKhoa() {
    const res = await fetch('http://localhost:3000/khoa');
    const data = await res.json();
    const selectKhoa = document.getElementById('select-khoa');
    selectKhoa.innerHTML = '<option value="">Chọn Khoa</option>';
    data.forEach(khoa => {
        selectKhoa.innerHTML += `<option value="${khoa.MaKhoa}">${khoa.TenKhoa}</option>`;
    });
    // XÓA đoạn này để không tự động chọn khoa đầu tiên và không tự động load lớp
    // if (data.length > 0) {
    //     selectKhoa.value = data[0].MaKhoa;
    //     fetchLop(data[0].MaKhoa);
    // }
}

// Lấy danh sách lớp theo khoa từ backend và render vào select-lop
async function fetchLop(maKhoa, selectedMaLop = null) {
    const selectLop = document.getElementById('select-lop');
    if (!maKhoa) {
        selectLop.innerHTML = '<option value="">Chọn Lớp</option>';
        return;
    }
    const res = await fetch(`http://localhost:3000/lop?khoa=${maKhoa}`);
    const data = await res.json();
    selectLop.innerHTML = '<option value="">Chọn Lớp</option>';
    data.forEach(lop => {
        selectLop.innerHTML += `<option value="${lop.MaLop}" ${selectedMaLop == lop.MaLop ? 'selected' : ''}>${lop.TenLop}</option>`;
    });
}

function updateKhoaInfo() {
    const selectKhoa = document.getElementById('select-khoa');
    const khoaInfo = document.getElementById('khoa-info');
    const selectedOption = selectKhoa.options[selectKhoa.selectedIndex];
    if (selectKhoa.value) {
        khoaInfo.textContent = `Khoa: ${selectedOption.text}`;
    } else {
        khoaInfo.textContent = '';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Lấy các phần tử cần thiết
    const loginForm = document.getElementById('login-form');
    const addStudentForm = document.getElementById('add-student-form');
    const studentTable = document.querySelector('.table');

    // Ẩn form thêm sinh viên và bảng khi chưa đăng nhập
    addStudentForm.style.display = 'none';
    studentTable.style.display = 'none';

    // Khởi tạo dropdown khoa/lớp
    fetchKhoa();
    document.getElementById('select-khoa').addEventListener('change', function () {
        fetchLop(this.value);
        updateKhoaInfo();
    });
    document.getElementById('select-lop').addEventListener('change', function () {
        updateKhoaInfo();
    });
    // Gọi luôn khi load lần đầu
    updateKhoaInfo();

    // Đăng nhập
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = loginForm.querySelector('input[type="text"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                loginForm.style.display = 'none';
                addStudentForm.style.display = 'block';
                studentTable.style.display = 'block';
                // Hiển thị menu sau khi đăng nhập
                document.querySelector('.main-menu').style.display = 'flex';
                // Hiển thị form nhập điểm sau khi đăng nhập
                document.getElementById('add-score-form').style.display = 'block';
                fetchStudents();
            } else {
                alert(result.message || 'Tên đăng nhập hoặc mật khẩu không đúng!');
            }
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Không thể kết nối đến server.');
        }
    });

    // Lấy danh sách sinh viên
    async function fetchStudents() {
        try {
            const response = await fetch('http://localhost:3000/students');
            const students = await response.json();
            const tbody = document.querySelector('tbody');
            tbody.innerHTML = '';
            students.forEach(student => {
                const row = `
                    <tr>
                        <td>${student.MSSV}</td>
                        <td>${student.HoTen}</td>
                        <td>${new Date(student.NgaySinh).toLocaleDateString()}</td>
                        <td>${student.DiaChi}</td>
                        <td>${student.GioiTinh}</td>
                        <td>${student.SoDienThoai}</td>
                        <td>${student.TenLop}</td>
                        <td>${student.TenKhoa || ''}</td>
                        <td>
                            <button onclick="editStudent('${student.MSSV}')">Sửa</button>
                            <button onclick="deleteStudent('${student.MSSV}')">Xóa</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Không thể tải danh sách sinh viên.');
        }
    }

    // Thêm hoặc sửa sinh viên
    let editingMSSV = null;
    addStudentForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const MSSV = addStudentForm.querySelector('input[placeholder="Mã Số Sinh Viên"]').value;
        const HoTen = addStudentForm.querySelector('input[placeholder="Họ và Tên"]').value;
        const NgaySinh = addStudentForm.querySelector('input[placeholder="Ngày Sinh"]').value;
        const DiaChi = addStudentForm.querySelector('input[placeholder="Địa Chỉ"]').value;
        const GioiTinh = addStudentForm.querySelector('select[name="GioiTinh"]').value;
        const SoDienThoai = addStudentForm.querySelector('input[placeholder="Số Điện Thoại"]').value;
        const MaLop = document.getElementById('select-lop').value;

        if (editingMSSV) {
            // Sửa sinh viên
            try {
                const response = await fetch(`http://localhost:3000/students/${editingMSSV}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ HoTen, NgaySinh, DiaChi, GioiTinh, SoDienThoai, MaLop }) // KHÔNG gửi MSSV
                });
                if (response.ok) {
                    alert('Cập nhật sinh viên thành công!');
                    fetchStudents();
                    addStudentForm.reset();
                    editingMSSV = null;
                } else {
                    alert('Có lỗi khi cập nhật sinh viên.');
                }
            } catch (error) {
                alert('Không thể kết nối đến server.');
            }
        } else {
            // Thêm sinh viên
            try {
                const response = await fetch('http://localhost:3000/students', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ MSSV, HoTen, NgaySinh, DiaChi, GioiTinh, SoDienThoai, MaLop })
                });

                if (response.ok) {
                    alert('Thêm sinh viên thành công!');
                    fetchStudents();
                    addStudentForm.reset();
                } else {
                    alert('Có lỗi xảy ra khi thêm sinh viên.');
                }
            } catch (error) {
                alert('Không thể kết nối đến server.');
            }
        }
    });

    // Xóa sinh viên
    window.deleteStudent = async function (mssv) {
        if (!confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) return;
        try {
            const response = await fetch(`http://localhost:3000/students/${mssv}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Xóa sinh viên thành công!');
                fetchStudents();
            } else {
                alert('Có lỗi xảy ra khi xóa sinh viên.');
            }
        } catch (error) {
            alert('Không thể kết nối đến server.');
        }
    };

    // Sửa sinh viên
    window.editStudent = async function (mssv) {
        try {
            const response = await fetch(`http://localhost:3000/students/${mssv}`);
            if (!response.ok) {
                alert('Không tìm thấy sinh viên!');
                return;
            }
            const student = await response.json();
            addStudentForm.style.display = 'block';
            addStudentForm.querySelector('input[placeholder="Mã Số Sinh Viên"]').value = student.MSSV;
            addStudentForm.querySelector('input[placeholder="Họ và Tên"]').value = student.HoTen;
            addStudentForm.querySelector('input[placeholder="Ngày Sinh"]').value = student.NgaySinh.split('T')[0];
            addStudentForm.querySelector('input[placeholder="Địa Chỉ"]').value = student.DiaChi;
            addStudentForm.querySelector('select[name="GioiTinh"]').value = student.GioiTinh;
            addStudentForm.querySelector('input[placeholder="Số Điện Thoại"]').value = student.SoDienThoai;

            // Chọn đúng khoa và lớp
            const selectKhoa = document.getElementById('select-khoa');
            const selectLop = document.getElementById('select-lop');
            // Tìm MaKhoa của lớp hiện tại
            const resLop = await fetch(`http://localhost:3000/lop-by-malop?malop=${student.MaLop}`);
            const lopData = await resLop.json();
            if (lopData && lopData.MaKhoa) {
                selectKhoa.value = lopData.MaKhoa;
                await fetchLop(lopData.MaKhoa, student.MaLop);
            }
            selectLop.value = student.MaLop;
            editingMSSV = mssv;
        } catch (error) {
            alert('Không thể kết nối đến server.');
        }
    };

    // Lấy danh sách môn học cho dropdown
    async function fetchMonHoc() {
        const res = await fetch('http://localhost:3000/monhoc');
        const data = await res.json();
        const select = document.getElementById('score-monhoc');
        select.innerHTML = '<option value="">Chọn môn học</option>';
        data.forEach(mh => {
            select.innerHTML += `<option value="${mh.MaMonHoc}">${mh.TenMonHoc}</option>`;
        });
    }
    fetchMonHoc();

    // Xử lý nhập điểm
    document.getElementById('add-score-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const MSSV = document.getElementById('score-mssv').value;
        const MaMonHoc = document.getElementById('score-monhoc').value;
        const Diem = document.getElementById('score-diem').value;
        const res = await fetch('http://localhost:3000/diem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ MSSV, MaMonHoc, Diem })
        });
        const result = await res.json();
        alert(result.message);
        fetchDiem(MSSV);
    });

    // Hiển thị bảng điểm
    async function fetchDiem(mssv) {
        const res = await fetch(`http://localhost:3000/diem/${mssv}`);
        const data = await res.json();
        const table = document.getElementById('score-table');
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';
        let first = true;
        data.forEach(row => {
            tbody.innerHTML += `<tr>
                <td>${first ? (row.TenSinhVien || '') : ''}</td>
                <td>${row.TenMonHoc}</td>
                <td>${row.Diem}</td>
            </tr>`;
            first = false;
        });
        table.style.display = data.length > 0 ? 'table' : 'none';
    }

    // Tự động hiển thị điểm khi nhập MSSV
    document.getElementById('score-mssv').addEventListener('blur', function() {
        const mssv = this.value;
        if (mssv) fetchDiem(mssv);
    });

    document.getElementById('menu-student').onclick = function() {
        document.getElementById('student-section').style.display = 'block';
        document.getElementById('score-section').style.display = 'none';
    };
    document.getElementById('menu-score').onclick = function() {
        document.getElementById('student-section').style.display = 'none';
        document.getElementById('score-section').style.display = 'block';
    };
});

