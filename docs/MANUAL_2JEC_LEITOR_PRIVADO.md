# RAF-PRAZO — Manual Operacional 2º JEC (leitor de PDF)

## Documento fornecido

- Título: Manual Operacional do Estagiário na Serventia — 2º Juizado Especial Cível de Duque de Caxias/RJ.
- Edição: 10/11/2026.
- Extensão: 113 páginas.
- Autoria declarada: Rafael MS Passos.
- Classificação na página 2: **USO RESTRITO · CONTROLE INDIVIDUAL**.
- Abrange rotinas do PJe, pautas de audiência, controle, balcão físico e balcão virtual.

## Decisão de privacidade

O PDF entregue pelo autor é identificado como material restrito. Sua inclusão direta em um repositório GitHub **público** ou em arquivos servidos por GitHub Pages permitiria acesso e download por qualquer pessoa, sem controle de autorização. Portanto, esta implementação **não publica o PDF** e não cria um link público de download. Uma versão pública somente deve ser hospedada após conferência do conteúdo e autorização adequada.

## Funcionalidade implementada

1. Abra o RAF-PRAZO e escolha **Manual do 2º JEC** no menu lateral ou na Visão geral. Acesso direto via `#manual`.
2. Clique **Selecionar PDF no dispositivo** e selecione o PDF fornecido.
3. Visualize no leitor integrado, abra em nova aba ou clique **Baixar PDF**.
4. Clique **Remover arquivo** para revogar a URL local e limpar a visualização.

O navegador utiliza uma URL local `blob:` criada a partir do arquivo selecionado. O leitor não utiliza rede para transmitir o PDF, não guarda texto, não usa armazenamento do navegador e revoga a URL ao remover o documento ou deixar a página. Somente valida a assinatura inicial `%PDF-`, sem fazer auditoria de segurança ou autenticação.

## Módulos não afetados

- Motor de cálculo de prazos e regras JEC/CPC.
- 18 certidões e a categoria Pauta.
- Biblioteca de prazos e feriados.
- Balcão Virtual, pesquisa global e favoritos.

## Requisitos de testes

- `tests/test_manual_2jec.cjs`: integração, privacidade, ausência de PDF restrito no repositório.
- `tests/browser_manual_2jec.py`: seletor local, PDF de teste sintético, visualização, link download, remoção e celular.
- Demais testes do RAF-PRAZO continuam obrigatórios antes da publicação.

## Publicação pública futura

Se o órgão autorizar uma edição pública após revisão, é possível criar uma edição específica que não tenha classificação restrita, hospedá-la no repositório e habilitar links diretos para abrir e baixar. Isso exige uma decisão separada e revisão jurídica e de privacidade; não deve ser presumido.