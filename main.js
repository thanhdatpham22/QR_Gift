const wishes = [
  "Chúc bạn mỗi ngày đều rực rỡ niềm vui và những cơ hội mới!",
  "Mong mọi điều tốt đẹp và bình an luôn đồng hành cùng bạn.",
  "Ngày hôm nay của bạn sẽ tuyệt diệu hơn cả mong đợi!",
  "Bạn xứng đáng với hạnh phúc vô hạn và những giấc mơ trọn vẹn.",
  "Gửi bạn năng lượng tích cực và một bầu trời may mắn.",
  "Hãy luôn tin vào bản thân, điều kỳ diệu đang đến gần!",
  "Chúc bạn sức khỏe dồi dào, tâm an, lòng sáng!",
  "Bạn là nguồn cảm hứng — hãy tiếp tục lan tỏa yêu thương.",
  "Tương lai của bạn đang sáng bừng, hãy bước tới tự tin!",
  "Cảm ơn vì đã là chính bạn, thế giới này cần bạn!"
];

const page = document.body.dataset.page || "card";

const randomWish = (exclude) => {
  const pool = exclude ? wishes.filter((w) => w !== exclude) : wishes;
  return pool[Math.floor(Math.random() * pool.length)];
};

const buildCardUrl = (text) => new URL(`card.html?msg=${encodeURIComponent(text)}`, window.location.href).href;
const buildQrUrl = (data) => `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(data)}`;

function setupGate() {
  const qrImg = document.getElementById("qrOnlyImg");
  const shuffleBtn = document.getElementById("shuffleBtn");
  const createBtn = document.getElementById("createBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const shareBtn = document.getElementById("shareBtn");
  const customMsg = document.getElementById("customMsg");

  let currentWish = randomWish();
  let currentLink = "";

  const render = (wish) => {
    if (customMsg) customMsg.value = wish;
    const link = buildCardUrl(wish);
    currentLink = link;
    qrImg.classList.remove("visible");
    qrImg.src = buildQrUrl(link);
    currentWish = wish;
  };

  qrImg?.addEventListener("load", () => qrImg.classList.add("visible"));

  shuffleBtn?.addEventListener("click", () => {
    const next = randomWish(currentWish);
    render(next);
  });

  createBtn?.addEventListener("click", () => {
    const text = (customMsg?.value || "").trim();
    render(text || randomWish());
  });

  downloadBtn?.addEventListener("click", async () => {
    if (!qrImg?.src) return;
    try {
      const res = await fetch(qrImg.src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qr-thiep.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      downloadBtn.textContent = "Đã tải ✔";
    } catch (err) {
      downloadBtn.textContent = "Tải không thành công";
    }
    setTimeout(() => (downloadBtn.textContent = "Tải QR"), 1400);
  });

  shareBtn?.addEventListener("click", async () => {
    if (!currentLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Thiệp 3D dành cho bạn",
          text: "Quét mã để mở thiệp 3D kèm lời chúc.",
          url: currentLink,
        });
        shareBtn.textContent = "Đã chia sẻ ✔";
      } catch (err) {
        shareBtn.textContent = "Không chia sẻ được";
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(currentLink);
        shareBtn.textContent = "Đã sao chép link ✔";
      } catch (err) {
        shareBtn.textContent = "Không sao chép được";
      }
    }
    setTimeout(() => (shareBtn.textContent = "Chia sẻ"), 1400);
  });

  render(currentWish);
}

function setupCard() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("msg");
  let current = raw ? decodeURIComponent(raw) : randomWish();

  const letterText = document.getElementById("letterText");
  const cardShell = document.getElementById("cardShell");
  const cardOuter = document.getElementById("cardOuter");
  const hintBtn = document.getElementById("hintBtn");

  const updateLetter = (text) => {
    if (letterText) letterText.textContent = text;
  };

  const toggleOpen = () => {
    const isOpen = cardShell?.classList.toggle("open");
    if (isOpen) {
      // let CSS drive the open transform
      if (cardOuter) cardOuter.style.transform = "";
    } else if (cardOuter) {
      cardOuter.style.transform = "rotateX(6deg) rotateY(-8deg)";
    }
  };

  cardOuter?.addEventListener("click", toggleOpen);
  hintBtn?.addEventListener("click", toggleOpen);

  // Subtle parallax on mouse move
  cardOuter?.addEventListener("pointermove", (e) => {
    const rect = cardOuter.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotY = -8 + x * 10;
    const rotX = 6 - y * 6;
    if (!cardShell?.classList.contains("open")) {
      cardOuter.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }
  });

  cardOuter?.addEventListener("pointerleave", () => {
    if (!cardShell?.classList.contains("open")) {
      cardOuter.style.transform = "rotateX(6deg) rotateY(-8deg)";
    }
  });

  updateLetter(current);
}

if (page === "gate") {
  setupGate();
} else {
  setupCard();
}
