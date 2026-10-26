// Đội hình HTX4.0 FC. Đổi avatar/tên/số áo ở đây.
export const TEAM = {
  name: 'HTX4.0 Football Club',
  short: 'HTX4.0 FC',
  captainId: 'cuong',
};

export const PLAYERS = [
  { id: 'diep', name: 'Diệp', number: 1, avatar: 'assets/avatars/diep.jpg' },
  { id: 'thien', name: 'Thiên', number: 6, avatar: 'assets/avatars/thien.jpg' },
  { id: 'duc', name: 'Đức', number: 7, avatar: 'assets/avatars/duc.jpg' },
  { id: 'vulinh', name: 'Vũ Linh', number: 8, avatar: 'assets/avatars/vulinh.jpg' },
  { id: 'cuong', name: 'Cường', number: 9, avatar: 'assets/avatars/cuong.jpg' },
  { id: 'son', name: 'Sơn', number: 10, avatar: 'assets/avatars/son.jpg' },
  { id: 'linh', name: 'Linh', number: 11, avatar: 'assets/avatars/linh.jpg' },
  { id: 'quan', name: 'Quân', number: 17, avatar: 'assets/avatars/quan.jpg' },
  // Chưa xếp vào DEFAULT_LINEUP → không hiển thị trên trang.
  { id: 'minhhung', name: 'Minh Hưng', number: null, avatar: 'assets/avatars/minhhung.jpg' },
];

// Thứ tự slot = thứ tự hiển thị nhiệm vụ (từ sau ra trước).
export const SLOTS = ['GK', 'LB', 'CB', 'RB', 'LM', 'CM', 'RM', 'ST'];

export const SLOT_LABELS = {
  GK: 'Thủ môn',
  LB: 'Hậu vệ trái',
  CB: 'Trung vệ',
  RB: 'Hậu vệ phải',
  LM: 'Tiền vệ trái',
  CM: 'Tiền vệ trung tâm',
  RM: 'Tiền vệ phải',
  ST: 'Tiền đạo cắm',
};

export const SLOT_TAGLINES = {
  GK: 'Bức tường cuối cùng, kiêm loa phát thanh của đội',
  LB: 'Giữ cánh trái, có cơ hội thì chồng biên',
  CB: 'Chốt chặn: ở đâu có bóng nguy hiểm, ở đó có anh',
  RB: 'Giữ cánh phải, có cơ hội thì chồng biên',
  LM: 'Động cơ cánh trái: lên công, về thủ',
  CM: 'Nhạc trưởng: nhận bóng, xoay người, phân phối',
  RM: 'Động cơ cánh phải: lên công, về thủ',
  ST: 'Mũi nhọn: giữ bóng, làm tường, dứt điểm',
};

// Đội hình chính thức tạm thời: 3-2-2 theo hình anh Cường gửi.
export const DEFAULT_LINEUP = {
  GK: 'diep',
  LB: 'linh',
  CB: 'vulinh',
  RB: 'thien',
  LM: 'son',
  CM: 'duc',
  RM: 'quan',
  ST: 'cuong',
};
