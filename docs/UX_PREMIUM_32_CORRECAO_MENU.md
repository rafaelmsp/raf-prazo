# RAF-PRAZO — UX Premium 3.2 · Correção visual e navegação

## Problemas observados na captura
1. Sidebar larga (248 px) com rótulos ocultos pelas regras herdadas do antigo menu retrátil.
2. Botão Visão geral renderizado com dois SVGs sobrepostos.
3. Cabeçalho claro herdando texto branco da antiga identidade azul, tornando busca, menu e ações quase invisíveis.
4. Logo com fundo e texto de baixa legibilidade devido a regras CSS !important anteriores.

## Correções aplicadas
- Estado compacto real: 74 px e nomes ocultos apenas quando o menu está recolhido.
- Estado expandido real: 246 px, com nomes e categorias visíveis.
- Desktop largo (a partir de 1450 px) começa expandido; telas desktop menores iniciam compactas e podem expandir pelo botão.
- Smartphone e tablet: gaveta lateral de até 280 px, inicialmente fechada, com nomes visíveis quando aberta.
- Correção da cor de logo, busca global, tema, atualizações, botão de expansão e foco do teclado; cores adaptadas ao tema claro/escuro.
- Ícone Home único, removida a inserção duplicada.
- Hero e cartões levemente compactados para reduzir rolagem desnecessária.
- Texto do rodapé do menu atualizado para RAF-PRAZO · PREMIUM.

## Integridade
- Nenhuma modificação nos 18 modelos de certidões, nos cinco títulos com asterisco e na categoria Pauta (4).
- Não altera datas, feriados, regras JEC/CPC, bibliotecas, arquivos de fontes, comunicados TJRJ ou o mecanismo de cálculo.
- Adota o estado `menu-open` existente, preservando controles de teclado e acessibilidade e sincronizando o rótulo do menu com sua situação.
- Os arquivos index.html e src/template.html devem permanecer idênticos.

## Critérios de aceite
- Em desktop largo (~1752 px): sidebar com ~246 px, legendas visíveis e um único ícone Home.
- Em desktop médio (~1366 px): sidebar com ~74 px, abre para ~246 px por clique e volta sem deixar faixa vazia.
- Em celular (360, 390, 430 px): menu abre como gaveta, apresenta textos e fecha sem rolagem horizontal.
- Logo tem fundo escuro, texto da busca e de botões visível sobre fundo claro, e CSS do tema noturno preservado.
- Fluxos funcionais de cálculo, busca de certidões, cópia, favoritos e recentes continuam passando nos testes.

## Publicação
- Executar regressões Node/Python/Chromium em CI, revisar screenshots e publicar após aprovação do PR.