# Raf-Prazo 2.3 — UX premium e harmonia visual

**Revisão de interface (desktop)** · 17/10/2026

## Objetivo
Melhorar o equilíbrio visual sem modificar contagem, calendários, feriados, prazos, regras JEC/CPC ou a coleta conservadora de documentos TJRJ.

## Entrega
- **Coluna esquerda (44%)**: vencimento, duração, primeiro dia contado, dias excluídos; parâmetros e configuração retrátil imediatamente abaixo; memória e segurança na sequência.
- **Coluna direita (56%)**: calendário judicial quadrado, navegação mensal, legenda, e ficha resumida da data selecionada em telas largas.
- **Sem vencimento duplicado**: removido o banner secundário da data final no painel do calendário e seu observador DOM associado. O vencimento permanece visível no bloco de Resultado e marcado na própria grade.
- **Ficha rápida do dia**: mostra a data, dia da semana, participação na contagem (marco inicial, dia contado, vencimento ou impedimento), ressalvas de abrangência e acesso à ficha completa preexistente.
- A ficha rápida deriva exclusivamente do resultado calculado e das funções existentes `reason`, `localLegalEvent` e `extraAt`. Não cria feriados nem novas decisões jurídicas.
- **Células 7x6 quadradas**, dimensão limitada à largura disponível, sem esticar verticalmente.
- **Responsividade**: em telas muito largas a ficha fica ao lado da grade; em telas intermediárias abaixo; no celular ela é ocultada e o fluxo original se mantém (vencimento → parâmetros → calendário).
- **Acessibilidade**: cartões com texto legível, botão de consulta por teclado, manutenção da ficha de detalhes, foco visível, suporte a tema claro/escuro e preferência por movimento reduzido.

## Testes de aceitação
1. Chromium em 360, 390, 430, 1024 e 1366 px: sem rolagem horizontal e com 42 células quadradas.
2. Desktop >= 1061 px: colunas proporcionais ~44/56, com resultado e parâmetros à esquerda.
3. Em desktop largo, resumo de data junto ao calendário, sem sobreposição.
4. Selecionar uma data atualiza a ficha e continua abrindo o detalhamento completo (fonte e abrangência).
5. Sem o banner redundante `calendarDue`; vencimento da calculadora `#due` e marcação `due` da grade preservados.
6. Testes JEC/CPC, memória, pré-configurações, casos manuais e horas, sincronização e regras conservadoras TJRJ continuam válidos.
7. Após aprovação da CI, verificar GitHub Pages publicado antes de encerrar.

**Atenção:** a ficha do dia é auxiliar; dados oficiais e regra de intimação prevalecem. Não atesta tempestividade.
