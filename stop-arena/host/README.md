# AnnA Stop Arena Host LAN — protótipo v0.1

Servidor de salas LAN para o **Multiplayer Local do Stop Arena**, reaproveitando o motor de salas do AnnA Virtual e a interface `../online/index.html`.

**Estado:** primeira versão de código implementada em branch; o fluxo do motor de salas passou em testes simulados de dois participantes. Ainda **não** há distribuição Windows pronta com `node.exe` embutido, nem validação física em computadores/celulares. Não publicar em produção antes de autorizar.

## Executar no Windows

1. Baixe a pasta completa `stop-arena/` do projeto, **mantendo `host/` e `online/` lado a lado**.
2. No computador anfitrião, execute **`host/Preparar-Runtime.cmd`** uma única vez com internet. Ele baixa uma versão oficial **Node.js 26 LTS Windows x64**, verifica o SHA-256 publicado pelo projeto Node.js e guarda apenas `host/runtime/node.exe`. O Node **não é instalado** no sistema.
3. Depois, mesmo sem internet, abra **`host/Iniciar-Stop-Arena-LAN.cmd`**. Se existir Node no PATH, o lançador também pode usá-lo como alternativa.
4. Mantenha a janela aberta. Abra no computador do professor `http://localhost:8788` e anote o endereço IPv4 mostrado, por exemplo `http://192.168.1.10:8788`.
5. Os celulares devem estar na mesma LAN e conseguir acessar o computador anfitrião. Abra **o mesmo IP e porta** no navegador dos alunos, entre em `Criar ou entrar em sala`, e informe o PIN de **7 caracteres** exibido pelo organizador.
6. O organizador começa a partida depois de entrar pelo menos 2 pessoas. Cada participante preenche respostas no próprio navegador; após o STOP todos podem votar na conferência. Os resultados são compartilhados pela rede interna.

Não depende de serviços do Cloudflare nem de conexão com a internet durante a partida. Toda sessão fica na memória do computador anfitrião: **fechar a janela ou reiniciar o servidor encerra as salas ativas**.

## Limitações da primeira versão

- O anfitrião usa HTTP na rede interna; não expor a porta 8788 na internet pública.
- Firewall do Windows: autorizar o processo apenas em **redes privadas**, se solicitado. O Wi-Fi da escola não pode bloquear a comunicação entre dispositivos (AP/client isolation). Estar na mesma faixa IP não garante comunicação.
- A IA Gemini não roda offline; a conferência coletiva e manual permanece disponível.
- A geração de QR Code ainda não foi integrada: o professor compartilha o link IP/porta e o PIN.
- As salas são mantidas em memória com expiração após 24 horas de inatividade. Não há persistência ao reiniciar.
- Windows x64 é o primeiro destino do launcher. macOS/Linux podem executar `node server.mjs` com Node.js disponível, mas não fazem parte dos testes físicos desta etapa.
- A sincronização atual usa consultas HTTP periódicas, já existentes no Cooperativo Online. O uso de WebSocket pode ser otimizado depois da validação funcional.
- Ainda não foi empacotado um executável `.exe` único. A pasta portátil funciona com `runtime/node.exe` fornecido pelo script; a distribuição final deve incluir o runtime para não exigir preparação inicial.

## Testes

Com Node 20+ disponível, execute:

```sh
node stop-arena/host/test-lan.mjs
```

O teste abre o servidor em `127.0.0.1`, cria sala, conecta dois participantes, preenche palavras diferentes na mesma categoria, vota, verifica bloqueio de campo vazio e confirma o placar de 10 pontos por categoria. O teste verifica a API e a página LAN, **não** substitui o teste real com dois smartphones.

## Organização

- `server.mjs` — servidor HTTP local, IPs LAN, sessões e rotas.
- `room-engine.mjs` — adaptação do motor de salas AnnA Virtual para Node.js local (sem Cloudflare).
- `Iniciar-Stop-Arena-LAN.cmd` — inicialização de dois cliques no Windows.
- `Preparar-Runtime.cmd` e `Preparar-Runtime.ps1` — preparação de Node portátil, com SHA-256.
- `test-lan.mjs` — teste de integração Node.
- `../online/index.html` — interface compartilhada entre LAN e internet; flag `STOP_ARENA_LAN` impede chamadas à nuvem quando servida pelo host.

**Importante:** a opção Multiplayer Local no site público abre instruções de instalação. Não tenta criar uma sala LAN no Cloudflare.
