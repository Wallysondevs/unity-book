import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "multiplayer-intro",
    section: "multiplayer",
    title: "Introdução a Multiplayer e Rede",
    difficulty: "avancado",
    subtitle: "Conceitos fundamentais antes de escrever uma linha de código de rede.",
    intro: `Fazer um jogo single player é difícil. Fazer um jogo multiplayer é, sem exagero, dez vezes mais difícil. A razão é simples: enquanto no single player você tem uma única máquina, com uma única realidade, no multiplayer você tem várias máquinas, cada uma com sua própria visão do mundo, conectadas por uma rede que é lenta, perde pacotes e atrasa de forma imprevisível. Antes de escolher uma biblioteca (Netcode for GameObjects, Mirror, Photon, FishNet), você precisa entender alguns conceitos que valem para qualquer engine.

O primeiro conceito é o modelo de topologia. Em Client/Server, existe uma máquina especial (o servidor) que é a fonte da verdade. Os clientes mandam intenções ('quero andar para a esquerda') e o servidor responde com o estado real ('agora você está em x=10'). Em Peer-to-Peer (P2P), todos os jogadores conversam diretamente entre si, sem um chefe central. P2P é mais barato (você não paga servidor) mas é um inferno para combater cheaters, porque cada cliente confia no outro. A indústria moderna prefere Client/Server quase sempre, com um sub-modelo chamado 'Listen Server' onde o host é um dos jogadores que também faz o papel de servidor. Isso explica por que jogos como Among Us, Valheim ou Stardew Valley em coop funcionam: um jogador hospeda, os outros entram.

O segundo conceito é autoridade. Quem decide se o tiro acertou? Se a resposta for 'o cliente que atirou', um cheater modifica o jogo e mata todo mundo com headshot. Se a resposta for 'o servidor', você precisa esperar a viagem de ida e volta para ver o sangue, o que parece lag. A solução prática é a chamada 'autoridade do servidor com predição do cliente': o cliente finge que o tiro acertou na hora (predição), e o servidor confirma depois. Quando o servidor discorda, o cliente faz uma 'reconciliação' (um pequeno teleporte ou correção). Esse padrão está em todo FPS competitivo desde Quake 3.

O terceiro conceito é latência. A internet típica tem entre 30 e 150 milissegundos de ping. Em 100ms, um jogador correndo a 5 m/s já se moveu meio metro entre 'eu apertei W' e 'o servidor sabe que apertei W'. Por isso existem técnicas como interpolação (suavizar movimento dos outros jogadores entre snapshots), extrapolação (chutar onde eles estarão), lag compensation (rebobinar o tempo no servidor para validar tiros) e tick rate (quantas vezes por segundo o servidor simula o mundo). Não dá para fingir que rede é instantânea.

Antes de escolher uma stack, decida: quantos jogadores por sala, é competitivo ou casual, é mobile ou PC, você tem orçamento para servidores dedicados? Essas perguntas mudam tudo.`,
    codes: [
      {
        lang: "csharp",
        code: `// Pseudocódigo ilustrando a diferença entre AUTORIDADE DE CLIENTE e AUTORIDADE DE SERVIDOR.
// Não é código de uma engine específica, é só para fixar o conceito.

// MODELO RUIM: cliente decide tudo. Cheater muda HP local e fica imortal.
public class JogadorClienteAutoritativo {
    public int hp = 100;

    public void LevouDano(int dano) {
        hp -= dano;            // o cliente decide quanto perdeu
        EnviarParaServidor(hp); // e só avisa o servidor depois
    }
}

// MODELO BOM: servidor decide. Cliente só pede.
public class JogadorServidorAutoritativo {
    public int hp = 100; // valor que existe no servidor

    // Roda no SERVIDOR. Cliente nem sabe que existe.
    public void AplicarDano(int dano, int idAtacante) {
        // Validar antes de aplicar:
        if (dano < 0 || dano > 999) return;            // sanity check
        if (!PodeAtacar(idAtacante)) return;           // antifraude

        hp -= dano;
        if (hp < 0) hp = 0;
        BroadcastNovoHpParaTodosClientes(hp);          // só agora os clientes ficam sabendo
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Exemplo conceitual de PREDIÇÃO DO CLIENTE com RECONCILIAÇÃO.
// Em FPS competitivo (Counter-Strike, Valorant), esse padrão é obrigatório.

public class MovimentoComPredicao {
    private Vector3 posicaoLocal;        // o que eu vejo agora
    private Vector3 posicaoConfirmada;   // a última posição validada pelo servidor
    private Queue<Input> inputsPendentes = new(); // inputs que mandei mas ainda não foram confirmados

    void Update() {
        // 1) Lê o input do jogador (tecla W, A, S, D).
        var input = LerInput();

        // 2) APLICA LOCALMENTE de imediato (predição) — sem esperar a rede.
        posicaoLocal += SimularMovimento(input);

        // 3) GUARDA o input para reconciliar depois.
        inputsPendentes.Enqueue(input);

        // 4) ENVIA o input para o servidor (que é a fonte da verdade).
        EnviarInputParaServidor(input);
    }

    // Servidor responde 'sua posição depois desse input deveria ser X'.
    void OnServerSnapshot(Vector3 posicaoOficial, int ultimoInputProcessado) {
        posicaoConfirmada = posicaoOficial;

        // Descarta os inputs que o servidor já processou.
        while (inputsPendentes.Count > 0 && inputsPendentes.Peek().id <= ultimoInputProcessado)
            inputsPendentes.Dequeue();

        // Reaplica os inputs pendentes em cima da posição oficial (reconciliação).
        var posReconciliada = posicaoConfirmada;
        foreach (var i in inputsPendentes)
            posReconciliada += SimularMovimento(i);

        // Se a diferença for grande, corrige (pode causar 'rubber banding' visível).
        if (Vector3.Distance(posicaoLocal, posReconciliada) > 0.5f)
            posicaoLocal = posReconciliada;
    }
}`,
      },
      {
        lang: "bash",
        code: `# Comandos úteis para diagnosticar problemas de rede ANTES de culpar o jogo.

# Ver latência até um servidor.
ping play.meujogo.com

# Ver perda de pacotes ao longo do caminho.
mtr play.meujogo.com           # Linux/macOS
pathping play.meujogo.com      # Windows

# Simular conexão ruim no Linux (testar como o jogo se comporta com lag/perda).
sudo tc qdisc add dev eth0 root netem delay 150ms loss 2%

# Para remover a simulação:
sudo tc qdisc del dev eth0 root netem

# No Windows, use o 'Clumsy' (programa gratuito) para simular lag, drop e jitter.`,
      },
    ],
    points: [
      "Multiplayer é uma ordem de magnitude mais complexo que single player. Planeje desde o dia 1.",
      "Client/Server com servidor autoritativo é o padrão para qualquer jogo competitivo.",
      "P2P é barato mas vulnerável a cheats e NAT. Use só em coop casual e local.",
      "Nunca confie no cliente: valide tudo no servidor (dano, posição, inventário, dinheiro).",
      "Predição + reconciliação esconde a latência sem abrir mão da autoridade do servidor.",
      "Tick rate de 20-30 Hz é suficiente para casual; 60+ Hz é o esperado em competitivo.",
      "Lag compensation rebobina o tempo no servidor para validar hits sem punir quem tem ping alto.",
      "Defina topologia, número de jogadores e modelo de hospedagem antes de escolher a biblioteca.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Não comece a programar multiplayer 'jogando uns RPCs' por aí. Sem entender autoridade e predição, você vai reescrever tudo no mês que vem.",
      },
      {
        type: "info",
        content: "Unity descontinuou o antigo UNet (Network Manager / NetworkBehaviour clássico) na versão 2019. Tutoriais antigos com 'using UnityEngine.Networking' não funcionam mais. Use Netcode for GameObjects ou Mirror.",
      },
      {
        type: "tip",
        content: "Teste com lag artificial desde o primeiro dia. Se o jogo só funciona em LAN, ele não funciona de verdade. Use Network Simulator do Netcode ou o 'LatencySimulator' do Mirror.",
      },
    ],
  },
  {
    slug: "netcode-gameobjects",
    section: "multiplayer",
    title: "Netcode for GameObjects",
    difficulty: "avancado",
    subtitle: "A biblioteca oficial de rede da Unity, do NetworkObject ao ServerRpc.",
    intro: `Netcode for GameObjects (apelidado de NGO) é a solução oficial atual da Unity para multiplayer. Ela substituiu o antigo UNet em 2021 e é mantida pela própria Unity Technologies, integrada com os serviços da Unity Gaming Services (Lobby, Relay, Matchmaker). Se você está começando hoje um projeto multiplayer e quer ficar dentro do ecossistema oficial, NGO é a escolha padrão.

O modelo mental do NGO é simples mas exige disciplina. Todo objeto que precisa existir em rede vira um GameObject com o componente NetworkObject. Esse componente dá ao objeto um ID único na rede e controla seu ciclo de vida (spawn, despawn, ownership). Em cima dele, você coloca scripts que herdam de NetworkBehaviour em vez de MonoBehaviour. NetworkBehaviour é como o irmão de rede do MonoBehaviour: tem Awake, Start, Update normais, mas ganha métodos especiais como OnNetworkSpawn (chamado quando o objeto aparece na rede) e callbacks para validar ownership.

A comunicação acontece em duas direções. Do cliente para o servidor, você usa um ServerRpc: um método marcado com [ServerRpc] que pode ser chamado pelo cliente mas executa no servidor. É assim que o cliente pede 'quero atirar', 'quero abrir essa porta'. Do servidor para os clientes, você usa um ClientRpc: marca com [ClientRpc] e ele executa em todos os clientes (ou em alguns específicos via ClientRpcParams). É como o servidor avisa 'tocou esse som', 'apareceu essa explosão'. Se você quer um valor que sincroniza automaticamente (vida, score, nome), use NetworkVariable em vez de RPC manual. Isso reduz boilerplate e é otimizado.

Quando NÃO usar NGO? Se você precisa de centenas de jogadores numa mesma instância (MMOs), NGO não é o foco — olhe Mirror, Fish-Networking ou soluções customizadas. Se você precisa de zero servidor (P2P puro entre celulares na mesma sala), considere Photon Fusion ou PUN. Mas para 99% dos jogos coop, PvP de até 64 jogadores e party games, NGO entrega.`,
    codes: [
      {
        lang: "csharp",
        code: `// Setup mínimo: um GameObject Player com movimento sincronizado pelo servidor.
// Requer: pacote 'com.unity.netcode.gameobjects' instalado, NetworkManager na cena
// e este script anexado a um Prefab com componente NetworkObject.

using Unity.Netcode;
using UnityEngine;

public class PlayerNetwork : NetworkBehaviour {
    [SerializeField] private float velocidade = 5f;

    // OnNetworkSpawn é o 'Start' do mundo em rede. Chamado em TODAS as máquinas
    // (servidor e clientes) assim que o objeto aparece.
    public override void OnNetworkSpawn() {
        // IsOwner é true só na máquina do dono daquele player.
        // Ex.: o cliente B vê o player do A, mas IsOwner só é true no PC do A.
        if (IsOwner) {
            // Move a câmera para seguir SÓ o player local.
            Camera.main.transform.SetParent(transform);
            Camera.main.transform.localPosition = new Vector3(0, 5, -5);
        }
    }

    void Update() {
        // Cada máquina roda o Update, mas só o dono envia input.
        if (!IsOwner) return;

        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");
        var dir = new Vector3(h, 0, v);

        // Pede ao servidor para mover. O servidor é a autoridade da posição.
        if (dir.sqrMagnitude > 0.01f)
            MoverServerRpc(dir);
    }

    // [ServerRpc] = chamado pelo cliente, executa no servidor.
    // RequireOwnership=true (padrão) garante que só o dono do objeto pode chamar.
    [ServerRpc]
    private void MoverServerRpc(Vector3 direcao) {
        // Sanity check: nunca confie no cliente.
        if (direcao.magnitude > 1.5f) return;

        // Aplica o movimento NO SERVIDOR. A NetworkTransform replica para todos.
        transform.position += direcao.normalized * velocidade * Time.deltaTime;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Sincronizando estado contínuo (vida) com NetworkVariable.
// NetworkVariable é uma 'variável que se replica sozinha' do servidor para os clientes.

using Unity.Netcode;
using UnityEngine;

public class PlayerHealth : NetworkBehaviour {
    // O default permite leitura por todos e escrita só pelo servidor.
    private NetworkVariable<int> hp = new NetworkVariable<int>(
        100,
        NetworkVariableReadPermission.Everyone,
        NetworkVariableWritePermission.Server
    );

    public override void OnNetworkSpawn() {
        // Se inscreve para reagir quando o valor mudar (em qualquer máquina).
        hp.OnValueChanged += AoMudarHp;
    }

    public override void OnNetworkDespawn() {
        hp.OnValueChanged -= AoMudarHp;
    }

    private void AoMudarHp(int antigo, int novo) {
        Debug.Log($"HP mudou de {antigo} para {novo}");
        if (novo <= 0 && IsOwner) Debug.Log("Você morreu!");
    }

    // Chamado pelo servidor quando este player toma dano.
    public void AplicarDano(int dano) {
        if (!IsServer) return; // dupla checagem
        hp.Value = Mathf.Max(0, hp.Value - dano);
    }

    // Quando o servidor quer avisar TODO MUNDO de algo cosmético, usa ClientRpc.
    [ClientRpc]
    private void TocarSomDeDanoClientRpc() {
        AudioSource.PlayClipAtPoint(Resources.Load<AudioClip>("dano"), transform.position);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Iniciando o jogo: host, server ou client.
// Geralmente plugado em botões de UI no menu inicial.

using Unity.Netcode;
using UnityEngine;
using UnityEngine.UI;

public class MenuRede : MonoBehaviour {
    [SerializeField] private Button btnHost;
    [SerializeField] private Button btnClient;
    [SerializeField] private Button btnServer;

    void Start() {
        // HOST = servidor + cliente local na mesma máquina. Modo mais comum em coop.
        btnHost.onClick.AddListener(() => NetworkManager.Singleton.StartHost());

        // CLIENT = só conecta a um servidor existente.
        btnClient.onClick.AddListener(() => NetworkManager.Singleton.StartClient());

        // SERVER = servidor dedicado, sem player local. Para builds de servidor headless.
        btnServer.onClick.AddListener(() => NetworkManager.Singleton.StartServer());

        // Você pode reagir a conexões.
        NetworkManager.Singleton.OnClientConnectedCallback += id =>
            Debug.Log($"Cliente {id} conectou. Total: {NetworkManager.Singleton.ConnectedClients.Count}");
    }
}`,
      },
      {
        lang: "json",
        code: `// manifest.json (Packages/manifest.json) — adicionando o pacote no projeto.
// Você pode também instalar via Window > Package Manager > Unity Registry > Netcode for GameObjects.
{
  "dependencies": {
    "com.unity.netcode.gameobjects": "1.8.1",
    "com.unity.services.authentication": "3.3.3",
    "com.unity.services.relay": "1.0.5",
    "com.unity.services.lobby": "1.2.2"
  }
}`,
      },
    ],
    points: [
      "NGO é a stack oficial Unity, integrada com Lobby/Relay/Matchmaker.",
      "Todo objeto em rede precisa de um componente NetworkObject e ser registrado no NetworkManager.",
      "Herde de NetworkBehaviour em vez de MonoBehaviour para ganhar acesso a IsOwner, IsServer, IsClient.",
      "ServerRpc: cliente pede para o servidor. ClientRpc: servidor avisa os clientes.",
      "Use NetworkVariable para estado contínuo (vida, score) em vez de mandar RPC todo frame.",
      "Host = servidor + cliente local. Client = só joga. Server = headless, sem render.",
      "Sempre cheque IsOwner antes de ler input local; sempre cheque IsServer antes de mutar estado autoritativo.",
      "Spawne objetos via NetworkObject.Spawn(), nunca com Instantiate puro.",
    ],
    alerts: [
      {
        type: "warning",
        content: "RPC com parâmetros pesados (arrays grandes, strings longas) é caro. Prefira IDs e que o cliente leia o resto de tabelas locais. Cada RPC custa MTU de pacote.",
      },
      {
        type: "danger",
        content: "Nunca aplique dano, dinheiro ou loot dentro de um ServerRpc sem validar. Um cliente modificado pode chamar qualquer RPC com qualquer parâmetro. RequireOwnership não impede ataque, só evita engano.",
      },
      {
        type: "tip",
        content: "Use o componente NetworkTransform para sincronizar posição/rotação automaticamente. Para movimento suave em outros clientes, ative interpolation. Para physics autoritativa, use NetworkRigidbody.",
      },
    ],
  },
  {
    slug: "mirror-networking",
    section: "multiplayer",
    title: "Mirror Networking",
    difficulty: "avancado",
    subtitle: "A alternativa open source mais madura, herdeira espiritual do UNet.",
    intro: `Mirror é uma biblioteca open source de multiplayer para Unity, mantida por uma comunidade ativa desde 2018. Ela nasceu como um fork modernizado do antigo UNet, então se você já viu tutoriais antigos da Unity com [Command] e [SyncVar], vai se sentir em casa. Mirror é gratuita (MIT), tem documentação extensa, foi usada em jogos comerciais grandes (Population: One, SCP: Secret Laboratory, Naïca Online) e é a escolha favorita de muitos desenvolvedores indie por ser estável e direta.

A grande pergunta é: Mirror ou Netcode for GameObjects? A resposta honesta: ambos funcionam. NGO é oficial, então tem garantia de continuidade e integração com serviços da Unity. Mirror é mais maduro em termos de comunidade, tem mais transportes prontos (KCP, Telepathy, WebSockets, Steam, Epic) e historicamente teve melhor performance em jogos com muitos players. Se você quer integrar com Steamworks ou Epic Online Services rapidamente, Mirror tem componentes prontos para isso. Se você quer Lobby/Relay/Matchmaker da Unity sem dor, NGO é mais direto.

Conceitos do Mirror espelham (sem trocadilho) os do NGO, com nomes diferentes. NetworkBehaviour é a classe base. Em vez de [ServerRpc] e [ClientRpc], você usa [Command] (cliente para servidor) e [ClientRpc] (servidor para todos os clientes). Em vez de NetworkVariable, você usa [SyncVar] em campos. NetworkIdentity faz o papel do NetworkObject. NetworkManager continua existindo e é o coordenador da cena.

Quando NÃO usar Mirror? Se seu projeto depende fortemente de Unity Gaming Services (Cloud Save, Authentication via Unity, Vivox, Game Server Hosting), NGO se integra mais fácil. Se você quer code-gen automático para serialização de structs complexas, NGO faz isso de forma mais elegante. Para o resto, Mirror é uma escolha sólida e provavelmente o caminho mais barato para um indie pequeno.`,
    codes: [
      {
        lang: "csharp",
        code: `// Player com movimento autoritativo no Mirror.
// Requer: Mirror instalado (via Asset Store ou GitHub), NetworkManager na cena,
// prefab com NetworkIdentity registrado em 'Spawnable Prefabs'.

using Mirror;
using UnityEngine;

public class PlayerMirror : NetworkBehaviour {
    [SerializeField] private float velocidade = 5f;

    // [SyncVar] sincroniza automaticamente do servidor para os clientes.
    // O 'hook' chama um método sempre que o valor muda (em todas as máquinas).
    [SyncVar(hook = nameof(AoMudarVida))]
    private int vida = 100;

    private void AoMudarVida(int antigo, int novo) {
        Debug.Log($"Vida mudou: {antigo} -> {novo}");
    }

    // OnStartLocalPlayer roda só no objeto do jogador local (equivalente a IsOwner do NGO).
    public override void OnStartLocalPlayer() {
        Camera.main.transform.SetParent(transform);
        Camera.main.transform.localPosition = new Vector3(0, 5, -5);
    }

    void Update() {
        // isLocalPlayer separa 'meu player' dos outros players visíveis.
        if (!isLocalPlayer) return;

        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");
        var dir = new Vector3(h, 0, v);

        if (dir.sqrMagnitude > 0.01f)
            CmdMover(dir);
    }

    // [Command] é chamado pelo cliente DONO e executa no servidor.
    // Convenção: nomes de Command começam com 'Cmd'.
    [Command]
    private void CmdMover(Vector3 dir) {
        if (dir.magnitude > 1.5f) return;
        transform.position += dir.normalized * velocidade * Time.deltaTime;
    }

    // Servidor causa dano e propaga para todos via SyncVar.
    [Server]
    public void AplicarDano(int dano) {
        vida = Mathf.Max(0, vida - dano);
        RpcTocarSomDano(); // avisa visualmente todos os clientes
    }

    // [ClientRpc] roda em todos os clientes que conhecem este objeto.
    [ClientRpc]
    private void RpcTocarSomDano() {
        // Som puramente cosmético, então tudo bem rodar em todo cliente.
        AudioSource.PlayClipAtPoint(Resources.Load<AudioClip>("hit"), transform.position);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// NetworkManager customizado: subir host/client, escolher transporte, registrar prefabs.

using Mirror;
using UnityEngine;

public class MeuNetworkManager : NetworkManager {
    [Header("Configuracao do jogo")]
    [SerializeField] private GameObject playerPrefab;

    public override void OnStartServer() {
        base.OnStartServer();
        Debug.Log("Servidor iniciado na porta " + (transport as kcp2k.KcpTransport).Port);
    }

    // Customiza o spawn do player quando alguem entra.
    public override void OnServerAddPlayer(NetworkConnectionToClient conn) {
        var spawn = Vector3.zero;
        var go = Instantiate(playerPrefab, spawn, Quaternion.identity);
        NetworkServer.AddPlayerForConnection(conn, go);
        Debug.Log($"Player spawnado para conexao {conn.connectionId}");
    }

    public override void OnServerDisconnect(NetworkConnectionToClient conn) {
        Debug.Log($"Cliente {conn.connectionId} desconectou");
        base.OnServerDisconnect(conn); // remove o player automaticamente
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Mirror tem TargetRpc: ClientRpc que roda em UM cliente especifico (o dono do alvo).
// Util para mandar mensagens privadas, abrir UI so para um jogador, etc.

using Mirror;
using UnityEngine;

public class CaixaDeTesouro : NetworkBehaviour {
    // Server marca um interagente; ele recebe mensagem privada de loot.
    [Server]
    public void Abrir(NetworkConnectionToClient quem) {
        TargetMostrarLoot(quem, "Espada Lendaria +12");
    }

    [TargetRpc]
    private void TargetMostrarLoot(NetworkConnectionToClient alvo, string item) {
        // So roda no cliente daquele jogador.
        Debug.Log($"Voce encontrou: {item}");
    }
}`,
      },
      {
        lang: "bash",
        code: `# Instalando Mirror.
# Opcao 1 (recomendada): Unity Asset Store (gratuito).
#   Window > Asset Store > buscar 'Mirror' > Add to My Assets > Import.

# Opcao 2: via Package Manager + Git URL.
#   Window > Package Manager > '+' > Add package from git URL...
#   https://github.com/MirrorNetworking/Mirror.git?path=/Assets/Mirror

# Build de servidor headless (Linux dedicated, sem janela).
# No Build Settings, marque 'Server Build' (Unity 2022+) ou use:
#   Linux Dedicated Server > Build.
# No comando, rode:
./MeuJogoServer.x86_64 -batchmode -nographics -port 7777`,
      },
    ],
    points: [
      "Mirror é gratuito, MIT, e tem comunidade enorme com transportes para Steam/Epic prontos.",
      "[Command] = cliente -> servidor; [ClientRpc] = servidor -> todos; [TargetRpc] = servidor -> um cliente.",
      "[SyncVar] sincroniza um campo automaticamente, com hook opcional para reagir.",
      "isLocalPlayer separa 'meu jogador' dos outros visíveis na cena.",
      "Sempre cheque [Server] ou isServer antes de mexer em estado autoritativo.",
      "NetworkIdentity é o equivalente Mirror ao NetworkObject do NGO.",
      "Para builds de servidor, marque 'Server Build' e rode com -batchmode -nographics.",
      "Se você precisa migrar de UNet antigo, Mirror é o caminho mais curto.",
    ],
    alerts: [
      {
        type: "info",
        content: "Mirror e Netcode for GameObjects não conversam entre si. Você escolhe um e vai com ele. Migrar no meio do projeto custa caro.",
      },
      {
        type: "tip",
        content: "Para coop com amigos sem servidor dedicado, use o transporte FizzySteamworks (Steam) ou EpicOnlineTransport (Epic). Eles fazem NAT traversal de graça via SDK desses serviços.",
      },
      {
        type: "warning",
        content: "Cuidado com [SyncVar] em estruturas grandes. Cada mudança envia o valor inteiro. Para listas, use SyncList<T>; para dicionários, SyncDictionary<K,V>. São otimizados para enviar só o delta.",
      },
    ],
  },
  {
    slug: "sincronizacao",
    section: "multiplayer",
    title: "Sincronização: Transform, Animação e Snapshot Interpolation",
    difficulty: "avancado",
    subtitle: "Como manter movimento suave sem teleportes nem 'fantasmas' nos outros jogadores.",
    intro: `Quando dois jogadores estão na mesma sala, cada um vê o outro como um boneco que se mexe. Esse boneco precisa receber atualizações de posição via rede, mas você não pode mandar a posição em todo frame: seria caro demais e a rede simplesmente não consegue. O padrão é mandar 'snapshots' (fotos do estado) algumas vezes por segundo (tipicamente entre 10 e 30) e o cliente preenche o que falta com interpolação. Sem isso, os outros players parecem se teletransportar a cada atualização.

Snapshot interpolation funciona assim: o servidor manda 'no tempo T1, fulano estava na posição P1; no tempo T2, em P2'. O cliente, em vez de pular direto para P2 quando recebe, intencionalmente RENDERIZA O PASSADO. Ele desenha o boneco interpolando entre P1 e P2, com algumas dezenas de milissegundos de atraso. Esse atraso (chamado interpolation buffer) garante que sempre tenha 'futuro' para mostrar. O preço é que você está vendo os outros jogadores levemente no passado — em FPS competitivo, isso é resolvido com lag compensation no servidor, que rebobina o mundo para validar tiros.

Animação é outro bicho. Você não sincroniza cada frame da animação byte a byte. Sincroniza os PARÂMETROS do Animator (booleans, floats, triggers) e cada cliente executa a animação localmente. Triggers são especialmente delicados: como triggers são consumidos uma vez, você precisa de um RPC ou de um SyncVar de evento para não perder a animação por causa de pacote perdido. NetworkAnimator (NGO e Mirror têm versões) faz a maior parte desse trabalho.

Há decisões finas: NetworkTransform deve sincronizar global ou local? Posição com floats ou compactada? Rotação como Quaternion (16 bytes) ou Euler comprimido (3 bytes)? Em projetos grandes, cada byte por player por tick conta. Em projetos pequenos, deixe os defaults e otimize depois com profiler.

Quando você NÃO sincroniza algo? Efeitos puramente cosméticos (partículas, screen shake, sons) podem ser disparados localmente via RPC sem sync de estado contínuo. Variáveis que só interessam ao próprio dono (cooldown da habilidade, mira) podem ficar locais. Sincronizar de menos é mais comum do que sincronizar demais — então liste o que cada outro jogador PRECISA ver.`,
    codes: [
      {
        lang: "csharp",
        code: `// Implementacao manual de snapshot interpolation (didatica) sem usar NetworkTransform.
// Util para entender o que NetworkTransform faz por baixo dos panos.

using System.Collections.Generic;
using Unity.Netcode;
using UnityEngine;

public class TransformInterpolado : NetworkBehaviour {
    private struct Snapshot { public double t; public Vector3 pos; public Quaternion rot; }

    private readonly List<Snapshot> buffer = new();
    private const double INTERPOLATION_DELAY = 0.1; // 100ms de atraso intencional

    [SerializeField] private float sendRate = 20f; // snapshots por segundo
    private float lastSent;

    void Update() {
        if (IsServer) {
            // Servidor envia snapshots em frequencia fixa.
            if (Time.time - lastSent >= 1f / sendRate) {
                lastSent = Time.time;
                EnviarSnapshotClientRpc(NetworkManager.ServerTime.Time, transform.position, transform.rotation);
            }
        } else {
            // Cliente renderiza o passado, interpolando entre snapshots.
            RenderizarInterpolado();
        }
    }

    [ClientRpc]
    private void EnviarSnapshotClientRpc(double t, Vector3 pos, Quaternion rot) {
        buffer.Add(new Snapshot { t = t, pos = pos, rot = rot });
        // Mantem o buffer pequeno.
        if (buffer.Count > 30) buffer.RemoveAt(0);
    }

    private void RenderizarInterpolado() {
        double agora = NetworkManager.ServerTime.Time - INTERPOLATION_DELAY;
        if (buffer.Count < 2) return;

        // Acha os dois snapshots que envolvem o instante 'agora'.
        for (int i = 0; i < buffer.Count - 1; i++) {
            var a = buffer[i];
            var b = buffer[i + 1];
            if (agora >= a.t && agora <= b.t) {
                float k = (float)((agora - a.t) / (b.t - a.t));
                transform.position = Vector3.Lerp(a.pos, b.pos, k);
                transform.rotation = Quaternion.Slerp(a.rot, b.rot, k);
                return;
            }
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Sincronizando Animator: parametros via SyncVar/NetworkVariable, triggers via RPC.

using Unity.Netcode;
using UnityEngine;

public class PlayerAnimSync : NetworkBehaviour {
    private Animator animator;
    private NetworkVariable<float> velocidade = new(0f);
    private NetworkVariable<bool> agachado = new(false);

    void Awake() => animator = GetComponent<Animator>();

    public override void OnNetworkSpawn() {
        velocidade.OnValueChanged += (_, v) => animator.SetFloat("Velocidade", v);
        agachado.OnValueChanged += (_, v) => animator.SetBool("Agachado", v);
    }

    void Update() {
        if (!IsOwner) return;
        var v = new Vector2(Input.GetAxis("Horizontal"), Input.GetAxis("Vertical")).magnitude;
        AtualizarParametrosServerRpc(v, Input.GetKey(KeyCode.LeftControl));

        // Trigger: enviado como evento, nao como variavel.
        if (Input.GetKeyDown(KeyCode.Space)) PularServerRpc();
    }

    [ServerRpc] private void AtualizarParametrosServerRpc(float v, bool ag) {
        velocidade.Value = v;
        agachado.Value = ag;
    }

    [ServerRpc] private void PularServerRpc() => DispararPuloClientRpc();

    [ClientRpc] private void DispararPuloClientRpc() => animator.SetTrigger("Pular");
}`,
      },
      {
        lang: "csharp",
        code: `// Comprimindo dados que vao pela rede. Em jogos com muitos players, isso vira diferenca real.
// Exemplo: enviar uma rotacao Y (1 float) em vez de um Quaternion completo (4 floats).

using Unity.Netcode;
using UnityEngine;

public class TorretaSync : NetworkBehaviour {
    // Em vez de mandar Quaternion (16 bytes), mandamos um angulo Y (4 bytes).
    private NetworkVariable<float> anguloY = new(0f);

    public override void OnNetworkSpawn() {
        anguloY.OnValueChanged += (_, v) => transform.rotation = Quaternion.Euler(0, v, 0);
    }

    [ServerRpc(RequireOwnership = false)]
    public void ApontarServerRpc(Vector3 alvo) {
        var dir = alvo - transform.position;
        anguloY.Value = Mathf.Atan2(dir.x, dir.z) * Mathf.Rad2Deg;
    }
}

// Para compactar floats com perda controlada (ex.: 0..360 em 2 bytes), use bibliotecas
// como BitPacker ou implemente FixedString/HalfFloat. Em NGO/Mirror, isso costuma estar
// disponivel via custom serializers.`,
      },
    ],
    points: [
      "Não envie posição todo frame: 10-30 snapshots por segundo + interpolação no cliente.",
      "Snapshot interpolation renderiza o passado em troca de movimento suave.",
      "Sincronize parâmetros do Animator, não animações inteiras. Triggers via RPC.",
      "NetworkAnimator (NGO e Mirror) cobre 90% dos casos sem código extra.",
      "Para projetos com muitos players, comprima rotações e use precisão menor onde dá.",
      "Estado puramente cosmético (partículas, screen shake) pode ser local via RPC simples.",
      "Lag compensation no servidor compensa o atraso de interpolação ao validar tiros.",
      "Antes de otimizar bits, otimize O QUE você sincroniza. Listar é mais barato que comprimir.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Não use NetworkTransform com Rigidbody se quiser physics autoritativa. Use NetworkRigidbody (NGO) ou NetworkRigidbody do Mirror — eles tratam corretamente forças, colisões e simulação no servidor.",
      },
      {
        type: "tip",
        content: "Ative interpolation no NetworkTransform (NGO) ou no NetworkTransform do Mirror para players remotos. Sem isso, os outros parecem andar a 10 FPS por causa do tick rate.",
      },
      {
        type: "info",
        content: "Quando precisar enviar muitos transforms (centenas de inimigos), considere 'area of interest' ou 'interest management': não mande dados de objetos longe do jogador. Mirror tem InterestManagement, NGO tem NetworkObject visibility.",
      },
    ],
  },
  {
    slug: "lobby-relay",
    section: "multiplayer",
    title: "Unity Lobby e Relay",
    difficulty: "avancado",
    subtitle: "Matchmaking simples e conexões NAT-traversal sem servidor dedicado.",
    intro: `Você terminou a parte técnica do multiplayer e os amigos jogam de boa em LAN. Aí você manda o build pro amigo na casa dele e... não conecta. Isso acontece porque o roteador da casa está fazendo NAT (Network Address Translation), e a maioria dos players residenciais não consegue receber conexões de fora sem configuração manual de port forwarding. Foi para resolver isso que existe o Relay: um servidor neutro na nuvem que faz a ponte entre os jogadores. Em vez de A se conectar direto a B, ambos se conectam ao Relay e ele encaminha os pacotes. É como uma central telefônica: ninguém precisa saber o número de casa do outro.

A Unity oferece esse serviço pronto chamado Unity Relay, integrado com o Unity Gaming Services (UGS). É gratuito até certa cota e se integra de forma transparente com Netcode for GameObjects. Ele resolve os problemas de NAT automaticamente. Em troca, você adiciona uns 20-40ms de latência (a viagem extra até o relay) e fica dependente da infraestrutura da Unity.

Mas Relay sozinho só faz a conexão funcionar. Você ainda precisa de algo que diga 'estes jogadores querem jogar juntos': aí entra o Unity Lobby. Lobby é um serviço de listagem: o host cria uma sala (com nome, máximo de jogadores, modo de jogo), e clientes podem listar salas, filtrar, juntar. Não passa dados de gameplay, só metadados. O fluxo padrão é: o host cria um Lobby + cria uma alocação no Relay + grava o código de junção (joinCode) como propriedade do Lobby. O cliente entra no Lobby, lê o joinCode, conecta no Relay, e a partida começa.

Quando NÃO usar Lobby+Relay? Se você tem servidores dedicados em data centers (Game Server Hosting, AWS GameLift, Edgegap), você não precisa de relay — clientes conectam direto no IP do servidor. Se seu jogo usa exclusivamente Steam, considere Steam Lobby + P2P do próprio Steam, que é gratuito e ilimitado. Se seu jogo é assíncrono ou turn-based, talvez nem precise de tudo isso. Para coop dropping/joining em jogos casual indie, Lobby+Relay é a escolha mais barata e rápida.`,
    codes: [
      {
        lang: "csharp",
        code: `// 1) Inicializacao dos servicos da Unity (Authentication anonima).
// Roda uma vez no inicio do app. Requer pacotes:
// com.unity.services.authentication, com.unity.services.relay, com.unity.services.lobbies.

using Unity.Services.Core;
using Unity.Services.Authentication;
using UnityEngine;

public class UgsBootstrap : MonoBehaviour {
    async void Start() {
        // Inicia o SDK da Unity Gaming Services (le configuracao do Project Settings).
        await UnityServices.InitializeAsync();

        // Login anonimo: a Unity gera um ID persistente sem precisar de senha.
        // Para producao, troque por Sign-In with Steam, Apple, Google, etc.
        if (!AuthenticationService.Instance.IsSignedIn) {
            await AuthenticationService.Instance.SignInAnonymouslyAsync();
        }

        Debug.Log("Logado como: " + AuthenticationService.Instance.PlayerId);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// 2) Host: criar uma alocacao no Relay e juntar a um Lobby novo, expondo o joinCode.

using System.Threading.Tasks;
using Unity.Netcode;
using Unity.Netcode.Transports.UTP;
using Unity.Networking.Transport.Relay;
using Unity.Services.Lobbies;
using Unity.Services.Lobbies.Models;
using Unity.Services.Relay;
using Unity.Services.Relay.Models;
using UnityEngine;

public class HospedarPartida : MonoBehaviour {
    private Lobby lobbyAtual;

    public async Task<string> CriarPartida(string nome, int maxPlayers) {
        // (a) Cria alocacao no Relay para 'maxPlayers - 1' clientes alem do host.
        Allocation alloc = await RelayService.Instance.CreateAllocationAsync(maxPlayers - 1);

        // (b) Pega o joinCode (string curta tipo 'A1B2C3') que clientes vao usar.
        string joinCode = await RelayService.Instance.GetJoinCodeAsync(alloc.AllocationId);

        // (c) Configura o transporte do Netcode para usar essa alocacao.
        var transport = NetworkManager.Singleton.GetComponent<UnityTransport>();
        transport.SetRelayServerData(new RelayServerData(alloc, "dtls"));

        // (d) Sobe como host (servidor + cliente local).
        NetworkManager.Singleton.StartHost();

        // (e) Cria o Lobby publico, anexando o joinCode como dado.
        var opcoes = new CreateLobbyOptions {
            IsPrivate = false,
            Data = new() {
                { "joinCode", new DataObject(DataObject.VisibilityOptions.Member, joinCode) },
                { "modo",     new DataObject(DataObject.VisibilityOptions.Public, "deathmatch") }
            }
        };
        lobbyAtual = await LobbyService.Instance.CreateLobbyAsync(nome, maxPlayers, opcoes);

        // Manda heartbeat para nao expirar (lobbies inativos morrem em 30s).
        InvokeRepeating(nameof(Heartbeat), 15f, 15f);

        Debug.Log($"Lobby criado. JoinCode={joinCode}");
        return joinCode;
    }

    private async void Heartbeat() {
        if (lobbyAtual != null)
            await LobbyService.Instance.SendHeartbeatPingAsync(lobbyAtual.Id);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// 3) Cliente: listar lobbies publicos, escolher um, ler joinCode e conectar via Relay.

using System.Threading.Tasks;
using Unity.Netcode;
using Unity.Netcode.Transports.UTP;
using Unity.Networking.Transport.Relay;
using Unity.Services.Lobbies;
using Unity.Services.Lobbies.Models;
using Unity.Services.Relay;
using Unity.Services.Relay.Models;
using UnityEngine;

public class ProcurarPartida : MonoBehaviour {
    public async Task<bool> EntrarPrimeiroLobby() {
        // Lista publica de lobbies, filtrada por slots disponiveis.
        var query = new QueryLobbiesOptions {
            Count = 25,
            Filters = new() {
                new QueryFilter(QueryFilter.FieldOptions.AvailableSlots, "0", QueryFilter.OpOptions.GT)
            }
        };
        QueryResponse resp = await LobbyService.Instance.QueryLobbiesAsync(query);
        if (resp.Results.Count == 0) {
            Debug.Log("Nenhum lobby disponivel.");
            return false;
        }

        Lobby escolhido = await LobbyService.Instance.JoinLobbyByIdAsync(resp.Results[0].Id);
        string joinCode = escolhido.Data["joinCode"].Value;

        // Junta na alocacao do Relay usando o codigo.
        JoinAllocation alloc = await RelayService.Instance.JoinAllocationAsync(joinCode);

        var transport = NetworkManager.Singleton.GetComponent<UnityTransport>();
        transport.SetRelayServerData(new RelayServerData(alloc, "dtls"));

        // Sobe como cliente. NGO conecta via Relay automaticamente.
        return NetworkManager.Singleton.StartClient();
    }
}`,
      },
      {
        lang: "json",
        code: `// Project Settings > Services: voce precisa vincular o projeto a uma organizacao Unity
// e ativar Authentication, Relay e Lobby no dashboard (https://dashboard.unity.com).
// O arquivo abaixo (ProjectSettings/UnityConnectSettings.asset) sera atualizado.
// Verifique se 'projectId' esta preenchido. Sem isso, os servicos nao iniciam.

{
  "ProjectSettings": {
    "projectName": "MeuJogoMultiplayer",
    "organizationId": "minha-org",
    "projectId": "abcd1234-5678-90ef-ghij-klmnopqrstuv",
    "services": {
      "authentication": "enabled",
      "relay":          "enabled",
      "lobby":          "enabled"
    }
  }
}`,
      },
    ],
    points: [
      "Relay resolve NAT: sem ele, jogadores em redes domésticas raramente conseguem conectar direto.",
      "Lobby é o serviço de listagem de salas; Relay é o tubo por onde os pacotes passam.",
      "O fluxo padrão: cria Relay -> guarda joinCode no Lobby -> cliente lê joinCode -> conecta via Relay.",
      "Lobbies inativos expiram em 30 segundos; mande heartbeat a cada 15-25s no host.",
      "Authentication anônima é ótima para protótipo, mas troque por Steam/Apple/Google em produção.",
      "Para servidores dedicados, pule o Relay e conecte direto no IP — Relay adiciona latência.",
      "Steam Lobby + P2P é grátis e ilimitado se seu jogo for exclusivo Steam.",
      "Use os filtros do QueryLobbies (modo, região, slots) para matchmaking simples sem servidor próprio.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Relay tem cota gratuita generosa mas finita. Se seu jogo crescer, monitore o dashboard da Unity. Cobrança vem por GB transferido. Servidor dedicado pode sair mais barato em escala.",
      },
      {
        type: "tip",
        content: "Sempre mostre o joinCode na UI para o host poder enviar manualmente para amigos (Discord, WhatsApp). É o equivalente moderno do 'meu IP é tal'. Funciona até quando o Lobby falha.",
      },
      {
        type: "danger",
        content: "Nunca exponha credenciais da UGS no código cliente. As chaves ficam no Unity Editor (Project Settings > Services). Se você commitou um projectId privado, gere um novo no dashboard. ProjectId em si é público, mas keys de servidor não.",
      },
    ],
  },
];
