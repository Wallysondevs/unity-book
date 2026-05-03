import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "csharp-intro",
    section: "csharp-unity",
    title: "Introdução ao C# no Unity",
    difficulty: "iniciante",
    subtitle: "Por que o Unity escolheu C# e como pensar em código dentro de uma engine de jogos.",
    intro: `Imagine que a Unity é uma cozinha enorme, cheia de ingredientes prontos: modelos 3D, sons, físicas, partículas. Você é o chef. Mas para combinar esses ingredientes em uma receita que faça sentido (um inimigo que persegue o jogador, uma porta que abre quando você se aproxima, um placar que sobe quando você coleta uma moeda) você precisa dar instruções claras. Essas instruções são escritas em uma linguagem de programação, e a linguagem oficial da Unity é o C#.

C# (lê-se "C sharp") foi criado pela Microsoft no início dos anos 2000. É uma linguagem moderna, com sintaxe parecida com Java e C++, mas pensada para ser mais segura e produtiva. A Unity adotou C# porque ele tem uma vantagem rara: é fácil o suficiente para iniciantes lerem, e ao mesmo tempo poderoso o suficiente para grandes estúdios usarem em produção. Jogos como Hollow Knight, Cuphead, Among Us, Cities: Skylines e Genshin Impact foram feitos em Unity com C#.

A grande sacada é entender que, dentro da Unity, você quase nunca escreve um programa "do zero" como faria em um console. Em vez disso, você escreve pequenos pedaços de comportamento chamados scripts, e cada script vira um Component que você cola em um GameObject (o objeto da cena: um cubo, um personagem, uma câmera). A engine fica chamando funções específicas do seu script no momento certo, por exemplo Start quando o jogo começa e Update a cada frame. Você nunca precisa escrever o "loop principal" do jogo, ele já existe.

Por isso, aprender C# para Unity não é só aprender a linguagem. É aprender a pensar em termos de componentes, eventos e tempo. Neste capítulo você vai ver o esqueleto de um script Unity típico, entender de onde vem o famoso MonoBehaviour e por que existem os métodos Start e Update. Nos capítulos seguintes a gente decompõe cada conceito (variáveis, condicionais, classes) sempre amarrando em situações reais de jogo.

Uma observação importante: para acompanhar este livro, basta ter o Unity Hub instalado, qualquer versão LTS (a mais comum hoje é a 2022.3 ou 6 LTS) e o Visual Studio Community ou o VS Code com a extensão de C#. Não é preciso instalar nada de C# separadamente, a Unity já traz tudo.`,
    codes: [
      {
        lang: "csharp",
        code: `// Este é o esqueleto de um script Unity típico.
// Salve em Assets/Scripts/MeuPrimeiroScript.cs e arraste para um GameObject.
using UnityEngine; // dá acesso a tudo da engine: Debug, Vector3, GameObject...

// O nome da classe DEVE ser igual ao nome do arquivo.
// MonoBehaviour é a classe base de todo script Unity que vira componente.
public class MeuPrimeiroScript : MonoBehaviour
{
    // Start é chamado UMA vez, quando o objeto entra em cena.
    void Start()
    {
        Debug.Log("Olá, Unity! O jogo começou.");
    }

    // Update é chamado A CADA FRAME (60+ vezes por segundo).
    void Update()
    {
        // Cuidado: tudo que estiver aqui roda muito! Não imprima coisas pesadas.
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Exemplo prático: girar um cubo continuamente.
// Cole em um cubo qualquer da cena e aperte Play.
using UnityEngine;

public class CuboGiratorio : MonoBehaviour
{
    // public significa que aparece no Inspector da Unity para você editar.
    public float velocidade = 90f; // graus por segundo

    void Update()
    {
        // transform é o componente de posição/rotação/escala do GameObject.
        // Time.deltaTime = quanto tempo passou desde o frame anterior.
        // Multiplicar pela velocidade deixa o movimento independente do FPS.
        transform.Rotate(0f, velocidade * Time.deltaTime, 0f);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Lista resumida das principais "mensagens" que a Unity chama no seu script.
using UnityEngine;

public class CicloDeVida : MonoBehaviour
{
    void Awake()  { /* chamado antes de Start, ideal para preparar referências */ }
    void OnEnable() { /* chamado toda vez que o objeto é ativado */ }
    void Start()  { /* chamado uma vez, depois de todos os Awake */ }
    void Update() { /* a cada frame, lógica de jogo geral */ }
    void FixedUpdate() { /* intervalo fixo, ideal para física (Rigidbody) */ }
    void LateUpdate()  { /* depois do Update, ideal para câmera seguir player */ }
    void OnDisable() { /* quando o objeto é desativado */ }
    void OnDestroy() { /* quando o objeto é destruído */ }
}`,
      },
      {
        lang: "bash",
        code: `# No terminal, dentro da pasta do projeto, você pode listar os scripts.
# Mas, na prática, tudo é gerenciado pela Unity Editor.
ls Assets/Scripts/
# Saída esperada: MeuPrimeiroScript.cs   CuboGiratorio.cs   ...`,
      },
    ],
    points: [
      "C# é a linguagem oficial e única para scripts de gameplay no Unity moderno.",
      "Todo script de comportamento herda de MonoBehaviour para virar um Component.",
      "O nome do arquivo .cs deve ser idêntico ao nome da classe pública.",
      "Start roda uma vez; Update roda a cada frame; FixedUpdate roda em intervalo fixo.",
      "Você nunca escreve o loop principal: a engine chama suas funções na hora certa.",
      "Multiplique sempre por Time.deltaTime quando o movimento depender do tempo.",
      "Armadilha comum: colocar lógica pesada dentro de Update e travar o jogo.",
    ],
    alerts: [
      {
        type: "info",
        content: "UnityScript (uma variante de JavaScript) e Boo foram suportados no passado, mas estão extintos desde a Unity 2017. Hoje é só C#, e qualquer tutorial que mostre 'function Update()' está obsoleto.",
      },
      {
        type: "tip",
        content: "Sempre que criar um script, crie pela Unity (Project > Create > C# Script) em vez de criar o .cs no explorador de arquivos. A Unity gera o template correto e evita que o nome da classe fique diferente do nome do arquivo.",
      },
      {
        type: "warning",
        content: "Não confunda Update com FixedUpdate. Movimento por transform vai em Update. Movimento por Rigidbody (forças, velocidade física) vai em FixedUpdate, senão a física fica trêmula.",
      },
    ],
  },
  {
    slug: "variaveis",
    section: "csharp-unity",
    title: "Variáveis em C#",
    difficulty: "iniciante",
    subtitle: "Caixinhas com nome para guardar vida, posição, score e qualquer dado do jogo.",
    intro: `Quando você joga qualquer jogo, o computador precisa lembrar de um monte de coisas ao mesmo tempo: quanta vida o jogador tem, em qual posição está, quantos inimigos faltam derrotar, qual é o score atual. Cada uma dessas informações precisa ser guardada em algum lugar da memória do computador. Esse lugar é o que chamamos de variável.

Pense numa variável como uma caixinha etiquetada. A etiqueta é o nome (por exemplo, "vidaDoPlayer") e dentro da caixa tem um valor (por exemplo, 100). Você pode olhar dentro da caixa quando quiser, e pode trocar o valor quando o jogo precisar (quando o player toma dano, você abaixa o número). A diferença em relação a guardar valores soltos no código é que a variável tem nome, e isso permite que o resto do programa use ela em qualquer ponto.

Em C#, diferente de Python ou JavaScript, toda variável tem um tipo fixo. Você precisa avisar logo de cara o que vai dentro: um número inteiro (int), um número com vírgula (float), um texto (string), um valor verdadeiro ou falso (bool), um vetor 3D (Vector3) e por aí vai. Isso parece chato no começo, mas evita uma quantidade enorme de bugs. Se você jurou que vidaDoPlayer é um int, o compilador não deixa você acidentalmente colocar um texto lá.

Outro detalhe importante no Unity: variáveis declaradas com a palavra public dentro de um MonoBehaviour aparecem automaticamente no Inspector. Isso significa que você pode ajustar valores (velocidade, vida máxima, dano da arma) direto no Editor, sem precisar mexer no código. Esse é um dos maiores superpoderes do C# dentro do Unity, e a gente vai usar muito daqui para frente. Já variáveis private ficam escondidas do Inspector e do resto do código de fora, e são a opção padrão quando o valor é assunto interno do script.`,
    codes: [
      {
        lang: "csharp",
        code: `// Exemplo: ficha do player com várias variáveis.
using UnityEngine;

public class FichaDoPlayer : MonoBehaviour
{
    // public = aparece no Inspector e pode ser lido por outros scripts.
    public string nomeDoHeroi = "Aria";
    public int vida = 100;            // número inteiro
    public float velocidade = 5.5f;   // float precisa do "f" no fim
    public bool estaVivo = true;      // bool guarda true ou false

    // private = só este script enxerga. É o padrão quando você omite a palavra.
    private int golpesRecebidos = 0;

    void Start()
    {
        Debug.Log("Herói: " + nomeDoHeroi + " com " + vida + " HP");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Você pode trocar o valor de uma variável a qualquer momento.
using UnityEngine;

public class TomarDano : MonoBehaviour
{
    public int vida = 100;

    void Update()
    {
        // Quando a tecla espaço é pressionada, perde 10 de vida.
        if (Input.GetKeyDown(KeyCode.Space))
        {
            vida = vida - 10;       // ou, mais curto: vida -= 10;
            Debug.Log("Vida agora: " + vida);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// var deixa o compilador descobrir o tipo sozinho (inferência).
// Útil quando o tipo é óbvio à direita; não funciona em campos public no Inspector.
using UnityEngine;

public class InferenciaDeTipo : MonoBehaviour
{
    void Start()
    {
        var pontos = 10;                  // int
        var apelido = "GuerreiroX";       // string
        var posicao = new Vector3(0, 1, 0); // Vector3
        var ehBoss = false;               // bool

        Debug.Log(pontos + " " + apelido + " " + posicao + " " + ehBoss);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// const e readonly: valores que não mudam.
using UnityEngine;

public class Constantes : MonoBehaviour
{
    // const: precisa ser conhecido em tempo de compilação.
    public const int VIDA_MAXIMA = 100;

    // readonly: pode ser definido só no Inspector ou no construtor.
    [SerializeField] private float velocidadeBase = 4f;

    void Start()
    {
        // VIDA_MAXIMA = 200; // ERRO: const não pode ser alterado.
        Debug.Log("Vida máxima permitida: " + VIDA_MAXIMA);
    }
}`,
      },
    ],
    points: [
      "Toda variável em C# tem um tipo fixo, declarado antes do nome.",
      "public expõe a variável no Inspector da Unity; private não.",
      "[SerializeField] permite expor variáveis private no Inspector mantendo o encapsulamento.",
      "Use float (com 'f' no fim) para números com casas decimais; int para inteiros.",
      "var deixa o C# inferir o tipo, mas só dentro de métodos.",
      "const guarda valores que nunca mudam, como VIDA_MAXIMA.",
      "Mudar variáveis no Inspector durante o Play não persiste depois que para o jogo.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Prefira [SerializeField] private ao invés de public. Você expõe no Inspector mas impede que outros scripts mexam direto. Isso facilita debug e evita bugs em projetos maiores.",
      },
      {
        type: "warning",
        content: "Esquecer o 'f' em 5.5f gera um erro de compilação dizendo que double não pode virar float automaticamente. Em Unity, use sempre float, não double, em valores de gameplay.",
      },
      {
        type: "info",
        content: "Mudou um valor public no script depois de já ter colocado o componente no objeto? Pode ser que a Unity mantenha o valor antigo do Inspector. Use o menu de contexto > Reset para voltar ao default.",
      },
    ],
  },
  {
    slug: "tipos-primitivos",
    section: "csharp-unity",
    title: "Tipos primitivos do C#",
    difficulty: "iniciante",
    subtitle: "int, float, bool, string e os tipos especiais do Unity como Vector3.",
    intro: `Se variáveis são caixinhas, os tipos primitivos são os formatos dessas caixinhas. Em C#, você não pode jogar qualquer coisa em qualquer variável: cada caixa só aceita um tipo de conteúdo. Isso parece uma limitação, mas na verdade é uma proteção. O compilador vai te avisar antes mesmo de rodar o jogo se você tentar somar um texto com um vetor, por exemplo.

Os tipos primitivos mais usados em jogos são poucos e dá para decorar rápido. int guarda números inteiros (idade, pontuação, número de balas). float guarda números com vírgula (velocidade, tempo, posição). bool guarda verdadeiro ou falso (estaVivo, tocouChao, portaAberta). string guarda texto (nome do jogador, mensagens de UI). Esses quatro cobrem talvez 70% das variáveis que você vai criar.

Existem também tipos numéricos menos comuns que aparecem de vez em quando: double (float com mais precisão, quase nunca necessário em Unity), long (int gigante para números acima de 2 bilhões), byte (número de 0 a 255, usado em cor), char (um caractere só, como 'A'). E tem dois tipos do Unity que você vai usar o tempo todo, mesmo que não sejam exatamente "primitivos": Vector2 e Vector3, que guardam pares e trios de números (geralmente posições e direções).

Saber qual tipo escolher é parte da arte. Vida do player normalmente é int (não faz sentido ter 87.3 de vida). Velocidade é float (5.5 metros por segundo). Nome é string. Posição no mundo é Vector3. Acertar isso desde o início evita conversões chatas depois e deixa a intenção do código clara para quem lê.`,
    codes: [
      {
        lang: "csharp",
        code: `// Os principais tipos primitivos com exemplos de jogo.
using UnityEngine;

public class TiposBasicos : MonoBehaviour
{
    // Inteiros: vida, munição, score, número de inimigos.
    public int vida = 100;
    public int municao = 30;
    public int score = 0;

    // Floats: velocidade, tempo, dano com casas decimais.
    public float velocidade = 5.5f;
    public float tempoDeRecarga = 1.25f;

    // Booleans: estados ligado/desligado.
    public bool estaPulando = false;
    public bool temChave = false;

    // Strings: textos.
    public string nome = "Player 1";

    // Vector3: posição, direção, escala em 3D.
    public Vector3 spawnInicial = new Vector3(0f, 1f, 0f);

    // Vector2: igual ao Vector3, mas só X e Y. Comum em 2D ou UI.
    public Vector2 inputDeMovimento = Vector2.zero;
}`,
      },
      {
        lang: "csharp",
        code: `// Conversões entre tipos: nem sempre são automáticas.
using UnityEngine;

public class Conversoes : MonoBehaviour
{
    void Start()
    {
        int vidaInteira = 100;
        float vidaComCasas = vidaInteira; // int vira float automaticamente

        float dano = 12.7f;
        int danoInteiro = (int)dano;      // float -> int precisa de cast (joga decimais fora)
        Debug.Log(danoInteiro);            // 12

        // string para número: use Parse ou TryParse.
        string textoDigitado = "42";
        int numero = int.Parse(textoDigitado);
        Debug.Log(numero + 1);             // 43

        // Número para string: ToString ou interpolação.
        int score = 250;
        string mensagem = $"Score: {score}"; // o $ ativa interpolação
        Debug.Log(mensagem);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Limites dos tipos: cuidado com overflow.
using UnityEngine;

public class LimitesDosTipos : MonoBehaviour
{
    void Start()
    {
        Debug.Log(int.MaxValue);   // 2.147.483.647
        Debug.Log(int.MinValue);   // -2.147.483.648

        // Se você somar 1 ao MaxValue, o número "vira" para o lado negativo.
        int x = int.MaxValue;
        x = x + 1;
        Debug.Log(x); // -2147483648 (overflow silencioso)

        // Para valores absurdamente grandes, use long.
        long pontuacaoGigante = 9000000000L;
        Debug.Log(pontuacaoGigante);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Vector3: o tipo mais usado em jogos 3D.
using UnityEngine;

public class UsandoVector3 : MonoBehaviour
{
    void Start()
    {
        Vector3 posicao = transform.position;        // pega a posição atual
        Vector3 cima = Vector3.up;                    // (0, 1, 0)
        Vector3 frente = transform.forward;          // direção que o objeto olha

        // Operações vetoriais funcionam como números.
        Vector3 novaPosicao = posicao + cima * 2f;   // sobe 2 metros
        transform.position = novaPosicao;

        // Distância entre dois pontos.
        Vector3 alvo = new Vector3(10, 0, 0);
        float distancia = Vector3.Distance(posicao, alvo);
        Debug.Log("Distância até o alvo: " + distancia);
    }
}`,
      },
    ],
    points: [
      "Os tipos mais usados em jogos: int, float, bool, string e Vector3.",
      "Use float (com 'f') para qualquer coisa com casa decimal em Unity.",
      "int para contadores discretos (vida, munição, score, inimigos).",
      "Conversão de float para int é explícita e descarta os decimais.",
      "Use $\"texto {variavel}\" para concatenar com clareza (interpolação de string).",
      "Vector3 é tipo do Unity, não do C# puro, mas se comporta como primitivo.",
      "Cuidado com overflow: int.MaxValue + 1 vira número negativo sem aviso.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Prefira sempre interpolação de string ($\"...\") ao invés de \"a\" + b + \"c\". Fica mais legível e o compilador otimiza melhor.",
      },
      {
        type: "warning",
        content: "Comparar floats com == quase nunca dá certo por causa de imprecisão binária. Use Mathf.Approximately(a, b) ou compare a diferença com um pequeno epsilon.",
      },
      {
        type: "info",
        content: "Em jogos para mobile, prefira int ao invés de long e float ao invés de double. A diferença em CPU e memória pode parecer pequena, mas em loops grandes faz efeito real.",
      },
    ],
  },
  {
    slug: "operadores",
    section: "csharp-unity",
    title: "Operadores",
    difficulty: "iniciante",
    subtitle: "Como combinar valores: somar dano, comparar vida, alternar booleans.",
    intro: `Toda lógica de jogo no fundo é uma sequência de pequenas operações: somar pontos, subtrair vida, comparar se a distância é menor que 5 metros, verificar se o jogador apertou um botão e se a porta está fechada ao mesmo tempo. Para fazer essas operações, o C# oferece os operadores. São símbolos curtos e diretos que combinam valores e produzem resultados.

Os operadores caem em três grandes famílias. A primeira é a aritmética: +, -, *, / e % (resto da divisão). Esses são os que você já conhece da matemática da escola, com uma pegadinha: dividir dois inteiros joga as casas decimais fora (5 / 2 dá 2, não 2.5). Para divisão real, pelo menos um dos lados precisa ser float.

A segunda família é a de comparação: ==, !=, <, >, <=, >=. Eles sempre retornam true ou false, e são o coração de qualquer condicional. "A vida está menor que 20?" é uma comparação. "O inimigo está vivo?" é outra. Atenção especial ao == (compara) versus = (atribui), que é a fonte clássica de bug em quem está começando.

A terceira é a lógica: && (E), || (OU), ! (NÃO). Eles combinam booleans para tomar decisões compostas. "Se o player está vivo E tem munição, pode atirar". "Se o inimigo morreu OU saiu da tela, remove ele". E ainda existem os operadores de atribuição compostos (+=, -=, *=, /=) que são atalhos super úteis: vida -= 10 é o mesmo que vida = vida - 10. Você vai escrever isso o tempo todo.`,
    codes: [
      {
        lang: "csharp",
        code: `// Operadores aritméticos básicos.
using UnityEngine;

public class Aritmetica : MonoBehaviour
{
    void Start()
    {
        int vida = 100;
        int dano = 25;

        Debug.Log(vida + dano); // 125
        Debug.Log(vida - dano); // 75
        Debug.Log(vida * 2);    // 200
        Debug.Log(vida / 3);    // 33 (divisão inteira, joga 0.33 fora)
        Debug.Log(vida % 7);    // 2 (resto da divisão)

        // Para divisão real, use floats.
        float meiaVida = vida / 3f; // 33.33...
        Debug.Log(meiaVida);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Operadores de comparação. Sempre devolvem bool.
using UnityEngine;

public class Comparacao : MonoBehaviour
{
    void Start()
    {
        int vida = 50;
        int vidaMaxima = 100;

        Debug.Log(vida == vidaMaxima); // false (igual a)
        Debug.Log(vida != vidaMaxima); // true  (diferente de)
        Debug.Log(vida < vidaMaxima);  // true
        Debug.Log(vida > vidaMaxima);  // false
        Debug.Log(vida <= 50);          // true (menor ou igual)
        Debug.Log(vida >= 51);          // false

        // Erro clássico: usar = (atribuição) ao invés de == (comparação).
        // if (vida = 0) { } // ERRO: não compila, vida é int não bool.
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Operadores lógicos: combinar condições.
using UnityEngine;

public class LogicaDeCombate : MonoBehaviour
{
    public int vida = 80;
    public int municao = 5;
    public bool estaEmCobertura = false;

    void Update()
    {
        // && significa E (ambos precisam ser verdadeiros).
        bool podeAtirar = vida > 0 && municao > 0;

        // || significa OU (basta um ser verdadeiro).
        bool emPerigo = vida < 20 || municao == 0;

        // ! inverte: !verdadeiro = falso.
        bool exposto = !estaEmCobertura;

        if (podeAtirar && exposto)
        {
            Debug.Log("Pode atirar e está exposto. Cuidado!");
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Operadores compostos: atalhos do dia a dia.
using UnityEngine;

public class Atalhos : MonoBehaviour
{
    int score = 0;
    int vida = 100;
    int combo = 1;

    void Update()
    {
        // += soma e atribui no mesmo passo.
        score += 10;        // mesmo que score = score + 10;

        // -= subtrai
        vida -= 5;          // perdeu 5 de vida

        // *= multiplica
        combo *= 2;         // dobrou o combo

        // ++ incrementa em 1
        combo++;            // combo agora é combo + 1

        // -- decrementa em 1
        vida--;             // vida agora é vida - 1
    }
}`,
      },
    ],
    points: [
      "Aritméticos: + - * / % fazem as contas básicas.",
      "Divisão entre inteiros descarta as casas decimais (5 / 2 = 2).",
      "Comparação sempre devolve true ou false: == != < > <= >=.",
      "Lógicos combinam booleans: && (E), || (OU), ! (NÃO).",
      "Atribuições compostas (+= -= *= /=) são atalhos clássicos do dia a dia.",
      "++ e -- somam ou subtraem 1, muito usados em contadores e índices.",
      "Cuidado: = atribui valor, == compara igualdade. Trocar os dois é erro clássico.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Em C#, dividir dois inteiros descarta as casas decimais. Se você precisa do resultado real, transforme um deles em float: (float)a / b ou a / b * 1f.",
      },
      {
        type: "tip",
        content: "Aproveite o curto-circuito do && e ||. Em 'if (alvo != null && alvo.estaVivo)', a segunda parte só roda se a primeira for true. Isso evita NullReferenceException de graça.",
      },
      {
        type: "info",
        content: "O operador % (módulo) é ouro para coisas como alternar entre opções (i % 2 detecta par/ímpar) ou fazer coisas a cada N frames (Time.frameCount % 60 == 0 dispara uma vez por segundo a 60 FPS).",
      },
    ],
  },
  {
    slug: "condicionais",
    section: "csharp-unity",
    title: "Condicionais (if, else, switch)",
    difficulty: "iniciante",
    subtitle: "Como o jogo toma decisões: se o player tem vida, então faz isso, senão aquilo.",
    intro: `Um jogo é, no fundo, uma máquina de tomar decisões. A cada frame, dezenas de perguntas precisam ser respondidas: o jogador apertou pulo? a vida chegou a zero? o inimigo está dentro do raio de detecção? a porta está trancada? Cada uma dessas perguntas vira uma condição no código, e o que acontece dependendo da resposta é o que dá vida ao jogo.

A ferramenta mais básica para isso é o if. A ideia é diretíssima: SE alguma coisa for verdadeira, ENTÃO faça este bloco. Se quiser outra ação para quando for falsa, usa o else. Quando há várias possibilidades em sequência, usa o else if. O C# vai checando uma a uma, na ordem, e para na primeira que der verdadeira. Por isso a ordem importa, especialmente quando as condições têm sobreposição.

Para situações em que você está testando uma única variável contra muitos valores possíveis (qual nível selecionado, qual estado do jogo, qual tipo de inimigo), o switch é mais limpo do que uma cascata de if/else if. Cada case representa um valor possível, e o break encerra aquele bloco. A partir do C# 8, existe também a forma "switch expression", que é mais compacta e devolve um valor direto.

Uma armadilha clássica de iniciante é o aninhamento exagerado, conhecido como "pirâmide do destino": ifs dentro de ifs dentro de ifs até o código andar para o lado da tela. Quase sempre dá para reescrever isso usando guards (saídas antecipadas com return) ou condições combinadas com && e ||. Código limpo lê de cima para baixo, sem precisar acompanhar dez níveis de indentação.`,
    codes: [
      {
        lang: "csharp",
        code: `// if simples e if/else: a estrutura mais básica.
using UnityEngine;

public class VerificarVida : MonoBehaviour
{
    public int vida = 30;

    void Update()
    {
        if (vida <= 0)
        {
            Debug.Log("Game Over!");
        }
        else if (vida < 25)
        {
            Debug.Log("Cuidado, vida baixa!");
        }
        else
        {
            Debug.Log("Tudo certo.");
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Combinando condições com && e ||.
using UnityEngine;

public class TentarAbrirPorta : MonoBehaviour
{
    public bool temChave = true;
    public bool portaTrancada = true;
    public float distanciaDaPorta = 1.5f;

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.E))
        {
            // Só abre se está perto E (tem chave OU a porta não está trancada).
            if (distanciaDaPorta < 2f && (temChave || !portaTrancada))
            {
                Debug.Log("Porta aberta!");
            }
            else
            {
                Debug.Log("Não consegue abrir.");
            }
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// switch: ideal quando você compara uma variável contra muitos valores.
using UnityEngine;

public class EstadoDoJogo : MonoBehaviour
{
    public enum Estado { Menu, Jogando, Pausado, GameOver }
    public Estado estadoAtual = Estado.Menu;

    void Update()
    {
        switch (estadoAtual)
        {
            case Estado.Menu:
                Debug.Log("Aperte Start para jogar.");
                break;

            case Estado.Jogando:
                // ... lógica principal de jogo
                break;

            case Estado.Pausado:
                Debug.Log("Pausado. Aperte P para voltar.");
                break;

            case Estado.GameOver:
                Debug.Log("Fim de jogo. Aperte R para reiniciar.");
                break;

            default:
                Debug.LogWarning("Estado não previsto!");
                break;
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Operador ternário: um if expressivo numa linha só.
// condicao ? valorSeVerdadeiro : valorSeFalso
using UnityEngine;

public class Ternario : MonoBehaviour
{
    public int vida = 80;

    void Start()
    {
        string status = vida > 50 ? "Saudável" : "Ferido";
        Debug.Log("Status: " + status);

        // Cor da barra de vida.
        Color cor = vida > 30 ? Color.green : Color.red;
        Debug.Log(cor);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Padrão "guard clause": evita aninhamento profundo.
using UnityEngine;

public class Atirar : MonoBehaviour
{
    public int municao = 5;
    public bool estaVivo = true;
    public float cooldown = 0f;

    void Update()
    {
        // Em vez de aninhar 3 ifs, sai cedo se algo falha.
        if (!estaVivo) return;
        if (municao <= 0) return;
        if (cooldown > 0f) return;

        // Só chega aqui se todas as condições passaram.
        Debug.Log("Bang! Tiro disparado.");
        municao--;
        cooldown = 0.5f;
    }
}`,
      },
    ],
    points: [
      "if executa um bloco quando a condição é verdadeira; else é o oposto.",
      "else if encadeia múltiplas alternativas e para na primeira verdadeira.",
      "switch é mais limpo que cascatas de if/else quando se compara um valor contra muitos.",
      "Sempre coloque break no fim de cada case (ou o C# avisa em erro).",
      "Operador ternário (cond ? a : b) deixa atribuições simples em uma linha.",
      "Guard clauses (if ... return) evitam aninhamentos profundos e melhoram a leitura.",
      "Use enum + switch para estados de jogo: fica explícito e fácil de manter.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Quando um if cresce mais de 3 níveis aninhados, pare e refatore. Quase sempre dá para extrair um método ou usar guard clauses para baixar a complexidade.",
      },
      {
        type: "warning",
        content: "switch sem break em algum case gera erro de compilação em C# (diferente de C/Java). Não esqueça do break ou do return em cada case.",
      },
      {
        type: "info",
        content: "A partir do C# 8 dá para usar 'switch expressions' (var msg = estado switch { Menu => ..., });. Mais compacto e devolve um valor diretamente. Funciona bem em Unity moderno.",
      },
    ],
  },
  {
    slug: "loops",
    section: "csharp-unity",
    title: "Loops (for, while, foreach)",
    difficulty: "iniciante",
    subtitle: "Repetir ações: spawnar dez inimigos, varrer uma lista de itens, esperar até a vida zerar.",
    intro: `Em programação, sempre que você precisar repetir alguma coisa, pense em loop. Spawnar 10 inimigos no início da fase, percorrer uma lista de itens do inventário para somar o peso, atirar uma rajada de balas a cada intervalo de tempo, esperar o jogador apertar um botão antes de prosseguir. Tudo isso é repetição, e em vez de copiar e colar dez vezes a mesma instrução, você usa um loop.

O C# oferece três tipos principais de loops e cada um tem seu jeito de pensar. O for é o clássico contador: você sabe exatamente quantas vezes quer repetir e usa uma variável (geralmente i) que vai de um número inicial até um número final. É a opção natural para "faça isto 10 vezes" ou "para cada índice da lista de 0 a Length - 1".

O while é o loop condicional: ele continua repetindo enquanto uma condição for verdadeira. Você usa quando não sabe de antemão quantas vezes vai repetir. "Continue caindo enquanto não tocar o chão", "continue gerando inimigos enquanto a fase estiver ativa". Existe também o do/while, que garante pelo menos uma execução antes de checar a condição.

O foreach é o mais elegante para varrer coleções (listas, arrays, dicionários). Em vez de gerenciar um índice à mão, você diz "para cada inimigo na lista de inimigos, faça isso". O risco do loop é o loop infinito, que trava o Unity inteiro porque o frame nunca termina. Sempre garanta que sua condição vai virar falsa em algum momento, ou que você tem um break para sair. Em jogo, lembre que loops dentro de Update rodam dezenas de vezes por segundo, então mantenha eles enxutos.`,
    codes: [
      {
        lang: "csharp",
        code: `// Loop for clássico: spawnar 10 inimigos.
using UnityEngine;

public class SpawnarInimigos : MonoBehaviour
{
    public GameObject prefabInimigo;

    void Start()
    {
        // i começa em 0, vai até 9, soma 1 a cada volta.
        for (int i = 0; i < 10; i++)
        {
            Vector3 posicao = new Vector3(i * 2f, 0f, 0f);
            Instantiate(prefabInimigo, posicao, Quaternion.identity);
            Debug.Log("Spawnei o inimigo número " + i);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// while: repete enquanto uma condição for verdadeira.
using UnityEngine;

public class GastarMunicao : MonoBehaviour
{
    public int municao = 5;

    void Start()
    {
        while (municao > 0)
        {
            Debug.Log("Bang! Restam " + (municao - 1));
            municao--;
        }
        Debug.Log("Acabou a munição.");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// foreach: percorre cada item de uma coleção.
using UnityEngine;
using System.Collections.Generic;

public class SomarPesoDoInventario : MonoBehaviour
{
    public List<float> pesosDosItens = new List<float> { 1.5f, 0.3f, 4.0f, 2.2f };

    void Start()
    {
        float total = 0f;
        foreach (float peso in pesosDosItens)
        {
            total += peso;
        }
        Debug.Log("Peso total: " + total + " kg");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// break e continue: controles finos dentro do loop.
using UnityEngine;

public class ProcurarPrimeiroVivo : MonoBehaviour
{
    public int[] vidasDosInimigos = { 0, 0, 50, 0, 80 };

    void Start()
    {
        for (int i = 0; i < vidasDosInimigos.Length; i++)
        {
            // continue: pula para a próxima iteração.
            if (vidasDosInimigos[i] <= 0)
            {
                continue; // morto, ignora
            }

            Debug.Log("Primeiro inimigo vivo: índice " + i);

            // break: sai do loop imediatamente.
            break;
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// CUIDADO: loop infinito trava o Unity inteiro.
using UnityEngine;

public class CuidadoLoopInfinito : MonoBehaviour
{
    void Start()
    {
        int contador = 0;

        // ESTE LOOP NUNCA TERMINA porque eu esqueci o contador++.
        // while (contador < 10)
        // {
        //     Debug.Log("Travei o Unity!");
        // }

        // Forma correta:
        while (contador < 10)
        {
            Debug.Log("Volta " + contador);
            contador++; // garante que vai sair em algum momento
        }
    }
}`,
      },
    ],
    points: [
      "for é ideal quando você sabe quantas iterações fazer.",
      "while repete enquanto a condição for verdadeira.",
      "foreach percorre coleções sem você precisar gerenciar índice.",
      "break sai do loop imediatamente; continue pula para a próxima volta.",
      "Sempre garanta que a condição do while pode virar falsa, ou trava o Unity.",
      "Loops dentro de Update rodam dezenas de vezes por segundo, mantenha enxutos.",
      "foreach pode gerar garbage em loops apertados; em código de performance crítica use for.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Loop infinito dentro de Start ou Update congela a Editor inteira. Você vai precisar matar a Unity pelo gerenciador de tarefas. Sempre teste com Debug.Log antes de garantir saída.",
      },
      {
        type: "tip",
        content: "Quando precisar repetir algo ao longo do tempo (não num único frame), use Coroutines (yield return) em vez de while. O while espera tudo no mesmo frame; coroutine espalha pelo tempo real.",
      },
      {
        type: "info",
        content: "foreach em listas grandes em Unity antigos (pré-2017) gerava alocação no GC. Hoje em URP/HDRP modernos é seguro, mas em hot loops de gameplay, for ainda é levemente mais rápido.",
      },
    ],
  },
  {
    slug: "metodos",
    section: "csharp-unity",
    title: "Métodos (funções)",
    difficulty: "iniciante",
    subtitle: "Empacotar lógica em blocos reutilizáveis: TomarDano, Atirar, Pular.",
    intro: `Imagine que você está cozinhando e descobre uma receita de molho que usa em três pratos diferentes. Você não escreve a receita inteira em cada um. Em vez disso, você anota a receita uma vez e, em cada prato, simplesmente diz "fazer o molho". Em programação, esse "fazer o molho" é um método (também chamado de função). Você define a receita uma vez e chama de quantos lugares quiser.

Métodos são fundamentais por três motivos. Primeiro, eles evitam código duplicado: se a lógica de "tomar dano" está em um método chamado TomarDano, você pode chamá-lo quando o player encosta no inimigo, quando cai num espinho ou quando leva tiro, sem repetir as 20 linhas três vezes. Segundo, eles dão nome para um pedaço de lógica, o que torna o código muito mais legível. Em vez de ler dez linhas e tentar entender o que fazem, você lê AtirarBala() e já sabe.

Terceiro, métodos isolam responsabilidades. Cada um faz uma coisa só, e isso facilita debug. Se a animação de pulo está errada, você sabe que o problema está dentro do método Pular(), não espalhado por todo o script.

Um método em C# tem quatro partes: o tipo de retorno (void se não devolve nada, int se devolve um número, etc.), o nome (em PascalCase: começa com maiúscula), os parâmetros entre parênteses (entradas que ele precisa para trabalhar) e o corpo entre chaves. Além disso pode levar modificadores como public ou private. Saber ler essas quatro partes destrava a leitura de qualquer código C# do mundo.`,
    codes: [
      {
        lang: "csharp",
        code: `// Estrutura básica de um método.
using UnityEngine;

public class Player : MonoBehaviour
{
    public int vida = 100;

    // void = não devolve nada.
    // TomarDano = nome.
    // (int dano) = parâmetro de entrada.
    public void TomarDano(int dano)
    {
        vida -= dano;
        Debug.Log("Tomei " + dano + " de dano. Vida: " + vida);

        if (vida <= 0)
        {
            Morrer();
        }
    }

    private void Morrer()
    {
        Debug.Log("Game over.");
        // Destroy(gameObject); // descomentar quando quiser de verdade
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Métodos com retorno: devolvem um valor para quem chamou.
using UnityEngine;

public class Calculos : MonoBehaviour
{
    // int = devolve um inteiro.
    public int CalcularDanoCritico(int danoBase)
    {
        return danoBase * 2;
    }

    // bool = devolve true ou false.
    public bool EstaNoChao(float alturaY)
    {
        return alturaY <= 0.01f;
    }

    void Start()
    {
        int dano = CalcularDanoCritico(15); // dano = 30
        Debug.Log("Dano crítico: " + dano);

        if (EstaNoChao(transform.position.y))
        {
            Debug.Log("Player no chão.");
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Múltiplos parâmetros e parâmetros opcionais.
using UnityEngine;

public class SistemaDeCura : MonoBehaviour
{
    public int vida = 50;
    public int vidaMaxima = 100;

    // 'mensagem' tem valor padrão; se não passar, vira "Curou!"
    public void Curar(int quantidade, string mensagem = "Curou!")
    {
        vida += quantidade;
        if (vida > vidaMaxima) vida = vidaMaxima; // clamp manual
        Debug.Log(mensagem + " Vida agora: " + vida);
    }

    void Start()
    {
        Curar(20);                        // usa "Curou!"
        Curar(15, "Poção pequena!");      // mensagem customizada
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Sobrecarga: vários métodos com o mesmo nome, parâmetros diferentes.
using UnityEngine;

public class Atacar : MonoBehaviour
{
    // Versão sem alvo: ataca para frente.
    public void Atirar()
    {
        Debug.Log("Atirando para frente.");
    }

    // Versão com alvo: mira em alguém.
    public void Atirar(Vector3 alvo)
    {
        Debug.Log("Atirando em " + alvo);
    }

    // Versão com alvo e dano customizado.
    public void Atirar(Vector3 alvo, int dano)
    {
        Debug.Log("Atirando em " + alvo + " com dano " + dano);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Métodos podem chamar uns aos outros, formando uma cadeia clara.
using UnityEngine;

public class ControleDoPlayer : MonoBehaviour
{
    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Space))
        {
            Pular();
        }
    }

    void Pular()
    {
        TocarSomDePulo();
        AplicarForcaDePulo();
        IniciarAnimacaoDePulo();
    }

    void TocarSomDePulo()    { Debug.Log("Som: Pulo!"); }
    void AplicarForcaDePulo(){ Debug.Log("Física: força aplicada"); }
    void IniciarAnimacaoDePulo() { Debug.Log("Anim: pulando"); }
}`,
      },
    ],
    points: [
      "Método = bloco de código com nome, reutilizável de qualquer ponto.",
      "void significa 'não devolve nada'; outros tipos devolvem o valor declarado.",
      "Parâmetros são entradas que o método precisa para trabalhar.",
      "Parâmetros podem ter valor padrão (string msg = \"oi\").",
      "Sobrecarga: mesmo nome com listas de parâmetros diferentes.",
      "Quebrar lógica em métodos pequenos torna o código legível e testável.",
      "PascalCase para nome de método; camelCase para parâmetros e variáveis locais.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Se um método passou de 30-40 linhas, ele provavelmente está fazendo coisas demais. Quebre em métodos menores com nomes descritivos. Seu eu do futuro vai agradecer.",
      },
      {
        type: "info",
        content: "Métodos chamados a partir de Update milhares de vezes por segundo precisam ser leves. Evite alocações (new) e operações pesadas como FindObjectOfType dentro deles.",
      },
      {
        type: "warning",
        content: "Não confunda método com função estática. Métodos pertencem a uma instância (MonoBehaviour) e enxergam os campos do objeto. Função estática (static) é independente, não tem 'this'.",
      },
    ],
  },
  {
    slug: "classes-objetos",
    section: "csharp-unity",
    title: "Classes e objetos",
    difficulty: "intermediario",
    subtitle: "Criar seus próprios tipos: Inimigo, Arma, Item. A base do código orientado a objetos.",
    intro: `Até agora você guardou dados soltos em variáveis: vidaDoPlayer, nomeDoHeroi, posicaoDoSpawn. Funciona para coisas simples, mas imagine modelar um inimigo: ele tem vida, dano, velocidade, nome, posição, sprite, som de morte. Se você criar 20 variáveis soltas para um inimigo, e depois quiser ter dez inimigos diferentes, vira um caos. É exatamente esse problema que classes resolvem.

Uma classe é um molde, uma planta de construção. Você define uma vez quais informações um inimigo tem (campos) e o que ele sabe fazer (métodos). Depois, sempre que precisar de um inimigo concreto na cena, você cria um objeto a partir dessa classe. É como ter o desenho de uma cadeira (classe) e poder montar quantas cadeiras de verdade quiser (objetos), cada uma com cor própria, mas todas seguindo o mesmo molde.

No Unity, todo MonoBehaviour já é uma classe. Quando você arrasta um script para um GameObject, a Unity cria um objeto daquela classe e o "anexa" ao objeto da cena. Mas você também pode criar suas próprias classes que não herdam de MonoBehaviour, úteis para representar dados puros (uma carta de baralho, um item do inventário, uma estatística de personagem) sem precisar virar componente.

Os blocos fundamentais de uma classe são: campos (variáveis que cada instância tem), propriedades (campos com regras de leitura/escrita), construtores (método especial que prepara um objeto recém-criado) e métodos (ações que o objeto pode realizar). Esses quatro elementos cobrem 90% do que você vai escrever em C# fora dos MonoBehaviours.`,
    codes: [
      {
        lang: "csharp",
        code: `// Classe simples representando um item do inventário.
// Não herda de MonoBehaviour, é só um molde de dados + comportamento.
public class Item
{
    // Campos: dados que cada item tem.
    public string nome;
    public int peso;
    public int valor;

    // Construtor: prepara um item novo.
    public Item(string novoNome, int novoPeso, int novoValor)
    {
        nome = novoNome;
        peso = novoPeso;
        valor = novoValor;
    }

    // Método: comportamento que qualquer Item sabe fazer.
    public string Descrever()
    {
        return $"{nome} (peso: {peso}, valor: {valor})";
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Como CRIAR e USAR objetos da classe Item dentro de um MonoBehaviour.
using UnityEngine;

public class TesteInventario : MonoBehaviour
{
    void Start()
    {
        // 'new' chama o construtor e cria um objeto novo.
        Item espada = new Item("Espada longa", 5, 100);
        Item pocao  = new Item("Poção de cura", 1, 25);

        Debug.Log(espada.Descrever()); // Espada longa (peso: 5, valor: 100)
        Debug.Log(pocao.Descrever());

        // Acessar e mudar campos diretamente.
        espada.valor = 150;
        Debug.Log(espada.Descrever());
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Propriedades: forma elegante de proteger campos.
public class ContaDePontos
{
    // Campo privado, ninguém de fora mexe direto.
    private int pontos = 0;

    // Propriedade pública: leitura livre, escrita controlada.
    public int Pontos
    {
        get { return pontos; }
        private set { pontos = value; } // só esta classe pode setar
    }

    public void Adicionar(int quanto)
    {
        if (quanto <= 0) return; // valida antes
        pontos += quanto;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Classe Inimigo que herda de MonoBehaviour (é um Component).
using UnityEngine;

public class Inimigo : MonoBehaviour
{
    // Campos expostos no Inspector.
    public string nome = "Goblin";
    public int vida = 30;
    public int dano = 5;
    public float velocidade = 2f;

    // Estado interno.
    private bool estaVivo = true;

    void Update()
    {
        if (!estaVivo) return;

        // Andar pra frente.
        transform.Translate(Vector3.forward * velocidade * Time.deltaTime);
    }

    public void ReceberDano(int quanto)
    {
        vida -= quanto;
        if (vida <= 0)
        {
            Morrer();
        }
    }

    private void Morrer()
    {
        estaVivo = false;
        Debug.Log(nome + " foi derrotado!");
        Destroy(gameObject, 1f); // destrói depois de 1 segundo
    }
}`,
      },
    ],
    points: [
      "Classe é o molde; objeto é a instância concreta criada com 'new'.",
      "Campos guardam dados; métodos guardam comportamento.",
      "Construtor é chamado uma vez quando você cria o objeto com 'new'.",
      "Classes que herdam de MonoBehaviour viram Components no Unity.",
      "Classes simples (sem MonoBehaviour) servem para dados puros como Item.",
      "Propriedades (get/set) protegem campos e permitem validação.",
      "PascalCase para nomes de classe; nome do arquivo igual ao da classe.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Você nunca cria MonoBehaviour com 'new MeuScript()'. Sempre use AddComponent<MeuScript>() ou Instantiate de um prefab. Usar new num MonoBehaviour não inicializa direito a engine.",
      },
      {
        type: "tip",
        content: "Para dados que aparecem no Inspector mas não são MonoBehaviour, marque a classe com [System.Serializable]. Aí ela serializa direitinho dentro de um MonoBehaviour pai.",
      },
      {
        type: "info",
        content: "ScriptableObject é uma classe especial entre 'classe pura' e MonoBehaviour. Ideal para configurações compartilhadas (lista de armas, perfis de inimigo) sem ocupar slot na cena.",
      },
    ],
  },
  {
    slug: "heranca-poly",
    section: "csharp-unity",
    title: "Herança e polimorfismo",
    difficulty: "intermediario",
    subtitle: "Reaproveitar código entre tipos parecidos: todo Inimigo tem vida, mas cada um ataca diferente.",
    intro: `Imagine que você está modelando os inimigos do seu jogo: tem o Goblin que dá soco, o Arqueiro que atira flechas, o Mago que lança bolas de fogo. Todos eles têm vida, podem morrer, têm um nome. Se você criar três classes do zero, vai duplicar muito código. A solução é definir uma classe base Inimigo com tudo que é comum, e fazer Goblin, Arqueiro e Mago herdarem dela. Eles ganham de graça os campos e métodos da base, e podem adicionar ou modificar comportamento próprio.

Esse é o conceito de herança. Em C#, a sintaxe é simples: class Goblin : Inimigo significa "Goblin é um Inimigo, e herda tudo que Inimigo tem". A classe filha pode adicionar novos campos, novos métodos, e pode redefinir métodos da pai usando override. Para isso a pai precisa marcar o método como virtual (ou abstract, se obriga o filho a implementar).

O polimorfismo é a outra metade do mesmo conceito. Significa que você pode ter uma variável do tipo Inimigo (a classe pai) que aponta para um Goblin, ou um Mago, ou um Arqueiro. Quando você chama inimigo.Atacar(), o C# escolhe automaticamente qual versão chamar com base no tipo real do objeto. Isso é poderoso: você pode varrer uma lista de inimigos chamando Atacar em todos, e cada um faz sua coisa, sem você precisar checar o tipo de cada um.

A herança é tentadora, mas tem perigos. Hierarquias profundas (A herda de B que herda de C que herda de D) viram pesadelo de manter. Em jogos modernos, muitas equipes preferem composição (juntar pequenos componentes especializados) ao invés de herança. Use herança quando há claramente uma relação "é-um" estável (Goblin é um Inimigo). Não use só para reaproveitar duas linhas de código.`,
    codes: [
      {
        lang: "csharp",
        code: `// Classe base: o molde comum de todo inimigo.
using UnityEngine;

public class Inimigo : MonoBehaviour
{
    public string nome = "Inimigo";
    public int vida = 50;

    // virtual = pode ser sobrescrito por classes filhas.
    public virtual void Atacar()
    {
        Debug.Log(nome + " ataca de forma genérica.");
    }

    public void ReceberDano(int dano)
    {
        vida -= dano;
        if (vida <= 0) Debug.Log(nome + " morreu!");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Classes filhas: cada uma sobrescreve Atacar à sua maneira.
using UnityEngine;

public class Goblin : Inimigo
{
    // override = substituir o método virtual da classe pai.
    public override void Atacar()
    {
        Debug.Log(nome + " dá um soco corpo-a-corpo!");
    }
}

public class Arqueiro : Inimigo
{
    public int flechasRestantes = 10;

    public override void Atacar()
    {
        if (flechasRestantes <= 0)
        {
            Debug.Log(nome + " sem flechas, foge!");
            return;
        }
        flechasRestantes--;
        Debug.Log(nome + " atira uma flecha. Restam: " + flechasRestantes);
    }
}

public class Mago : Inimigo
{
    public override void Atacar()
    {
        Debug.Log(nome + " lança uma bola de fogo!");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Polimorfismo em ação: tratar todos como Inimigo, mas cada um age diferente.
using UnityEngine;
using System.Collections.Generic;

public class Arena : MonoBehaviour
{
    public List<Inimigo> inimigos = new List<Inimigo>();

    void Start()
    {
        // Imagine que estes inimigos foram colocados via Inspector.
        foreach (Inimigo i in inimigos)
        {
            i.Atacar(); // chama a versão certa para cada tipo automaticamente
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// abstract: a classe base obriga as filhas a implementarem.
using UnityEngine;

public abstract class Arma : MonoBehaviour
{
    public string nome;

    // Não tem corpo. Quem herdar é OBRIGADO a implementar.
    public abstract void Disparar();
}

public class Pistola : Arma
{
    public override void Disparar()
    {
        Debug.Log(nome + ": Pum!");
    }
}

public class Espingarda : Arma
{
    public override void Disparar()
    {
        Debug.Log(nome + ": BOOM (rajada)!");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// base.Metodo() chama a versão da classe pai dentro do override.
using UnityEngine;

public class ChefeFinal : Inimigo
{
    public override void Atacar()
    {
        // Primeiro faz o ataque base...
        base.Atacar();
        // ...e depois adiciona um efeito extra.
        Debug.Log(nome + " também grita um rugido aterrorizante!");
    }
}`,
      },
    ],
    points: [
      "Herança permite que uma classe filha reaproveite tudo da classe pai.",
      "virtual + override deixa a filha trocar o comportamento de um método.",
      "abstract obriga toda filha a implementar o método.",
      "Polimorfismo: variável do tipo pai pode apontar para qualquer filha.",
      "base.Metodo() acessa a versão da classe pai dentro de um override.",
      "Hierarquias profundas viram dor de cabeça; prefira composição quando possível.",
      "Use herança só para relações claras de 'é-um' (Goblin é um Inimigo).",
    ],
    alerts: [
      {
        type: "tip",
        content: "Em Unity, prefira componentes pequenos e independentes (saúde em um script, movimento em outro, ataque em outro) ao invés de uma classe gigante. Composição vence herança em projetos grandes.",
      },
      {
        type: "warning",
        content: "Esquecer 'override' faz o C# entender que você está criando um novo método com o mesmo nome (efeito 'shadow'). O compilador avisa, não ignore o aviso.",
      },
      {
        type: "info",
        content: "C# não permite herança múltipla de classes (só de uma pai), mas permite implementar várias interfaces. Use interfaces (IAttackable, IDamageable) para 'capacidades' que se combinam.",
      },
    ],
  },
  {
    slug: "namespaces-using",
    section: "csharp-unity",
    title: "Namespaces e using",
    difficulty: "iniciante",
    subtitle: "Organizar código em pastas lógicas e importar funcionalidades de outros lugares.",
    intro: `Imagine uma biblioteca enorme com milhões de livros. Se todos estivessem jogados em uma única pilha, encontrar qualquer coisa seria impossível. A biblioteca organiza por seções: literatura, ciências, história, infantil. Em código, namespaces fazem o mesmo papel: agrupam classes em compartimentos lógicos para evitar conflito de nomes e facilitar a navegação.

Quando você abre qualquer script Unity, a primeira linha é geralmente "using UnityEngine;". Esse using está dizendo "eu quero usar tudo do namespace UnityEngine sem precisar escrever o nome completo toda vez". Sem o using, você teria que escrever UnityEngine.GameObject, UnityEngine.Vector3, UnityEngine.Debug em cada referência. Com ele, basta GameObject, Vector3, Debug.

Existem alguns namespaces que você vai ver praticamente em todos os scripts. UnityEngine traz a engine inteira. System é a base do C# (números, datas, strings). System.Collections.Generic traz List, Dictionary e outras coleções. UnityEngine.UI dá acesso aos componentes de interface (Button, Text, Slider). TMPro é o do TextMeshPro, hoje o padrão para texto em jogos.

Você também pode (e deve) criar seus próprios namespaces conforme o projeto cresce. Em um jogo de RPG, faria sentido ter MeuJogo.Inimigos, MeuJogo.Itens, MeuJogo.UI, MeuJogo.Salvamento. Isso evita que duas classes com o mesmo nome em pastas diferentes causem conflito, e deixa claro a qual sistema cada coisa pertence. A sintaxe é simples: envolva sua classe com namespace MeuJogo.Inimigos { ... }.`,
    codes: [
      {
        lang: "csharp",
        code: `// Os 'using' mais comuns em scripts de Unity moderno.
using UnityEngine;                  // engine: GameObject, Vector3, Debug, Mathf
using System.Collections;           // IEnumerator (coroutines)
using System.Collections.Generic;   // List<T>, Dictionary<K,V>
using UnityEngine.UI;               // Button, Image, Slider
using TMPro;                         // TextMeshProUGUI (texto moderno)

public class ExemploImports : MonoBehaviour
{
    public List<GameObject> inimigos = new List<GameObject>();
    public TextMeshProUGUI textoScore;
    public Slider barraVida;

    void Start()
    {
        Debug.Log("Tenho " + inimigos.Count + " inimigos na cena.");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Sem o using, você precisa do nome completo do tipo.
// Funciona, mas vira poluição visual.
public class SemUsing : UnityEngine.MonoBehaviour
{
    public UnityEngine.GameObject prefab;
    public System.Collections.Generic.List<UnityEngine.Vector3> pontos
        = new System.Collections.Generic.List<UnityEngine.Vector3>();

    void Start()
    {
        UnityEngine.Debug.Log("Funciona, mas é horrível de ler.");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Criando seu próprio namespace.
// Arquivo: Assets/Scripts/Inimigos/Goblin.cs
using UnityEngine;

namespace MeuJogo.Inimigos
{
    public class Goblin : MonoBehaviour
    {
        public int vida = 30;

        void Start()
        {
            Debug.Log("Sou um Goblin do MeuJogo.Inimigos");
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Para usar a classe Goblin de outro arquivo, importe o namespace.
// Arquivo: Assets/Scripts/Sistemas/Spawner.cs
using UnityEngine;
using MeuJogo.Inimigos; // agora 'Goblin' está disponível diretamente

public class Spawner : MonoBehaviour
{
    public Goblin prefabGoblin;

    void Start()
    {
        Instantiate(prefabGoblin, Vector3.zero, Quaternion.identity);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Lidando com conflito de nomes (alias com 'using ... = ...').
using UnityEngine;
using DebugUnity = UnityEngine.Debug;
using DebugSistema = System.Diagnostics.Debug;

public class Aliases : MonoBehaviour
{
    void Start()
    {
        DebugUnity.Log("Console da Unity");
        // DebugSistema.WriteLine("Saída do .NET puro"); // se precisasse
    }
}`,
      },
    ],
    points: [
      "namespace agrupa classes; using importa um namespace inteiro.",
      "UnityEngine, System, System.Collections.Generic e UnityEngine.UI são os mais comuns.",
      "Crie seus próprios namespaces para organizar projetos grandes.",
      "Sem 'using', é preciso escrever o caminho completo (UnityEngine.Vector3).",
      "Conflito de nomes pode ser resolvido com alias (using A = Outro.A).",
      "TextMeshPro precisa de 'using TMPro;' e do componente TextMeshProUGUI.",
      "A organização em namespaces espelha boa estrutura de pastas no projeto.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Use o atalho Ctrl+. (Visual Studio) ou Quick Fix (Rider) para o IDE adicionar o 'using' que está faltando automaticamente. Economiza muito tempo de copiar e colar.",
      },
      {
        type: "warning",
        content: "Se você criar uma classe chamada Debug no seu projeto, ela vai ofuscar UnityEngine.Debug em todos os arquivos com 'using UnityEngine;'. Evite nomes que conflitem com a engine.",
      },
      {
        type: "info",
        content: "A partir do Unity 2022, você pode declarar 'global usings' em um arquivo separado para evitar repetir 'using UnityEngine;' em todo script. Útil em projetos grandes.",
      },
    ],
  },
  {
    slug: "listas-arrays",
    section: "csharp-unity",
    title: "Listas e arrays",
    difficulty: "intermediario",
    subtitle: "Coleções de coisas: lista de inimigos, array de waypoints, dicionário de itens.",
    intro: `Em qualquer jogo minimamente complexo, você precisa lidar com várias coisas do mesmo tipo ao mesmo tempo: todos os inimigos vivos na cena, todos os itens no inventário, todos os waypoints da patrulha do guarda, todos os pontos de spawn da fase. Criar uma variável separada para cada um (inimigo1, inimigo2, inimigo3) é insustentável. A solução é usar uma coleção, e em C# as duas mais comuns são array e List.

Array é a coleção mais antiga e mais simples. Você define o tamanho na hora da criação e ele não muda mais. Por exemplo, um array de 5 waypoints é fixo: você não pode adicionar um sexto sem criar outro array. A vantagem é que arrays são levemente mais rápidos e ocupam menos memória, ótimos quando você sabe a quantidade exata e ela não muda.

List é a coleção que cresce e encolhe à vontade. Você adiciona com Add, remove com Remove ou RemoveAt, e pergunta o tamanho atual com Count. Em jogos, List é a escolha padrão para coisas dinâmicas (inimigos vivos, projéteis ativos, itens coletados). Em troca, gasta um pouquinho mais de memória do que arrays.

Há ainda outras coleções importantes: Dictionary é como um caderno de telefones, onde você procura um valor pela "chave" (por nome de item, por ID de quest, por tag). HashSet guarda elementos únicos e responde rapidamente "este elemento está aqui?". Queue funciona como fila (primeiro a entrar é o primeiro a sair, ótima para mensagens). Stack é o oposto (último a entrar, primeiro a sair, útil em pilha de undo). Cada uma resolve um problema específico: aprender quando usar qual é parte importante de programar bem em Unity.`,
    codes: [
      {
        lang: "csharp",
        code: `// Arrays: tamanho fixo, declarado na criação.
using UnityEngine;

public class WaypointsPatrulha : MonoBehaviour
{
    // Array de Vector3 com 4 posições de patrulha.
    public Vector3[] waypoints = new Vector3[4];

    void Start()
    {
        // Acesso por índice (começa em 0).
        waypoints[0] = new Vector3(0, 0, 0);
        waypoints[1] = new Vector3(5, 0, 0);
        waypoints[2] = new Vector3(5, 0, 5);
        waypoints[3] = new Vector3(0, 0, 5);

        Debug.Log("Total de waypoints: " + waypoints.Length);

        // Iterar com for tradicional.
        for (int i = 0; i < waypoints.Length; i++)
        {
            Debug.Log("Waypoint " + i + ": " + waypoints[i]);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Lists: tamanho variável, ideal para coisas dinâmicas.
using UnityEngine;
using System.Collections.Generic;

public class GerenciadorDeInimigos : MonoBehaviour
{
    private List<GameObject> inimigosVivos = new List<GameObject>();

    public void RegistrarInimigo(GameObject inimigo)
    {
        inimigosVivos.Add(inimigo);
        Debug.Log("Inimigos vivos: " + inimigosVivos.Count);
    }

    public void RemoverInimigo(GameObject inimigo)
    {
        inimigosVivos.Remove(inimigo);
        Debug.Log("Inimigos vivos: " + inimigosVivos.Count);
    }

    public bool ExistemInimigos()
    {
        return inimigosVivos.Count > 0;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Iterar uma List de forma elegante com foreach.
using UnityEngine;
using System.Collections.Generic;

public class CalcularScoreTotal : MonoBehaviour
{
    public List<int> scoresDosJogadores = new List<int> { 100, 250, 75, 300 };

    void Start()
    {
        int total = 0;
        int maximo = int.MinValue;

        foreach (int score in scoresDosJogadores)
        {
            total += score;
            if (score > maximo) maximo = score;
        }

        Debug.Log("Total: " + total + " | Recordista: " + maximo);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Dictionary: associar chaves a valores.
using UnityEngine;
using System.Collections.Generic;

public class Inventario : MonoBehaviour
{
    // Dicionário: nome do item -> quantidade.
    private Dictionary<string, int> itens = new Dictionary<string, int>();

    void Start()
    {
        itens["Poção"] = 3;
        itens["Espada"] = 1;
        itens["Flecha"] = 25;

        // Acesso pela chave.
        Debug.Log("Tenho " + itens["Flecha"] + " flechas.");

        // Verificar se existe antes de acessar.
        if (itens.ContainsKey("Escudo"))
        {
            Debug.Log("Escudos: " + itens["Escudo"]);
        }
        else
        {
            Debug.Log("Não tenho escudo.");
        }

        // Iterar todos.
        foreach (var par in itens)
        {
            Debug.Log(par.Key + ": " + par.Value);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// CUIDADO: modificar uma lista enquanto faz foreach quebra o jogo.
using UnityEngine;
using System.Collections.Generic;

public class RemocaoSegura : MonoBehaviour
{
    public List<int> vidasDosInimigos = new List<int> { 0, 50, 0, 30, 0 };

    void Start()
    {
        // ERRADO: causa InvalidOperationException.
        // foreach (int v in vidasDosInimigos)
        //     if (v <= 0) vidasDosInimigos.Remove(v);

        // CORRETO: percorrer de trás para frente removendo.
        for (int i = vidasDosInimigos.Count - 1; i >= 0; i--)
        {
            if (vidasDosInimigos[i] <= 0)
            {
                vidasDosInimigos.RemoveAt(i);
            }
        }

        Debug.Log("Restantes: " + vidasDosInimigos.Count);
    }
}`,
      },
    ],
    points: [
      "Array tem tamanho fixo; List cresce e encolhe à vontade.",
      "Acesso por índice começa em 0 (último é Length - 1 ou Count - 1).",
      "List.Add, List.Remove, List.RemoveAt são as operações básicas.",
      "Dictionary<TChave, TValor> mapeia chaves a valores (rápido para buscar).",
      "Não modifique uma lista enquanto faz foreach: dá InvalidOperationException.",
      "Para remover em loop, percorra de trás para frente com for.",
      "List<T> precisa de 'using System.Collections.Generic;'.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Acessar lista[100] quando ela só tem 5 itens dá IndexOutOfRangeException. Sempre cheque list.Count antes ou use list.ElementAtOrDefault em LINQ.",
      },
      {
        type: "tip",
        content: "Em projetos com muitos inimigos sendo criados e destruídos por segundo, use object pooling (reaproveitar objetos da lista) em vez de Instantiate/Destroy direto. Reduz garbage collector dramaticamente.",
      },
      {
        type: "info",
        content: "List<T> em código de hot path pode causar boxing se T for tipo de valor (struct). Para máxima performance em loops apertados, considere arrays nativos ou NativeList do Unity.Collections.",
      },
    ],
  },
  {
    slug: "eventos-delegates",
    section: "csharp-unity",
    title: "Eventos e delegates",
    difficulty: "intermediario",
    subtitle: "Avisar várias partes do jogo quando algo importante acontece, sem amarrar tudo.",
    intro: `Imagine que o player morreu. Várias coisas precisam reagir: a UI mostra uma tela de Game Over, o áudio toca a música de derrota, o spawn de inimigos para, o sistema de ranking salva a pontuação, a câmera faz um efeito de fade. Se o script do player chamasse cada um desses sistemas diretamente, o código viraria um nó: o Player teria que conhecer UI, Áudio, Spawn, Ranking e Câmera. Acoplado demais. Mudou um, quebra todos.

A solução elegante é o padrão de eventos. O player simplesmente "anuncia" para o mundo: "Eu morri!". Quem estiver interessado, escuta. Cada sistema que quiser reagir se inscreve no evento. Quando dispara, todos os inscritos são avisados, mas o player não precisa saber quem está ouvindo. Isso é desacoplamento, e é o segredo de código que escala bem.

Em C# existem várias formas de fazer isso, e cada uma tem seu uso. Um delegate é o tipo mais primitivo: você define a "assinatura" (que parâmetros e que retorno) e cria uma variável que aponta para um ou mais métodos. Action é um delegate pronto que não devolve nada (Action, Action<int>, Action<int, string>). Func é o delegate pronto que devolve um valor (Func<int, bool>). event é uma palavra-chave que protege um delegate para que só a classe dona possa disparar.

E há o UnityEvent, classe da Unity que permite expor eventos no Inspector. Você arrasta GameObjects para serem notificados sem escrever código. Ótimo para designers e para conexões visíveis na cena. Em troca, é um pouquinho mais lento e menos flexível que eventos C# puros. A escolha depende do contexto: para lógica interna pesada, prefira event/Action; para conexões visuais que designers vão configurar, UnityEvent é o caminho.`,
    codes: [
      {
        lang: "csharp",
        code: `// Action: o delegate mais usado para anunciar que algo aconteceu.
using UnityEngine;
using System;

public class Player : MonoBehaviour
{
    public int vida = 100;

    // Evento sem parâmetros: "o player morreu".
    public event Action OnMorrer;

    // Evento com parâmetro: "tomei X de dano".
    public event Action<int> OnTomarDano;

    public void TomarDano(int quanto)
    {
        vida -= quanto;
        OnTomarDano?.Invoke(quanto); // ?. evita erro se ninguém escuta

        if (vida <= 0)
        {
            OnMorrer?.Invoke();
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Como SE INSCREVER em um evento e reagir.
using UnityEngine;

public class UIManager : MonoBehaviour
{
    public Player player;

    void OnEnable()
    {
        // += inscreve o método como ouvinte.
        player.OnMorrer += MostrarGameOver;
        player.OnTomarDano += AtualizarBarraDeVida;
    }

    void OnDisable()
    {
        // -= sempre desinscreve quando o objeto sai.
        // ESSENCIAL para evitar memory leaks e crashes.
        player.OnMorrer -= MostrarGameOver;
        player.OnTomarDano -= AtualizarBarraDeVida;
    }

    void MostrarGameOver()
    {
        Debug.Log("UI: Tela de Game Over!");
    }

    void AtualizarBarraDeVida(int dano)
    {
        Debug.Log("UI: Player levou " + dano + ", atualizando barra.");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Func: delegate que DEVOLVE um valor. Útil para callbacks de cálculo.
using UnityEngine;
using System;

public class CalculadoraDeDano : MonoBehaviour
{
    // Func<int, int, int>: recebe dois ints e devolve um int.
    public Func<int, int, int> formulaDeDano;

    void Start()
    {
        // Inscrevendo uma fórmula simples.
        formulaDeDano = (ataque, defesa) => Mathf.Max(1, ataque - defesa);

        int dano = formulaDeDano(20, 8); // 12
        Debug.Log("Dano final: " + dano);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// UnityEvent: evento que aparece no Inspector para conectar visualmente.
using UnityEngine;
using UnityEngine.Events;

public class Botao : MonoBehaviour
{
    // Aparece no Inspector como uma lista arrastável.
    public UnityEvent OnClicado;

    // Versão com parâmetro:
    public UnityEvent<int> OnPontuou;

    void Update()
    {
        if (Input.GetMouseButtonDown(0))
        {
            OnClicado?.Invoke();   // notifica todos conectados no Inspector
            OnPontuou?.Invoke(10); // ganhou 10 pontos
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Padrão "EventBus" estático: comunicação global desacoplada.
using UnityEngine;
using System;

public static class EventosDoJogo
{
    public static event Action<int> OnScoreMudou;
    public static event Action OnGameOver;

    public static void DispararScore(int novoScore)
    {
        OnScoreMudou?.Invoke(novoScore);
    }

    public static void DispararGameOver()
    {
        OnGameOver?.Invoke();
    }
}

// Em qualquer script:
public class ExemploUso : MonoBehaviour
{
    void OnEnable()  { EventosDoJogo.OnScoreMudou += AtualizarHUD; }
    void OnDisable() { EventosDoJogo.OnScoreMudou -= AtualizarHUD; }
    void AtualizarHUD(int score) { Debug.Log("HUD: " + score); }
}`,
      },
    ],
    points: [
      "Eventos permitem que vários sistemas reajam sem o emissor conhecê-los.",
      "Action é delegate sem retorno; Func é delegate com retorno.",
      "Use += para inscrever um ouvinte; -= para desinscrever.",
      "Sempre desinscreva em OnDisable/OnDestroy para evitar memory leaks.",
      "Use ?.Invoke() para disparar com segurança quando ninguém está inscrito.",
      "UnityEvent expõe eventos no Inspector, ótimo para conexões visuais.",
      "Eventos C# puros são mais rápidos; UnityEvent é mais flexível para designers.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Esquecer de desinscrever (OnDisable com -=) é a fonte número um de bugs em jogos com mudança de cena. O ouvinte fica zumbi e tenta acessar objeto destruído, causando NullReferenceException.",
      },
      {
        type: "tip",
        content: "Sempre use ?.Invoke() em vez de Invoke(). O ?. impede crash se ninguém estiver inscrito no evento, situação totalmente normal e que não deveria quebrar nada.",
      },
      {
        type: "info",
        content: "Para projetos médios e grandes, considere bibliotecas como UniRx, MessagePipe ou um EventBus customizado. Eles oferecem eventos tipados, ordenação e ferramentas de debug muito superiores.",
      },
    ],
  },
];
