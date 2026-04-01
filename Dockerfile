# -------------------------
# Estágio 1: BUILD
# -------------------------
FROM maven:3.9.8-eclipse-temurin-21 AS build

WORKDIR /app

# Copia apenas pom.xml para aproveitar cache de dependências
COPY pom.xml ./

# Baixa dependências para usar cache (modo batch)
RUN mvn -B dependency:go-offline

# Copia o restante do projeto e faz o build (skipTests para builds mais rápidos)
COPY . .
RUN mvn -B -DskipTests package

# -------------------------
# Estágio 2: RUNTIME
# -------------------------
FROM eclipse-temurin:21-jre-jammy

# Cria usuário não-root e home (portátil para imagens base Debian/Ubuntu)
RUN groupadd --gid 1000 appgroup \
 && useradd --uid 1000 --gid appgroup --create-home --shell /bin/false appuser

WORKDIR /home/appuser

# Exponha a porta da aplicação
EXPOSE 8080

# Copia o JAR do estágio de build (usa curinga pra cobrir nome do artefato)
COPY --from=build /app/target/*.jar /home/appuser/app.jar

# Ajusta permissões para o usuário não-root
RUN chown appuser:appgroup /home/appuser/app.jar

# Switch para usuário não-root
USER appuser

# Comando padrão
ENTRYPOINT ["java","-jar","/home/appuser/app.jar"]
