# Fluxo Alinhadores

Aplicação web para gestão da produção de alinhadores odontológicos, construída com React, TypeScript, Vite e AWS Amplify Gen 2.

## Descrição

O sistema centraliza o cadastro de pacientes, o ciclo de vida dos casos, o histórico de status, os anexos clínicos e a operação diária da produção.

## Arquitetura

- Frontend em React + TypeScript + Vite.
- Autenticação com Amazon Cognito via Amplify Auth.
- Dados persistidos em DynamoDB via Amplify Data.
- Arquivos grandes armazenados em S3 via Amplify Storage.
- Deploy preparado para AWS Amplify Hosting.

## Serviços AWS usados

- Amazon Cognito
- Amazon DynamoDB
- Amazon S3
- AWS AppSync, gerenciado pelo Amplify Data
- AWS Amplify Hosting

## Estrutura de pastas

```text
fluxo-alinhadores/
  amplify/
    auth/resource.ts
    data/resource.ts
    storage/resource.ts
    backend.ts
  src/
    components/
    hooks/
    lib/
    pages/
    services/
    styles.css
    main.tsx
  amplify_outputs.json
  package.json
  vite.config.ts
```

## Modelo de dados

### Patient

- `id`
- `owner`
- `name`
- `birthDate`
- `document`
- `phone`
- `email`
- `notes`
- `createdAt`
- `updatedAt`

### AlignerCase

- `id`
- `owner`
- `patientId`
- `caseNumber`
- `title`
- `status`
- `upperArch`
- `lowerArch`
- `quantityOfAligners`
- `priority`
- `dueDate`
- `notes`
- `createdAt`
- `updatedAt`

### CaseStatusHistory

- `id`
- `owner`
- `caseId`
- `fromStatus`
- `toStatus`
- `note`
- `createdAt`

### CaseFile

- `id`
- `owner`
- `caseId`
- `fileName`
- `fileKey`
- `contentType`
- `size`
- `createdAt`

## Regras de autorização

- Todas as entidades usam `owner` authorization.
- Cada usuário só acessa os próprios registros.
- O bucket S3 usa prefixos por identidade para manter os arquivos privados.
- Não há infraestrutura manual fora do Amplify.
- Nenhuma chave ou credencial sensível é exposta no frontend.

## Como rodar localmente

O projeto usa `.nvmrc` com Node.js 26.3.1.

```bash
nvm use
npm install
npx ampx sandbox
npm run dev
```

Em outro terminal, o sandbox mantém o backend local e gera o arquivo `amplify_outputs.json`.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

## Como subir no GitHub

```bash
git status
git add .
git commit -m "Create Fluxo Alinhadores"
git push
```

## Deploy no AWS Amplify

1. Faça push do repositório no GitHub.
2. Crie um app no AWS Amplify Console.
3. Conecte o repositório e selecione a branch.
4. Confirme o build automático do frontend e do backend Gen 2.
5. Use o fluxo de preview/sandbox para validação local antes do merge.

### Instruções operacionais

- `npm install`
- `nvm use`
- `npx ampx sandbox`
- `npm run dev`
- `git push`
- Deploy pelo Amplify Console

## Variáveis de ambiente

O projeto não depende de segredos em arquivo `.env`.

Arquivo opcional:

- `.env.example`

## Observações de segurança

- O fluxo usa autenticação obrigatória.
- Os dados e arquivos ficam restritos ao dono do registro.
- O app não armazena chaves AWS no cliente.
- A exclusão de paciente e caso remove os dependentes associados.

## Roadmap futuro

- Assinatura eletrônica de aprovação clínica.
- Upload assíncrono com barra de progresso por arquivo.
- Controle de usuários por grupo.
- Kanban de produção por etapa.
- Auditoria detalhada de alterações.
- Notificações automáticas por atraso ou entrega.

## Licença

Proprietária, não licenciada para redistribuição. Repositório privado.
