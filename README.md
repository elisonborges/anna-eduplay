# AnnA EduPlay — desenvolvimento

## Estado da branch `dev/gamelab-editor-v03`

Protótipo incremental de AnnA GameLab e Quiz Arena. A branch **não está publicada em produção**.

### GameLab
- Acesso condicionado à autenticação e autorização do portal AnnA One, via Worker de homologação.
- Criação, edição, duplicação, importação e exportação de quizzes JSON.
- Questões de múltipla escolha e verdadeiro/falso, com nível de dificuldade.
- Biblioteca de questões reutilizáveis, busca, filtros, importação/exportação JSON e exclusão individual confirmada.
- Dados armazenados em `localStorage` na origem `eduplay.annaone.com.br`.

### Quiz Arena
- Leitura dos quizzes locais criados no GameLab na mesma origem e perfil de navegador.
- Importação aditiva de arquivos JSON exportados do GameLab, sem sobrescrever os quizzes existentes.
- Jogo com pontuação, feedback, repetição e histórico local de até 20 partidas (10 exibidas).
- Exportação de quizzes em JSON e histórico em CSV (separador ponto e vírgula, UTF-8 com BOM).
- Atualização da listagem entre abas da mesma origem via evento de armazenamento.
- Limpeza voluntária do histórico; nenhum nome de aluno é solicitado.

### Limitações e segurança
- `localStorage` não sincroniza entre computadores, perfis ou navegadores. A transferência atual é manual por JSON.
- Abrir o site offline depende de o navegador já possuir os arquivos necessários; **não há suporte offline garantido por service worker** nesta etapa.
- A autorização visual do GameLab não constitui proteção de dados confidenciais em um backend. Toda API futura deverá validar a sessão e permissões no servidor.
- O Quiz Arena é público e utiliza somente dados locais importados ou previamente criados no mesmo navegador.
- Ainda não há teste funcional automatizado com navegador real nem validação completa do perfil Professor.

### Roteiro de validação antes da publicação
1. Abrir o GameLab autenticado como Master e criar um quiz com questões dos dois tipos.
2. Guardar questões na biblioteca, filtrar, duplicar e reutilizar uma questão.
3. Exportar quizzes e biblioteca JSON; verificar os arquivos.
4. Na mesma origem, abrir o Quiz Arena, jogar, conferir pontuação, resultado e histórico.
5. Em outro navegador, importar o JSON no Quiz Arena; confirmar que nenhum quiz anterior foi apagado.
6. Exportar os resultados em CSV, conferir acentos e limpar o histórico local.
7. Excluir uma questão da biblioteca e verificar que os quizzes existentes permanecem intactos.
8. Verificar comportamento sem autenticação no GameLab, sem afetar o acesso público ao Quiz Arena.
9. Testar layouts mobile, armazenamento indisponível e dados JSON inválidos.
10. Testar perfil Professor institucional quando houver conta disponível.

**Não fazer merge em `main` antes da validação funcional e da autorização explícita.**
