# Lấp Gốc TOEIC · Ms. Ngọc Huyền

Lộ trình tự học TOEIC 500+ (32 checkpoint · 4 chặng · giao diện Đầm sen). Học viên đăng nhập bằng Gmail cô đã cấp quyền.

- `index.html`: trang học viên. Bấm **Đăng nhập bằng Google** bằng đúng Gmail cô đã thêm. Nội dung được mã hoá, ai mở file trên GitHub cũng không đọc được bài.
- `quan-ly.html`: trang cô thêm, khoá, gia hạn học viên và xem tiến độ. Chỉ tài khoản giáo viên của My English Workspace đăng nhập được.
- `lg.js`: lưu tiến độ học viên lên Firebase (`lg_progress`), để học viên đổi máy không mất bài và cô xem được tiến độ.
- `audio/`: audio Nghe Part 1–4.
- Chế độ xem trước của giáo viên: đăng nhập bằng Gmail giáo viên rồi thêm `#giao-vien` vào cuối link (không lưu điểm).

## Cài đặt một lần

### 1. Thêm Rules trên Firebase

Firebase Console → dự án **my-english-workspace-cf8d7** → Firestore Database → **Rules**.
Dán đoạn dưới vào **bên trong** khối `match /databases/{database}/documents { ... }`, cạnh phần của lớp TOEIC 500+, rồi bấm **Publish**.

```
    // ===== Lấp Gốc TOEIC =====
    function lgTeacher() {
      return request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    function lgActive() {
      return request.auth != null
        && exists(/databases/$(database)/documents/lg_students/$(request.auth.token.email.lower()))
        && get(/databases/$(database)/documents/lg_students/$(request.auth.token.email.lower())).data.locked != true
        && get(/databases/$(database)/documents/lg_students/$(request.auth.token.email.lower())).data.until > request.time;
    }
    match /lg_students/{email} {
      allow read: if lgTeacher()
        || (request.auth != null && request.auth.token.email.lower() == email);
      allow write: if lgTeacher();
    }
    match /lg_secret/{doc} {
      allow read: if lgTeacher() || lgActive();
      allow write: if lgTeacher();
    }
    match /lg_progress/{email} {
      allow read: if lgTeacher()
        || (request.auth != null && request.auth.token.email.lower() == email);
      allow create, update: if request.auth != null
        && request.auth.token.email.lower() == email && lgActive();
      allow delete: if lgTeacher();
    }
```

### 2. Cài mã giải mã

Mở `quan-ly.html` → đăng nhập tài khoản giáo viên → mục **Cài đặt khóa học** → **Nhập / đổi mã giải mã tài liệu** → dán mã em Claude gửi → **Lưu mã**.
Mã không nằm trong repo này. Không chia sẻ mã cho ai.

### 3. Thêm domain đăng nhập (nếu Google báo lỗi `auth/unauthorized-domain`)

Firebase Console → Authentication → Settings → **Authorized domains** → thêm `phamthingochuyen891997-jpg.github.io` (đã có sẵn nếu lớp 500+ đăng nhập được).
