# Registro de correcao do Zupi por etapas

Data: 2026-06-17

## Objetivo inicial

Corrigir a separacao entre o plano Pessoa Fisica e o plano Pessoa Juridica/Escola sem refatorar o sistema inteiro e sem implementar tudo de uma vez.

O problema principal identificado foi a reutilizacao indevida dos dashboards PF:

- aluno credenciado caia no dashboard da crianca PF;
- responsavel criado/vinculado pela escola caia no dashboard do responsavel PF;
- paginas compartilhadas, como biblioteca, usavam menu e permissoes de responsavel PF mesmo quando o acesso era escolar.

## Diagnostico feito

### Roles existentes no inicio

- `RESPONSAVEL`
- `CRIANCA`
- `ESCOLA`
- `DOCENTE`
- `ALUNO_CREDENCIADO`
- `ADMIN`

Nao existia `RESPONSAVEL_CREDENCIADO`.

### Dashboards existentes no inicio

- `zupi-frontend/dashboard-pais.html`
- `zupi-frontend/dashboard-crianca.html`
- `zupi-frontend/dashboard-escola.html`
- `zupi-frontend/dashboard-docente.html`
- `zupi-frontend/dashboard-admin.html`

Nao existiam:

- `dashboard-aluno-credenciado.html`
- `dashboard-responsavel-credenciado.html`

### Problemas principais encontrados

1. `ALUNO_CREDENCIADO` existia no backend, mas o frontend redirecionava para `/dashboard-crianca`.
2. O responsavel cadastrado pela escola era salvo como `RESPONSAVEL` e inicialmente como `PESSOA_FISICA`.
3. O frontend dependia de `planType`, mas `UserResponse` nao devolvia `planType`.
4. A pagina `/biblioteca` usava sidebar PF mesmo para escola.
5. O upload de PDF da biblioteca podia falhar por limite padrao de multipart do Spring.
6. O teste de contexto usava perfil `deploy` e tentava carregar `${DATABASE_URL}` em ambiente de teste.
7. O projeto tinha arquivos OAuth2 em `src/main/java/.../security/oauth2/`, mas faltava a dependencia Maven necessaria.

## Etapa 1 - Rotas, roles, login, auth guard e dashboards corretos

### Backend

Arquivos alterados:

- `src/main/java/senai/tcc/zupiapi/zupibackend/model/enums/UserType.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/dto/response/UserResponse.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/dto/ChildLoginResponse.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/services/UserService.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/services/ChildService.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/services/GoogleAuthService.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/security/UserDetailsImpl.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/security/services/CustomUserDetailsService.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/security/oauth2/GoogleOAuth2SuccessHandler.java`
- `pom.xml`

Mudancas:

- Adicionado `RESPONSAVEL_CREDENCIADO` ao enum `UserType`.
- `UserResponse` passou a devolver `planType`.
- `ChildLoginResponse` passou a devolver `userType` e `planType`.
- `UserService.resolvePlanType()` passou a reconhecer:
  - `ESCOLA`
  - `DOCENTE`
  - `ALUNO_CREDENCIADO`
  - `RESPONSAVEL_CREDENCIADO`
  como `PESSOA_JURIDICA`.
- Criada regra de role efetiva:
  - se um usuario salvo como `RESPONSAVEL` possui pelo menos uma crianca/aluno com `schoolLinked=true`, ele passa a autenticar como `RESPONSAVEL_CREDENCIADO`.
- Login tradicional (`/auth/login`) passou a devolver essa role efetiva.
- `/auth/me` passou a devolver essa role efetiva.
- `CustomUserDetailsService` passou a carregar a role efetiva no Spring Security.
- Login Google tambem passou a aplicar a role efetiva.
- Adicionada dependencia:
  - `spring-boot-starter-oauth2-client`

### Frontend

Arquivos alterados/criados:

- `zupi-frontend/public/js/api.js`
- `zupi-frontend/public/js/auth-guard.js`
- `zupi-frontend/public/js/routes.js`
- `zupi-frontend/public/js/child-nav.js`
- `zupi-frontend/public/js/dashboardCriancaScript.js`
- `zupi-frontend/public/js/loginScript.js`
- `zupi-frontend/public/js/selecaoPerfilScript.js`
- `zupi-frontend/public/js/responsavel-sidebar.js`
- `zupi-frontend/403.html`
- `zupi-frontend/dashboard-aluno-credenciado.html`
- `zupi-frontend/public/js/dashboardAlunoCredenciado.js`
- `zupi-frontend/dashboard-responsavel-credenciado.html`
- `zupi-frontend/public/js/dashboardResponsavelCredenciado.js`
- `vercel.json`
- `zupi-frontend/vercel.json`

Mudancas:

- Criado dashboard separado para aluno credenciado:
  - `/dashboard-aluno-credenciado`
- Criado dashboard separado para responsavel credenciado:
  - `/dashboard-responsavel-credenciado`
- `ALUNO_CREDENCIADO` deixou de ir para `/dashboard-crianca`.
- `RESPONSAVEL_CREDENCIADO` passou a ir para `/dashboard-responsavel-credenciado`.
- Caso o frontend receba um usuario como `RESPONSAVEL`, ele consulta `/child/me`.
  - Se existir filho/aluno com `schoolLinked=true`, a sessao local passa a ser marcada como `RESPONSAVEL_CREDENCIADO` + `PESSOA_JURIDICA`.
- `/selecao-perfil` passou a redirecionar responsavel credenciado para `/dashboard-responsavel-credenciado`.
- `dashboard-crianca` passou a bloquear acesso direto de `ALUNO_CREDENCIADO`, redirecionando para o dashboard correto.
- `child-nav` passou a apontar o dashboard correto conforme o tipo:
  - `CRIANCA` -> `/dashboard-crianca`
  - `ALUNO_CREDENCIADO` -> `/dashboard-aluno-credenciado`
- Pagina 403 passou a voltar para o dashboard correto de cada perfil.

### Testes ajustados/adicionados

Arquivos alterados:

- `src/test/java/senai/tcc/zupiapi/zupibackend/ZupibackendApplicationTests.java`
- `src/test/java/senai/tcc/zupiapi/zupibackend/services/UserServiceTest.java`

Mudancas:

- `ZupibackendApplicationTests` passou a usar `@ActiveProfiles("test")`.
- Teste antigo de senha nula foi atualizado para a excecao atual (`BusinessException`).
- Adicionados testes para:
  - `RESPONSAVEL_CREDENCIADO` resolver como `PESSOA_JURIDICA`;
  - `ALUNO_CREDENCIADO` resolver como `PESSOA_JURIDICA`;
  - responsavel salvo como `RESPONSAVEL`, mas com aluno escolar vinculado, autenticar como `RESPONSAVEL_CREDENCIADO`.

## Etapa 2 - Biblioteca escolar

### Backend

Arquivos alterados:

- `src/main/java/senai/tcc/zupiapi/zupibackend/repositories/TeacherRepository.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/repositories/SchoolRepository.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/services/SchoolService.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/exceptions/handler/GlobalExceptionHandler.java`
- `src/main/resources/application.properties`
- `src/main/resources/application-test.properties`

Mudancas:

- `TeacherRepository` ganhou `findByAccountId(Long accountId)`.
- `SchoolRepository` ganhou `findByNameIgnoreCase(String name)`.
- `SchoolService.listBooks()` deixou de exigir apenas `ESCOLA`.
- A biblioteca agora resolve a escola permitida conforme o perfil:
  - `ESCOLA`: escola da conta;
  - `DOCENTE`: escola do docente;
  - `ALUNO_CREDENCIADO`: escola vinculada ao aluno;
  - `RESPONSAVEL_CREDENCIADO`: escolas dos alunos vinculados ao responsavel.
- `getBookFile()` passou a validar se o livro pertence a uma escola permitida ao usuario atual.
- Upload continua restrito a `ESCOLA`.
- Configurado upload de PDF:
  - `zupi.library.upload-dir=${ZUPI_LIBRARY_UPLOAD_DIR:uploads/library-pdfs}`
  - `spring.servlet.multipart.max-file-size=10MB`
  - `spring.servlet.multipart.max-request-size=10MB`
- Adicionado tratamento para arquivo maior que o permitido:
  - mensagem: `O PDF deve ter no maximo 10MB`

### Frontend

Arquivos alterados:

- `zupi-frontend/biblioteca.html`
- `zupi-frontend/dashboard-responsavel-credenciado.html`

Mudancas:

- `/biblioteca` passou a carregar livros reais da escola para:
  - `ESCOLA`
  - `DOCENTE`
  - `ALUNO_CREDENCIADO`
  - `RESPONSAVEL_CREDENCIADO`
- Para `RESPONSAVEL`/PF, a biblioteca continua usando conteudo estatico PF.
- O botao `Anexar livro` aparece apenas para `ESCOLA`.
- A sidebar da biblioteca passou a se adaptar ao perfil:
  - escola ve menu escolar;
  - docente ve menu docente;
  - responsavel credenciado ve menu de responsavel credenciado;
  - PF continua vendo menu PF.
- O card `Biblioteca` no dashboard do responsavel credenciado passou a ter link para `/biblioteca`.

## Validacoes realizadas

### Backend

Comando usado:

```bash
mvn test
```

Resultado mais recente:

- `129` testes executados;
- `0` falhas;
- `0` erros;
- build Maven com sucesso.

### Frontend

Comando usado:

```bash
npm.cmd run build
```

Resultado:

- build Vite com sucesso.

Avisos ainda existentes no build:

- `jogo-ligar-objetos.html` referencia script sem `type="module"`;
- `zupi.html` referencia script sem `type="module"`.

Esses avisos ja existiam e nao foram tratados nesta etapa.

## Pontos observados durante os testes manuais

### Resolvido

- Responsavel criado/vinculado pela escola nao deve mais cair em `/selecao-perfil` nem no dashboard PF.
- Responsavel credenciado vai para `/dashboard-responsavel-credenciado`.
- Biblioteca nao deve mais trocar a sidebar da escola para sidebar PF.
- Upload de biblioteca agora possui limite configurado para ate 10MB.

### Atencao para testar

1. Reiniciar o backend apos as alteracoes de upload.
2. Entrar como escola.
3. Ir para `/biblioteca`.
4. Anexar um PDF menor que 10MB.
5. Entrar como aluno credenciado ou responsavel credenciado.
6. Abrir `/biblioteca`.
7. Confirmar que o livro aparece e abre corretamente.

## Pendencias para proximas etapas

### Etapa 3 - Atividades e quizzes

Ainda nao implementado.

Necessario:

- criar modelo/rotas para atividades escolares publicadas por docentes;
- separar atividades PF de atividades escolares;
- listar atividades escolares para aluno credenciado;
- mostrar acompanhamento para responsavel credenciado;
- criar quizzes/desafios escolares publicados por docentes;
- fazer `desafios-semanais` carregar quizzes escolares para aluno credenciado.

### Etapa 4 - Relatorios

Ainda nao implementado.

Necessario:

- relatorios para escola por aluno/turma;
- relatorios para docente;
- relatorios para responsavel credenciado apenas do aluno vinculado;
- impedir acesso a relatorios PF quando o perfil for escolar.

### Etapa 5 - Chat

Ainda nao implementado.

Necessario:

- chat entre responsavel credenciado, docentes e escola;
- permissao por escola/aluno;
- UI separada do plano PF.

## Observacoes tecnicas

- A pasta `src/main/java/senai/tcc/zupiapi/zupibackend/security/oauth2/` ja estava nao rastreada no Git antes das alteracoes.
- A dependencia OAuth2 foi adicionada porque esses arquivos estavam quebrando a compilacao.
- Foram preservadas alteracoes existentes no workspace; nada foi revertido.
- Algumas alteracoes em `application.properties` e `application-test.properties` ja apareciam como diferenca no workspace durante a revisao. Nao foram revertidas.
