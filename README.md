# ☭ COMMUNOPOLY ☭

Manual Não-Oficial para consultar as regras, peças, cartas e o tabuleiro do "Communopoly", com calculadora de pontuação de fim de jogo.

## ✨ Funcionalidades

- 📖 Regras gerais em cards
- ♟️ Grid de 12 peças com busca por nome/habilidade/destino e modal de detalhes
- 🚨 Regras especiais (Cadeia, Desaparecer, Contrabando)
- 🃏 Cartas No Chance e Communist Test em abas, com busca e acordeão
- 🗺️ Tabuleiro completo em ordem horária, com espaços especiais destacados e clicáveis
- 🏆 Calculadora de pontuação de fim de jogo, com campos dinâmicos por peça
- Responsivo, com suporte a tema claro/escuro do sistema

## 🚀 Rodando localmente

O `app.js` carrega `data.json` via `fetch()` precisando de um servidor. Para executar com um servidor local simples:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## ✏️ Edição de informações
- **Mudar textos das peças, cartas, regras ou tabuleiro**: edite `data.json`.
- **Mudar o que aparece no card antes de clicar**: função `renderPecas()` em `app.js`.
- **Mudar o que aparece no modal ao clicar**: função `openPecaModal()` em `app.js`.
- **Mudar fórmulas de pontuação**: objeto `CALC_FORMULAS` em `app.js`.

## 🛠️ Tecnologias

HTML, CSS e JavaScript.

## 📄 Informações
Communist Monopoly (Communopoly) é uma versão do jogo Monopoly criada por  [No Rolls Barred (NBR)](https://norollsbarred.com).
