// Mostrar o formulário quando um plano é selecionado
function selecionarPlano(nome, valor) {
  const pagamentoBox = document.getElementById("pagamento");
  pagamentoBox.classList.remove("hidden");

  document.getElementById("planoSelecionado").textContent = "Plano: " + nome;

  document.getElementById("precoSelecionado").textContent =
    valor === 0 ? "Grátis" : `R$ ${valor}/mês`;
}



// Máscara para número do cartão
document.getElementById("cardNumber").addEventListener("input", function () {
  let value = this.value.replace(/\D/g, "").substring(0, 16);
  this.value = value.replace(/(.{4})/g, "$1 ").trim();
});



// Máscara para validade MM/AA
document.getElementById("validade").addEventListener("input", function () {
  let value = this.value.replace(/\D/g, "").substring(0, 4);

  if (value.length >= 3) {
    value = value.replace(/(\d{2})(\d{1,2})/, "$1/$2");
  }

  this.value = value;
});



// Enviar o formulário
document.getElementById("formPagamento").addEventListener("submit", function (e) {
  e.preventDefault();
  
  alert("Pagamento realizado com sucesso! 🎉");

  // (Opcional) você pode redirecionar:
  // window.location.href = "sucesso.html";
});
