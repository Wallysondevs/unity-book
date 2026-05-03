import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "navmesh",
    section: "ai-gameplay",
    title: "NavMesh: o mapa invisível dos personagens",
    difficulty: "avancado",
    subtitle: "Como o Unity calcula caminhos andáveis e gera a malha de navegação.",
    intro: `Imagine que você é um turista em uma cidade nova e precisa ir do hotel até um restaurante. Você não calcula rotas medindo cada calçada com régua: você abre um mapa que já marca onde dá para andar (calçadas, ruas) e onde não dá (paredes, rios, cercas). O NavMesh do Unity é exatamente esse mapa, só que para personagens dentro do jogo. Em vez de cada inimigo ficar tentando descobrir sozinho, em tempo real, se uma rampa é passável ou se aquele buraco é fundo demais, o Unity pré-processa o cenário e gera uma "malha de navegação" — um polígono enorme cobrindo só as áreas onde personagens podem pisar.

O problema que o NavMesh resolve é caro: pathfinding (encontrar o melhor caminho entre A e B) num mundo 3D arbitrário é matematicamente complicado e custa muita CPU se feito do zero a cada frame. Algoritmos clássicos como A* precisam de um grafo. O NavMesh constrói esse grafo automaticamente analisando colisores, inclinações, alturas de degraus e raio do agente. Depois, na hora do jogo, achar um caminho é só uma busca rápida nesse grafo já pronto.

Existem dois sabores de NavMesh hoje no Unity. O clássico, embutido na engine, faz o "bake" estático no editor: você marca os objetos como Navigation Static, abre a janela Window > AI > Navigation, ajusta agente e baixa o botão Bake. Funciona bem para cenários que não mudam. Já o pacote AI Navigation (com NavMeshSurface, NavMeshModifier, NavMeshLink, NavMeshObstacle) permite gerar e atualizar a malha em tempo de execução, suporta múltiplos agentes de tamanhos diferentes e é o que você deve usar em projetos novos. O componente NavMeshSurface é o coração disso: você adiciona ele em um GameObject vazio e mandar BuildNavMesh() recria a malha a partir das geometrias da cena.

Quando NÃO usar NavMesh? Em jogos 2D top-down com tilemap, normalmente um A* de grid próprio é mais simples e flexível. Em mundos procedurais infinitos, o custo de rebuildar pode pesar — vale considerar pathfinding customizado por chunks. E em jogos com voo livre ou mecânicas de escalada complexas, o NavMesh padrão (que assume agentes "andando no chão") simplesmente não dá conta. Para 90% dos casos de inimigos terrestres em FPS, RPG ou estratégia, porém, ele é a escolha certa e economiza semanas de trabalho.`,
    codes: [
      {
        lang: "csharp",
        code: `// Gerar a NavMesh em runtime a partir de um NavMeshSurface.
// Útil quando o cenário muda (peças encaixadas, destruição, geração procedural).
using UnityEngine;
using Unity.AI.Navigation; // pacote com.unity.ai.navigation

public class NavMeshBuilder : MonoBehaviour
{
    // Arraste aqui o GameObject que tem o componente NavMeshSurface.
    [SerializeField] private NavMeshSurface surface;

    private void Start()
    {
        // Constrói a malha pela primeira vez no início do jogo.
        surface.BuildNavMesh();
    }

    // Chame este método sempre que abrir/fechar uma porta, derrubar parede,
    // ou instanciar geometria nova que precise ser considerada.
    public void RebuildNavMesh()
    {
        // UpdateNavMesh é incremental e mais barato que BuildNavMesh do zero.
        surface.UpdateNavMesh(surface.navMeshData);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Marcando obstáculos dinâmicos sem rebuildar a malha inteira.
// NavMeshObstacle "fura" a malha em volta dele em tempo real.
using UnityEngine;
using UnityEngine.AI;

[RequireComponent(typeof(NavMeshObstacle))]
public class CaixaMovel : MonoBehaviour
{
    private NavMeshObstacle obstacle;

    private void Awake()
    {
        obstacle = GetComponent<NavMeshObstacle>();

        // Carve = true faz o obstacle realmente cortar a NavMesh,
        // forçando agentes a desviar. Custa mais CPU; use em poucos objetos.
        obstacle.carving = true;

        // CarveOnlyStationary evita re-carve enquanto o objeto está se movendo,
        // o que reduz picos de processamento.
        obstacle.carveOnlyStationary = true;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Áreas customizadas: marcar "água" como custo alto faz o agente
// preferir caminhos secos, mesmo que sejam mais longos.
using UnityEngine;
using UnityEngine.AI;

public class CustoDeAreas : MonoBehaviour
{
    private void Start()
    {
        // Pegamos o índice da área "Water" definida na janela Navigation > Areas.
        int areaAgua = NavMesh.GetAreaFromName("Water");

        // Definimos o custo dessa área como 5 (padrão é 1).
        // O caminho por água passa a ser 5x mais caro que por terra.
        NavMesh.SetAreaCost(areaAgua, 5f);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Calculando um caminho SEM mover o agente, só para visualizar/validar.
using UnityEngine;
using UnityEngine.AI;

public class PreviewCaminho : MonoBehaviour
{
    [SerializeField] private Transform destino;

    private void Update()
    {
        NavMeshPath caminho = new NavMeshPath();

        // CalculatePath devolve true se conseguiu chegar (parcial ou completo).
        if (NavMesh.CalculatePath(transform.position, destino.position, NavMesh.AllAreas, caminho))
        {
            // Desenhamos linha por linha entre os pontos do caminho na Scene view.
            for (int i = 0; i < caminho.corners.Length - 1; i++)
            {
                Debug.DrawLine(caminho.corners[i], caminho.corners[i + 1], Color.green);
            }

            // status pode ser Complete, Partial ou Invalid.
            if (caminho.status == NavMeshPathStatus.PathPartial)
                Debug.LogWarning("Destino inacessível, caminho parcial.");
        }
    }
}`,
      },
    ],
    points: [
      "NavMesh é uma malha pré-calculada de áreas andáveis, não um cálculo por frame.",
      "Bake estático no editor serve para cenários fixos; NavMeshSurface serve para cenas dinâmicas.",
      "Use o pacote AI Navigation (com.unity.ai.navigation) em projetos novos, não o sistema legado.",
      "NavMeshObstacle com carving permite obstáculos em tempo real sem rebuild completo.",
      "Áreas customizadas (Water, Lava) e custos guiam o agente por rotas preferidas.",
      "Para múltiplos tamanhos de inimigo, faça vários NavMeshSurface, um por agent type.",
      "Pegadinha: esquecer de marcar geometria como Navigation Static antes de bakear.",
      "Pegadinha: agente cair pelo chão se o NavMesh não cobrir a posição de spawn.",
    ],
    alerts: [
      {
        type: "warning",
        content: "O sistema NavMesh antigo (sem o pacote AI Navigation) ainda funciona, mas é considerado legado. Documentação nova, exemplos e suporte da comunidade focam em NavMeshSurface. Não invista tempo aprendendo a janela legada se você está começando agora.",
      },
      {
        type: "tip",
        content: "Sempre habilite Show NavMesh na janela Navigation enquanto faz o bake. A área azul mostrada é o que o agente realmente enxerga. Se algo estranho acontece (inimigo travado, andando em buraco), 90% das vezes o problema está visível ali.",
      },
      {
        type: "info",
        content: "BuildNavMesh em runtime trava a thread principal por alguns milissegundos em cenas grandes. Para mundos enormes, divida em vários NavMeshSurface menores e bake só os que estão perto do jogador.",
      },
    ],
  },
  {
    slug: "navmesh-agent",
    section: "ai-gameplay",
    title: "NavMeshAgent: movendo personagens com inteligência",
    difficulty: "avancado",
    subtitle: "Configuração prática do componente que faz inimigos perseguirem, patrulharem e desviarem.",
    intro: `O NavMesh por si só é só o mapa. Quem caminha sobre ele é o NavMeshAgent — o componente que você cola num inimigo e que faz toda a mágica de "vai do ponto A até o ponto B desviando das paredes". Pense nele como um motorista de táxi com GPS: você fala o endereço (SetDestination), e ele cuida de calcular a rota, acelerar, frear, virar e parar perto do destino. Você não precisa programar curvas, evitar colisão com outros agentes ou suavizar movimento — tudo isso vem de fábrica.

Por baixo dos panos, o NavMeshAgent faz três coisas em ordem: encontra um caminho no NavMesh (uma sequência de cantos chamados corners), move o transform a cada frame respeitando velocidade máxima e aceleração, e usa um sistema chamado RVO (Reciprocal Velocity Obstacles) para que vários agentes não se atravessem. As propriedades-chave são speed (velocidade máxima em metros por segundo), angularSpeed (graus por segundo na rotação), acceleration (quão rápido atinge a velocidade máxima), stoppingDistance (quanto antes do destino ele deve parar) e radius/height (tamanho do "cilindro" do agente, usado para evitar colisões e calcular se cabe em um vão).

A propriedade isOnNavMesh é seu melhor amigo na hora de debugar. Se você instancia um inimigo no ar, longe da malha, ela retorna false e qualquer chamada de SetDestination vai falhar silenciosamente. Sempre faça spawn em cima do NavMesh ou use NavMesh.SamplePosition para "encaixar" a posição na malha mais próxima. Outro ponto importante: o NavMeshAgent é um motor de movimento — ele já modifica o transform.position. Se você também tem um Rigidbody na mesma entidade, configure-o como kinematic, ou os dois vão brigar e o personagem vai tremer feito gelatina.

Para situações que o NavMesh não cobre — pular janela, escalar escada, teleporte — existem os OffMeshLink. Você desenha manualmente uma "ponte" entre duas partes da malha e o agente trata aquele trecho de forma especial. Por padrão, ele simplesmente "teleporta" a velocidade constante; mas você pode interceptar com isOnOffMeshLink e tocar uma animação de pulo, drift ou queda. Combinado com Animator e raycasts para detectar inclinação, dá para fazer IA que parece muito mais "viva" do que só andar no chão plano.`,
    codes: [
      {
        lang: "csharp",
        code: `// Inimigo perseguidor simples.
using UnityEngine;
using UnityEngine.AI;

[RequireComponent(typeof(NavMeshAgent))]
public class Perseguidor : MonoBehaviour
{
    [SerializeField] private Transform alvo;       // arraste o player aqui
    [SerializeField] private float distanciaParar = 1.5f;

    private NavMeshAgent agent;

    private void Awake()
    {
        agent = GetComponent<NavMeshAgent>();

        // Configura no código (também daria para fazer no Inspector).
        agent.speed = 3.5f;              // metros por segundo
        agent.angularSpeed = 360f;       // gira até 360 graus/s
        agent.acceleration = 8f;
        agent.stoppingDistance = distanciaParar;
    }

    private void Update()
    {
        // Sempre cheque isOnNavMesh antes de SetDestination.
        if (alvo == null || !agent.isOnNavMesh) return;

        // SetDestination dispara um cálculo de caminho assíncrono.
        // Chamar todo frame é OK: o Unity ignora se o destino não mudou muito.
        agent.SetDestination(alvo.position);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Patrulha entre waypoints com pausa em cada ponto.
using UnityEngine;
using UnityEngine.AI;

public class Patrulheiro : MonoBehaviour
{
    [SerializeField] private Transform[] pontos;   // arraste vários transforms vazios
    [SerializeField] private float tempoEsperaSegundos = 2f;

    private NavMeshAgent agent;
    private int indiceAtual;
    private float esperandoAte;

    private void Awake()
    {
        agent = GetComponent<NavMeshAgent>();
        agent.autoBraking = true;          // freia ao se aproximar do destino
        IrParaProximo();
    }

    private void Update()
    {
        // remainingDistance só é confiável depois que o caminho terminou de calcular.
        if (agent.pathPending) return;

        if (agent.remainingDistance <= agent.stoppingDistance)
        {
            // Chegou. Espera um pouco antes de ir para o próximo ponto.
            if (Time.time >= esperandoAte)
            {
                esperandoAte = Time.time + tempoEsperaSegundos;
                IrParaProximo();
            }
        }
    }

    private void IrParaProximo()
    {
        if (pontos.Length == 0) return;
        agent.SetDestination(pontos[indiceAtual].position);
        indiceAtual = (indiceAtual + 1) % pontos.Length;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Spawn seguro: garantir que o agente nasce em cima da NavMesh.
using UnityEngine;
using UnityEngine.AI;

public class SpawnSeguro : MonoBehaviour
{
    [SerializeField] private GameObject prefabInimigo;

    public void Spawnar(Vector3 posicaoDesejada)
    {
        // Procura o ponto da NavMesh mais próximo num raio de 5 metros.
        if (NavMesh.SamplePosition(posicaoDesejada, out NavMeshHit hit, 5f, NavMesh.AllAreas))
        {
            Instantiate(prefabInimigo, hit.position, Quaternion.identity);
        }
        else
        {
            Debug.LogWarning("Nenhuma NavMesh próxima de " + posicaoDesejada);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Tratamento manual de OffMeshLink (pulo, queda, escalada).
using System.Collections;
using UnityEngine;
using UnityEngine.AI;

public class AgenteComPulo : MonoBehaviour
{
    private NavMeshAgent agent;
    [SerializeField] private float duracaoPulo = 0.6f;
    [SerializeField] private AnimationCurve curvaAltura = AnimationCurve.EaseInOut(0, 0, 1, 0);

    private void Awake() => agent = GetComponent<NavMeshAgent>();

    private void Update()
    {
        // Quando o agente entra num OffMeshLink, paramos o auto-traverse
        // e fazemos a animação de pulo na mão.
        if (agent.isOnOffMeshLink)
        {
            StartCoroutine(PularLink());
        }
    }

    private IEnumerator PularLink()
    {
        OffMeshLinkData data = agent.currentOffMeshLinkData;
        Vector3 inicio = transform.position;
        Vector3 fim = data.endPos + Vector3.up * agent.baseOffset;
        float t = 0f;

        agent.updatePosition = false;     // assumimos o controle do movimento
        agent.updateRotation = false;

        while (t < 1f)
        {
            t += Time.deltaTime / duracaoPulo;
            Vector3 pos = Vector3.Lerp(inicio, fim, t);
            pos.y += curvaAltura.Evaluate(t);  // arco do pulo
            transform.position = pos;
            yield return null;
        }

        agent.CompleteOffMeshLink();      // avisa ao agent que terminou
        agent.updatePosition = true;
        agent.updateRotation = true;
    }
}`,
      },
    ],
    points: [
      "SetDestination dispara cálculo assíncrono; use pathPending para saber se já está pronto.",
      "stoppingDistance evita o agente esmagar o jogador chegando em cima do alvo.",
      "Sempre cheque isOnNavMesh antes de mandar comandos para evitar warnings silenciosos.",
      "Combine Rigidbody.isKinematic = true com NavMeshAgent para não brigar com a física.",
      "OffMeshLink permite pular janelas, descer escadas e teleportar entre regiões.",
      "Use NavMesh.SamplePosition para spawnar inimigos garantindo que estão na malha.",
      "autoBraking = false faz o agente não desacelerar — bom para patrulhas contínuas.",
      "Pegadinha: rotação do transform sendo controlada pelo agent E por outro script ao mesmo tempo.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Nunca defina transform.position diretamente em um GameObject com NavMeshAgent ativo. Use agent.Warp(novaPosicao) — ele teleporta o agente E reconecta com a NavMesh. Setar transform.position quebra a sincronia interna e o agente para de se mover sem erro visível.",
      },
      {
        type: "tip",
        content: "Para animar o personagem (idle, walk, run), leia agent.velocity.magnitude e jogue no parâmetro Speed do Animator. Não mande o Animator mover o root motion; deixe o NavMeshAgent ser a única fonte de movimento, ou aplique applyRootMotion = false.",
      },
      {
        type: "warning",
        content: "stoppingDistance maior que zero junto com autoBraking pode fazer o agente parar e ficar oscilando no limite. Se o jogador se mexe rápido, considere setar stoppingDistance menor e aplicar a 'parada' por código checando distância manualmente.",
      },
    ],
  },
  {
    slug: "state-machine",
    section: "ai-gameplay",
    title: "Máquinas de estado: organizando o cérebro do inimigo",
    difficulty: "avancado",
    subtitle: "Como dividir comportamentos em estados claros e transições previsíveis.",
    intro: `Imagine um segurança de loja. Em qualquer momento, ele está em um de poucos modos bem definidos: parado de braços cruzados (Idle), andando entre as prateleiras (Patrulha), seguindo alguém suspeito (Perseguir), apitando o radinho (Alertar). Ele não está nos quatro estados ao mesmo tempo, e a passagem de um para outro acontece por eventos claros: viu alguém estranho, perdeu o suspeito de vista, recebeu chamado pelo rádio. Esse modelo mental — poucos estados, transições disparadas por condições — é uma máquina de estado finita (FSM, Finite State Machine), e é a forma mais comum e mais barata de organizar IA em jogos.

A motivação prática é gerenciamento de complexidade. Sem FSM, é fácil cair no inferno do "if dentro de if dentro de if": "se viu o player e tem munição e não está com pouca vida e o boss não morreu, atira; senão, se está perto, foge; senão...". Em duas semanas o código fica impossível de modificar. Com FSM, cada estado tem uma única responsabilidade (Patrulha só patrulha), e as transições ficam concentradas em um lugar onde você consegue ler todas de uma vez.

Existem várias formas de implementar FSM no Unity. A mais simples é um enum + switch dentro de Update — funciona ótimo para 3 ou 4 estados. Acima disso, vira espaguete e vale subir o nível: criar uma interface IState com Enter, Update e Exit, e um StateMachine que segura o estado atual. É praticamente o mesmo padrão usado pelo Animator do próprio Unity (estados, transições, parâmetros), só que para lógica em vez de animação.

Quando NÃO usar FSM? Quando o número de estados explode (mais de 10) ou quando estados precisam ser combinados (atirar enquanto corre enquanto recarrega). Aí você sobe para Hierarchical State Machines, Behaviour Trees ou Goal-Oriented Action Planning. Mas comece sempre simples. A maioria dos inimigos icônicos da história dos jogos — fantasmas do Pac-Man, soldados de Half-Life, zumbis de Resident Evil — foi feita com FSM modesta. Domine isso primeiro, suba de complexidade só quando o problema pedir.`,
    codes: [
      {
        lang: "csharp",
        code: `// Versão mais simples: enum + switch. Boa para 2 a 4 estados.
using UnityEngine;
using UnityEngine.AI;

public class InimigoSimples : MonoBehaviour
{
    private enum Estado { Idle, Patrulhar, Perseguir, Atacar }

    [SerializeField] private Transform player;
    [SerializeField] private Transform[] waypoints;
    [SerializeField] private float raioDeteccao = 8f;
    [SerializeField] private float raioAtaque = 1.5f;

    private NavMeshAgent agent;
    private Estado estado = Estado.Patrulhar;
    private int waypointIndex;

    private void Awake() => agent = GetComponent<NavMeshAgent>();

    private void Update()
    {
        float dist = Vector3.Distance(transform.position, player.position);

        // Transições centralizadas: ler aqui dá para entender a IA toda.
        if (dist <= raioAtaque)            estado = Estado.Atacar;
        else if (dist <= raioDeteccao)     estado = Estado.Perseguir;
        else if (estado == Estado.Perseguir) estado = Estado.Patrulhar;

        switch (estado)
        {
            case Estado.Idle:
                agent.isStopped = true;
                break;

            case Estado.Patrulhar:
                agent.isStopped = false;
                if (!agent.pathPending && agent.remainingDistance < 0.5f)
                {
                    waypointIndex = (waypointIndex + 1) % waypoints.Length;
                    agent.SetDestination(waypoints[waypointIndex].position);
                }
                break;

            case Estado.Perseguir:
                agent.isStopped = false;
                agent.SetDestination(player.position);
                break;

            case Estado.Atacar:
                agent.isStopped = true;
                transform.LookAt(player);
                // chame aqui sua animação/dano
                break;
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Versão escalável: interface IState + StateMachine.
// Cada estado vira uma classe pequena, fácil de testar e trocar.
using UnityEngine;

public interface IState
{
    void Enter();
    void Tick();      // chamado todo Update
    void Exit();
}

public class StateMachine
{
    public IState Current { get; private set; }

    public void ChangeState(IState next)
    {
        Current?.Exit();
        Current = next;
        Current.Enter();
    }

    public void Tick() => Current?.Tick();
}`,
      },
      {
        lang: "csharp",
        code: `// Estados concretos para um inimigo. Cada um sabe sobre 1 coisa só.
using UnityEngine;
using UnityEngine.AI;

public class EstadoPatrulha : IState
{
    private readonly NavMeshAgent agent;
    private readonly Transform[] pontos;
    private int indice;

    public EstadoPatrulha(NavMeshAgent agent, Transform[] pontos)
    {
        this.agent = agent;
        this.pontos = pontos;
    }

    public void Enter()
    {
        agent.isStopped = false;
        if (pontos.Length > 0) agent.SetDestination(pontos[indice].position);
    }

    public void Tick()
    {
        if (!agent.pathPending && agent.remainingDistance < 0.5f)
        {
            indice = (indice + 1) % pontos.Length;
            agent.SetDestination(pontos[indice].position);
        }
    }

    public void Exit() { /* nada a limpar aqui */ }
}

public class EstadoPerseguir : IState
{
    private readonly NavMeshAgent agent;
    private readonly Transform alvo;

    public EstadoPerseguir(NavMeshAgent agent, Transform alvo)
    {
        this.agent = agent;
        this.alvo = alvo;
    }

    public void Enter() => agent.isStopped = false;
    public void Tick()  => agent.SetDestination(alvo.position);
    public void Exit()  { }
}`,
      },
      {
        lang: "csharp",
        code: `// O MonoBehaviour amarra tudo: cria os estados, decide as transições.
using UnityEngine;
using UnityEngine.AI;

[RequireComponent(typeof(NavMeshAgent))]
public class CerebroInimigo : MonoBehaviour
{
    [SerializeField] private Transform player;
    [SerializeField] private Transform[] waypoints;
    [SerializeField] private float raioVisao = 8f;

    private StateMachine fsm;
    private IState patrulha;
    private IState perseguir;

    private void Awake()
    {
        var agent = GetComponent<NavMeshAgent>();
        fsm = new StateMachine();
        patrulha  = new EstadoPatrulha(agent, waypoints);
        perseguir = new EstadoPerseguir(agent, player);
        fsm.ChangeState(patrulha);
    }

    private void Update()
    {
        float dist = Vector3.Distance(transform.position, player.position);

        // Lógica de transição em UM lugar só.
        if (dist <= raioVisao && fsm.Current != perseguir) fsm.ChangeState(perseguir);
        else if (dist > raioVisao * 1.2f && fsm.Current != patrulha) fsm.ChangeState(patrulha);

        fsm.Tick();
    }
}`,
      },
    ],
    points: [
      "FSM decompõe IA em estados pequenos com responsabilidade única.",
      "Toda transição deve ser fácil de localizar — concentre num lugar só.",
      "Comece com enum + switch; evolua para IState quando passar de 4-5 estados.",
      "Use Enter/Exit para resetar variáveis e evitar 'lixo' entre transições.",
      "Aplique histerese (raioVisao vs raioVisao*1.2) para evitar troca rápida demais.",
      "FSM combina lindo com NavMeshAgent: cada estado controla SetDestination e isStopped.",
      "O Animator do Unity já é uma FSM; a mesma intuição vale para lógica.",
      "Acima de ~10 estados, considere Behaviour Tree ou subdividir em FSMs hierárquicas.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Crie uma variável debug que mostra o estado atual no Inspector ou via OnGUI/Gizmos. Quando o inimigo 'fica travado' você imediatamente vê em qual estado ele está parado, e isso reduz horas de debug para minutos.",
      },
      {
        type: "warning",
        content: "Não esqueça de chamar Exit() no estado anterior antes do Enter() do novo. Se o estado anterior estava com agent.isStopped = true, e você esquecer de soltar, o inimigo congela mesmo já estando em Perseguir.",
      },
      {
        type: "info",
        content: "Existem assets prontos como FSM Builder e Animancer que dão FSM visual no Inspector. Ótimos para times grandes, mas para projetos pequenos a versão em código é mais leve, versionável no git e mais fácil de debugar.",
      },
    ],
  },
  {
    slug: "behaviour-trees",
    section: "ai-gameplay",
    title: "Behaviour Trees: IA modular para comportamentos complexos",
    difficulty: "avancado",
    subtitle: "O modelo que sustenta a IA de Halo, The Sims e quase todo AAA moderno.",
    intro: `Quando uma máquina de estado começa a ter dezenas de transições cruzadas, todo programador sente o mesmo desconforto: a teia vira um espaguete impossível de manter. Foi exatamente esse problema que a Bungie enfrentou desenvolvendo Halo 2 em 2003, e a resposta deles virou padrão da indústria — Behaviour Trees (BTs). Em vez de pensar em estados ligados por setas, você pensa em árvores de decisão executadas de cima para baixo, da esquerda para a direita, a cada frame.

A intuição é parecida com aquele fluxograma "se isso, então aquilo" que a gente desenha em papel. A árvore tem nós-pais (compostos) e nós-folha (ações ou condições). Os dois compostos mais usados são Sequence (executa filhos em ordem; falha se algum falhar) e Selector (executa filhos em ordem; sucesso se algum tiver sucesso, tipo um "ou" em prioridade). Folhas fazem coisas concretas: "ver se o player está na linha de visão", "ir até a última posição conhecida", "atirar". Cada nó retorna Success, Failure ou Running. Esse vocabulário simples gera comportamentos surpreendentemente ricos.

A grande vantagem das BTs sobre FSMs é modularidade. Você pode pegar a sub-árvore "fugir e se curar" e reusar em três inimigos diferentes só ligando ela em outro lugar. Pode adicionar um novo comportamento no meio da árvore sem reescrever transições. Designers conseguem editar visualmente sem tocar em código. É o motivo de praticamente todo motor moderno (Unreal, Godot 4, CryEngine) ter editor de BT nativo. O Unity, ironicamente, não tem editor oficial — é necessário usar pacotes como Behavior Designer (pago, robusto), NPBehave (open source, em código), ou o mais novo Unity Behaviour da própria Unity (Muse Behavior, em preview).

Quando NÃO usar BT? Para inimigo de mosca que só persegue o jogador, é overkill — uma FSM com 2 estados resolve. BT começa a brilhar quando você tem várias prioridades concorrentes, sub-comportamentos reutilizáveis e a necessidade de designers não-programadores ajustarem a IA. Comece entendendo o conceito implementando uma versão minimalista em C# (como no exemplo abaixo), e só parta para um pacote pronto quando sentir que vai escalar.`,
    codes: [
      {
        lang: "csharp",
        code: `// Implementação minimalista de Behaviour Tree em C# puro.
// Suficiente para entender o modelo antes de adotar uma lib.
public enum NodeStatus { Success, Failure, Running }

public abstract class BTNode
{
    public abstract NodeStatus Tick();
}

// Sequence: executa filhos em ordem, falha no primeiro que falhar.
public class Sequence : BTNode
{
    private readonly BTNode[] filhos;
    public Sequence(params BTNode[] filhos) => this.filhos = filhos;

    public override NodeStatus Tick()
    {
        foreach (var f in filhos)
        {
            var s = f.Tick();
            if (s != NodeStatus.Success) return s; // Failure ou Running param
        }
        return NodeStatus.Success;
    }
}

// Selector: executa filhos em ordem, sucesso no primeiro que tiver sucesso.
public class Selector : BTNode
{
    private readonly BTNode[] filhos;
    public Selector(params BTNode[] filhos) => this.filhos = filhos;

    public override NodeStatus Tick()
    {
        foreach (var f in filhos)
        {
            var s = f.Tick();
            if (s != NodeStatus.Failure) return s; // Success ou Running param
        }
        return NodeStatus.Failure;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Folhas: ações e condições concretas. Cada uma sabe o mínimo possível.
using UnityEngine;
using UnityEngine.AI;

public class CondicaoVeoPlayer : BTNode
{
    private readonly Transform self, player;
    private readonly float raio;

    public CondicaoVeoPlayer(Transform self, Transform player, float raio)
    {
        this.self = self; this.player = player; this.raio = raio;
    }

    public override NodeStatus Tick()
    {
        return Vector3.Distance(self.position, player.position) <= raio
            ? NodeStatus.Success
            : NodeStatus.Failure;
    }
}

public class AcaoPerseguir : BTNode
{
    private readonly NavMeshAgent agent;
    private readonly Transform alvo;

    public AcaoPerseguir(NavMeshAgent agent, Transform alvo)
    {
        this.agent = agent; this.alvo = alvo;
    }

    public override NodeStatus Tick()
    {
        if (!agent.isOnNavMesh) return NodeStatus.Failure;
        agent.SetDestination(alvo.position);

        // Enquanto não chegou, está rodando. Quando chegar, sucesso.
        if (agent.pathPending) return NodeStatus.Running;
        return agent.remainingDistance <= agent.stoppingDistance
            ? NodeStatus.Success
            : NodeStatus.Running;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Montando a árvore. Lê quase como um documento de design:
// "SE vejo o player, persigo; SENÃO patrulho."
using UnityEngine;
using UnityEngine.AI;

[RequireComponent(typeof(NavMeshAgent))]
public class InimigoComBT : MonoBehaviour
{
    [SerializeField] private Transform player;
    [SerializeField] private Transform[] waypoints;
    [SerializeField] private float raioVisao = 8f;

    private BTNode raiz;

    private void Awake()
    {
        var agent = GetComponent<NavMeshAgent>();

        // Sub-árvore: ver player E perseguir.
        var ramoCombate = new Sequence(
            new CondicaoVeoPlayer(transform, player, raioVisao),
            new AcaoPerseguir(agent, player)
        );

        // Sub-árvore: patrulhar (só uma ação que sempre roda).
        var ramoPatrulha = new AcaoPatrulhar(agent, waypoints);

        // Raiz: tenta combate; se falhar (não vê player), patrulha.
        raiz = new Selector(ramoCombate, ramoPatrulha);
    }

    private void Update() => raiz.Tick();
}`,
      },
      {
        lang: "csharp",
        code: `// Ação de patrulha que mantém estado interno entre ticks.
using UnityEngine;
using UnityEngine.AI;

public class AcaoPatrulhar : BTNode
{
    private readonly NavMeshAgent agent;
    private readonly Transform[] pontos;
    private int indice;

    public AcaoPatrulhar(NavMeshAgent agent, Transform[] pontos)
    {
        this.agent = agent;
        this.pontos = pontos;
    }

    public override NodeStatus Tick()
    {
        if (pontos == null || pontos.Length == 0) return NodeStatus.Failure;

        // Se chegou no waypoint atual, avança para o próximo.
        if (!agent.pathPending && agent.remainingDistance < 0.5f)
        {
            indice = (indice + 1) % pontos.Length;
            agent.SetDestination(pontos[indice].position);
        }

        // Patrulha não 'termina' — sempre Running.
        return NodeStatus.Running;
    }
}`,
      },
    ],
    points: [
      "Behaviour Trees substituem espaguete de transições por árvore lida de cima para baixo.",
      "Sequence = AND em ordem; Selector = OR em prioridade; folhas = ações ou condições.",
      "Cada nó retorna Success, Failure ou Running; isso é todo o vocabulário.",
      "Sub-árvores são reutilizáveis entre inimigos diferentes — a grande vantagem sobre FSM.",
      "Unity não tem editor visual oficial estável; use NPBehave, Behavior Designer ou Muse Behavior.",
      "Ticke a árvore inteira por frame (ou a cada N frames para economizar CPU).",
      "Use Decorators (Inverter, Repeater, Cooldown) para enriquecer sem criar novos nós.",
      "Para inimigos simples, FSM ainda é mais barata; reserve BT para IA com várias prioridades.",
    ],
    alerts: [
      {
        type: "info",
        content: "O termo 'Behavior Tree' aparece com escrita americana (sem 'u') na maioria das libs e documentação de motores. Em pesquisas, prefira 'behavior tree unity' para encontrar mais material.",
      },
      {
        type: "tip",
        content: "Antes de implementar uma BT, desenhe ela no papel ou em ferramenta como draw.io. Se você não consegue desenhar a árvore, é sinal de que o comportamento ainda não está claro o bastante para ser codificado.",
      },
      {
        type: "warning",
        content: "Tickar a árvore inteira a cada frame pode pesar com 50+ inimigos. Para hordas, faça tick a cada 0.1s, divida agentes em buckets atualizados em frames diferentes (time slicing) ou rode a IA num Job/Burst quando viável.",
      },
    ],
  },
  {
    slug: "sensores-ai",
    section: "ai-gameplay",
    title: "Sensores: como a IA enxerga e escuta o mundo",
    difficulty: "avancado",
    subtitle: "Implementando visão, audição e campos de percepção realistas.",
    intro: `Sem sensores, qualquer IA do mundo é só um robô andando em círculos. Para o inimigo decidir perseguir, fugir, alertar ou ignorar, ele precisa primeiro perceber o ambiente. Em jogos, percepção é simulada com truques bem mais simples do que os algoritmos de visão computacional reais — afinal, a IA tem acesso direto à cena. O segredo é restringir esse acesso de propósito, criando regras que imitam limitações humanas: "só vê o que está dentro de um cone à frente, sem parede no caminho", "só ouve passos num raio de 10 metros, e mais se o jogador correr".

A implementação clássica de visão tem três peças: distância (está perto o suficiente?), ângulo (está dentro do cone do meu campo de visão?) e linha de visão (não tem obstáculo no meio?). Distância é trivial. Ângulo se calcula com Vector3.Angle entre o forward do inimigo e o vetor que vai do inimigo até o alvo. Linha de visão se faz com Physics.Raycast — você atira um raio e vê se ele bate primeiro no jogador ou em outra coisa. Os três combinados produzem aquele clássico "campo de visão" de jogos stealth como Metal Gear ou Splinter Cell.

Audição é geralmente mais simples, mas mais sutil. A forma fácil é trigger: o jogador, ao andar, emite um colisor esférico maior quando corre, menor quando agacha; inimigos com OnTriggerEnter na esfera "ouvem". A forma mais rica é um sistema de eventos: o jogador dispara NoiseEvent.Make(posicao, raio), e cada IA registrada decide se o evento está dentro do alcance dela. Esse modelo desacopla quem faz barulho de quem ouve, o que é ouro em projetos grandes.

Onde isso falha? Quando você quer que a IA seja "justa". Em jogos competitivos, dar à IA visão perfeita instantânea sente-se trapaça. Por isso é comum adicionar uma fase de awareness gradual: ao ver o jogador por X segundos, o inimigo passa de "desconfiado" para "alertado" para "atacando". Tornar isso visível com indicadores (o icone de exclamação amarelo virando vermelho) faz o jogador entender as regras e curtir a tensão. Sensor não é só código — é design de feedback.`,
    codes: [
      {
        lang: "csharp",
        code: `// Sensor de visão clássico: distância + ângulo + linha de visão.
using UnityEngine;

public class SensorVisao : MonoBehaviour
{
    [SerializeField] private Transform alvo;
    [SerializeField] private float distanciaMaxima = 10f;
    [SerializeField, Range(0, 180)] private float anguloVisao = 60f; // metade do cone
    [SerializeField] private LayerMask camadasObstaculo;

    public bool VeAlvo { get; private set; }

    private void Update()
    {
        VeAlvo = ChecarVisao();
    }

    private bool ChecarVisao()
    {
        if (alvo == null) return false;

        Vector3 paraAlvo = alvo.position - transform.position;

        // 1) Distância
        if (paraAlvo.sqrMagnitude > distanciaMaxima * distanciaMaxima) return false;

        // 2) Ângulo (cone)
        float angulo = Vector3.Angle(transform.forward, paraAlvo);
        if (angulo > anguloVisao) return false;

        // 3) Linha de visão (raycast até o alvo)
        if (Physics.Raycast(transform.position, paraAlvo.normalized,
                            out RaycastHit hit, distanciaMaxima, camadasObstaculo))
        {
            // Se o raio bateu em algo ANTES do alvo, é obstáculo.
            if (hit.transform != alvo) return false;
        }

        return true;
    }

    // Visualiza o cone na Scene view para facilitar o ajuste no Inspector.
    private void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.yellow;
        Gizmos.DrawWireSphere(transform.position, distanciaMaxima);

        Vector3 esquerda = Quaternion.Euler(0, -anguloVisao, 0) * transform.forward * distanciaMaxima;
        Vector3 direita  = Quaternion.Euler(0,  anguloVisao, 0) * transform.forward * distanciaMaxima;
        Gizmos.color = Color.red;
        Gizmos.DrawRay(transform.position, esquerda);
        Gizmos.DrawRay(transform.position, direita);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Sistema de eventos de som — desacoplado, escalável.
using System.Collections.Generic;
using UnityEngine;

public static class SistemaSom
{
    private static readonly List<ISensorAuditivo> ouvintes = new();

    public static void Registrar(ISensorAuditivo s)   => ouvintes.Add(s);
    public static void Desregistrar(ISensorAuditivo s) => ouvintes.Remove(s);

    // Quem faz barulho chama isso. Não precisa saber quem está ouvindo.
    public static void EmitirSom(Vector3 posicao, float raio, float intensidade = 1f)
    {
        foreach (var o in ouvintes)
        {
            float d = Vector3.Distance(o.Posicao, posicao);
            if (d <= raio)
            {
                // Som mais fraco quanto mais longe.
                o.Ouvir(posicao, intensidade * (1f - d / raio));
            }
        }
    }
}

public interface ISensorAuditivo
{
    Vector3 Posicao { get; }
    void Ouvir(Vector3 origem, float intensidade);
}`,
      },
      {
        lang: "csharp",
        code: `// Inimigo implementa o sensor auditivo e reage ao som.
using UnityEngine;
using UnityEngine.AI;

public class SensorAuditivoInimigo : MonoBehaviour, ISensorAuditivo
{
    [SerializeField] private float limiteAtencao = 0.3f;
    private NavMeshAgent agent;

    public Vector3 Posicao => transform.position;

    private void OnEnable()
    {
        agent = GetComponent<NavMeshAgent>();
        SistemaSom.Registrar(this);
    }

    private void OnDisable() => SistemaSom.Desregistrar(this);

    public void Ouvir(Vector3 origem, float intensidade)
    {
        // Só investiga se o som for forte o bastante.
        if (intensidade < limiteAtencao) return;

        Debug.Log($"Ouvi algo em {origem} com intensidade {intensidade:F2}");

        if (agent != null && agent.isOnNavMesh)
            agent.SetDestination(origem);
    }
}

// E o jogador, ao andar:
// SistemaSom.EmitirSom(transform.position, 8f, 0.5f);
// Ao correr: raio 15, intensidade 1f. Ao agachar: raio 2, intensidade 0.2f.`,
      },
      {
        lang: "csharp",
        code: `// Awareness gradual: indicador estilo Metal Gear.
using UnityEngine;

public class AwarenessGradual : MonoBehaviour
{
    [SerializeField] private SensorVisao sensor;
    [SerializeField] private float tempoAteAlerta = 1.5f;

    [Range(0f, 1f)] public float NivelSuspeita; // 0 calmo, 1 alerta total

    private void Update()
    {
        if (sensor.VeAlvo)
        {
            // Subir mais rápido quando vê.
            NivelSuspeita = Mathf.MoveTowards(NivelSuspeita, 1f, Time.deltaTime / tempoAteAlerta);
        }
        else
        {
            // Cair devagar quando perde de vista (sente que tem alguém).
            NivelSuspeita = Mathf.MoveTowards(NivelSuspeita, 0f, Time.deltaTime * 0.2f);
        }

        // Use o nível para acender ícone de alerta no HUD.
    }

    public bool EstaAlertado => NivelSuspeita >= 0.99f;
}`,
      },
    ],
    points: [
      "Visão = distância + ângulo + linha de visão por raycast. Os três juntos.",
      "Use sqrMagnitude em vez de distância para checagens de raio: evita raiz quadrada.",
      "OnDrawGizmosSelected acelera muito o ajuste fino dos cones de visão.",
      "Som por evento global (publish/subscribe) escala melhor que triggers físicos.",
      "Modular intensidade do som por ação do jogador (correr, agachar, atirar).",
      "Awareness gradual com Mathf.MoveTowards transmite tensão e parece justo.",
      "LayerMask correto no Raycast evita o raio bater em colliders do próprio inimigo.",
      "Pegadinha: raycast sair de dentro de um collider e bater em si mesmo.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Posicione o ponto de origem do raycast na altura dos olhos (transform.position + Vector3.up * 1.6f), não no chão. Se sair do pé do inimigo, pode bater em obstáculos baixos e o inimigo vira cego em escadas e degraus.",
      },
      {
        type: "warning",
        content: "Cuidado com layers: se o jogador tem Collider no mesmo Layer do cenário e você usa LayerMask geral, o raio pode bater no jogador antes de detectar obstáculo, dando falso positivo. Coloque Player numa layer dedicada e ajuste a máscara para ignorar a layer do próprio inimigo.",
      },
      {
        type: "info",
        content: "Para hordas grandes, em vez de cada inimigo fazer raycast todo frame, espalhe os checks ao longo de vários frames (time slicing) ou use Physics.OverlapSphereNonAlloc para coletar candidatos antes de raycastar. CPU agradece.",
      },
    ],
  },
  {
    slug: "ml-agents",
    section: "ai-gameplay",
    title: "ML-Agents: ensinando NPCs com aprendizado por reforço",
    difficulty: "avancado",
    subtitle: "Quando programar regras não é suficiente: deixe a IA aprender sozinha.",
    intro: `Tudo que vimos até aqui — FSM, Behaviour Tree, sensores — é IA escrita à mão. Você programa regras explícitas e o personagem segue. Funciona maravilhosamente para a maioria dos jogos. Mas existem situações em que escrever regras é praticamente impossível: ensinar um carro a fazer drift perfeito, treinar um boss que se adapta ao estilo do jogador, criar um NPC que aprende a jogar futebol em equipe. Para esses casos, o Unity tem uma ferramenta poderosa e gratuita: o ML-Agents Toolkit.

ML-Agents conecta o Unity (que roda o jogo) com Python (que roda o algoritmo de aprendizado). O algoritmo padrão é Reinforcement Learning, mais especificamente PPO (Proximal Policy Optimization). A ideia é simples de explicar: o agente faz uma ação no jogo, recebe recompensa (positiva se foi bom, negativa se foi ruim), e aos poucos aprende a maximizar recompensa. É exatamente como ensinar um cachorro com biscoito — só que rápido, em milhões de tentativas paralelas. Depois de treinado, você exporta um arquivo .onnx que roda direto no jogo via Barracuda/Sentis, sem precisar mais do Python.

Três conceitos compõem qualquer agente: observações (o que ele "sente": posição do alvo, velocidade, raycasts), ações (o que ele pode fazer: mover, pular, atirar, num espaço discreto ou contínuo) e recompensas (o sinal de "isso foi bom"). A arte do ML-Agents está em escolher essas três coisas. Observações demais e o treino fica lento; de menos, ele não converge. Recompensas mal balanceadas fazem o agente "trapacear" — descobre buracos do design e maximiza recompensa fazendo coisas absurdas.

Quando NÃO usar ML-Agents? Sempre que regras explícitas funcionam. Treino é caro (horas a dias), exige tuning, e o resultado é uma "caixa-preta" difícil de ajustar manualmente. Para inimigos comuns de FPS, fica mais barato e previsível usar BT. ML-Agents brilha em prototipagem de mecânicas (descobrir se um setup é jogável), bots para playtest automatizado, e em comportamentos emergentes que seriam tediosos de programar (locomoção física com ragdoll, controle de drone, animais com IA realista). Pense nele como uma ferramenta especializada, não substituta da IA tradicional.`,
    codes: [
      {
        lang: "bash",
        code: `# Instalação: Python 3.10.x + virtualenv + pacote.
# (No Windows, use o terminal do Anaconda ou WSL para evitar dor de cabeça.)
python3 -m venv venv
source venv/bin/activate            # no Windows: venv\\Scripts\\activate

# A versão do pacote Python precisa bater com o pacote Unity.
# Confira a tabela em github.com/Unity-Technologies/ml-agents/releases.
pip install mlagents==1.1.0

# Verifica que está tudo certo.
mlagents-learn --help

# No Unity: Window > Package Manager > + > Add package by name
# com.unity.ml-agents (versão correspondente, ex: 3.0.0)`,
      },
      {
        lang: "csharp",
        code: `// Agente clássico "RollerBall": uma esfera que aprende a chegar num alvo.
using UnityEngine;
using Unity.MLAgents;
using Unity.MLAgents.Actuators;
using Unity.MLAgents.Sensors;

public class RollerAgent : Agent
{
    [SerializeField] private Transform alvo;
    [SerializeField] private float forca = 10f;

    private Rigidbody rb;

    public override void Initialize()
    {
        rb = GetComponent<Rigidbody>();
    }

    // Chamado no início de cada episódio (cada 'tentativa' do agente).
    public override void OnEpisodeBegin()
    {
        // Se caiu da plataforma, reseta posição e velocidade.
        if (transform.localPosition.y < 0)
        {
            rb.linearVelocity = Vector3.zero;
            rb.angularVelocity = Vector3.zero;
            transform.localPosition = new Vector3(0, 0.5f, 0);
        }

        // Move o alvo para um lugar aleatório.
        alvo.localPosition = new Vector3(Random.value * 8 - 4, 0.5f, Random.value * 8 - 4);
    }

    // Define o que o agente "vê" do mundo a cada step.
    public override void CollectObservations(VectorSensor sensor)
    {
        sensor.AddObservation(alvo.localPosition);    // 3 floats
        sensor.AddObservation(transform.localPosition); // 3 floats
        sensor.AddObservation(rb.linearVelocity.x);     // 1 float
        sensor.AddObservation(rb.linearVelocity.z);     // 1 float
        // Total: 8 observações. Configure no Behavior Parameters: Vector Obs Space Size = 8.
    }

    // Recebe ações do cérebro (modelo) e aplica no jogo.
    public override void OnActionReceived(ActionBuffers actions)
    {
        // 2 ações contínuas: força em X e em Z.
        Vector3 controle = new(actions.ContinuousActions[0], 0, actions.ContinuousActions[1]);
        rb.AddForce(controle * forca);

        // Recompensa: chegou perto do alvo?
        float dist = Vector3.Distance(transform.localPosition, alvo.localPosition);
        if (dist < 1.42f)
        {
            SetReward(1.0f);    // ótimo!
            EndEpisode();
        }
        else if (transform.localPosition.y < 0)
        {
            SetReward(-1.0f);   // caiu, péssimo
            EndEpisode();
        }
        else
        {
            // Pequena penalidade por step para incentivar resolver rápido.
            AddReward(-0.001f);
        }
    }

    // Permite controlar o agente com teclado para testar antes de treinar.
    public override void Heuristic(in ActionBuffers actionsOut)
    {
        var c = actionsOut.ContinuousActions;
        c[0] = Input.GetAxis("Horizontal");
        c[1] = Input.GetAxis("Vertical");
    }
}`,
      },
      {
        lang: "yaml",
        code: `# Arquivo de configuração de treinamento: config/roller.yaml
# Define hiperparâmetros do PPO. Comece com este e ajuste depois.
behaviors:
  RollerBall:                       # precisa bater com Behavior Name no Unity
    trainer_type: ppo
    hyperparameters:
      batch_size: 10
      buffer_size: 100
      learning_rate: 3.0e-4
      beta: 5.0e-4                  # incentivo a explorar (entropy)
      epsilon: 0.2                  # PPO clip
      lambd: 0.99
      num_epoch: 3
    network_settings:
      normalize: false
      hidden_units: 128
      num_layers: 2
    reward_signals:
      extrinsic:
        gamma: 0.99                 # quanto valoriza recompensa futura
        strength: 1.0
    max_steps: 500000               # passos totais de treino
    time_horizon: 64
    summary_freq: 10000`,
      },
      {
        lang: "bash",
        code: `# Treinando: rode no terminal, depois aperte Play no Unity.
mlagents-learn config/roller.yaml --run-id=roller_v1

# Após o treino, o modelo .onnx aparece em results/roller_v1/RollerBall.onnx
# No Unity: arraste esse .onnx no campo Model do Behavior Parameters,
# mude Behavior Type para "Inference Only" e o agente passa a usar o cérebro
# treinado, sem precisar mais do Python.

# Para retomar treino interrompido:
mlagents-learn config/roller.yaml --run-id=roller_v1 --resume

# Para visualizar curvas de aprendizado em tempo real:
tensorboard --logdir results --port 6006
# abre http://localhost:6006 no navegador`,
      },
    ],
    points: [
      "ML-Agents conecta Unity (jogo) e Python (treinador) via aprendizado por reforço.",
      "Três pilares de qualquer Agent: observações, ações e recompensas.",
      "Use Heuristic() para controlar o agente manualmente e validar antes de treinar.",
      "Exporte modelo .onnx e rode em Inference Only — sem Python no jogo final.",
      "Recompensa mal desenhada gera 'reward hacking': agente trapaceia o sistema.",
      "Comece simples (RollerBall) antes de tentar problemas complexos como locomoção.",
      "Versão do pacote Unity precisa bater com a do pip mlagents — confira a tabela oficial.",
      "ML-Agents é especializado: para inimigos triviais, FSM/BT continuam mais práticos.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Versionamento é o calcanhar de Aquiles do ML-Agents. Pacote Unity 3.x exige mlagents Python específico, que exige Python 3.10.x. Misturar versões gera erros crípticos. Sempre crie um virtualenv dedicado e confira a release notes correspondente.",
      },
      {
        type: "tip",
        content: "Acelere o treino paralelizando: duplique a área de treino 8 ou 16 vezes na cena. Cada cópia tem seu próprio Agent e Target. Marque Behavior Parameters com o mesmo Behavior Name. O treinador agrega experiências de todos e converge muito mais rápido.",
      },
      {
        type: "info",
        content: "Em projetos de produção que usam o modelo treinado em runtime, prefira o pacote Sentis (sucessor do Barracuda) para inferência. Suporta mais operações de ONNX, é mais rápido e está em desenvolvimento ativo pela Unity.",
      },
    ],
  },
];
