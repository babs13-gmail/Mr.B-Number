// ================= INIT =================
showPaymentOptions();

// ================= Boutons colorés =================
function showPaymentOptions() {
  document.getElementById("paymentBox").innerHTML = `
    <button class="paypal" onclick="payPayPal()">💳 PayPal</button>
    <button class="wave" onclick="payWave()">📱 Wave</button>
    <button class="binance" onclick="payBinance()">₿ Binance</button>
  `;
}

// ================= PAYPAL =================
function payPayPal() {
  document.getElementById("paymentBox").innerHTML += `
    <br><br>💳 PayPal : <b>babsozil7@gmail.com</b><br><br>
    Envoie <b>300 FCFA</b> puis entre la référence :
    <br><br>
    <input id="ref" placeholder="ID transaction">
    <br><br>
    <button class="paypal" onclick="validate('PayPal')">Valider</button>
    <div id="result"></div>
  `;
}

// ================= WAVE =================
function payWave() {
  document.getElementById("paymentBox").innerHTML += `
    <br><br>📱 Wave : <b>+221769044393</b><br><br>
    Envoie <b>300 FCFA</b> puis entre la référence :
    <br><br>
    <input id="ref" placeholder="Référence">
    <br><br>
    <button class="wave" onclick="validate('Wave')">Valider</button>
    <div id="result"></div>
  `;
}

// ================= BINANCE avec QR code =================
function payBinance() {
  const binanceAddress = "TNHXiJsQmFDmLa2g27aYYmR7m2FZBCMTR4";
  document.getElementById("paymentBox").innerHTML += `
    <br><br>₿ Binance (USDT) : <b>${binanceAddress}</b><br>
    ⚠️ Réseau accepté : TRC20 uniquement<br><br>
    <div id="qrcode"></div>
    <br>Envoie l'équivalent de <b>300 FCFA</b> puis entre le TXID :
    <br><br>
    <input id="ref" placeholder="TXID">
    <br><br>
    <button class="binance" onclick="validate('Binance')">Valider</button>
    <div id="result"></div>
  `;

  new QRCode(document.getElementById("qrcode"), {
    text: binanceAddress,
    width: 150,
    height: 150,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  });
}

// ================= VALIDATION =================
async function validate(service) {
  const refInput = document.getElementById("ref");
  const ref = refInput.value.trim();

  if (!ref || ref.length < 5) {
    alert("❌ Référence invalide !");
    return;
  }

  document.getElementById("result").innerText = "⏳ Vérification du paiement...";

  try {
    const res = await fetch("/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref, service })
    });

    const data = await res.json();
    document.getElementById("result").innerText =
      data.message + "\n\n🙏 Merci pour ta confiance !";

  } catch (err) {
    document.getElementById("result").innerText = "❌ Erreur connexion serveur";
  }
}
