import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "monobehaviour",
    section: "scripting",
    title: "MonoBehaviour: a classe base de tudo",
    difficulty: "iniciante",
    subtitle: "Entenda por que quase todo script de Unity herda de MonoBehaviour e o que isso significa na prática.",
    intro: `Imagine que cada GameObject na sua cena é uma pessoa, e cada componente preso nele (Rigidbody, AudioSource, seu próprio script) é um órgão ou habilidade dessa pessoa. O Unity precisa de uma forma padrão para conversar com todos esses componentes: avisar quando a cena começou, quando um frame foi desenhado, quando o objeto foi destruído. Essa "interface universal" é a classe MonoBehaviour. Quando o seu script herda de MonoBehaviour, você está dizendo: "Unity, pode me chamar nos momentos certos do ciclo de vida".

Sem MonoBehaviour, sua classe vira só um pedaço de código C# normal. Ela continua existindo, mas o Unity não sabe quando rodar nada dela, ela não pode ser arrastada para um GameObject no Inspector, e métodos especiais como Start(), Update() ou OnCollisionEnter() simplesmente nunca são chamados. Por isso, no começo, basicamente todo script que você cria no Unity (botão direito > Create > C# Script) já vem com "public class MeuScript : MonoBehaviour" pronto.

Mas atenção: nem TUDO precisa ser MonoBehaviour. Classes utilitárias puras (matemática, formatação, dados), estruturas de dados (uma classe Inventario, uma struct Item) e sistemas que rodam fora do ciclo do Unity podem (e devem) ser C# puro. Herdar de MonoBehaviour tem um custo de memória e de performance, e cada instância precisa estar grudada em um GameObject. Saber quando NÃO usar é tão importante quanto saber quando usar.

Outro ponto que confunde iniciantes: você nunca usa "new MeuScript()" para criar um MonoBehaviour. Quem cria é o Unity, no momento em que você arrasta o script para um GameObject ou chama AddComponent. Tentar fazer "new" gera um warning e o objeto criado não funciona como componente. Esse capítulo te mostra a anatomia desse contrato entre o seu código e o motor.`,
    codes: [
      {
        lang: "csharp",
        code: `// Arquivo: MeuPrimeiroScript.cs
// Crie no Unity com botão direito na pasta Assets > Create > C# Script.
using UnityEngine; // traz a classe MonoBehaviour, Debug, Vector3, etc.

// O nome da classe DEVE ser idêntico ao nome do arquivo, senão o Unity reclama.
public class MeuPrimeiroScript : MonoBehaviour
{
    // Variáveis públicas aparecem no Inspector e podem ser editadas sem mexer no código.
    public string mensagem = "Olá, Unity!";

    // Start é chamado pelo Unity uma única vez, antes do primeiro frame.
    void Start()
    {
        // Debug.Log imprime no Console (Window > General > Console).
        Debug.Log(mensagem);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Comparação: classe utilitária SEM MonoBehaviour.
// Não precisa estar grudada em GameObject; é C# puro.
public static class Calculadora
{
    // Função utilitária, pode ser chamada de qualquer lugar.
    public static int Somar(int a, int b)
    {
        return a + b;
    }
}

// Em outro script (este sim MonoBehaviour) você usa assim:
using UnityEngine;
public class UsaCalculadora : MonoBehaviour
{
    void Start()
    {
        int resultado = Calculadora.Somar(2, 3); // chamada estática, sem instanciar nada
        Debug.Log("Resultado: " + resultado);    // Console mostra: Resultado: 5
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Adicionando componentes via código em runtime.
using UnityEngine;

public class CriadorDeCubo : MonoBehaviour
{
    void Start()
    {
        // Cria um cubo primitivo na cena (já vem com MeshRenderer, BoxCollider, etc.).
        GameObject cubo = GameObject.CreatePrimitive(PrimitiveType.Cube);

        // AddComponent é a forma CORRETA de criar um MonoBehaviour:
        // o Unity registra o componente no ciclo de vida automaticamente.
        Rigidbody rb = cubo.AddComponent<Rigidbody>();
        rb.mass = 2f;

        // ERRADO: 'new Rigidbody()' não funciona. Nunca tente instanciar com new.
    }
}`,
      },
    ],
    points: [
      "MonoBehaviour é o contrato que faz o Unity chamar seu código nos momentos certos.",
      "Só herde de MonoBehaviour quando precisar de ciclo de vida ou de aparecer no Inspector.",
      "Nome do arquivo .cs precisa bater com o nome da classe pública.",
      "Variáveis public (ou [SerializeField] private) aparecem no Inspector.",
      "Use AddComponent<T>() para criar MonoBehaviours em runtime, nunca 'new'.",
      "Classes de dados, utilitários e sistemas puros podem (e devem) ser C# normal.",
      "Cada MonoBehaviour custa memória e processamento; não exagere na quantidade.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Criar um MonoBehaviour com 'new' compila, mas gera warning em runtime e o objeto não recebe Start, Update nem nada. Sempre use AddComponent ou arraste o script no Inspector.",
      },
      {
        type: "tip",
        content: "Prefira [SerializeField] private em vez de public quando quiser apenas mostrar no Inspector. Mantém a variável privada para o resto do código e evita acoplamento.",
      },
      {
        type: "info",
        content: "MonoBehaviour não é o único tipo serializável: ScriptableObject também é, e é melhor para dados puros que vivem fora da cena. Veremos isso em capítulos futuros.",
      },
    ],
  },
  {
    slug: "awake-start",
    section: "scripting",
    title: "Awake, OnEnable e Start: a inicialização correta",
    difficulty: "iniciante",
    subtitle: "Quando cada um é chamado, qual a ordem real e onde colocar cada tipo de inicialização.",
    intro: `Quando uma cena carrega, o Unity não chama os métodos de inicialização em ordem aleatória. Existe uma sequência rígida: primeiro Awake() em todos os scripts, depois OnEnable() em todos os scripts ativos, e só então Start() em todos. Entender essa ordem evita uma classe inteira de bugs do tipo "funciona às vezes, dá NullReferenceException em outras".

A regra mental é simples: Awake serve para preparar o próprio objeto (pegar referências internas com GetComponent, inicializar variáveis privadas, criar listas vazias). Start serve para conversar com OUTROS objetos (porque, quando o seu Start roda, todo mundo já fez Awake). Se você tentar acessar outro componente no Awake, pode ser que ele ainda não tenha se inicializado. Já no Start, é seguro.

OnEnable é o irmão menos famoso, mas igualmente importante. Ele é chamado toda vez que o GameObject ou componente é ativado, inclusive se você desativar e reativar. Já Awake e Start rodam UMA ÚNICA VEZ na vida do objeto. Por isso, OnEnable é o lugar certo para se inscrever em eventos (event += metodo) e OnDisable é onde você se desinscreve. Misturar isso com Awake/Start é uma fonte clássica de memory leaks e listeners duplicados.

Outro detalhe que pega iniciante: se o componente ou GameObject está DESATIVADO no Inspector, Start nunca é chamado até a primeira vez que ele for ativado. Awake também só roda quando o objeto fica ativo. Isso significa que objetos desativados em Pools ou prefabs não inicializam até serem ligados. Saber disso muda como você projeta sistemas de instanciação e pooling.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;

public class CicloDeVida : MonoBehaviour
{
    private Rigidbody rb; // referência interna, será preenchida no Awake

    // Awake roda UMA vez, antes de tudo, mesmo se o componente estiver desativado
    // (mas o GameObject precisa estar ativo).
    void Awake()
    {
        Debug.Log("1. Awake - pegando referências internas");
        rb = GetComponent<Rigidbody>(); // pegar referência aqui é seguro
    }

    // OnEnable roda toda vez que o componente é ativado (inclusive na primeira).
    void OnEnable()
    {
        Debug.Log("2. OnEnable - me inscrevendo em eventos");
    }

    // Start roda UMA vez, antes do primeiro Update, depois que todos os Awakes terminaram.
    void Start()
    {
        Debug.Log("3. Start - agora posso falar com outros objetos");
        // Aqui é seguro chamar GameObject.Find ou acessar singletons.
    }

    // OnDisable roda quando o componente é desativado ou destruído.
    void OnDisable()
    {
        Debug.Log("OnDisable - cancelando inscrições para evitar leaks");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Exemplo prático: por que NÃO acessar outros objetos no Awake.
using UnityEngine;

public class Jogador : MonoBehaviour
{
    public static Jogador Instancia; // singleton simples

    void Awake()
    {
        // Definir o singleton no Awake é seguro, é só atribuição local.
        Instancia = this;
    }
}

public class Inimigo : MonoBehaviour
{
    private Transform alvo;

    void Awake()
    {
        // PERIGO: Jogador.Instancia pode ser null aqui!
        // A ordem dos Awakes entre objetos não é garantida.
        // alvo = Jogador.Instancia.transform;  // pode crashar
    }

    void Start()
    {
        // Seguro: nesse ponto, todos os Awakes já rodaram.
        alvo = Jogador.Instancia.transform;
        Debug.Log("Alvo encontrado: " + alvo.name);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// OnEnable / OnDisable para eventos.
using UnityEngine;
using UnityEngine.SceneManagement;

public class OuvinteDeCena : MonoBehaviour
{
    // Inscrever em OnEnable, desinscrever em OnDisable.
    // Isso evita 'listener fantasma' quando o objeto é desativado/reativado.
    void OnEnable()
    {
        SceneManager.sceneLoaded += AoCarregarCena;
    }

    void OnDisable()
    {
        SceneManager.sceneLoaded -= AoCarregarCena;
    }

    private void AoCarregarCena(Scene cena, LoadSceneMode modo)
    {
        Debug.Log("Cena carregada: " + cena.name);
    }
}`,
      },
    ],
    points: [
      "Ordem real: Awake (todos) -> OnEnable (todos ativos) -> Start (todos) -> primeiro Update.",
      "Awake: prepare a si mesmo (GetComponent, variáveis privadas).",
      "Start: converse com outros objetos, eles já estão prontos.",
      "OnEnable/OnDisable: inscrever e desinscrever de eventos sempre em par.",
      "Awake e Start rodam uma vez; OnEnable/OnDisable rodam a cada (re)ativação.",
      "Componente desativado: Start só roda na primeira vez que for ativado.",
      "Não confie na ordem dos Awakes entre scripts diferentes sem configurar Script Execution Order.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Inscrever em evento dentro do Start sem desinscrever em OnDestroy/OnDisable causa NullReferenceException quando o objeto morre e o evento ainda dispara. Use sempre OnEnable + OnDisable.",
      },
      {
        type: "tip",
        content: "Se precisa garantir que um script rode antes de outro, vá em Edit > Project Settings > Script Execution Order e arraste-os manualmente. Use só quando necessário; muita configuração ali vira pesadelo de manutenção.",
      },
    ],
  },
  {
    slug: "update-fixedupdate",
    section: "scripting",
    title: "Update vs FixedUpdate: frame x física",
    difficulty: "iniciante",
    subtitle: "A diferença essencial entre o loop visual e o loop de física, e onde colocar cada tipo de código.",
    intro: `Todo jogo precisa de um relógio que bate continuamente. Em Unity, na verdade, existem DOIS relógios diferentes batendo ao mesmo tempo. Update() é o relógio visual: ele dispara a cada frame desenhado na tela. Se o jogo está rodando a 60 FPS, Update roda 60 vezes por segundo. Se cair para 30 FPS por causa de um efeito pesado, Update vai rodar 30 vezes por segundo. Ou seja: Update é instável, depende do hardware e da carga do momento.

FixedUpdate() é o relógio da física. Ele roda em intervalos FIXOS, por padrão a cada 0.02 segundos (50 vezes por segundo), independente do FPS. Se o jogo travar por um instante, o Unity acumula os FixedUpdates devidos e roda vários em sequência para compensar. Esse passo fixo é o que garante que a física (Rigidbody, colisões, gravidade) se comporte de forma reproduzível, sem objetos atravessando paredes só porque o frame rate caiu.

A regra prática: TUDO que mexe com Rigidbody (rb.AddForce, rb.MovePosition, rb.velocity) vai dentro de FixedUpdate. TUDO que lê input do jogador (Input.GetKeyDown, leitura de mouse), atualiza animações visuais não-físicas, ou faz lógica de jogo, vai em Update. Misturar isso é a causa #1 de movimento "espasmódico" ou de inputs perdidos. Por exemplo: GetKeyDown lido em FixedUpdate pode falhar porque a tecla foi pressionada e solta entre dois FixedUpdates.

Uma analogia: pense em Update como você batendo papo enquanto faz panqueca, em ritmo livre. FixedUpdate é o metrônomo de uma banda: bate exatamente no tempo, ignorando se o cantor atrasou. Se você pisar em qualquer Rigidbody fora do tempo do metrônomo, a panqueca queima.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;

// Movimento de personagem com Rigidbody: input no Update, força no FixedUpdate.
[RequireComponent(typeof(Rigidbody))]
public class MovimentoJogador : MonoBehaviour
{
    public float velocidade = 5f;
    private Rigidbody rb;
    private Vector3 inputMovimento;
    private bool querPular;

    void Awake()
    {
        rb = GetComponent<Rigidbody>();
    }

    // Update: leitura de input. GetKeyDown SÓ funciona confiável aqui.
    void Update()
    {
        float h = Input.GetAxisRaw("Horizontal");
        float v = Input.GetAxisRaw("Vertical");
        inputMovimento = new Vector3(h, 0f, v).normalized;

        // Capturamos o pulo aqui, mas APLICAMOS no FixedUpdate.
        if (Input.GetKeyDown(KeyCode.Space))
        {
            querPular = true;
        }
    }

    // FixedUpdate: aplicamos forças e velocidades no Rigidbody.
    void FixedUpdate()
    {
        Vector3 alvo = inputMovimento * velocidade;
        rb.linearVelocity = new Vector3(alvo.x, rb.linearVelocity.y, alvo.z);

        if (querPular)
        {
            rb.AddForce(Vector3.up * 5f, ForceMode.Impulse);
            querPular = false; // consumiu o pedido
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Demonstração: por que GetKeyDown no FixedUpdate é furada.
using UnityEngine;

public class DemoTeclaErrada : MonoBehaviour
{
    // ERRADO: pode perder o pressionamento entre dois FixedUpdates.
    void FixedUpdate()
    {
        if (Input.GetKeyDown(KeyCode.Space))
        {
            Debug.Log("As vezes esse log nem aparece!");
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Mostrando a diferença de cadência entre os dois loops.
using UnityEngine;

public class CompararCadencia : MonoBehaviour
{
    private int contUpdate;
    private int contFixed;

    void Update()    { contUpdate++; }
    void FixedUpdate() { contFixed++; }

    // OnGUI desenha texto simples na tela (sem Canvas) para debug rápido.
    void OnGUI()
    {
        GUI.Label(new Rect(10, 10, 400, 20), "Update por seg (aprox FPS): " + contUpdate);
        GUI.Label(new Rect(10, 30, 400, 20), "FixedUpdate por seg: " + contFixed);

        // Reseta cada segundo para enxergar a taxa atual.
        if (Time.frameCount % 60 == 0) { contUpdate = 0; contFixed = 0; }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Ajustando o passo fixo da física no Project Settings via código (raro, mas existe).
using UnityEngine;

public class AjustarFixed : MonoBehaviour
{
    void Start()
    {
        // Passo padrão: 0.02 (50Hz). Para jogos de combate rápido, alguns usam 0.0166 (60Hz).
        // CUIDADO: passo menor = mais chamadas de FixedUpdate por segundo = mais CPU.
        Time.fixedDeltaTime = 0.0166f;
    }
}`,
      },
    ],
    points: [
      "Update: roda por frame, taxa variável, ideal para input e visual.",
      "FixedUpdate: roda em passo fixo (0.02s padrão), ideal para Rigidbody e física.",
      "Use Input.GetKeyDown e GetKeyUp SEMPRE no Update.",
      "Aplique forças, velocidades e MovePosition SEMPRE no FixedUpdate.",
      "Capture intenção no Update, execute a ação no FixedUpdate via flag/buffer.",
      "Tempo entre frames = Time.deltaTime; tempo do passo fixo = Time.fixedDeltaTime.",
      "Mudar fixedDeltaTime tem custo de CPU; só ajuste com motivo claro.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Mover um Rigidbody pelo transform.position dentro do Update pula o sistema de física: o objeto atravessa colisores. Use rb.MovePosition no FixedUpdate.",
      },
      {
        type: "info",
        content: "Em jogos de FPS alto (144+), considere baixar fixedDeltaTime para 0.01666 (60Hz) ou menos para evitar 'judder' visível em corpos físicos rápidos.",
      },
      {
        type: "tip",
        content: "Quando ler input em Update e usar em FixedUpdate, prefira variáveis de buffer (bool querPular) em vez de calcular velocidade no Update e aplicar no FixedUpdate; menos confusão de timing.",
      },
    ],
  },
  {
    slug: "lateupdate",
    section: "scripting",
    title: "LateUpdate: o último a falar",
    difficulty: "iniciante",
    subtitle: "Por que existe um terceiro loop e por que ele é o melhor lugar para sua câmera.",
    intro: `Depois que todos os Updates de todos os scripts terminam de rodar em um frame, o Unity ainda chama mais um método: LateUpdate(). Por que isso? Porque às vezes você precisa garantir que SEU código rode DEPOIS que todo mundo já se mexeu. O exemplo clássico é a câmera que segue o jogador.

Imagine: o jogador anda no Update. A câmera, se também anda no Update, pode rodar ANTES do jogador (porque a ordem entre scripts é imprevisível por padrão). Resultado: a câmera mira na posição antiga do jogador, e o jogador parece estar tremendo dentro da tela. Esse é o famoso "jitter" de câmera. A solução é colocar o código da câmera no LateUpdate: ele só roda depois que todo o resto já se moveu, então a câmera vê a posição final correta do jogador.

LateUpdate também é o lugar certo para qualquer ajuste reativo: corrigir rotação de IK depois da animação tocar, alinhar objetos visuais a partes de um personagem, ou aplicar offsets que dependem de cálculos feitos por outros scripts. Pense nele como o "limpa tudo no final do frame" antes de a tela ser desenhada.

O que NÃO colocar no LateUpdate: lógica de física (vai em FixedUpdate), input pesado (vai em Update), animações controladas por código (geralmente Update). Usar LateUpdate quando não precisa só atrasa coisas e dificulta debug.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;

// Câmera de terceira pessoa simples, suave, no LateUpdate.
public class CameraSeguidora : MonoBehaviour
{
    public Transform alvo;            // arraste o jogador aqui no Inspector
    public Vector3 offset = new Vector3(0f, 3f, -6f);
    public float suavidade = 5f;

    // LateUpdate: roda depois de todos os Updates desse frame.
    // Garantia: o jogador JÁ se moveu, então a câmera mira no lugar certo.
    void LateUpdate()
    {
        if (alvo == null) return;

        Vector3 posicaoDesejada = alvo.position + offset;
        // Lerp suaviza o movimento. Time.deltaTime mantém a suavidade igual em qualquer FPS.
        transform.position = Vector3.Lerp(transform.position, posicaoDesejada, suavidade * Time.deltaTime);
        transform.LookAt(alvo.position + Vector3.up * 1.5f);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Demonstração de jitter: a MESMA câmera no Update vs no LateUpdate.
using UnityEngine;

public class CameraNoUpdate : MonoBehaviour
{
    public Transform alvo;
    public Vector3 offset = new Vector3(0f, 3f, -6f);

    // Se este script rodar ANTES do Update do jogador,
    // a câmera vai mirar na posição antiga -> jitter.
    void Update()
    {
        if (alvo == null) return;
        transform.position = alvo.position + offset;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Outro caso clássico: marcador de UI sobre a cabeça de um inimigo.
using UnityEngine;

public class MarcadorAcimaDaCabeca : MonoBehaviour
{
    public Transform inimigo;
    public Vector3 offsetCabeca = new Vector3(0f, 2f, 0f);

    // No LateUpdate garantimos que a animação do inimigo já atualizou a posição
    // da cabeça neste frame, então o marcador encaixa exatamente.
    void LateUpdate()
    {
        if (inimigo == null) return;
        transform.position = inimigo.position + offsetCabeca;

        // Faz o marcador sempre olhar para a câmera principal (billboard).
        if (Camera.main != null)
        {
            transform.rotation = Quaternion.LookRotation(transform.position - Camera.main.transform.position);
        }
    }
}`,
      },
    ],
    points: [
      "LateUpdate roda depois de TODOS os Updates do frame.",
      "Use para câmera que segue alvo: elimina jitter visual.",
      "Use para qualquer ajuste reativo que depende de outros se moverem antes.",
      "Não jogue lógica de física aqui (continua sendo FixedUpdate).",
      "Animações em runtime que reagem ao Animator também ficam bem em LateUpdate.",
      "Se vira hábito jogar tudo em LateUpdate, você está mascarando bugs de ordem.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Para câmeras profissionais, considere o pacote Cinemachine (gratuito da Unity). Ele resolve jitter, suavização e composição sem você escrever quase nada de código.",
      },
      {
        type: "warning",
        content: "Se você usa Rigidbody com interpolação na câmera, evite mover a câmera no LateUpdate por velocidade física: combine com Rigidbody.interpolation = Interpolate para resultado suave.",
      },
    ],
  },
  {
    slug: "coroutines",
    section: "scripting",
    title: "Coroutines: rotinas que pausam e continuam",
    difficulty: "intermediario",
    subtitle: "Como executar tarefas ao longo do tempo sem travar o jogo, usando IEnumerator e yield return.",
    intro: `Imagine que você quer fazer um inimigo brilhar em vermelho por 2 segundos depois de levar um tiro. A solução ingênua seria algo como "espere 2 segundos com Thread.Sleep". O problema: isso CONGELA o jogo inteiro, porque trava a thread principal do Unity. Ninguém quer um jogo que para de responder a cada efeito visual.

A resposta do Unity para esse problema são as Coroutines. Uma coroutine é um método que pode "pausar" no meio da execução, devolver o controle para o Unity continuar rodando o jogo normalmente, e depois "continuar de onde parou" no próximo frame ou depois de um tempo. É como um livro com marcador: você lê um capítulo, fecha o livro para fazer outras coisas, e na próxima sessão continua exatamente da página marcada.

Tecnicamente, uma coroutine é um método que retorna IEnumerator e usa yield return para indicar onde "pausa". Você não chama ela com método.normal(): chama com StartCoroutine(método()). Se quiser parar antes do fim, guarda a referência e chama StopCoroutine. As pausas mais comuns são "yield return null" (espera um frame), "yield return new WaitForSeconds(2f)" (espera 2 segundos de jogo) e "yield return new WaitUntil(() => condicao)" (espera virar verdade).

Coroutines são poderosas, mas têm armadilhas. Elas param INSTANTANEAMENTE quando o GameObject é desativado (SetActive(false)) ou destruído. Elas não rodam em paralelo de verdade (não são threads), só intercalam. E criar muitos "new WaitForSeconds" em loop gera lixo de memória, então em código pesado guardamos a instância em uma variável. Hoje em projetos novos muitas coisas migraram para async/await com UniTask, mas coroutines continuam sendo o feijão com arroz mais simples para tarefas temporais.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;
using System.Collections; // necessário para IEnumerator

public class Inimigo : MonoBehaviour
{
    public Renderer rend;
    public float duracaoFlash = 0.2f;

    void Start()
    {
        rend = GetComponent<Renderer>();
    }

    // Método público para o resto do código pedir o flash.
    public void LevouTiro()
    {
        // StartCoroutine recebe a chamada do método (com parênteses) e dispara.
        StartCoroutine(FlashVermelho());
    }

    // O retorno IEnumerator é o que faz desse método uma coroutine.
    private IEnumerator FlashVermelho()
    {
        Color original = rend.material.color;
        rend.material.color = Color.red;

        // 'yield return' devolve o controle para o Unity por X segundos de jogo.
        yield return new WaitForSeconds(duracaoFlash);

        rend.material.color = original;
        // Quando termina, a coroutine simplesmente acaba.
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Loop temporal: contagem regressiva visível, sem travar o jogo.
using UnityEngine;
using System.Collections;
using TMPro;

public class ContagemRegressiva : MonoBehaviour
{
    public TMP_Text texto; // arraste um TextMeshPro UI no Inspector

    void Start()
    {
        StartCoroutine(Contar(5));
    }

    private IEnumerator Contar(int de)
    {
        for (int i = de; i > 0; i--)
        {
            texto.text = i.ToString();
            // Espera 1 segundo entre cada número, sem travar nada.
            yield return new WaitForSeconds(1f);
        }
        texto.text = "VAI!";
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Parando uma coroutine antes do fim e otimização de WaitForSeconds.
using UnityEngine;
using System.Collections;

public class GerenciadorOndas : MonoBehaviour
{
    private Coroutine ondaAtual;
    // Reutilizamos a instância para não gerar lixo de memória a cada iteração.
    private static readonly WaitForSeconds esperaCurta = new WaitForSeconds(0.5f);

    public void IniciarOnda()
    {
        if (ondaAtual != null) StopCoroutine(ondaAtual); // cancela a anterior
        ondaAtual = StartCoroutine(SpawnarInimigos(10));
    }

    public void CancelarOnda()
    {
        if (ondaAtual != null)
        {
            StopCoroutine(ondaAtual);
            ondaAtual = null;
        }
    }

    private IEnumerator SpawnarInimigos(int quantos)
    {
        for (int i = 0; i < quantos; i++)
        {
            Debug.Log("Spawnou inimigo " + (i + 1));
            yield return esperaCurta; // reutiliza a instância
        }
        ondaAtual = null;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Esperando uma condição arbitrária ficar verdadeira.
using UnityEngine;
using System.Collections;

public class EsperaCarregamento : MonoBehaviour
{
    public bool recursosProntos = false;

    IEnumerator Start()
    {
        Debug.Log("Esperando recursos...");
        // Lambda checada a cada frame, até virar true.
        yield return new WaitUntil(() => recursosProntos);
        Debug.Log("Tudo pronto, podemos jogar.");
    }
}`,
      },
    ],
    points: [
      "Coroutine = método IEnumerator que pausa com yield return e continua depois.",
      "Inicie com StartCoroutine, pare com StopCoroutine guardando a referência.",
      "yield return null espera um frame; WaitForSeconds espera tempo de jogo.",
      "Cuidado: coroutine para imediatamente se o GameObject é desativado.",
      "Reutilize 'new WaitForSeconds(x)' em variável estática para evitar lixo de GC.",
      "Coroutines não são threads; tudo continua na main thread do Unity.",
      "Para projetos modernos, considere async/await + UniTask como alternativa.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Se você desativar o GameObject (SetActive(false)) no meio de uma coroutine, ela morre sem aviso e não roda o que viria depois do yield. Cuidado com cleanup esperando após pausas.",
      },
      {
        type: "tip",
        content: "Para esperar até o próximo FixedUpdate, use 'yield return new WaitForFixedUpdate()'. Para esperar o fim do frame (depois do render), use 'WaitForEndOfFrame'. Útil para screenshots.",
      },
      {
        type: "info",
        content: "WaitForSeconds usa Time.timeScale, então se você pausar o jogo (Time.timeScale = 0), as coroutines com WaitForSeconds congelam. Para ignorar pausa, use WaitForSecondsRealtime.",
      },
    ],
  },
  {
    slug: "time-deltatime",
    section: "scripting",
    title: "Time.deltaTime: movimento independente de FPS",
    difficulty: "iniciante",
    subtitle: "Por que multiplicar por deltaTime é o segredo para seu jogo se comportar igual em qualquer máquina.",
    intro: `Quando você escreve "transform.position += Vector3.right * 5f" dentro de um Update, parece simples: mover o objeto 5 unidades para a direita por frame. Mas pense no que isso significa: em uma máquina rodando a 60 FPS, ele se move 60 * 5 = 300 unidades por segundo. Em uma máquina lenta de 30 FPS, ele se move 150 unidades por segundo. O mesmo jogo, na mesma cena, com velocidades completamente diferentes dependendo do hardware. Isso é inaceitável.

A solução é Time.deltaTime: o tempo, em segundos, que se passou desde o último frame. Em 60 FPS, deltaTime vale aproximadamente 0.0166. Em 30 FPS, vale 0.0333. Quando você multiplica seu movimento por deltaTime, está dizendo "quero me mover 5 unidades por SEGUNDO, não por frame". A matemática se ajusta sozinha: 60 * 5 * 0.0166 = 5; 30 * 5 * 0.0333 = 5. Mesmo resultado por segundo, em qualquer FPS.

A regra que você precisa fixar: dentro de Update, qualquer coisa que aconteça "ao longo do tempo" multiplica por Time.deltaTime. Movimento, rotação, cooldowns, contadores. Já dentro de FixedUpdate, use Time.fixedDeltaTime (que é constante e igual ao passo da física). Não confunda: usar deltaTime no FixedUpdate dá resultado correto na média mas com micro-tremores.

Outras propriedades úteis: Time.time (segundos totais desde o jogo começar), Time.timeScale (1 = velocidade normal, 0 = pausa, 0.5 = câmera lenta), Time.unscaledDeltaTime (delta ignorando timeScale, útil para UI que precisa funcionar mesmo com jogo pausado). Dominar Time é dominar a sensação de fluidez do jogo.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;

public class MovimentoCorreto : MonoBehaviour
{
    public float velocidade = 5f; // unidades POR SEGUNDO

    void Update()
    {
        // ERRADO: depende do FPS, fica rápido em PC bom e lento em PC ruim.
        // transform.Translate(Vector3.right * velocidade);

        // CERTO: movimento consistente em qualquer FPS.
        transform.Translate(Vector3.right * velocidade * Time.deltaTime);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Cooldowns e timers que respeitam o tempo real.
using UnityEngine;

public class TiroComCooldown : MonoBehaviour
{
    public float intervaloDeTiro = 0.5f; // tempo entre disparos
    private float tempoRestante = 0f;

    void Update()
    {
        // Decrementa em segundos, não em frames.
        tempoRestante -= Time.deltaTime;

        if (Input.GetButton("Fire1") && tempoRestante <= 0f)
        {
            Atirar();
            tempoRestante = intervaloDeTiro; // reseta o cooldown
        }
    }

    void Atirar()
    {
        Debug.Log("Pew!");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Pausando o jogo de forma global com timeScale.
using UnityEngine;

public class GerenciadorPausa : MonoBehaviour
{
    private bool pausado = false;

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            pausado = !pausado;
            // timeScale = 0 congela física, animações e Time.deltaTime.
            Time.timeScale = pausado ? 0f : 1f;
        }
    }
}

// Já a UI que precisa funcionar pausada usa Time.unscaledDeltaTime:
public class AnimacaoMenu : MonoBehaviour
{
    public RectTransform painel;
    void Update()
    {
        // unscaledDeltaTime ignora Time.timeScale, então o menu segue animando mesmo pausado.
        painel.Rotate(0f, 0f, 90f * Time.unscaledDeltaTime);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Câmera lenta dramática (slow-motion) e voltar ao normal.
using UnityEngine;
using System.Collections;

public class CameraLenta : MonoBehaviour
{
    public void DispararCameraLenta(float duracao)
    {
        StartCoroutine(RotinaSlowMo(duracao));
    }

    IEnumerator RotinaSlowMo(float duracao)
    {
        Time.timeScale = 0.3f;
        // WaitForSecondsRealtime ignora timeScale, senão a espera também seria 'lenta'.
        yield return new WaitForSecondsRealtime(duracao);
        Time.timeScale = 1f;
    }
}`,
      },
    ],
    points: [
      "Multiplique por Time.deltaTime no Update para velocidade independente de FPS.",
      "No FixedUpdate, use Time.fixedDeltaTime (constante).",
      "Time.time = segundos desde o jogo começar; útil para timestamps.",
      "Time.timeScale controla velocidade global; 0 pausa o mundo.",
      "Time.unscaledDeltaTime ignora pausa; ideal para UI e menu.",
      "WaitForSecondsRealtime em coroutines ignora timeScale.",
      "Cooldowns em segundos: subtrair deltaTime até zerar é o padrão mais simples.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Time.timeScale = 0 NÃO para o Update dos seus scripts: ele só zera o deltaTime e congela física. Inputs e código continuam rodando. Cuide disso na lógica de pausa.",
      },
      {
        type: "tip",
        content: "Para movimento curvado (ex: orbitar) prefira Mathf.Lerp / Vector3.Slerp combinados com deltaTime. Resultado mais suave do que somar manualmente.",
      },
    ],
  },
  {
    slug: "getcomponent",
    section: "scripting",
    title: "GetComponent: como conversar com outros componentes",
    difficulty: "iniciante",
    subtitle: "A forma correta (e a errada) de pegar referências para outros componentes do mesmo objeto, do pai ou dos filhos.",
    intro: `Em Unity, um GameObject sozinho não faz nada. Quem dá comportamento são os componentes pendurados nele: Transform, Rigidbody, Collider, AudioSource, seus próprios scripts. Para que um script converse com outro componente, ele precisa pegar uma "referência" para esse componente. A forma mais comum de fazer isso é com GetComponent<T>().

GetComponent<Rigidbody>() basicamente diz: "no GameObject onde EU estou, me dê o Rigidbody se existir, ou null se não existir". Existe também GetComponentInParent<T>() que sobe a hierarquia procurando, e GetComponentInChildren<T>() que desce procurando nos filhos. Cada um tem seu uso e seu custo.

A pegadinha número 1: GetComponent é relativamente caro. Não custa o mundo, mas se você chamar dentro do Update todo frame, em centenas de objetos, vira gargalo. A boa prática é cachear: chamar uma vez no Awake e guardar em variável privada. Depois disso, você usa a variável e nunca mais paga o custo da busca.

A pegadinha número 2: GetComponent retorna null se o componente não existir. Acessar uma referência null gera NullReferenceException, o erro mais comum em jogos Unity. A defesa é o atributo [RequireComponent(typeof(Rigidbody))] na classe, que obriga o Unity a adicionar o componente automaticamente quando você arrasta seu script para um GameObject. Isso elimina uma classe inteira de bugs.

Por fim, sempre que possível, prefira atribuir referências PELO INSPECTOR (com [SerializeField] private Rigidbody rb;). É mais rápido em runtime (zero busca) e força você a montar a cena de forma explícita. GetComponent fica para casos genéricos ou quando o componente é adicionado dinamicamente.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;

// RequireComponent garante que o Rigidbody exista no GameObject.
// Se você arrastar este script para um cubo sem Rigidbody, o Unity adiciona sozinho.
[RequireComponent(typeof(Rigidbody))]
public class PuloSimples : MonoBehaviour
{
    private Rigidbody rb; // cache: ocupa um slot e nunca mais buscamos

    void Awake()
    {
        // Pegar a referência UMA vez, no Awake. Boa prática universal.
        rb = GetComponent<Rigidbody>();
    }

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Space))
        {
            // Usa o cache, sem custo de busca.
            rb.AddForce(Vector3.up * 5f, ForceMode.Impulse);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Buscar em pai e em filhos, e quando usar cada um.
using UnityEngine;

public class ExemploHierarquia : MonoBehaviour
{
    void Start()
    {
        // GetComponent: SÓ no GameObject deste script.
        var meuCol = GetComponent<Collider>();

        // GetComponentInParent: sobe a árvore até achar (ou null).
        // Útil quando uma 'mão' do personagem precisa achar o 'corpo' principal.
        var statsDoCorpo = GetComponentInParent<EstatisticasJogador>();

        // GetComponentInChildren: desce nos filhos. Pega o PRIMEIRO encontrado em profundidade.
        // Útil para um jogador que tem um Renderer no filho 'Modelo'.
        var rendDoModelo = GetComponentInChildren<Renderer>();

        // Versão plural: pega TODOS, em array.
        Renderer[] todos = GetComponentsInChildren<Renderer>();
        Debug.Log("Total de renderers nos filhos: " + todos.Length);
    }
}

public class EstatisticasJogador : MonoBehaviour
{
    public int vida = 100;
}`,
      },
      {
        lang: "csharp",
        code: `// Preferindo referência via Inspector com SerializeField.
using UnityEngine;

public class ReferenciaPeloInspector : MonoBehaviour
{
    // [SerializeField] mostra no Inspector mesmo sendo private.
    // Mais rápido em runtime: zero busca, é só uma referência direta.
    [SerializeField] private Rigidbody rb;
    [SerializeField] private AudioSource som;

    void Awake()
    {
        // Defesa: se esqueceu de arrastar no Inspector, busca na hora e avisa.
        if (rb == null) rb = GetComponent<Rigidbody>();
        if (som == null) Debug.LogWarning("AudioSource nao foi atribuido em " + name);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Padrão 'TryGetComponent': mais limpo do que checar null.
using UnityEngine;

public class InteragirComObjeto : MonoBehaviour
{
    void OnTriggerEnter(Collider outro)
    {
        // TryGetComponent retorna bool e preenche a variável se achar.
        if (outro.TryGetComponent<Item>(out var item))
        {
            Debug.Log("Coletei: " + item.nome);
            Destroy(outro.gameObject);
        }
    }
}

public class Item : MonoBehaviour
{
    public string nome = "Poção";
}`,
      },
    ],
    points: [
      "GetComponent<T>() pega componente do MESMO GameObject; retorna null se não existir.",
      "GetComponentInParent / GetComponentInChildren sobem ou descem a hierarquia.",
      "Sempre cacheie no Awake: chamar GetComponent no Update toda hora pesa.",
      "[RequireComponent] no topo da classe garante que a dependência exista.",
      "[SerializeField] private + arrastar no Inspector é mais rápido que GetComponent.",
      "TryGetComponent é mais limpo do que GetComponent + checar null.",
      "GetComponentsInChildren retorna inativos também se passar 'true' como parâmetro.",
    ],
    alerts: [
      {
        type: "warning",
        content: "GetComponentInChildren INCLUI o próprio GameObject na busca. Se o componente também existe no pai, ele retorna o do pai antes dos filhos. Ler a doc evita confusão.",
      },
      {
        type: "tip",
        content: "No Unity 2020+ existe a otimização: chamar GetComponent retornando struct (ex: Transform) tem custo zero porque é cacheado internamente. Mesmo assim, manter cache explícito é mais legível.",
      },
      {
        type: "danger",
        content: "Nunca chame GetComponent no construtor da classe. MonoBehaviours não usam construtor; sempre use Awake. Construtor pode rodar em momento inválido e crashar a Editor.",
      },
    ],
  },
  {
    slug: "find-objects",
    section: "scripting",
    title: "Find e FindObjectsByType: achando coisas pela cena",
    difficulty: "intermediario",
    subtitle: "Quando vale buscar objetos pelo nome ou pelo tipo, e por que essas funções têm fama (merecida) de lentas.",
    intro: `Às vezes o seu script precisa achar um objeto que não foi pré-arrastado no Inspector: o jogador, o gerenciador da cena, todos os inimigos vivos. O Unity oferece várias funções para isso, e cada uma tem custo, propósito e uma reputação ruim quando usada errado.

GameObject.Find("NomeDoObjeto") faz uma varredura pela cena inteira procurando por nome. Funciona, mas é lento (pode varrer milhares de objetos), e quebra silenciosamente se você renomear o objeto. Já GameObject.FindWithTag("Player") é bem mais rápido, porque o Unity mantém um índice por tag. É a forma preferida para achar 1 jogador, 1 câmera principal, 1 spawn point.

Para achar TODOS os objetos de um tipo, antes existia FindObjectsOfType<T>(), que está marcado como obsoleto a partir do Unity 2023. O substituto moderno é FindObjectsByType<T>(FindObjectsSortMode.None), que é até 5x mais rápido porque permite pular a ordenação. Use sempre FindObjectsSortMode.None se a ordem não importa, e .InstanceID se importar (muito menos comum).

A regra de ouro: NUNCA chame essas funções dentro de Update. Elas são caras. Chame uma vez em Start, guarde a referência, e pronto. Para casos onde objetos surgem e somem ao longo do jogo (inimigos spawnando), prefira manter uma lista própria, atualizada por OnEnable/OnDisable de cada inimigo. Isso troca uma busca cara por um cache barato.

Para casos onde você quer um único ponto de acesso (gerenciador de UI, gerenciador de áudio), o padrão mais usado é Singleton: o próprio gerenciador se registra em uma variável estática Instance no Awake, e qualquer um acessa via "MeuGerenciador.Instance" sem custo de busca.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;

public class ExemplosBusca : MonoBehaviour
{
    void Start()
    {
        // 1) Buscar por NOME: lento e frágil. Use só em ferramentas de editor.
        GameObject lampada = GameObject.Find("LampadaSala");

        // 2) Buscar por TAG: rápido e robusto. Marque a tag no Inspector.
        GameObject jogador = GameObject.FindWithTag("Player");

        // 3) Buscar TODOS por tipo (Unity 2023+):
        // FindObjectsSortMode.None pula a ordenacao e e mais rapido.
        Inimigo[] inimigos = Object.FindObjectsByType<Inimigo>(FindObjectsSortMode.None);
        Debug.Log("Inimigos vivos na cena: " + inimigos.Length);

        // 4) Achar UM objeto por tipo (devolve o primeiro que encontrar):
        var spawn = Object.FindFirstObjectByType<SpawnPoint>();
        if (spawn != null) Debug.Log("Spawn em: " + spawn.transform.position);
    }
}

public class Inimigo : MonoBehaviour {}
public class SpawnPoint : MonoBehaviour {}`,
      },
      {
        lang: "csharp",
        code: `// Padrão Singleton: gerenciador acessível globalmente sem busca repetida.
using UnityEngine;

public class GerenciadorSom : MonoBehaviour
{
    // Variável estática: existe uma única na memória, acessível de qualquer lugar.
    public static GerenciadorSom Instance { get; private set; }

    public AudioSource source;

    void Awake()
    {
        // Se já existe outra instância, mata esta para evitar duplicidade.
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
        // DontDestroyOnLoad mantém o objeto vivo entre cenas.
        DontDestroyOnLoad(gameObject);
    }

    public void Tocar(AudioClip clip)
    {
        source.PlayOneShot(clip);
    }
}

// Em qualquer outro script, sem busca:
public class Tiro : MonoBehaviour
{
    public AudioClip somTiro;
    void Atirar()
    {
        GerenciadorSom.Instance.Tocar(somTiro);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Lista auto-gerenciada: cada inimigo se registra ao nascer e remove ao morrer.
using System.Collections.Generic;
using UnityEngine;

public class Inimigo2 : MonoBehaviour
{
    // Lista estática compartilhada por todos os inimigos.
    public static readonly List<Inimigo2> Vivos = new List<Inimigo2>();

    void OnEnable()  { Vivos.Add(this); }
    void OnDisable() { Vivos.Remove(this); }

    // Em vez de FindObjectsByType<Inimigo2>() todo frame,
    // qualquer sistema só consulta Inimigo2.Vivos. Custo: zero.
}`,
      },
    ],
    points: [
      "GameObject.Find: por nome, lento, frágil; só para ferramentas/editor.",
      "GameObject.FindWithTag: por tag, rápido, ideal para jogador/câmera.",
      "FindObjectsByType<T>(FindObjectsSortMode.None) substitui o antigo FindObjectsOfType.",
      "FindFirstObjectByType<T>() para pegar só o primeiro existente.",
      "NUNCA chame Find* dentro de Update; cacheie no Start.",
      "Singletons via static Instance evitam busca e centralizam acesso.",
      "Listas auto-gerenciadas (OnEnable/OnDisable) substituem buscas frequentes.",
    ],
    alerts: [
      {
        type: "info",
        content: "FindObjectsOfType<T>() ainda compila no Unity 2023+ mas vem marcado como obsoleto. Migre para FindObjectsByType para silenciar warnings e ganhar performance.",
      },
      {
        type: "warning",
        content: "DontDestroyOnLoad só funciona em GameObjects de raiz da hierarquia. Se seu Singleton é filho de outro objeto, ele será destruído mesmo assim. Garanta que está na raiz.",
      },
      {
        type: "tip",
        content: "Para projetos grandes, considere usar um framework de injeção de dependências como Zenject ou VContainer. Resolve acesso global sem o acoplamento dos Singletons clássicos.",
      },
    ],
  },
  {
    slug: "ordem-execucao",
    section: "scripting",
    title: "Ordem de Execução: quem roda primeiro?",
    difficulty: "intermediario",
    subtitle: "A ordem completa dos eventos de um frame Unity e como controlar quando o seu script roda em relação aos outros.",
    intro: `Cada frame de Unity passa por uma sequência fixa de fases: input, FixedUpdate (zero ou mais vezes, dependendo do tempo acumulado), Update, animações, LateUpdate, render, fim de frame. Dentro de cada fase, o Unity chama o método correspondente em todos os scripts ativos. A ordem entre scripts diferentes na MESMA fase, porém, é IMPREVISÍVEL por padrão.

Isso significa: se o ScriptA.Update e o ScriptB.Update existem, você não tem garantia de qual roda primeiro em um frame. Na maioria das vezes não importa. Mas em casos como "o gerenciador de input precisa rodar antes dos jogadores" ou "a câmera precisa rodar depois de tudo", isso vira problema sério.

Existem duas formas de controlar essa ordem. A primeira é o Script Execution Order (Edit > Project Settings > Script Execution Order), uma janela onde você arrasta scripts para uma lista e define um número: scripts com número menor rodam ANTES dos com número maior. Use com moderação: configurar 50 scripts ali vira pesadelo.

A segunda forma é mais elegante para casos pontuais: usar LateUpdate em vez de Update (para coisas que devem rodar depois), ou usar callbacks como OnPreRender, OnPostRender (legados), Application.onBeforeRender, ou eventos do PlayerLoop em projetos modernos. Para a maioria dos projetos, a regra é: se você está mexendo na ordem de execução com frequência, provavelmente está com um problema de arquitetura — eventos e dependências explícitas resolvem melhor.

A ordem completa dentro de um frame é mais ou menos esta: Awake -> OnEnable (em inicialização) -> Start -> [loop] FixedUpdate -> física e colisões -> OnTrigger/OnCollision -> input -> Update -> animator -> LateUpdate -> render -> OnGUI -> fim de frame -> [próximo frame]. Decorar isso ajuda a debugar 90% dos bugs de timing.`,
    codes: [
      {
        lang: "csharp",
        code: `// Forçando um script a rodar antes dos outros via atributo.
using UnityEngine;

// Número negativo: roda ANTES de scripts com ordem 0 (padrão).
// Número positivo: roda DEPOIS.
[DefaultExecutionOrder(-100)]
public class GerenciadorInput : MonoBehaviour
{
    public static float horizontal;
    public static float vertical;

    void Update()
    {
        // Como temos -100, este Update roda antes dos scripts dos jogadores (ordem 0).
        horizontal = Input.GetAxisRaw("Horizontal");
        vertical = Input.GetAxisRaw("Vertical");
    }
}

public class JogadorUsaInput : MonoBehaviour
{
    void Update()
    {
        // Já garantido: GerenciadorInput.Update rodou antes neste frame.
        Vector3 mov = new Vector3(GerenciadorInput.horizontal, 0, GerenciadorInput.vertical);
        transform.Translate(mov * 5f * Time.deltaTime);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Demonstração visual da ordem dos eventos em um único objeto.
using UnityEngine;

public class LogarOrdem : MonoBehaviour
{
    void Awake()        { Debug.Log("1 Awake"); }
    void OnEnable()     { Debug.Log("2 OnEnable"); }
    void Start()        { Debug.Log("3 Start"); }
    void FixedUpdate()  { Debug.Log("4 FixedUpdate"); }
    void Update()       { Debug.Log("5 Update"); }
    void LateUpdate()   { Debug.Log("6 LateUpdate"); }
    void OnDisable()    { Debug.Log("7 OnDisable"); }
    void OnDestroy()    { Debug.Log("8 OnDestroy"); }
}`,
      },
      {
        lang: "csharp",
        code: `// Padrão: usar evento próprio em vez de mexer em ordem de execução.
// Mais escalável e não 'esconde' dependências.
using System;
using UnityEngine;

public class TickGlobal : MonoBehaviour
{
    public static event Action AoAtualizar;

    void Update()
    {
        // Centralizamos o tick aqui; outros sistemas se inscrevem no evento.
        AoAtualizar?.Invoke();
    }
}

public class SistemaA : MonoBehaviour
{
    void OnEnable()  { TickGlobal.AoAtualizar += MeuTick; }
    void OnDisable() { TickGlobal.AoAtualizar -= MeuTick; }
    void MeuTick()   { /* lógica do sistema A */ }
}`,
      },
    ],
    points: [
      "Dentro da mesma fase (ex: Update), a ordem entre scripts é imprevisível.",
      "Use [DefaultExecutionOrder(n)] para forçar ordem específica em um script.",
      "Edit > Project Settings > Script Execution Order faz o mesmo via UI.",
      "Prefira LateUpdate para 'rodar depois de todo mundo' em vez de mexer em ordens.",
      "Decore o ciclo: Awake -> OnEnable -> Start -> FixedUpdate -> Update -> LateUpdate.",
      "Eventos próprios (Action) costumam ser melhores que reordenar scripts.",
      "Configurar muitos scripts no Execution Order vira pesadelo de manutenção.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Script Execution Order não controla a ordem de Awake entre dois scripts no MESMO GameObject ao adicionar via AddComponent em runtime: nesse caso vai pela ordem de adição.",
      },
      {
        type: "tip",
        content: "Quando bater dúvida de ordem, jogue Debug.Log com nome do script e fase em pontos suspeitos. Em 5 minutos você descobre quem roda quando, sem ler doc.",
      },
    ],
  },
  {
    slug: "debug-log",
    section: "scripting",
    title: "Debug.Log e amigos: a ferramenta mais subestimada",
    difficulty: "iniciante",
    subtitle: "Como usar Debug.Log, LogWarning, LogError, DrawLine e Gizmos para enxergar o que está acontecendo no seu jogo.",
    intro: `Quase todo iniciante começa caçando bugs com a estratégia "fica olhando o jogo e tentando adivinhar o que está errado". Esse caminho é doloroso. A ferramenta mais simples e mais poderosa para entender o que seu código está fazendo é Debug.Log. Ela imprime uma mensagem na janela Console (Window > General > Console). Você pode imprimir variáveis, marcar pontos do código, conferir se um método foi mesmo chamado, ver valores em tempo real.

Existem três níveis principais. Debug.Log é informação geral (preto). Debug.LogWarning é amarelo: indica algo suspeito mas não quebrado. Debug.LogError é vermelho e PAUSA o jogo se "Error Pause" estiver ligado no Console. Use os três para criar uma escala visual rápida: as linhas vermelhas e amarelas do Console te puxam o olhar, as pretas ficam de informação.

Existe também a versão sobrecarregada Debug.Log("texto", contexto): o segundo parâmetro é um objeto Unity (geralmente "this" ou um GameObject), e quando você clica na linha do Console, o Unity HIGHLIGHTA esse objeto na cena. Isso é mágico para descobrir "qual dos 50 inimigos disparou esse log". Pouca gente usa, e é a feature mais útil do Console.

Para debug visual em 3D, existe Debug.DrawLine e Debug.DrawRay: desenham linhas que aparecem na Scene View (e na Game View se "Gizmos" estiver ligado). Perfeito para visualizar raycasts, vetores de movimento, áreas de patrulha. Para visualização persistente em qualquer momento (não só rodando), implemente OnDrawGizmos no script: tudo que você desenhar lá aparece sempre na Scene.

Por último: lembre que Debug.Log custa CPU e gera alocação. Em código quente (chamado muitas vezes por frame) com Logs ativos, o jogo pode lagar. Em build final, considere o atributo [Conditional] para remover logs de release, ou use Debug.unityLogger.logEnabled = false para desligar tudo.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;

public class ExemplosDebug : MonoBehaviour
{
    public int vida = 100;

    void Start()
    {
        // Log básico: aparece preto no Console.
        Debug.Log("Inimigo iniciado com vida " + vida);

        // Log com contexto: clicar no Console destaca este GameObject na cena.
        Debug.Log("Inimigo iniciado em " + transform.position, this);

        // Warning: aparece amarelo. Use para coisas suspeitas mas não fatais.
        if (vida < 50) Debug.LogWarning("Vida baixa para inimigo " + name);

        // Error: aparece vermelho. Pausa se 'Error Pause' estiver ligado.
        if (vida <= 0) Debug.LogError("Inimigo morto antes de comecar! " + name, this);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Visualização de Raycast com DrawRay no Update.
using UnityEngine;

public class TiroComDebug : MonoBehaviour
{
    public float alcance = 10f;

    void Update()
    {
        Vector3 origem = transform.position;
        Vector3 direcao = transform.forward * alcance;

        // Linha vermelha visível na Scene mostrando para onde o raio vai.
        Debug.DrawRay(origem, direcao, Color.red);

        if (Input.GetButtonDown("Fire1"))
        {
            if (Physics.Raycast(origem, transform.forward, out RaycastHit hit, alcance))
            {
                Debug.Log("Acertou: " + hit.collider.name, hit.collider);
                // Linha verde do ponto de impacto, persiste 2 segundos.
                Debug.DrawLine(origem, hit.point, Color.green, 2f);
            }
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Gizmos para visualizar áreas mesmo com o jogo parado.
using UnityEngine;

public class AreaDeDeteccao : MonoBehaviour
{
    public float raio = 5f;

    // OnDrawGizmos roda sempre na Scene View, mesmo fora do Play.
    void OnDrawGizmos()
    {
        Gizmos.color = new Color(1f, 0f, 0f, 0.25f);
        Gizmos.DrawSphere(transform.position, raio);
    }

    // OnDrawGizmosSelected só desenha quando o objeto está selecionado.
    void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.yellow;
        Gizmos.DrawWireSphere(transform.position, raio * 1.5f);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Removendo logs em build final com [Conditional].
using UnityEngine;
using System.Diagnostics; // namespace de Conditional

public static class Logger
{
    // Esta chamada SOME do binário compilado se DEBUG não estiver definido.
    // No Editor e em builds de Development, roda; em Release, é eliminada pelo compilador.
    [Conditional("UNITY_EDITOR"), Conditional("DEVELOPMENT_BUILD")]
    public static void LogDev(string mensagem)
    {
        UnityEngine.Debug.Log("[DEV] " + mensagem);
    }
}

// Uso:
// Logger.LogDev("Verificando dano " + dano);  // some no build final, sem custo`,
      },
    ],
    points: [
      "Debug.Log / LogWarning / LogError dão escala visual no Console.",
      "Passe 'this' como segundo parâmetro: clicar no Console destaca o objeto.",
      "Debug.DrawLine e DrawRay visualizam vetores e raycasts em runtime.",
      "OnDrawGizmos desenha sempre na Scene; OnDrawGizmosSelected só quando selecionado.",
      "Debug.Log custa performance e gera alocação; cuidado em código quente.",
      "Use [Conditional] para remover logs em builds de release.",
      "Ative 'Error Pause' no Console para parar o Editor no primeiro erro.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Use Debug.Break() para pausar a Editor no exato momento que uma condição acontece. Combinado com Debug.Log, é mais rápido que muitos breakpoints.",
      },
      {
        type: "warning",
        content: "Debug.Log com concatenação de string ('a ' + b + ' c') gera alocação mesmo se o log estiver desligado. Em hotpath, use Debug.unityLogger.logEnabled ou [Conditional] para evitar.",
      },
      {
        type: "info",
        content: "No Console, clique no ícone de ampulheta (Collapse) para juntar logs idênticos. Ajuda a perceber quando o mesmo erro acontece 10000 vezes por segundo.",
      },
    ],
  },
];
