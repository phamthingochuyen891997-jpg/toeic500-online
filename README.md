# Lớp TOEIC Online 500+ · Ms. Ngọc Huyền

Lộ trình 32 buổi (16/11/2026 – 17/03/2027) và 20 bài Mini Test cho học viên lớp TOEIC Online 500+.

- `gioi-thieu.html`: trang giới thiệu khoá, ai cũng xem được.
- `index.html`: trang lộ trình của học viên. Phải đăng nhập Google bằng Gmail cô đã kích hoạt.
- `reading.html`: **Lộ trình Mini-Test Reading** – 1 link gom 31 bài (Part 5, 6, 7 Mini Test 01–10 + Part 7 Full Test), chia 3 chặng theo tuần, hiện điểm thi thật của từng học viên. Phải đăng nhập như trên.
- `mt/`: các bài Mini Test (Reading Mini Test 1–4, Part 5/6/7 Mini Test 01–10, Part 7 Full Test). Phải đăng nhập như trên.
- `quan-ly.html`: trang cô thêm, khoá, gia hạn học viên, đặt link Zoom/Meet và xem tiến độ cả lớp. Chỉ tài khoản giáo viên của My English Workspace đăng nhập được.
- `t5.js`: lưu tiến độ học viên lên Firebase và chế độ **thi thật** (thêm `?thi=1` sau link Mini Test: ẩn đáp án tới khi nộp, bấm giờ, tự lưu điểm).

Nội dung trang học viên và Mini Test được mã hoá. Ai mở file trên GitHub cũng chỉ thấy chuỗi ký tự, không đọc được bài.

## Cài đặt một lần

### 1. Thêm Rules trên Firebase

Firebase Console → dự án **my-english-workspace-cf8d7** → Firestore Database → **Rules**.
Dán đoạn dưới vào **bên trong** khối `match /databases/{database}/documents { ... }`, cạnh phần của khoá Bứt Phá, rồi bấm **Publish**.

```
    // ===== Lớp TOEIC Online 500+ =====
    function t500Teacher() {
      return request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    function t500Active() {
      return request.auth != null
        && exists(/databases/$(database)/documents/t500_students/$(request.auth.token.email.lower()))
        && get(/databases/$(database)/documents/t500_students/$(request.auth.token.email.lower())).data.locked != true
        && get(/databases/$(database)/documents/t500_students/$(request.auth.token.email.lower())).data.until > request.time;
    }
    match /t500_students/{email} {
      allow read: if t500Teacher()
        || (request.auth != null && request.auth.token.email.lower() == email);
      allow write: if t500Teacher();
    }
    match /t500_secret/{doc} {
      allow read: if t500Teacher() || t500Active();
      allow write: if t500Teacher();
    }
    match /t500_progress/{email} {
      allow read: if t500Teacher()
        || (request.auth != null && request.auth.token.email.lower() == email);
      allow create, update: if request.auth != null
        && request.auth.token.email.lower() == email && t500Active();
      allow delete: if t500Teacher();
    }
    match /t500_config/{doc} {
      allow read: if t500Teacher() || t500Active();
      allow write: if t500Teacher();
    }
```

(Rules này đã được cài trên Firebase ngày 03/11/2026.)

### 2. Cài mã giải mã

Mở `quan-ly.html` → đăng nhập tài khoản giáo viên → mục **Cài đặt khoá học** → **Nhập / đổi mã giải mã** → dán mã em Claude gửi → **Lưu mã**.
Mã không nằm trong repo này. Không chia sẻ mã cho ai.

`reading.html` và Mini Test 06–10 dùng **mã Reading riêng** (lưu ở `t500_secret/reading`). Cài ở `quan-ly.html` → **Nhập / đổi mã Lộ trình Mini-Test Reading**. Rules hiện có đã cho phép, không cần sửa.

### 3. Thêm học viên

Ở `quan-ly.html`, nhập Gmail và họ tên học viên → **Thêm & kích hoạt**. Hạn mặc định 31/05/2027.
Học viên mở link lộ trình → **Đăng nhập bằng Google** → chọn đúng Gmail đó.

Muốn chặn một học viên, bấm **Khoá**. Học viên đó không vào được nữa, chậm nhất sau 20 phút.

© Ms. Ngọc Huyền (Phạm Thị Ngọc Huyền). Tài liệu tự biên soạn, giữ bản quyền.
