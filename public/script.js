// Googleフォームの送信先
const GOOGLE_FORM_ACTION_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdVKgwHvgEPYnCXUZhU0f8rWKdLYaA9GHdlNlrRX9RSy4GhtQ/formResponse";
const ENTRY_BARCODE = "entry.01";
const ENTRY_STATUS = "entry.02";

// QuaggaJS の初期化（video を自分で用意して target に指定）
Quagga.init({
  inputStream: {
    name: "Live",
    type: "LiveStream",
    target: document.querySelector("#scanner"), // 自前の video に埋め込む！
    constraints: {
      facingMode: "environment"
    }
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
  console.log("QuaggaJS ready → start!");
  Quagga.start();
});

// 検出結果を input に表示
Quagga.onDetected(function(result) {
  const code = result.codeResult.code;
  document.getElementById("barcode").value = code;
  console.log("検出:", code);

  // 一旦停止（連続検出防止）
  Quagga.stop();
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