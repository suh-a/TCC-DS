html = open("src/main/resources/templates/cadastro.html", "r", encoding="utf-8").read()
html = html.replace("motion.div", "motion.DIV_PLACEHOLDER")
html = html.replace("motion.DIV_PLACEHOLDER", "motion.div")
# fix: replace motion.div with div
html = html.replace("motion.div", "div")
open("src/main/resources/templates/cadastro.html", "w", encoding="utf-8").write(html)
print("fixed")
