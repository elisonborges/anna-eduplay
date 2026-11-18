# Stop Arena — validação v0.2 (protótipo integrado)

## Respostas em MAIÚSCULAS
- Respostas são convertidas em letras maiúsculas durante a digitação, com acentos preservados.
- Texto em maiúsculas é mantido no salvamento e na conferência.
- Respostas de partidas antigas armazenadas localmente são normalizadas quando reabertas.

## Disponível no jogo web
- Validação inicial da letra e de respostas vazias.
- Dicionário local **parcial** para categorias comuns, utilizável sem internet.
- Estados: **Aceita** (palavra conhecida), **Inválida** (não corresponde à letra), **Revisar** (desconhecida ou categoria sem dicionário) e **Vazia**.
- Revisão manual de qualquer decisão, inclusive das palavras aceitas automaticamente.
- Rodada não avança enquanto houver respostas em **Revisar**.
- Apenas respostas aceitas contam 10 pontos; desconhecidas nunca são recusadas apenas por ausência no dicionário.
- Consulta opcional à IA sugere status e justificativa, mas não modifica automaticamente a decisão.

## IA: backend pendente de configuração
O botão `Consultar IA` usa `POST /api/stop-arena/validate` na **mesma origem** do EduPlay. O arquivo `server/ai-worker.js` é um **modelo de Cloudflare Worker**; adicionar esse arquivo ao GitHub NÃO implanta o Worker.

Antes de ativar a IA, é necessário:
1. Configurar uma rota para `/api/stop-arena/validate` no domínio EduPlay que execute o Worker;
2. Definir o segredo `OPENAI_API_KEY` no ambiente servidor (nunca no GitHub nem no HTML);
3. Definir `ALLOWED_ORIGIN=https://eduplay.annaone.com.br` e verificar o modelo disponível em `OPENAI_MODEL`;
4. Adicionar rate limiting e monitoramento de uso/custo e validar os limites antes de tornar a rota pública;
5. Testar respostas corretas, erradas e ambíguas e o fallback quando o serviço estiver indisponível.

Sem esse serviço, a tela continua funcional com dicionário e revisão manual, exibindo indisponibilidade ao consultar IA. **IA não está ativa nem foi comprovada em produção.**

## Limitações
O dicionário inicial é demonstrativo, não exaustivo. Uma palavra reconhecida pode precisar de revisão por contexto; categorias compostas como CEP aceitam cidade, estado ou país, mas ainda não possuem verificação geográfica exaustiva. O motor atual é individual, com dados locais; não há multiplayer nem avaliação docente remota. Falta teste funcional real de ponta a ponta e visual mobile.
