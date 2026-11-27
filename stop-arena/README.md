## Ajuste da tela de criação — participantes compactos

- A configuração de sala ocupa a largura disponível, com as categorias, letras e opções mantidas.
- O antigo cartão lateral grande de participantes é substituído por uma faixa horizontal compacta, com ícone, texto curto e link direto para entrar com PIN.
- A antessala dos jogadores permanece com cartões horizontais, emoji escolhido e nome; esta mudança da tela de criação não interfere na dinâmica da partida.

## Antessala — jogadores em linha com emoji próprio

- A lista da antessala online agora é uma **fileira horizontal de cartões**, com rolagem lateral em telas estreitas, sem empilhar cada jogador verticalmente.
- Cada participante escolhe um emoji ao entrar pelo link de PIN. O organizador escolhe seu emoji ao criar a sala. O servidor valida a escolha e compartilha o emoji com todos.
- Cada cartão mostra **emoji grande, nome e identificação** (organizador, participante ou você); o organizador continua com o botão Remover para os demais.
- A antessala mantém chat e emojis temporários separados dos emojis de identificação; o chat é bloqueado quando a partida inicia.
- Alterações guardadas nas branches `feature/stop-arena-antessala-moderacao`, incluídas nesta publicação.

## Antessala Online com moderação e interação (em desenvolvimento)

- Após criar a sala, organizador e participantes aguardam na antessala com o **PIN em destaque**, lista de jogadores e configurações resumidas da partida. Um novo layout responsivo destaca o painel de jogadores e a conversa da equipe.
- Na antessala online, o organizador pode **remover participantes** pelo botão Remover e **excluir mensagens inadequadas** do chat. Removidos têm o token invalidado, suas mensagens retiradas e o mesmo nome bloqueado naquela sala. A medida não constitui bloqueio permanente de pessoas que retornem com outro nome.
- **Chat de até 140 caracteres** e reações predefinidas (👋 👏 🎉 👍 😊 🚀) funcionam exclusivamente na fase de antessala, com limitação de frequência e máximo das 40 mensagens mais recentes.
- Quando o organizador inicia o sorteio, o servidor desativa o chat e emojis, limpa o histórico da conversa e não aceita novas interações desse tipo durante roleta, rodada, conferência ou finalização. A **votação de respostas na conferência** continua permitida, pois é parte do jogo, não do chat.
- O layout do **organizador** também foi atualizado para separar visualmente as etapas 01 Configurar partida e 02 Convidar jogadores; os controles de criação, entrada e sorteio permanecem compatíveis.
- O Host LAN portátil mantém sua antessala anterior para não depender das novas ações de chat/moderação não presentes na versão local do motor de salas.
- Desenvolvido nos branches `feature/stop-arena-antessala-moderacao` dos repositórios `anna-eduplay` e `anna-virtual`. Publicação na `main` autorizada após esta revisão.

## Cooperativo Online — criação, entrada independente e roleta sincronizada (novembro de 2026)

- A página `stop-arena/online/` fica dedicada ao **organizador**, que configura equipe, categorias, letras, quantidade de rodadas e duração, cria a sala e compartilha PIN e convite.
- Nova página independente para os **participantes**: `stop-arena/online/entrar/`, com apenas PIN de 7 caracteres e nome. O convite enviado pelo organizador abre diretamente esta página com o PIN preenchido. A adesão salva a sessão no navegador e leva à tela compartilhada da sala.
- O menu inicial do Stop Arena apresenta dois links separados, **Criar sala online** e **Entrar em sala online**.
- A etapa de roleta é sincronizada pelo servidor: 1,5 segundo de sorteio visual, revelação da letra, **contagem de 5 segundos** e transição automática para a rodada; durante a preparação, nenhuma resposta pode ser enviada. O cronômetro da rodada começa na hora acordada pelo servidor, não na hora em que cada dispositivo recebeu a atualização.
- A cada nova rodada ocorre outro sorteio e outra contagem. A conferência, votação e pontuação coletiva continuam funcionando como antes.
- Compatibilidade: o modo Host LAN portátil mantém sua interface de criação/entrada no mesmo endereço, pois utiliza motor de salas local; as alterações de roleta foram aplicadas ao motor online da AnnA Virtual.
- Implementação integrada em branches `feature/stop-arena-online-acesso-roleta` nos repositórios **anna-eduplay** e **anna-virtual**.

## AnnA Stop Arena Host LAN — implementação atual (v0.1)

- O **Multiplayer Local** deixa de utilizar salas do Cloudflare: o card inicial aponta para `stop-arena/lan/`, com instruções para iniciar o aplicativo anfitrião.
- O motor de salas existente foi adaptado para `stop-arena/host/room-engine.mjs`; `server.mjs` oferece HTTP LAN, recebe comandos de criação/entrada/votação/STOP e serve a interface `stop-arena/online/index.html` em modo offline.
- O organizador inicia o Host pelo lançador `Iniciar-Stop-Arena-LAN.cmd`, que abre a interface no navegador Windows. Cada aluno utiliza o endereço IPv4 e a porta exibidos pelo anfitrião e entra com o PIN alfanumérico de 7 caracteres.
- A preparação do `runtime/node.exe` Windows x64 está em `Preparar-Runtime.cmd`: uma etapa online inicial, com download do Node LTS e verificação SHA-256. O runtime **ainda não está incluído** no repositório/distribuição.
- Depois de preparado, o sistema é independente da internet para o jogo. As salas são mantidas em memória do anfitrião, e a conferência Gemini permanece desativada nesse modo offline.
- Esta primeira versão foi testada sintaticamente e seu motor de salas passou em simulação de dois jogadores. **O teste de execução completa em Windows e a conexão física LAN ainda estão pendentes**.
- As alterações estão na branch `feature/stop-arena-host-lan`, **não publicadas na main**.

## Multiplayer Local — sala com PIN (nova modalidade)

- O card antes denominado **Cooperativo Local** agora abre `stop-arena/online/?modo=local` com título **🏫 Multiplayer Local**.
- O organizador cria uma sala para 2 a 6 participantes, configura as categorias, letras, tempo e rodadas, e recebe um **PIN alfanumérico de 7 caracteres** gerado pelo serviço de salas existente.
- Cada integrante entra no próprio celular, tablet ou computador com o PIN ou link de convite, digita suas próprias respostas e participa da conferência da equipe após o STOP.
- O PIN pode ser copiado diretamente na sala. O convite preserva `modo=local` para quem entrar pelo link. Todos participam da mesma sala sincronizada, com votação, Gemini opcional e pontuação coletiva por categoria.
- **Limitação declarada:** o servidor de salas AnnA Virtual exige conexão à internet, mesmo quando os jogadores estão fisicamente próximos e conectados ao mesmo Wi-Fi. Este modo **não** oferece hospedagem LAN/autônoma nem funcionamento offline entre dispositivos. Não se deve anunciá-lo como rede local sem internet.
- O **Cooperativo Online** permanece acessível para participantes em lugares diferentes, com a mesma infraestrutura de salas e a opção de eventos e quadro de salas.
- Implementação incremental em `feature/stop-arena-multiplayer-local`, **sem publicação na branch principal**. Os jogos antigos de um único aparelho permanecem legíveis no armazenamento local, mas não são mais oferecidos como uma modalidade nova.

## Finalização antecipada de partida — implementação em branch

- Botão **🏁 Finalizar jogo** nas telas de escolha/sorteio da letra, preenchimento e conferência dos modos locais. Ao clicar, um **pop-up de confirmação** informa as rodadas concluídas, os pontos acumulados e que a rodada incompleta não conta para o resultado.
- Confirmando, os cronômetros são interrompidos e aparece a tela de resultado final com a pontuação das rodadas concluídas. Cancelando, a partida continua inalterada.
- No Cooperativo Online, o organizador pode encerrar a sala antecipadamente (lobby, preenchimento ou conferência); participantes não organizadores continuam podendo sair individualmente. A confirmação avisa que o encerramento vale para todos e só contabiliza rodadas concluídas.
- O Durable Object marca a sala como finalizada antecipadamente e sincroniza a tela de resultado com todos os jogadores, preservando histórico e pontos acumulados.
- Alterações preparadas em `feature/stop-arena-finalizar-partida` de `anna-eduplay` e `anna-virtual`. **Não publicadas na main.**

## Roleta — preparação de cinco segundos

- Depois de a roleta revelar a letra, aparece a contagem regressiva visual **5, 4, 3, 2, 1**; ao terminar, a rodada começa automaticamente.
- O botão **▶ Começar rodada agora** é liberado assim que a roleta para e permite iniciar sem esperar os cinco segundos.
- O cronômetro da partida só começa quando a tela de respostas é aberta, não durante o sorteio nem a preparação.
- Ao iniciar a rodada ou abandonar a tela, o temporizador de preparação é cancelado para impedir inícios duplicados.
- Aplicado à roleta das modalidades locais (Individual, Educacional, Contra o Computador e Cooperativo Local). As salas online não têm roleta visual nessa interface; seu início continua controlado pelo organizador.
- Implementado na branch de desenvolvimento **feature/stop-arena-validacao-compartilhada**, ainda sem publicação na versão principal.

## Conferência conjunta das respostas — revisão em desenvolvimento

- Cada participante de uma sala online mantém suas próprias respostas por categoria durante a rodada. Após o STOP, todos os participantes autorizados veem as palavras preenchidas por cada integrante, com autoria identificada.
- Qualquer participante pode votar **Aceitar** ou **Recusar** em cada resposta não vazia. Dois votos concordantes definem o status provisório; divergências permanecem pendentes. O organizador pode decidir e encerrar uma divergência.
- Nenhum participante pode votar, corrigir ou atribuir pontos a respostas vazias. Na tela individual, o seletor de uma resposta em branco fica desabilitado; na sala online, ela aparece como não preenchida.
- A IA atua como parecer de desempate e ortografia, compartilhado no estado persistente da sala. Nunca substitui automaticamente palavras digitadas nem concede pontuação com base apenas na correção sugerida.
- Os resultados coletivos contabilizam **no máximo 10 pontos por categoria**, mesmo com diversas palavras corretas enviadas por jogadores diferentes. O histórico da sala preserva a pontuação consolidada.
- Com 2 a 6 participantes e 6 a 12 categorias, a conferência pode envolver até 72 respostas; consultas Gemini são divididas em lotes de até 12 entradas, com índices traduzidos de volta para a resposta original.
- O Worker informa o status HTTP e a mensagem resumida do provedor nos erros Gemini; o erro 502 observado não teve causa específica verificada em produção. Se a IA falhar, a revisão manual permanece disponível.
- Alterações em `feature/stop-arena-validacao-compartilhada` de `anna-eduplay` e `anna-virtual`. Ainda não publicadas na `main` nem validadas com o Gemini real e dois celulares.

## Sugestões ortográficas do Gemini (em desenvolvimento)

- O botão **🤖 Conferir escrita com IA** permite revisar a adequação à categoria e a grafia das respostas preenchidas, mesmo quando já reconhecidas localmente.
- Se o Gemini identificar uma grafia corrigida com segurança, o card mostra **✍️ Grafia sugerida: ...**, mantém a palavra originalmente digitada e deixa a avaliação pendente de decisão humana (sem pontuação automática para uma correção).
- No Cooperativo Online, a sugestão aparece ao organizador; a avaliação pode ficar pendente por ação autenticada do servidor. Os outros participantes recebem as alterações de status e pontuação.
- O Worker filtra sugestões por índice, comprimento e letra inicial. Gemini pode errar e não é um corretor ortográfico infalível.
- Esta melhoria está nas branches **feature/stop-arena-correcao-ortografica** dos dois repositórios; ainda não foi publicada na branch principal nem validada com a API Gemini real.

## Conferência de respostas com Gemini — integração

- O jogador continua recebendo validação imediata do dicionário local, inclusive offline. Palavras não encontradas, mas com letra inicial compatível, ficam pendentes.
- Na tela de revisão em cards, **🤖 Conferir pendentes com IA** envia somente letra, categoria e resposta das pendências ao endpoint protegido `/stop-arena/validate` do AnnA Virtual. A chave do Gemini fica exclusivamente no Worker.
- As avaliações `valid` e `invalid` são aplicadas aos cards e à pontuação; respostas com `review` exigem revisão manual. O jogador pode corrigir qualquer avaliação. Sem internet, cota ou configuração Gemini, continua a revisão manual.
- No Cooperativo Online, somente o organizador aciona a conferência; o resultado é gravado via ações autenticadas de avaliação e sincronizado com a sala, preservando a decisão manual do organizador.
- O adversário offline contra o computador permanece separado do serviço Gemini.
- Validação feita: sintaxe JavaScript e simulação da resposta da API para casos aceitos, recusados e duvidosos; **não equivale a uma chamada real ao Gemini**. A disponibilidade real depende da publicação do AnnA Virtual e da variável `GEMINI_API_KEY` no Cloudflare.

## Nova experiência visual — preenchimento e conferência

- Tela **Preencher palavras**: cabeçalho com letra da rodada, cronômetro, progresso e status; campos agrupados em cards por categoria, com ícones, contraste reforçado e borda destacada quando preenchidos.
- Campos em duas colunas no desktop e uma coluna no celular, com teclado mobile e `Enter` para passar à próxima palavra. A contagem de respostas é atualizada durante a digitação.
- Tela **Conferir respostas**: sai a tabela extensa e entra uma grade de cards com categoria, resposta, avaliação editável, justificativa e pontos; estatísticas de aceitas, pendentes e pontuação no topo.
- Mensagem de celebração quando todas as respostas estiverem conferidas; enquanto houver pendências, a próxima rodada permanece bloqueada.
- O botão de IA fica inativo quando não há respostas pendentes. Sua integração real com Gemini continua dependendo de backend configurado; esta revisão **não publica a branch de IA em desenvolvimento**.
- Os modos Individual, Contra o Computador, Educacional e Cooperativo Local usam a mesma nova interface, preservando as regras, histórico e pontuação existentes.
- Alterações somente em HTML/CSS/JS de `stop-arena/index.html`. A versão online e o backend não foram alterados nesta publicação.

## Experimento de layout — cards verticais (branch visual)

- Branch: `experiment/stop-arena-cards-verticais`. **Não está publicada no site principal**.
- Tela inicial com cinco cards em **formato retrato**, ícone ilustrativo grande, texto centralizado e ação destacada na parte inferior.
- Ícones renovados: 🎯 Individual, 🦾 Contra o computador, 🧩 Educacional, 🤝 Cooperativo local e 🌐 Cooperativo Online.
- Responsividade: grade de **3 colunas no desktop**, **2 no tablet/celular**, **1 em telas muito estreitas**.
- Interação leve: elevação do card, rotação suave do ícone e deslocamento da seta ao passar o mouse; efeitos desativados para usuários com `prefers-reduced-motion`.
- Respeita tema claro/escuro e navegação por teclado; **não modifica lógica de jogo, partidas ou rotas online**.
- Sintaxe JavaScript verificada; validação visual em navegador e aprovação ainda pendentes.

# Stop Arena — validação e modalidades

## Recreativo contra o computador — protótipo offline (branch de desenvolvimento)

- Na página inicial, o botão **🤖 Contra o computador** abre a mesma configuração de categorias, letras, tempo e rodadas do jogo Recreativo, com dificuldade **Fácil, Normal ou Difícil**.
- O adversário usa **exclusivamente respostas existentes no dicionário local**. Categorias não presentes no dicionário ou sem palavra iniciada pela letra sorteada ficam sem resposta; o computador não inventa palavras.
- Respostas do computador são escolhidas **antes da rodada** e **mantidas ocultas até STOP**. A dificuldade influencia a probabilidade de preencher cada categoria: Fácil 35%, Normal 65%, Difícil 92%, quando existe uma opção conhecida.
- O jogador recebe a conferência local habitual e pode revisar manualmente palavras desconhecidas; o computador pontua somente suas palavras existentes no dicionário.
- Resultados por rodada e placar final são separados para jogador e computador. Respostas e histórico ficam em `localStorage`.
- **Sem internet e sem chave de API**: este não é o futuro adversário generativo Gemini. O modo Cooperativo e o Recreativo individual continuam preservados.
- Estágio atual: código gravado em `feature/stop-arena-computador-offline`, sintaxe JavaScript aprovada e simulação de pontuação com dicionário existente. **Ainda não implantado no site principal nem validado visualmente no navegador.**
- Próxima evolução, separada: adversário Gemini conectado ao backend, com cotas, validação de respostas e preservação do jogo offline como alternativa.



## Histórico: cooperativo local antigo (mesmo dispositivo, substituído)
- A tela inicial oferece **🤝 Cooperativo**, além de Recreativo e Educacional individuais.
- Equipe com **2 a 6 participantes**, nome personalizável e respostas compartilhadas no **mesmo dispositivo**.
- As respostas continuam em MAIÚSCULAS e utilizam validação local, revisão manual e botão opcional de consulta à IA.
- Pontuação **única** da equipe: 10 pontos por resposta validada. Meta coletiva de **70% dos pontos possíveis**.
- Em cada resposta há registro **opcional** da pessoa que contribuiu. O relatório final mostra contribuições sem ranking competitivo.
- Os dados continuam no `localStorage`, preservando a partida na mesma instalação do navegador.
- **Não é sala online:** não há convite, código de sala, sincronização entre dispositivos nem colaboração simultânea pela rede. Esses recursos exigem backend de sessão/realtime em etapa futura.
- Validação visual e teste de partida completa no navegador ainda pendentes.

## Quadro de salas disponíveis

- Acesse `stop-arena/online/salas/`; há links de acesso direto no Cooperativo Online e no painel de eventos.
- Lista pública das salas **criadas após a implantação deste recurso**, com **nome da equipe/sala**, código, situação, **participantes inscritos**, **pessoas conectadas** e **vagas disponíveis**.
- Cada sala comporta 6 participantes. “Conectados” considera atividade registrada nos últimos **20 segundos**; uma pessoa pode continuar inscrita mesmo desconectada.
- Vagas aparecem somente enquanto a sala está no lobby. Depois do início, o ingresso é bloqueado mesmo que haja menos de seis inscritos.
- Atualização automática do quadro a cada 12 segundos, com botão de atualização manual e filtro opcional por código de evento.
- O quadro não expõe nomes de participantes nem tokens de sessão; divulga apenas o nome da equipe/sala e quantidades.
- Backend: `StopArenaDirectory` (Durable Object SQLite) armazena códigos das salas por até 24 horas; `StopArenaRoom` fornece resumo público de ocupação e presença. O serviço lista até as 100 salas mais recentes por consulta, com contagem total.
- O índice não recupera automaticamente salas anteriores à implantação do recurso. A implantação Cloudflare e o funcionamento em produção ainda exigem confirmação.
- Testes simulados cobriram sala com 1/6 e 6/6 participantes, rejeição do sétimo, entrada bloqueada após início e queda da contagem de conectados por inatividade.

## Gestão dos eventos (próxima evolução)

- O professor define **tipo de desafio (Recreativo ou Educacional), conjunto de seis categorias, tempo e número de rodadas** quando cria um evento.
- O backend impõe essas regras a todas as salas que utilizam o mesmo código de evento. Alterações feitas na configuração local de uma equipe não substituem as regras do evento.
- O evento prepara uma **sequência de letras comum a todas as equipes**, mantida oculta no placar público até cada rodada começar. Equipes podem iniciar em momentos diferentes, mas recebem o mesmo desafio na rodada correspondente.
- O placar de equipes mostra posição, pontuação, estado da partida e número de jogadores. O organizador pode **exportar CSV** com BOM UTF-8 e separador ponto e vírgula, para análise escolar.
- O CSV protege células contra fórmulas iniciadas por caracteres especiais.
- Eventos criados antes desta evolução podem não possuir regras compartilhadas; a página identifica esses eventos sem prometer comparabilidade.
- O sistema permite concluir rodadas de forma independente, sem necessidade de todos começarem ao mesmo tempo.
- Foram realizados testes simulados com **duas salas recebendo a mesma letra** e validações da configuração de evento. Falta validação real em dispositivos e implantação Cloudflare.

## Eventos com até 50 equipes

- Página do organizador: `stop-arena/online/eventos/`.
- Cada evento cria um **código próprio de sete caracteres** e aceita o registro de até **50 equipes** (limite conferido pelo servidor).
- Cada equipe possui sua própria sala online, com **2 a 6 participantes**; esse limite não foi alterado.
- Ao criar a sala, informe o código do evento. O servidor registra a equipe, recusa nomes repetidos e bloqueia a 51ª equipe.
- O painel do evento apresenta os nomes das equipes, quantidade de participantes, códigos das salas e pontuação, atualizados automaticamente a cada cinco segundos.
- As equipes jogam suas partidas de forma independente; **não há sorteio/cronômetro sincronizado entre equipes** nem classificação pedagógica automática.
- A infraestrutura usa um `StopArenaEvent` Durable Object SQLite separado do `StopArenaRoom`, com limpeza após 24 horas de inatividade. O registro não armazena tokens de acesso dos jogadores.
- O limite de 50 equipes foi testado em simulação do objeto: **50 registros aceitos, 51º recusado (409)**.
- A implantação do Worker e testes reais em diversos aparelhos ainda requerem confirmação; gravação no GitHub não implica implantação confirmada.

## Cooperativo Online — salas em dispositivos diferentes (v0.3)

Acesse `stop-arena/online/` ou o cartão **Cooperativo Online** na página inicial.

- Organizadores escolhem modo **Recreativo ou Educacional**, conjunto de categorias, 6 a 12 categorias, **letras A–Z que participarão**, 1–20 rodadas e 30–300 segundos.
- Geram um código de **7 caracteres**, link de convite e entram com nome próprio.
- Os convidados entram pelo link/código **antes** do início; são necessários de 2 a 6 participantes.
- Cada participante usa seu próprio aparelho conectado à internet. As respostas são compartilhadas e sincronizadas por consultas periódicas ao serviço (~2,5 s), com atualização ao digitar e sem exigir atualização manual da página.
- Respostas em **MAIÚSCULAS**; quando duas pessoas editam a mesma categoria, prevalece a última edição salva no servidor.
- O servidor sorteia letras A–Z e controla o prazo. Ao tocar STOP ou acabar o tempo, a equipe entra em revisão.
- Dicionário local compartilhado para validação inicial; o organizador resolve pendências e pode pedir **sugestões ao Gemini**, nunca aprovadas automaticamente.
- A pontuação é **coletiva**, 10 pontos por resposta aceita, com meta de 70% dos pontos possíveis e resumo da equipe.
- Tokens individuais temporários ficam na `sessionStorage` do navegador, não no link de convite; o backend não retorna tokens de outros participantes.
- Salas são armazenadas no Cloudflare Durable Objects (SQLite), isoladas por código, com limpeza automática por alarmes após 24 horas sem alterações. Sem gravação de dados acadêmicos ou conta de estudante.
- **Limite conhecido:** sincronização por polling, não por WebSocket; reconexões e concorrência podem gerar conflitos de última escrita. O modo não possui chat, placar entre equipes ou acompanhamento remoto de professores.
- Publicação do GitHub Pages é automática conforme a configuração de produção; o backend exige implantação da classe `StopArenaRoom` e binding `STOP_ARENA_ROOM` no Cloudflare (configuração incluída em `elisonborges/anna-virtual/wrangler.toml`). A gravação no GitHub não prova que a implantação ocorreu.
- Testes de sintaxe e do motor da sala com servidor simulado foram realizados; **a implantação real e uma partida com dois aparelhos continuam sem confirmação**.

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
