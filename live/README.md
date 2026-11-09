# AnnA EduPlay Live — preparação para sessões coletivas

Código inicial em `live/worker.js` publicado no repositório, **não implantado no Cloudflare**.

## Objetivo
Professor cria sala, recebe PIN de seis dígitos, alunos entram com apelido, professor avança perguntas e os dispositivos recebem eventos WebSocket. Modos: pergunta e respostas no aluno (`full`) ou apenas botões (`buttons`).

## Estado real
- Worker com rota de criação protegida e objeto de sala WebSocket: implementado como base.
- Autorização real do professor: **não integrada**. O Worker retorna HTTP 503 na criação enquanto `HOST_AUTH_URL` e `HOST_AUTH_SECRET` não forem configurados; o contrato de autenticação precisa ser alinhado com o Worker existente.
- Persistência, retomada após reinício, rate limit, unicidade de PIN, desconexão/reentrada, encerramento e expiração de salas: **pendentes**.
- Interface de professor e alunos, implantação do Worker, testes entre dispositivos: **pendentes**.
- A sala em memória não é segura contra reinício/hibernação do Durable Object; não usar em aula real antes de corrigir.
- Pontuação atualmente fixa em 1000 × multiplicador por acerto; bônus por velocidade não implementado.
- Não usar apelidos de alunos para identificação permanente; definir retenção e exclusão antes da implantação.

## Segurança antes de ativar
1. Validar o token do professor em servidor de confiança, não no cliente; confirmar formato e escopos com o serviço de autorização AnnA One.
2. Implementar PIN sem colisões, limites de tentativas, entrada e expiração.
3. Persistir estado e resultados essenciais com Durable Object Storage e lidar com reconexão.
4. Não transmitir resposta correta antes da revelação; conferir prazos no servidor.
5. Testar autenticação, CORS, permissões e sessões simultâneas.
6. Configurar domínio e binding Durable Object no Cloudflare e só então ligar a interface de produção.

## Importante
A interface atual do Quiz Arena mantém dois **layouts locais**. Eles não constituem multiplayer. Nenhuma configuração de Neon, Supabase, Cloudflare ou dados reais foi alterada.
