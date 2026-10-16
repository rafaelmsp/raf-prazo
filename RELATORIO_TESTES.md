# Relatório de verificação — Raf-Prazo

**Data de construção:** 16/10/2026  
**Responsável pelo projeto:** Rafael Moraes da Silva Passos  
**Escopo:** protótipo funcional HTML5 com calendário JSON, fonte nacional gratuita e curadoria manual de atos do TJRJ.

## Verificações executadas

- [x] Sintaxe JavaScript dos scripts embutidos no HTML validada com Node.js.
- [x] Sete testes automatizados em Python concluídos com sucesso.
- [x] Modal de Termos de Uso obrigatório na primeira abertura; botão inicialmente desabilitado.
- [x] Resultado com 3 dias úteis a partir de 27/10/2026: **03/11/2026** com ato TJRJ ativado.
- [x] Desativando a opção de atos TJRJ: **30/10/2026**, demonstrando o efeito do Aviso nº 290/2026.
- [x] Exibição de fonte HTTPS oficial do TJRJ na central de atualizações.
- [x] Painéis de Alterações, Fontes e Sincronização funcionando com dados JSON.
- [x] Alternância claro/escuro.
- [x] Tutorial integrado no menu lateral.
- [x] Fallback para base incorporada quando a requisição JSON falha.
- [x] Teste visual em desktop (1366 × 768) e dispositivo estreito (390 × 844).
- [x] Nenhum erro JavaScript reportado no cenário automatizado.
- [x] Regras não promovem automaticamente Carnaval/Corpus Christi de API genérica a suspensão forense.

## Limitações e pendências de implantação

- [ ] **GitHub Pages ainda não publicado.** É necessário criar o repositório e habilitar Pages.
- [ ] **GitHub Actions ainda não executado em repositório real.** O workflow está pronto para ativação, mas sua execução pública não foi comprovada nesta etapa.
- [ ] **Consulta BrasilAPI em produção não testada neste ambiente.** Foram feitos testes de integração simulada e verificação documental do endpoint; o primeiro workflow confirmará o acesso real.
- [ ] **Atos do TJRJ não são monitorados automaticamente.** Somente registros curados manualmente afetam o cálculo.
- [ ] **Cobertura estadual e municipal não é exaustiva.** `dados/feriados-locais.json` inicia vazio.
- [ ] **Revisão jurídica do Termo de Uso e da descrição de privacidade** recomendada antes de divulgação ampla.

O relatório comprova apenas os cenários testados, não a ausência de erros ou a exatidão de qualquer prazo concreto.
