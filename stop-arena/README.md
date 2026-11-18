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

## IA: integração com AnnA Virtual (Gemini)

O Stop Arena faz chamadas opcionais a `https://anna-virtual-teste.elisonborg.workers.dev/stop-arena/validate`, reutilizando o backend do módulo AnnA Virtual no repositório privado `elisonborges/anna-virtual`. A rota usa a variável secreta `GEMINI_API_KEY` no Worker, com controle de origem para `https://eduplay.annaone.com.br`, limites por IP pelo `ANNA_RATE_LIMITER` e limite de 12 respostas por consulta.

**Código salvo no GitHub não significa Worker publicado.** Antes de declarar a IA ativa em produção, é necessário implantar a versão atual do repositório anna-virtual no Cloudflare, confirmar que o segredo GEMINI_API_KEY e o limitador estão presentes, e realizar um teste autorizado de ponta a ponta. Não é necessário criar uma chave OpenAI.

A IA somente oferece sugestões, nunca altera automaticamente as respostas ou a pontuação. Se a consulta falhar, a revisão manual continua operante. A configuração anterior em `stop-arena/server/ai-worker.js` é uma alternativa não utilizada, e não deve ser implantada simultaneamente.

## Limitações
O dicionário inicial é demonstrativo, não exaustivo. Uma palavra reconhecida pode precisar de revisão por contexto; categorias compostas como CEP aceitam cidade, estado ou país, mas ainda não possuem verificação geográfica exaustiva. O motor atual é individual, com dados locais; não há multiplayer nem avaliação docente remota. Falta teste funcional real de ponta a ponta e visual mobile.
