const GOOGLE_FORM_ACTION_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdVKgwHvgEPYnCXUZhU0f8rWKdLYaA9GHdlNlrRX9RSy4GhtQ/formResponse";
const ENTRY_BARCODE = "entry.01";
const ENTRY_STATUS = "entry.02";

const video = document.getElementById("preview");
let track;

// カメラ起動
navigator.mediaDevices.getUserMedia({
  video: { facingMode: "environment" },
  audio: false
}).then(stream => {
  video.srcObject = stream;
  track = stream.getTracks()[0];
  video.play();

  console.log("✅ カメラ映像 OK");

  // Quaggaを起動
  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: video
    },
    decoder: {
      readers: ["code_128_reader", "ean_reader", "ean_8_reader"]
    },
    locate: true
  }, function(err) {
    if (err) {
      console.error(err);
      return;
    }
    console.log("✅ Quagga ready → start!");
    Quagga.start();
  });

}).catch(err => {
  console.error("❌ カメラ起動失敗", err);
  alert("カメラの許可を確認してください！");
});

// 検出結果
Quagga.onDetected(function(result) {
  const code = result.codeResult.code;
  document.getElementById("barcode").value = code;
  console.log("✅ 検出:", code);

  Quagga.stop();
  if (track) track.stop();

  // 映像を縮小＋半透明化
  video.style.width = "150px";
  video.style.opacity = "0.3";
});

// Googleフォームに送信
document.getElementById("submitBtn").addEventListener("click", function() {
  const barcode = document.getElementById("barcode").value;
  const status = document.getElementById("status").value;

  const formData = new FormData();
  formData.append(ENTRY_BARCODE, barcode);
  formData.append(ENTRY_STATUS, status);

  fetch(GOOGLE_FORM_ACTION_URL, {
    method: "POST",
    mode: "no-cors",
    body: formData
  }).then(() => {
    alert("送信しました！");
    const encoded = encodeURIComponent(barcode + "-01");
    window.location.href = `print.html?code=${encoded}&status=${encodeURIComponent(status)}`;
  });
});
