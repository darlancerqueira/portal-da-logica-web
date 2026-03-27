# Portal da Logica: Jornada Python

Jogo educativo para aprender logica de programacao em Python do zero. O projeto agora tem duas edicoes:

- terminal em Python
- web com interface grafica no navegador

## Edicao web

A versao web fica pronta para abrir no navegador e para publicar depois em hospedagem estatica.

### Arquivos principais da web

- [index.html](/C:/Users/Darlan%20Cerqueira/Documents/Aprendendo/index.html)
- [styles.css](/C:/Users/Darlan%20Cerqueira/Documents/Aprendendo/styles.css)
- [app.js](/C:/Users/Darlan%20Cerqueira/Documents/Aprendendo/app.js)
- [game-data.js](/C:/Users/Darlan%20Cerqueira/Documents/Aprendendo/game-data.js)
- [py-worker.js](/C:/Users/Darlan%20Cerqueira/Documents/Aprendendo/py-worker.js)

### Como abrir localmente no navegador

1. Abra o terminal na pasta do projeto.
2. No Windows, voce tambem pode dar dois cliques em:

- [abrir_portal_web.bat](/C:/Users/Darlan%20Cerqueira/Documents/Aprendendo/abrir_portal_web.bat)

3. Se quiser o jeito mais facil por terminal, rode:

```bash
py serve_web.py
```

4. Se preferir, tambem funciona com um servidor local simples:

```bash
py -m http.server 8000
```

5. Abra no navegador:

```text
http://localhost:8000
```

### Observacoes da versao web

- o progresso fica salvo no navegador com `localStorage`
- os desafios de codigo Python rodam no browser via Pyodide
- na primeira vez, a pagina precisa de internet para carregar o laboratorio Python
- depois de publicada, outra pessoa pode acessar pelo link e jogar normalmente

## Publicar para compartilhar por link

O caminho mais simples e publicar no GitHub Pages.

1. Coloque estes arquivos em um repositorio no GitHub.
2. Nas configuracoes do repositorio, ative o GitHub Pages publicando a partir da branch principal e da pasta raiz.
3. Aguarde o GitHub gerar a URL publica.
4. Compartilhe esse link com outras pessoas.

## Edicao terminal

Se quiser continuar usando a versao antiga de terminal:

```bash
python main.py
```

Arquivos principais:

- [main.py](/C:/Users/Darlan%20Cerqueira/Documents/Aprendendo/main.py)
- [jornada_python/engine.py](/C:/Users/Darlan%20Cerqueira/Documents/Aprendendo/jornada_python/engine.py)
- [jornada_python/game_data.py](/C:/Users/Darlan%20Cerqueira/Documents/Aprendendo/jornada_python/game_data.py)
