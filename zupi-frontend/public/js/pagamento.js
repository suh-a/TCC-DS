document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formPagamento');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Fluxo de pagamento é apenas demonstrativo; integre um gateway quando for para produção.');
  });
});
