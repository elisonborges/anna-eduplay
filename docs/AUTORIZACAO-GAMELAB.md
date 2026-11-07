# AnnA EduPlay — contrato de autorização do GameLab (proposta, não implantada)

## Estado verificado
- Portal AnnA One usa Neon Auth (cliente @neondatabase/auth 0.5.0-beta).
- Endpoint existente `GET /v1/admin/authorize` responde `admin_authorized: true` para Master.
- Endpoint existente `GET /v1/institution/me` retorna vínculos e módulos, mas **não comprova perfil docente**.
- Não foi identificado endpoint docente no código consultado. Não presumir que exista.
- O domínio do EduPlay é outro subdomínio; compartilhamento de sessão do cliente Neon Auth **não foi validado**.
- O GameLab atual é HTML estático com quizzes em localStorage. Ocultar a interface não protege os dados nem equivale a autorização de API.

## Contrato sugerido ao serviço central (pendente de implementação)
`GET /v1/eduplay/authorize`
Header: `Authorization: Bearer <access_token>`.
Servidor valida assinatura, expiração e emissor do JWT; identifica usuário por ID verificado; consulta papéis e vínculos ativos na fonte de verdade. Nunca confiar em `role` informado pelo navegador.

Resposta autorizada HTTP 200:
```json
{"authorized":true,"role":"master","user_id":"<id-verificado>"}
```
ou `role:"teacher"` para docente com vínculo ativo e permissão EduPlay.

Resposta negada HTTP 403:
```json
{"authorized":false}
```
Falha de autenticação HTTP 401; indisponibilidade HTTP 5xx. Em todos os casos, GameLab permanece bloqueado.

## Ordem de implementação
1. Identificar onde vivem papéis de professor, vínculos e permissões; definir política Master e professor.
2. Implementar endpoint central e validar CORS estrito para `https://eduplay.annaone.com.br`.
3. Confirmar fluxo SSO entre subdomínios, incluindo retorno após login; não pressupor compartilhamento de localStorage.
4. Integrar frontend ao endpoint com bloqueio por padrão; remover verificações institucionais que não concedem autorização.
5. Migrar operações de conteúdo para API autenticada e banco Neon com autorização por usuário/instituição. Manter exportação/importação de backup para dados locais.
6. Testar Master, professor ativo, usuário sem papel, sessão expirada, falha de rede, isolamento entre usuários e migração de quizzes.
7. Somente após validação, aprovar merge e publicação.

## Segurança
Não tratar controle visual em GitHub Pages como barreira de segurança. O servidor deve autorizar cada leitura/gravação. Não publicar chaves privadas nem permitir leitura de quizzes de outros professores.

## Verificação de acesso realizada em 2026-11-07
- Repositórios acessíveis da conta GitHub foram enumerados; nenhum contém o projeto de implantação do Worker `anna-one-auditoria`.
- Não existe ferramenta conectada de administração Cloudflare Workers nesta sessão. Portanto, **não foi possível criar/publicar** `/v1/eduplay/authorize`.
- O login existente em `anna-one/app/login-neon.html` aceita apenas `next=master` ou redireciona ao dashboard; não implementa retorno seguro ao EduPlay. Alterá-lo isoladamente não resolveria compartilhamento de sessão entre origens.
- A branch do GameLab está configurada para falhar fechada (sem autorização explícita, interface oculta). **Não fazer merge** até validar endpoint, sessão e isolamento de dados.
- Bloqueio visual de uma página estática não equivale a proteção de conteúdo. Para segurança efetiva, mover operações privadas para backend autenticado.

## Dependência para conclusão
Obter acesso ao código-fonte/deploy do Worker central e à configuração de Neon Auth, para implementar autorização docente, configurar origens/retorno do login e executar testes com contas autorizadas e não autorizadas. Não alterar banco de produção nem presumir o esquema de papéis.
