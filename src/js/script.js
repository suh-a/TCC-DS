function bounceZupi(element) {
  element.classList.add('bounce');
  setTimeout(() => {
    element.classList.remove('bounce');
  }, 500);
}
