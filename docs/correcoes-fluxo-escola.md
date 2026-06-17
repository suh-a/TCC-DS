# Correcoes do fluxo pessoa juridica/escola

Data: 2026-06-14

## Causas reais encontradas

### 1. `/school/teachers` retornava "No static resource school/teachers"

A rota existia no codigo corrigido, mas o front-end em desenvolvimento usava o proxy do Vite com destino padrao para `https://tcc-ds-dzs2.onrender.com`. Ou seja: ao abrir `localhost:5173`, as chamadas `/school/*` podiam ir para o back-end remoto/antigo, nao para a API local com as correcoes.

Tambem havia uma API antiga ocupando a porta `8080` durante o teste. A versao corrigida foi testada em `8081` para nao interromper esse processo sem permissao.

Correcao aplicada: `zupi-frontend/vite.config.js` agora usa `http://localhost:8080` como API padrao em `development`, mantendo Render apenas para build/preview/producao quando `VITE_API_BASE` nao for definido.

### 2. Alunos salvos nao apareciam de forma confiavel

A listagem usava apenas `schoolName`, que e um texto livre. Se o cadastro nao preenchesse exatamente o mesmo nome, ou se houvesse escola com nome alterado/repetido, o aluno ficava fora da listagem.

Correcao aplicada: `Child` agora possui relacionamento real com `School` por `school_id`. O cadastro escolar salva `child.school = escolaLogada`, e `GET /school/students` busca primeiro por `school_id`. O filtro por `schoolName` ficou apenas como fallback para registros legados.

### 3. Login de aluno/crianca gerado ficava instavel

As credenciais infantis sao geradas em `ChildService` e salvas em `children.child_login_email` e `children.child_password_hash` com `PasswordEncoder`. O login geral tambem foi ajustado para aceitar esse e-mail.

O problema adicional era que, como tambem criamos um `User` para aluno credenciado, o `CustomUserDetailsService` podia resolver o e-mail infantil como `User` antes de `Child`, fazendo o JWT/autorizacao trabalhar com o id do usuario em vez do id da crianca.

Correcao aplicada: `CustomUserDetailsService` agora procura `Child.childLoginEmail` antes de `User.email`. Assim, login infantil retorna `userType=ALUNO_CREDENCIADO` e `userId` igual ao `children.id`.

### 4. Login de professor/docente gerado nao funcionava

O fluxo precisava garantir que o cadastro de docente criasse tambem uma conta em `usuarios`, com role esperada pelo projeto.

Correcao aplicada: `POST /school/teachers` cria `Teacher` e `User` vinculado, com `userType=DOCENTE`, `planType=PESSOA_JURIDICA`, e senha criptografada por `PasswordEncoder`. O front ja redireciona `DOCENTE` para `/dashboard-docente`.

### 5. Possivel colisao de e-mail infantil

O e-mail infantil era baseado em nome + ano. Dois alunos com mesmo nome/ano poderiam gerar o mesmo login.

Correcao aplicada: a geracao de credenciais infantis verifica `children.child_login_email` e `usuarios.email`; em caso de colisao, adiciona sufixo numerico.

## Arquivos alterados

- `src/main/java/senai/tcc/zupiapi/zupibackend/model/Child.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/repositories/ChildRepository.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/dto/mapper/ChildMapper.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/services/ChildService.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/services/SchoolService.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/services/UserService.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/security/services/CustomUserDetailsService.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/controllers/SchoolController.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/model/SchoolClass.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/model/LibraryBook.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/repositories/TeacherRepository.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/repositories/SchoolClassRepository.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/repositories/LibraryBookRepository.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/dto/request/TeacherRequest.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/dto/request/SchoolClassRequest.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/dto/request/AccessEmailRequest.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/dto/request/LibraryBookRequest.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/dto/response/TeacherResponse.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/dto/response/SchoolClassResponse.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/dto/response/SchoolAccessResponse.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/dto/response/AccessItemResponse.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/dto/response/PasswordResetResponse.java`
- `src/main/java/senai/tcc/zupiapi/zupibackend/dto/response/LibraryBookResponse.java`
- `zupi-frontend/vite.config.js`
- `zupi-frontend/dashboard-escola.html`
- `zupi-frontend/biblioteca.html`
- `zupi-frontend/public/js/auth-guard.js`
- `zupi-frontend/public/js/cadastroScript.js`

Observacao: `src/main/resources/application-dev.properties` e `src/main/resources/application.properties` ja estavam modificados antes desta rodada.

## Trechos principais corrigidos

### Vínculo real aluno-escola

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "school_id")
@JsonIgnore
private School school;
```

```java
ChildRegistrationResponse response = childService.saveForSchool(schoolChild, school);
```

```java
private List<Child> studentsFor(School school) {
    List<Child> bySchoolId = childRepository.findBySchoolId(school.getId());
    if (!bySchoolId.isEmpty()) {
        return bySchoolId;
    }
    return childRepository.findBySchoolLinkedTrueAndSchoolName(school.getName());
}
```

### Login infantil resolve `Child` antes de `User`

```java
Child child = childRepository.findByChildLoginEmail(username).orElse(null);
if (child != null) {
    return UserDetailsImpl.buildFromChild(child);
}
```

### Proxy local do front-end

```js
const defaultApiTarget = mode === 'development'
  ? 'http://localhost:8080'
  : 'https://tcc-ds-dzs2.onrender.com';
```

## Rotas finais usadas pelo front-end

- `POST /auth/register`
- `POST /auth/login`
- `GET /school/dashboard`
- `GET /school/students`
- `POST /school/students`
- `GET /school/responsibles`
- `POST /school/responsibles`
- `GET /school/teachers`
- `POST /school/teachers`
- `GET /school/classes`
- `POST /school/classes`
- `GET /school/accesses`
- `GET /school/reports/summary`

## Payloads de exemplo

### Cadastro de aluno

```json
{
  "name": "Aluno Teste",
  "cpf": "77061421012",
  "birthDate": "2016-03-15",
  "schoolClass": "3 Ano A",
  "condition": null,
  "responsibleId": 2,
  "schoolLinked": true,
  "schoolName": null
}
```

Resposta esperada:

```json
{
  "child": {
    "id": 2,
    "name": "Aluno Teste",
    "childLoginEmail": "alunoteste.2016@zupi-kids.app",
    "schoolLinked": true,
    "schoolName": "Escola Teste"
  },
  "generatedPassword": "DfAds45fJm"
}
```

### Cadastro de professor/docente

```json
{
  "name": "Docente Teste",
  "email": "docente.teste@teste-zupi.local",
  "specialty": "Pedagogia"
}
```

Resposta esperada:

```json
{
  "id": 2,
  "name": "Docente Teste",
  "email": "docente.teste@teste-zupi.local",
  "specialty": "Pedagogia",
  "accountId": 8,
  "generatedPassword": "q5NGnH6cxs"
}
```

## Respostas esperadas de login

### Login de aluno

Request:

```json
{
  "email": "alunoteste0614210126.2016@zupi-kids.app",
  "password": "DfAds45fJm"
}
```

Resposta verificada:

```json
{
  "user": {
    "id": 2,
    "email": "alunoteste0614210126.2016@zupi-kids.app",
    "userType": "ALUNO_CREDENCIADO"
  },
  "jwtPayload": {
    "userId": 2,
    "userType": "ALUNO_CREDENCIADO"
  }
}
```

### Login de docente

Request:

```json
{
  "email": "docente.0614210126@teste-zupi.local",
  "password": "q5NGnH6cxs"
}
```

Resposta verificada:

```json
{
  "user": {
    "id": 8,
    "email": "docente.0614210126@teste-zupi.local",
    "userType": "DOCENTE"
  },
  "jwtPayload": {
    "userId": 8,
    "userType": "DOCENTE"
  }
}
```

## Testes feitos no banco real

Ambiente:

- API corrigida executada em `http://localhost:8081`
- Banco real: `jdbc:postgresql://localhost:5432/zupi_dev_db`
- Override usado para nao recriar tabelas: `--spring.jpa.hibernate.ddl-auto=update`

Checklist executado:

- Registrada escola real via `POST /auth/register`.
- Login como escola via `POST /auth/login`: retornou `userType=ESCOLA`.
- Cadastrado responsavel via `POST /school/responsibles`.
- Cadastrado aluno via `POST /school/students`.
- Consultado `GET /school/students`: retornou 1 aluno; o aluno criado apareceu na listagem.
- Conferido no banco via JDBC:
  - `children.id=2`
  - `children.school_linked=true`
  - `children.school_id=2`
  - `children.school_name=Escola Teste 0614210126`
  - `schools.id=2`
- Cadastrado docente via `POST /school/teachers`: nao retornou Not Found.
- Consultado `GET /school/teachers`: retornou 1 docente; o docente criado apareceu na listagem.
- Conferido no banco via JDBC:
  - `teachers.id=2`
  - `teachers.school_id=2`
  - `teachers.user_id=8`
  - `usuarios.user_type=DOCENTE`
- Login com credenciais geradas para aluno: sucesso, `userType=ALUNO_CREDENCIADO`.
- Login com credenciais geradas para docente: sucesso, `userType=DOCENTE`.
- Build do front-end: `npm.cmd run build` passou.

## Observacao operacional importante

Durante o teste, a porta `8080` estava ocupada pelo processo `PID 2832`. A versao corrigida foi validada na porta `8081` para nao parar esse processo sem autorizacao. Para o front local em `localhost:5173` usar as correcoes sem configurar `VITE_API_BASE`, a API antiga da porta `8080` precisa ser reiniciada com esta versao corrigida.
