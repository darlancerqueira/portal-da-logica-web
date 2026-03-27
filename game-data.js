window.GAME_DATA = {
    meta: {
        title: "Portal da Logica: Jornada Python",
        subtitle: "Uma aventura interativa para aprender logica de programacao do zero em Python.",
        intro: [
            "O mundo de Pylandia esta perdendo a energia dos Cristais da Razao.",
            "Voce sera o mentor de {hero}, uma exploradora curiosa que precisa atravessar vales, pontes, florestas e torres antigas.",
            "Cada obstaculo so pode ser resolvido com ideias de programacao em Python.",
            "A jornada foi pensada para iniciantes: primeiro entendemos o conceito, depois testamos a ideia em pequenos desafios e, por fim, aplicamos tudo em missoes mais completas.",
        ].join(" "),
        ending: [
            "Quando o ultimo selo se desfaz, o Portal da Logica volta a brilhar.",
            "{hero} atravessa a torre final com seguranca porque voce construiu, passo a passo, o raciocinio necessario para cada escolha.",
            "Mais importante do que decorar comandos foi entender como transformar um problema em etapas pequenas e resolviveis.",
            "Essa e a base de toda programacao: observar, dividir, testar e ajustar.",
        ].join(" "),
        credits: [
            "Projeto criado para servir como um primeiro jogo-estudo de Python.",
            "Agora em edicao web, tudo roda no navegador para facilitar estudo, compartilhamento e publicacao.",
        ].join(" "),
    },
    foundationGuide: [
        {
            title: "Como jogar",
            content: [
                "Cada fase apresenta um pedaco da historia, um resumo do conteudo e desafios curtos.",
                "Desafios de quiz pedem a alternativa correta. Desafios de saida pedem que voce preveja o resultado mostrado pelo codigo.",
                "Desafios de codigo pedem que voce escreva Python e envie a resposta para validacao.",
            ].join(" "),
            example: `Exemplo de envio em desafios de codigo:
numero = 3
dobro = numero * 2
print(dobro)`,
        },
        {
            title: "Pensamento logico",
            content: [
                "Sempre que um desafio parecer grande demais, divida-o.",
                "Pergunte a si mesmo: quais informacoes eu tenho, o que preciso produzir e quais passos pequenos me levam ate la?",
                "Programar e montar uma receita de cozinha para o computador seguir sem improvisar.",
            ].join(" "),
            example: `Problema: somar energias de tres cristais.
Passos:
1. Guardar os valores em variaveis.
2. Somar essas variaveis.
3. Mostrar o resultado.`,
        },
        {
            title: "Dicas para iniciantes",
            content: [
                "Erros fazem parte do processo.",
                "Se o resultado nao bater, reveja os nomes das variaveis, a indentacao dentro de if e for, e se voce retornou um valor com return quando a fase pediu isso.",
            ].join(" "),
            example: `Checklist rapido:
- O nome da funcao esta igual ao pedido?
- Usei = para guardar valor e == para comparar?
- Fechei parenteses e aspas?
- A resposta realmente faz o que o desafio pediu?`,
        },
    ],
    phases: [],
};

window.GAME_DATA.phases.push(
    {
        id: "fase_1",
        title: "Fase 1 - Vale do Despertar",
        story: [
            "{hero} desperta no Vale do Despertar diante de um obelisco apagado.",
            "As inscricoes antigas dizem que toda aventura comeca nomeando coisas e observando resultados.",
            "Para religar o obelisco, voce precisara dominar exibicao de mensagens, variaveis e contas simples.",
        ].join(" "),
        goal: "Acender o primeiro cristal usando print, variaveis e operacoes basicas.",
        reference: [
            {
                title: "print e strings",
                content: "A funcao print() mostra uma mensagem na tela. Textos em Python ficam entre aspas e sao chamados de strings.",
                example: `print("Ola, aventureira!")`,
            },
            {
                title: "Variaveis",
                content: "Variaveis guardam informacoes. O sinal = significa atribuicao: o valor da direita passa a ser armazenado com o nome da esquerda.",
                example: `nome = "Lia"
cristais = 4`,
            },
            {
                title: "Contas",
                content: "Python faz contas com operadores como +, -, * e /. Voce pode misturar numeros e variaveis nessas expressoes.",
                example: `energia_total = cristais * 3 + bonus`,
            },
        ],
        challenges: [
            {
                id: "f1_c1",
                type: "quiz",
                title: "Nomeando o mapa",
                prompt: "O obelisco pede que o nome da exploradora seja guardado em uma variavel chamada nome. Qual linha faz isso corretamente?",
                choices: [
                    `print("Lia")`,
                    `nome == "Lia"`,
                    `nome = "Lia"`,
                    `"Lia" = nome`,
                ],
                answerIndex: 2,
                hint: "Para guardar um valor em uma variavel, use atribuicao com =.",
                explanation: "A linha nome = \"Lia\" cria a variavel nome e armazena o texto. O operador == compara valores; ele nao cria variaveis.",
                successText: "O primeiro simbolo do obelisco acende. {hero} agora pode registrar o que encontra pelo caminho.",
            },
            {
                id: "f1_c2",
                type: "output",
                title: "Saudacao do vale",
                prompt: "Observe o codigo e diga exatamente o que aparecera na tela.",
                code: `nome = "Luna"
print("Bem-vinda,", nome)`,
                expectedOutput: "Bem-vinda, Luna",
                hint: "print separa os valores por espaco quando usamos virgula.",
                explanation: "Ao imprimir um texto e depois a variavel nome, o Python mostra os dois com um espaco entre eles: Bem-vinda, Luna.",
                successText: "A pedra ecoa a saudacao correta e abre uma passagem curta para o centro do vale.",
            },
            {
                id: "f1_c3",
                type: "code",
                title: "Energia do cristal",
                prompt: "{hero} encontrou 4 cristais. Cada cristal fornece 3 pontos de energia e ainda existe um bonus fixo de 2 pontos. Crie a variavel energia_total com o valor final.",
                starterCode: `cristais = 4
bonus = 2
# crie a variavel energia_total abaixo`,
                checks: [
                    {
                        type: "variable_equals",
                        name: "energia_total",
                        expected: 14,
                    },
                ],
                hint: "Primeiro multiplique cristais por 3. Depois some bonus ao resultado.",
                explanation: "A expressao correta e cristais * 3 + bonus. Ela usa as variaveis ja existentes para calcular 4 * 3 + 2, que resulta em 14.",
                successText: "O obelisco recebe energia suficiente e projeta o mapa da regiao. A primeira fase foi dominada.",
            },
        ],
        completionText: "{hero} sai do vale entendendo que programar comeca por nomear dados, realizar operacoes e observar o que o programa mostra.",
    },
    {
        id: "fase_2",
        title: "Fase 2 - Ponte das Decisoes",
        story: [
            "Uma ponte mecanica barra a passagem para o leste.",
            "O mecanismo so responde a comparacoes e escolhas.",
            "Agora {hero} precisa aprender a perguntar: uma condicao e verdadeira ou falsa?",
        ].join(" "),
        goal: "Destravar a ponte usando comparacoes, booleanos e if/else.",
        reference: [
            {
                title: "Comparacoes",
                content: "Operadores de comparacao verificam relacoes entre valores. Exemplos: ==, !=, >, <, >= e <=.",
                example: `energia >= 10`,
            },
            {
                title: "Booleanos",
                content: "Uma expressao booleana resulta em True ou False. Esses dois valores representam verdadeiro e falso.",
                example: `tem_chave = True`,
            },
            {
                title: "if e else",
                content: "if executa um bloco quando a condicao e verdadeira. else cobre o caminho contrario.",
                example: `if energia >= 10:
    print("Porta aberta")
else:
    print("Recarregar")`,
            },
        ],
        challenges: [
            {
                id: "f2_c1",
                type: "quiz",
                title: "O simbolo da igualdade",
                prompt: "Qual operador verifica se dois valores sao iguais em Python?",
                choices: ["=", "==", "!=", ">="],
                answerIndex: 1,
                hint: "= guarda valor. A comparacao usa um sinal extra.",
                explanation: "== compara valores. Ja = faz atribuicao, isto e, guarda um resultado em uma variavel.",
                successText: "A primeira trava da ponte reconhece a comparacao correta.",
            },
            {
                id: "f2_c2",
                type: "output",
                title: "Escolha do mecanismo",
                prompt: "Veja o codigo abaixo e informe a saida exibida.",
                code: `energia = 9
if energia >= 10:
    print("Porta aberta")
else:
    print("Recarregar")`,
                expectedOutput: "Recarregar",
                hint: "Compare 9 com 10 antes de decidir qual bloco roda.",
                explanation: "Como 9 nao e maior nem igual a 10, a condicao do if e falsa. Por isso o bloco do else e executado.",
                successText: "A ponte move suas placas para a configuracao correta.",
            },
            {
                id: "f2_c3",
                type: "code",
                title: "Chave e energia",
                prompt: "{hero} tem energia suficiente e uma chave da ponte. Crie a variavel porta_aberta. Ela deve ser True somente se energia for maior ou igual a 10 e tem_chave tambem for True.",
                starterCode: `energia = 12
tem_chave = True
# crie porta_aberta abaixo`,
                checks: [
                    {
                        type: "variable_equals",
                        name: "porta_aberta",
                        expected: true,
                    },
                ],
                hint: "Voce pode unir duas condicoes com and.",
                explanation: "Uma boa solucao e porta_aberta = energia >= 10 and tem_chave. As duas exigencias precisam ser verdadeiras ao mesmo tempo.",
                successText: "Com a logica montada, a ponte finalmente abaixa e libera o caminho.",
            },
        ],
        completionText: "{hero} aprende que programas tambem tomam decisoes. A partir daqui, cada caminho pode mudar de acordo com as condicoes observadas.",
    }
);

window.GAME_DATA.phases.push(
    {
        id: "fase_5",
        title: "Fase 5 - Arquivo das Memorias",
        story: [
            "No Arquivo das Memorias, milhares de artefatos estao organizados em prateleiras flutuantes.",
            "Para explorar esse lugar, {hero} precisa aprender a guardar varios valores juntos e percorre-los quando preciso.",
        ].join(" "),
        goal: "Manipular listas, acessar itens e percorrer colecoes.",
        reference: [
            {
                title: "Listas",
                content: "Listas guardam varios valores em uma unica variavel. Elas usam colchetes e itens separados por virgula.",
                example: `itens = ["corda", "mapa", "tocha"]`,
            },
            {
                title: "Indices",
                content: "Cada item da lista tem uma posicao. O primeiro item fica no indice 0, o segundo no indice 1, e assim por diante.",
                example: `primeiro = itens[0]`,
            },
            {
                title: "append e repeticao",
                content: "append adiciona um novo item ao final da lista. Tambem podemos usar for para percorrer todos os elementos.",
                example: `itens.append("chave")
for item in itens:
    print(item)`,
            },
        ],
        challenges: [
            {
                id: "f5_c1",
                type: "quiz",
                title: "Primeiro compartimento",
                prompt: "Qual indice acessa o primeiro item de uma lista?",
                choices: ["0", "1", "-1", "primeiro"],
                answerIndex: 0,
                hint: "Listas em Python comecam do zero.",
                explanation: "O primeiro elemento de uma lista fica no indice 0. Essa e uma convencao muito importante em Python e em varias linguagens.",
                successText: "Uma gaveta secreta se abre assim que a indexacao correta e usada.",
            },
            {
                id: "f5_c2",
                type: "output",
                title: "Novo item no inventario",
                prompt: "Qual numero aparece na tela depois da operacao abaixo?",
                code: `itens = ["corda", "mapa"]
itens.append("tocha")
print(len(itens))`,
                expectedOutput: "3",
                hint: "A lista comeca com 2 itens e recebe mais 1.",
                explanation: "Depois do append, a lista passa a ter tres elementos. len(itens) retorna exatamente essa quantidade.",
                successText: "As estantes se reorganizam e revelam o corredor das gemas raras.",
            },
            {
                id: "f5_c3",
                type: "code",
                title: "Catalogando gemas",
                prompt: "Crie a funcao contar_gemas_raras(gemas). A lista contem valores de energia. Conte quantas gemas tem energia maior ou igual a 7 e retorne esse total.",
                starterCode: `def contar_gemas_raras(gemas):
    total = 0
    # percorra a lista e conte as gemas raras
    return total`,
                checks: [
                    {
                        type: "function_cases",
                        name: "contar_gemas_raras",
                        cases: [
                            { args: [[4, 7, 9]], expected: 2 },
                            { args: [[1, 2, 3]], expected: 0 },
                            { args: [[7, 7, 7]], expected: 3 },
                        ],
                    },
                ],
                hint: "Use for para olhar cada valor e if para decidir se soma 1.",
                explanation: "Esse desafio junta lista, laco e condicao. E exatamente assim que muitos programas analisam colecoes de dados.",
                successText: "{hero} registra os artefatos corretos e encontra a chave da torre final.",
            },
        ],
        completionText: "Listas permitem trabalhar com conjuntos inteiros de informacoes. Agora sua logica ja enxerga mais de um valor por vez.",
    },
    {
        id: "fase_6",
        title: "Fase 6 - Torre do Guardiao",
        story: [
            "A Torre do Guardiao reune tudo o que foi aprendido.",
            "Os corredores mudam de forma, as portas exigem filtros de energia e o nucleo final so abre se a rota inteira for planejada com logica.",
        ].join(" "),
        goal: "Combinar variaveis, condicoes, repeticoes, funcoes e listas em desafios finais.",
        reference: [
            {
                title: "Planejar antes de codar",
                content: "Nos desafios finais, vale a pena escrever a estrategia mentalmente: 1. qual dado entra? 2. o que preciso devolver? 3. vou percorrer, comparar, acumular ou decidir?",
                example: `Entrada: lista de energias
Saida: apenas valores >= 10
Passos: criar lista vazia, percorrer, filtrar, retornar`,
            },
            {
                title: "Filtrando valores",
                content: "Filtrar significa percorrer uma lista e guardar apenas os itens que atendem a uma condicao.",
                example: `selecionadas = []
for valor in portas:
    if valor >= 10:
        selecionadas.append(valor)`,
            },
            {
                title: "Somando uma missao inteira",
                content: "Quando precisamos do total de uma lista, usamos um acumulador iniciado em zero e somamos cada item durante o laco.",
                example: `total = 0
for energia in energias:
    total += energia`,
            },
        ],
        challenges: [
            {
                id: "f6_c1",
                type: "quiz",
                title: "Ferramenta certa",
                prompt: "Se voce precisa percorrer todos os valores de uma lista, qual estrutura costuma ser a mais apropriada?",
                choices: ["if", "for", "return", "print"],
                answerIndex: 1,
                hint: "Pense em repeticao organizada sobre varios itens.",
                explanation: "for e a estrutura ideal para percorrer cada item de uma lista ou de outra sequencia.",
                successText: "O guardiao aceita sua estrategia e libera o primeiro corredor.",
            },
            {
                id: "f6_c2",
                type: "code",
                title: "Portas seguras",
                prompt: "Crie a funcao escolher_portas(portas). Ela recebe uma lista de energias e deve devolver uma nova lista contendo apenas os valores maiores ou iguais a 10.",
                starterCode: `def escolher_portas(portas):
    seguras = []
    # filtre apenas as portas seguras
    return seguras`,
                checks: [
                    {
                        type: "function_cases",
                        name: "escolher_portas",
                        cases: [
                            { args: [[8, 10, 12]], expected: [10, 12] },
                            { args: [[15, 3, 10]], expected: [15, 10] },
                            { args: [[]], expected: [] },
                        ],
                    },
                ],
                hint: "Crie uma lista vazia, percorra cada valor e use append quando ele passar no teste.",
                explanation: "Aqui usamos a ideia de filtro: observar item por item e guardar apenas os que atendem a condicao.",
                successText: "{hero} identifica exatamente quais portas suportam a travessia.",
            },
            {
                id: "f6_c3",
                type: "code",
                title: "Energia da expedicao",
                prompt: "Crie a funcao energia_da_missao(energias). Ela deve somar todos os valores da lista e retornar o total.",
                starterCode: `def energia_da_missao(energias):
    total = 0
    # some todas as energias
    return total`,
                checks: [
                    {
                        type: "function_cases",
                        name: "energia_da_missao",
                        cases: [
                            { args: [[3, 4, 5]], expected: 12 },
                            { args: [[10]], expected: 10 },
                            { args: [[]], expected: 0 },
                        ],
                    },
                ],
                hint: "Use um acumulador chamado total e adicione cada energia dentro do laco.",
                explanation: "Somar uma colecao inteira e uma tarefa comum em logica de programacao. O laco visita cada item e o acumulador guarda o progresso.",
                successText: "O nucleo central da torre recebe a quantidade exata de energia.",
            },
            {
                id: "f6_c4",
                type: "code",
                title: "Selo final do portal",
                prompt: "Crie a funcao liberar_portal(energias). Some todas as energias da lista. Se o total for maior ou igual a 20, retorne True. Caso contrario, retorne False.",
                starterCode: `def liberar_portal(energias):
    total = 0
    # some as energias e decida se o portal abre
    return False`,
                checks: [
                    {
                        type: "function_cases",
                        name: "liberar_portal",
                        cases: [
                            { args: [[5, 7, 8]], expected: true },
                            { args: [[10, 2]], expected: false },
                            { args: [[]], expected: false },
                        ],
                    },
                ],
                hint: "Primeiro descubra o total. Depois compare esse total com 20.",
                explanation: "Esse desafio junta tudo: lista, laco, acumulador, condicao e retorno booleano. E um excelente retrato da logica de programacao.",
                successText: "Com a decisao final correta, o Portal da Logica desperta por completo.",
            },
        ],
        completionText: "A torre foi vencida. Voce usou cada conceito como uma ferramenta e provou que ja consegue resolver problemas progressivos em Python.",
    }
);

window.GAME_DATA.phases.push(
    {
        id: "fase_3",
        title: "Fase 3 - Floresta dos Ciclos",
        story: [
            "A Floresta dos Ciclos esta cheia de caminhos repetidos, degraus em sequencia e patrulhas previsiveis.",
            "Fazer tudo manualmente seria cansativo.",
            "E hora de repetir instrucoes com inteligencia.",
        ].join(" "),
        goal: "Percorrer caminhos repetitivos usando for, range e acumuladores.",
        reference: [
            {
                title: "for",
                content: "O laco for repete um bloco para cada item de uma sequencia. Ele e excelente quando sabemos quantas repeticoes queremos.",
                example: `for passo in range(3):
    print(passo)`,
            },
            {
                title: "range",
                content: "range cria uma sequencia de numeros. range(3) gera 0, 1 e 2. range(1, 4) gera 1, 2 e 3.",
                example: `for numero in range(1, 4):`,
            },
            {
                title: "Acumuladores",
                content: "Um acumulador e uma variavel usada para somar ou reunir valores ao longo de varias repeticoes.",
                example: `total = 0
for numero in range(1, 4):
    total += numero`,
            },
        ],
        challenges: [
            {
                id: "f3_c1",
                type: "quiz",
                title: "Pegadas do range",
                prompt: "Quais numeros aparecem em range(3)?",
                choices: ["1, 2, 3", "0, 1, 2", "0, 1, 2, 3", "3, 2, 1"],
                answerIndex: 1,
                hint: "range(3) comeca do zero e para antes do 3.",
                explanation: "range(3) gera 0, 1 e 2. O limite final nao entra na sequencia.",
                successText: "As placas de madeira da trilha se alinham no ritmo certo.",
            },
            {
                id: "f3_c2",
                type: "output",
                title: "Contando passos",
                prompt: "Descubra o valor exibido pelo programa.",
                code: `passos = 0
for numero in range(1, 4):
    passos += numero
print(passos)`,
                expectedOutput: "6",
                hint: "Some 1 + 2 + 3.",
                explanation: "O laco adiciona 1, depois 2, depois 3 em passos. O total final impresso e 6.",
                successText: "A trilha de luz atravessa a neblina e mostra uma saida segura.",
            },
            {
                id: "f3_c3",
                type: "code",
                title: "Totem da repeticao",
                prompt: "Crie a funcao contar_passos(limite). Ela deve somar todos os numeros de 1 ate limite e retornar o total.",
                starterCode: `def contar_passos(limite):
    total = 0
    # use um laco para somar de 1 ate limite
    return total`,
                checks: [
                    {
                        type: "function_cases",
                        name: "contar_passos",
                        cases: [
                            { args: [1], expected: 1 },
                            { args: [3], expected: 6 },
                            { args: [5], expected: 15 },
                        ],
                    },
                ],
                hint: "range(1, limite + 1) percorre de 1 ate o valor final.",
                explanation: "Esse desafio usa um acumulador. A cada repeticao, adicionamos o numero atual ao total e retornamos o resultado no fim.",
                successText: "{hero} decifra o padrao da floresta. Repetir com criterio e muito mais poderoso do que repetir manualmente.",
            },
        ],
        completionText: "Agora voce ja sabe automatizar sequencias. Isso abre espaco para problemas maiores sem precisar escrever a mesma coisa muitas vezes.",
    },
    {
        id: "fase_4",
        title: "Fase 4 - Oficina dos Encantamentos",
        story: [
            "Na oficina antiga, magos engenheiros guardavam suas melhores rotinas em pequenos encantamentos reutilizaveis.",
            "Em Python, esses encantamentos sao funcoes.",
        ].join(" "),
        goal: "Criar e usar funcoes com parametros e retorno.",
        reference: [
            {
                title: "def",
                content: "Funcoes sao blocos nomeados que agrupam instrucoes. Elas ajudam a reutilizar logica e deixar o programa mais organizado.",
                example: `def saudacao(nome):
    return "Ola, " + nome`,
            },
            {
                title: "Parametros",
                content: "Parametros recebem valores quando a funcao e chamada. Eles fazem a mesma funcao servir para varios casos.",
                example: `saudacao("Lia")`,
            },
            {
                title: "return",
                content: "return envia um resultado para fora da funcao. Sem return, a funcao executa, mas nao entrega um valor util para outras partes do programa.",
                example: `def dobrar(valor):
    return valor * 2`,
            },
        ],
        challenges: [
            {
                id: "f4_c1",
                type: "quiz",
                title: "O papel do return",
                prompt: "Para que serve return dentro de uma funcao?",
                choices: [
                    "Para repetir o codigo varias vezes automaticamente",
                    "Para enviar um resultado de volta",
                    "Para criar uma lista vazia",
                    "Para comentar linhas de codigo",
                ],
                answerIndex: 1,
                hint: "Pense no valor que sai da funcao quando ela termina.",
                explanation: "return devolve um resultado para quem chamou a funcao. E assim que uma funcao pode calcular algo e entregar a resposta.",
                successText: "Uma engrenagem brilhante encaixa na bancada central da oficina.",
            },
            {
                id: "f4_c2",
                type: "output",
                title: "Encantamento simples",
                prompt: "Qual valor sera mostrado pelo codigo abaixo?",
                code: `def dobrar(valor):
    return valor * 2

print(dobrar(4))`,
                expectedOutput: "8",
                hint: "A funcao multiplica o numero recebido por 2.",
                explanation: "Ao chamar dobrar(4), a funcao retorna 8. O print mostra esse resultado na tela.",
                successText: "As runas da oficina respondem ao primeiro encantamento completo.",
            },
            {
                id: "f4_c3",
                type: "code",
                title: "Mensagem do arsenal",
                prompt: "Crie a funcao montar_alerta(nome, cristais). Ela deve retornar a frase no formato: 'Ayla guardou 3 cristais.'",
                starterCode: `def montar_alerta(nome, cristais):
    # retorne a frase pedida
    return ""`,
                checks: [
                    {
                        type: "function_cases",
                        name: "montar_alerta",
                        cases: [
                            { args: ["Ayla", 3], expected: "Ayla guardou 3 cristais." },
                            { args: ["Nora", 1], expected: "Nora guardou 1 cristais." },
                        ],
                    },
                ],
                hint: "Use concatenacao com str() ou uma f-string para montar o texto.",
                explanation: "Funcoes tambem podem devolver textos. Esse padrao e comum em jogos, aplicativos e sistemas que precisam formatar mensagens.",
                successText: "{hero} grava um encantamento reutilizavel no caderno de viagem.",
            },
        ],
        completionText: "Voce acabou de transformar logica em ferramentas reutilizaveis. Isso e um grande salto na forma de pensar programas.",
    }
);

window.GAME_DATA.phases.sort((left, right) => {
    const leftNumber = Number(left.id.replace("fase_", ""));
    const rightNumber = Number(right.id.replace("fase_", ""));
    return leftNumber - rightNumber;
});
