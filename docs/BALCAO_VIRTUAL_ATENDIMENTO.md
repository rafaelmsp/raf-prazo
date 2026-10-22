# Raf-Prazo — Balcão Virtual: Atendimento

**Novo item do menu:** `Balcão Virtual — Atendimento`

**Página interna:** [Abrir diretamente no Raf-Prazo](https://rafaelmsp.github.io/raf-prazo/#balcao-virtual)

## Escopo

Biblioteca estática de **47 mensagens** em português, separadas por:

- Abertura e regras do atendimento.
- Identificação (câmera, OAB, número do processo e limite de processos).
- Consulta aos autos e mensagens de espera.
- Andamentos e conclusão ao gabinete.
- Recursos, contrarrazões e Turma Recursal.
- Audiências, pauta e link.
- Execução, bloqueio/penhora e mandados.
- Atendimento e orientações.
- Encerramento e limites de tempo/processos.

Cada cartão apresenta **assunto, título, frase completa e botão Copiar na lateral**. Há busca por texto, filtros por categoria e campo opcional para inserir o número CNJ nos modelos que possuam o marcador `[NÚMERO DO PROCESSO]`.

### Limites e fidelidade do conteúdo

- As frases que constavam literalmente nos trechos recuperados foram indicadas como *Texto-base recuperado*; complementos redigidos nesta entrega estão marcados como *Modelo complementar*.
- Cada mensagem é uma sugestão para revisão pelo servidor/estagiário antes de ser enviada, não uma resposta automática sobre a situação processual concreta.
- Regras de atendimento incluídas conforme os materiais anteriormente fornecidos pelo usuário: OAB, câmera, 10 minutos, até 3 processos e referência ao Ato Normativo Conjunto TJ/CGJ nº 15/2026. Conferir sempre a vigência e as orientações oficiais da unidade.
- As funções **não acessam Teams, PJe ou cadastro de processos**; copiar utiliza a API de clipboard do navegador e um fallback local.
- O número do processo preenchido no campo não é enviado a nenhum servidor por esse módulo e não fica gravado como dado persistente.
- A funcionalidade não altera o calendário judicial, a contagem, a memória do cálculo, a base de feriados ou a lógica do motor.

## Arquivos

- `assets/balcao-virtual.js`: biblioteca de 47 frases, busca, categorias, navegação e cópia.
- `assets/balcao-virtual.css`: interface responsiva, desktop e celular.
- `index.html` e `src/template.html`: botão no menu, CSS e JavaScript.
- `tests/test_balcao_virtual.cjs`: regressão estática da quantidade de frases, referências, botão copiar e isolamento de dados.
- `.github/workflows/atualizar.yml`: inclui o novo teste na atualização periódica.

## Como usar

Abra o Raf-Prazo, clique no menu **Balcão Virtual — Atendimento**, procure a situação desejada e use o botão **Copiar** à direita de cada mensagem. Cole no Teams e ajuste número do processo, nomes e providências efetivamente realizadas.
