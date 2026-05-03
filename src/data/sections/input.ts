import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "input-legado",
    section: "input",
    title: "Input Legacy: o sistema antigo que ainda manda recado",
    difficulty: "intermediario",
    subtitle: "Por que Input.GetKey e Input.GetAxis ainda existem e quando ainda fazem sentido.",
    intro: `Antes de você sair criando ações, mapas e bindings com o Input System novo, é importante entender o sistema antigo, conhecido como Input Manager ou simplesmente "Input legacy". Ele é a forma original que a Unity oferecia para ler teclado, mouse e joystick desde os primórdios da engine. Mesmo em projetos novos de 2024 e 2025, você ainda vai encontrar tutoriais, plugins da Asset Store e código de equipe com Input.GetKey, Input.GetAxis e Input.mousePosition espalhados por toda parte. Ignorar esse sistema é como aprender a dirigir só carro automático e ficar travado quando alguém te entrega um câmbio manual.

Pense no Input legacy como uma central de telefonia antiga: você ligava para um número (uma string como "Horizontal" ou "Jump") e a Unity te respondia "está pressionado" ou "não está". O grande problema dessa abordagem é que ela é polling pura — a cada Update, você precisa perguntar "ei, a tecla está apertada?". Não existem eventos, não existe diferenciação entre dispositivos, e tudo gira em torno de strings configuradas em uma janela chamada Input Manager (Edit > Project Settings > Input Manager). Se você digitar "horizontal" em vez de "Horizontal", a Unity não reclama em tempo de compilação. Você só descobre o erro quando o personagem fica parado no playtest.

A Unity tentou aposentar esse sistema várias vezes desde 2019, quando lançou o Input System novo (pacote separado). Mas como milhões de projetos dependem dele, e como ele simplesmente funciona para protótipos, ele continua disponível e habilitado por padrão em projetos Built-in. Em projetos URP e HDRP recentes, o template já vem com o Input System novo ativado, e o legacy fica desligado — e isso é uma pegadinha que confunde muito iniciante. Você copia um tutorial antigo, cola Input.GetKey, e não acontece nada.

Neste capítulo você vai aprender a ler teclas, eixos virtuais e mouse com o sistema antigo, vai entender o que é o Input Manager, vai ver como configurar dois esquemas de input simultâneos (Both) e vai sair com critério para escolher entre ficar no legacy ou migrar para o novo. Não pule isso achando que é "obsoleto": muito código de produção ainda vive aqui.`,
    codes: [
      {
        lang: "csharp",
        code: `// Movimento básico de personagem usando o Input legacy.
// Anexe este script a um GameObject com Rigidbody.
using UnityEngine;

public class MovimentoLegacy : MonoBehaviour
{
    public float velocidade = 5f;
    public float forcaPulo = 7f;
    private Rigidbody rb;

    void Start()
    {
        // Cacheamos o Rigidbody para evitar GetComponent toda hora.
        rb = GetComponent<Rigidbody>();
    }

    void Update()
    {
        // GetAxis devolve um valor entre -1 e 1, com suavização interna.
        // "Horizontal" e "Vertical" sao nomes pre-configurados no Input Manager,
        // mapeados para WASD e setas por padrao.
        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");

        // Construimos um vetor de direcao no plano XZ (chao).
        Vector3 direcao = new Vector3(h, 0f, v);
        transform.Translate(direcao * velocidade * Time.deltaTime, Space.World);

        // GetKeyDown dispara apenas no frame em que a tecla foi pressionada.
        // Ideal para acoes pontuais como pular, atirar, abrir menu.
        if (Input.GetKeyDown(KeyCode.Space))
        {
            rb.AddForce(Vector3.up * forcaPulo, ForceMode.Impulse);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Diferenca entre GetKey, GetKeyDown e GetKeyUp.
// Cada um responde a um momento diferente do ciclo de uma tecla.
using UnityEngine;

public class TestaTeclas : MonoBehaviour
{
    void Update()
    {
        // GetKey: TRUE em todos os frames enquanto a tecla esta pressionada.
        // Use para movimento continuo, mira, segurar para carregar.
        if (Input.GetKey(KeyCode.W))
        {
            Debug.Log("W esta sendo segurada (todo frame)");
        }

        // GetKeyDown: TRUE somente no frame da pressao (borda de subida).
        // Use para acoes unicas: pular, abrir inventario, confirmar.
        if (Input.GetKeyDown(KeyCode.E))
        {
            Debug.Log("E foi pressionada agora (so 1 frame)");
        }

        // GetKeyUp: TRUE no frame em que a tecla foi solta.
        // Util para mecanicas tipo "soltou para soltar a flecha".
        if (Input.GetKeyUp(KeyCode.E))
        {
            Debug.Log("E foi solta agora");
        }

        // Mouse tambem responde por KeyCode, mas a forma idiomatica
        // e usar GetMouseButton (0=esquerdo, 1=direito, 2=meio).
        if (Input.GetMouseButtonDown(0))
        {
            Debug.Log("Clique esquerdo! Posicao: " + Input.mousePosition);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// GetAxis vs GetAxisRaw: a diferenca que muda a sensacao do jogo.
using UnityEngine;

public class AxisVsRaw : MonoBehaviour
{
    void Update()
    {
        // GetAxis aplica uma curva de suavizacao (gravity e sensitivity).
        // Quando voce solta a tecla, o valor cai gradualmente para zero.
        // Bom para fisica realista de carros, avioes, camera de mira.
        float suave = Input.GetAxis("Horizontal");

        // GetAxisRaw devolve estritamente -1, 0 ou 1, sem suavizacao.
        // Use em jogos de plataforma e tiro top-down: voce quer responsividade
        // imediata e controla a aceleracao no seu proprio codigo.
        float bruto = Input.GetAxisRaw("Horizontal");

        Debug.Log($"suave={suave:F2} | bruto={bruto:F0}");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Como descobrir e respeitar o Input Manager.
// Os eixos pre-definidos pela Unity sao:
// Horizontal, Vertical -> WASD/setas e Joystick X/Y
// Mouse X, Mouse Y    -> movimento do mouse (delta)
// Mouse ScrollWheel   -> roda do mouse
// Fire1, Fire2, Fire3 -> Ctrl, Alt, Shift esquerdos
// Jump                -> Space
// Submit, Cancel      -> Enter e Escape
using UnityEngine;

public class CamaraOrbital : MonoBehaviour
{
    public Transform alvo;
    public float sensibilidade = 100f;
    public float zoomSpeed = 5f;
    private float yaw;
    private float pitch;
    private float distancia = 5f;

    void Update()
    {
        // Mouse X e Mouse Y devolvem o DELTA (quanto se moveu desde o ultimo frame).
        yaw   += Input.GetAxis("Mouse X") * sensibilidade * Time.deltaTime;
        pitch -= Input.GetAxis("Mouse Y") * sensibilidade * Time.deltaTime;
        pitch = Mathf.Clamp(pitch, -40f, 80f);

        // Roda do mouse para zoom.
        distancia -= Input.GetAxis("Mouse ScrollWheel") * zoomSpeed;
        distancia = Mathf.Clamp(distancia, 2f, 15f);

        Quaternion rot = Quaternion.Euler(pitch, yaw, 0f);
        transform.position = alvo.position - rot * Vector3.forward * distancia;
        transform.LookAt(alvo);
    }
}`,
      },
    ],
    points: [
      "Input legacy funciona por polling: voce pergunta o estado a cada Update.",
      "GetKey segura, GetKeyDown dispara 1 frame, GetKeyUp dispara ao soltar.",
      "GetAxis suaviza com curva; GetAxisRaw devolve -1/0/1 cru e responsivo.",
      "Os nomes (Horizontal, Vertical, Fire1...) vem de Edit > Project Settings > Input Manager.",
      "String typo em GetAxis nao da erro de compilacao, so silencio em runtime.",
      "Input.mousePosition e em pixels, com (0,0) no canto inferior esquerdo da tela.",
      "Em projetos URP/HDRP novos, o legacy pode estar desligado por padrao.",
      "Use legacy para protótipos rápidos ou projetos pequenos; migre para o novo em produtos sérios.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Se Input.GetKey nao responde a nada, va em Edit > Project Settings > Player > Other Settings > Active Input Handling. Mude para 'Both' ou 'Input Manager (Old)'. Em projetos URP modernos costuma vir como 'Input System Package (New)' apenas.",
      },
      {
        type: "tip",
        content: "Nunca leia input dentro de FixedUpdate. Use Update para capturar (especialmente GetKeyDown/Up, que so disparam 1 frame), guarde em variaveis e aplique a fisica em FixedUpdate. Caso contrario voce perde inputs.",
      },
      {
        type: "info",
        content: "GetAxis multiplica o valor por Time.deltaTime se voce usar para movimento, mas para Mouse X / Mouse Y o valor JA E um delta de frame: multiplicar por deltaTime de novo deixa a camera estranhamente lenta em FPS altos.",
      },
    ],
  },
  {
    slug: "input-system",
    section: "input",
    title: "Input System novo: a virada de chave da Unity",
    difficulty: "intermediario",
    subtitle: "Pacote oficial moderno: ações, callbacks, dispositivos e por que vale a pena migrar.",
    intro: `O Input System novo é um pacote oficial da Unity (com.unity.inputsystem) lançado em 2019 para resolver dores que o sistema antigo arrastava há mais de uma década. A diferença filosófica é grande: em vez de você ficar perguntando "a tecla X está apertada?" todo frame, você declara ações abstratas como "Move", "Jump", "Fire" e o sistema te avisa quando essas ações acontecem, independente do dispositivo que as disparou. É a diferença entre ficar olhando pela janela esperando o entregador chegar e ter uma campainha que toca quando ele chega.

A motivação prática é direta. No sistema antigo, suportar teclado, gamepad Xbox, gamepad PlayStation, joystick antigo e touch ao mesmo tempo virava uma sopa de ifs com strings hardcoded. Pior: dois jogadores no mesmo PC com gamepads diferentes era praticamente impossível sem hacks. O Input System novo foi desenhado pensando em tudo isso desde o começo. Ele entende dispositivos como Keyboard.current, Mouse.current, Gamepad.current, Touchscreen.current; permite mapear bindings (combinações de teclas) para ações; suporta múltiplos jogadores com pareamento automático; e ainda gera código C# tipado a partir dos seus assets de Action.

A curva de aprendizado é o preço. Você precisa instalar o pacote pelo Package Manager, criar um asset .inputactions, configurar Action Maps (Player, UI, Driving), Bindings (W/A/S/D, Left Stick, Touchscreen), Control Schemes (Keyboard&Mouse, Gamepad), e por fim ligar tudo a scripts via callbacks ou via componente PlayerInput. Soa pesado, mas em 30 minutos de prática a coisa flui — e o ganho em manutenibilidade é enorme. Trocar o botão de pulo de Space para Enter vira um ajuste no asset, sem recompilar nem caçar Input.GetKeyDown(KeyCode.Space) em 40 scripts.

Neste capítulo você vai instalar o pacote, criar seu primeiro Input Action Asset, ler input por três caminhos diferentes (acesso direto, callbacks via PlayerInput, classe gerada) e entender quando cada um faz mais sentido. Os capítulos seguintes vão aprofundar gamepad, touch, action maps e binding com dispositivos.`,
    codes: [
      {
        lang: "bash",
        code: `# Instalacao do Input System.
# 1. Abra Window > Package Manager
# 2. Em "Packages: Unity Registry", procure "Input System"
# 3. Clique Install (versao 1.7+ recomendada para Unity 2022.3 LTS ou superior)
# 4. A Unity vai perguntar se quer ativar o sistema novo. Escolha:
#    - "Yes" -> desliga o legacy e reinicia o editor
#    - Para usar os dois ao mesmo tempo, va em
#      Edit > Project Settings > Player > Active Input Handling = Both`,
      },
      {
        lang: "csharp",
        code: `// Forma mais direta: ler dispositivos pelo singleton .current.
// Otima para prototipos rapidos; nao precisa criar asset nenhum.
using UnityEngine;
using UnityEngine.InputSystem;

public class LeituraDireta : MonoBehaviour
{
    void Update()
    {
        // Keyboard.current pode ser null se nenhum teclado estiver conectado
        // (em consoles e mobile, por exemplo). Sempre cheque.
        var kb = Keyboard.current;
        if (kb == null) return;

        // wasPressedThisFrame substitui GetKeyDown.
        if (kb.spaceKey.wasPressedThisFrame)
        {
            Debug.Log("Espaco pressionado!");
        }

        // isPressed substitui GetKey.
        if (kb.wKey.isPressed)
        {
            transform.Translate(Vector3.forward * Time.deltaTime * 5f);
        }

        // Mouse com Mouse.current.
        var mouse = Mouse.current;
        if (mouse != null && mouse.leftButton.wasPressedThisFrame)
        {
            Debug.Log("Clique em " + mouse.position.ReadValue());
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Usando o componente PlayerInput + callbacks.
// 1. Crie um Input Action Asset (botao direito > Create > Input Actions)
// 2. Adicione um componente PlayerInput ao seu personagem
// 3. Arraste o asset no campo Actions
// 4. Mude Behavior para "Invoke Unity Events" ou "Send Messages"
// Aqui usamos "Send Messages": a Unity chama metodos OnXxx automaticamente.
using UnityEngine;
using UnityEngine.InputSystem;

[RequireComponent(typeof(PlayerInput))]
public class JogadorComCallbacks : MonoBehaviour
{
    public float velocidade = 5f;
    private Vector2 movimentoAtual;

    // Nome do metodo bate com o nome da Action ("Move", "Jump").
    // O parametro InputValue traz o valor lido naquele frame.
    public void OnMove(InputValue value)
    {
        movimentoAtual = value.Get<Vector2>();
    }

    public void OnJump(InputValue value)
    {
        // value.isPressed = true quando comecou, false quando terminou.
        if (value.isPressed)
        {
            Debug.Log("Pulou!");
        }
    }

    void Update()
    {
        Vector3 v = new Vector3(movimentoAtual.x, 0f, movimentoAtual.y);
        transform.Translate(v * velocidade * Time.deltaTime, Space.World);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Caminho mais "profissional": classe C# gerada a partir do asset.
// 1. Selecione o .inputactions no Project
// 2. No Inspector, marque "Generate C# Class" e clique Apply
// 3. A Unity gera uma classe (ex.: PlayerControls) com tudo tipado.
using UnityEngine;
using UnityEngine.InputSystem;

public class JogadorTipado : MonoBehaviour
{
    private PlayerControls controls;
    private Vector2 movimento;

    void Awake()
    {
        // Instancia a classe gerada.
        controls = new PlayerControls();

        // Inscreve callbacks com lambdas. Note como tudo e fortemente tipado:
        // o IDE autocompleta Player.Move, Player.Jump etc.
        controls.Player.Move.performed += ctx => movimento = ctx.ReadValue<Vector2>();
        controls.Player.Move.canceled  += ctx => movimento = Vector2.zero;
        controls.Player.Jump.performed += ctx => Debug.Log("Pulou!");
    }

    // Action maps precisam ser ligados/desligados manualmente neste modo.
    void OnEnable()  => controls.Player.Enable();
    void OnDisable() => controls.Player.Disable();

    void Update()
    {
        Vector3 v = new Vector3(movimento.x, 0f, movimento.y);
        transform.Translate(v * 5f * Time.deltaTime, Space.World);
    }
}`,
      },
    ],
    points: [
      "Input System novo e baseado em ACOES abstratas, nao em teclas concretas.",
      "Instala via Package Manager; ative em Player Settings > Active Input Handling.",
      "Tres formas de uso: leitura direta (.current), PlayerInput + callbacks, classe gerada.",
      "wasPressedThisFrame = GetKeyDown; isPressed = GetKey; wasReleasedThisFrame = GetKeyUp.",
      "Suporta multiplos jogadores e dispositivos sem gambiarra.",
      "Trocar bindings nao recompila codigo: edita o asset .inputactions.",
      "Para projeto serio, prefira a classe gerada por dar autocomplete e refactor seguro.",
      "PlayerInput com Send Messages e otimo para iniciantes; callbacks tipados para producao.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Se voce ativar so o Input System novo e tiver scripts antigos com Input.GetKey, eles vao parar de funcionar e nao vao dar erro. A engine simplesmente devolve sempre 'false'. Use 'Both' enquanto migra.",
      },
      {
        type: "tip",
        content: "Sempre ligue (Enable) o Action Map em OnEnable e desligue em OnDisable. Esquecer disso e a causa numero um de 'meu input nao funciona' no Input System novo.",
      },
      {
        type: "info",
        content: "A classe gerada (PlayerControls) precisa ser instanciada com 'new', e nao adicionada como componente. Voce a destrói com .Dispose() em OnDestroy se quiser ser rigoroso com memoria.",
      },
    ],
  },
  {
    slug: "teclado-mouse",
    section: "input",
    title: "Teclado e mouse: do WASD ao raycast de mira",
    difficulty: "intermediario",
    subtitle: "Padrões de leitura, mira por raycast e diferenças entre os dois sistemas.",
    intro: `Teclado e mouse continuam sendo o par de entrada mais comum em jogos de PC, mesmo com a popularização do gamepad. Por isso, dominar como ler esses dois dispositivos com fluência é praticamente obrigatório para qualquer dev Unity. A boa notícia é que ambos os sistemas (legacy e novo) tratam teclado e mouse com APIs bem maduras. A má notícia é que eles diferem em detalhes que parecem pequenos mas mudam comportamento em produção: deltas de mouse, posição em pixels versus normalizada, ordem de execução em relação à física, e cuidados com Time.deltaTime.

A primeira coisa que confunde iniciante é o conceito de "delta do mouse". Quando você gira a câmera arrastando o mouse, você não quer saber a posição absoluta do cursor — você quer saber quanto ele se moveu desde o último frame. Tanto Input.GetAxis("Mouse X") (legacy) quanto Mouse.current.delta.ReadValue() (novo) já entregam esse delta direto, e por isso multiplicar por Time.deltaTime nesses casos é ERRADO. O delta já incorpora o tempo. Em FPS altos, a câmera fica devagar; em FPS baixos, fica rápida. É um bug muito comum em projetos iniciantes.

Outro ponto é a posição da tela. Em Unity, mousePosition (legacy) e Mouse.current.position (novo) devolvem coordenadas em pixels com (0, 0) no canto inferior esquerdo. Isso difere de quase todo framework web, onde o (0,0) fica no canto superior esquerdo. Quando você precisa converter para uma posição no mundo 3D, usa Camera.ScreenPointToRay para gerar um raio e dispara um Physics.Raycast. Esse padrão é a base de mira em FPS, click-to-move em RTS, seleção de unidades, build mode em jogos de construção e muitos outros.

Neste capítulo você vai ver lado a lado o mesmo movimento WASD nos dois sistemas, vai aprender a fazer mira com raycast, vai entender locks de cursor para FPS e vai pegar dicas para evitar os bugs mais comuns. No fim, vai conseguir trocar entre os dois sistemas com tranquilidade.`,
    codes: [
      {
        lang: "csharp",
        code: `// WASD + mira com mouse no Input legacy.
// Padrao classico de FPS; locka o cursor e usa o delta para girar.
using UnityEngine;

public class FpsLegacy : MonoBehaviour
{
    public Transform camera;
    public float velocidade = 5f;
    public float sensibilidade = 2f;
    private float pitch;

    void Start()
    {
        // Trava o cursor no centro e some com ele. Essencial para FPS.
        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;
    }

    void Update()
    {
        // Movimento no plano: GetAxisRaw para sensacao de jogo classico.
        float h = Input.GetAxisRaw("Horizontal");
        float v = Input.GetAxisRaw("Vertical");
        Vector3 dir = (transform.right * h + transform.forward * v).normalized;
        transform.position += dir * velocidade * Time.deltaTime;

        // Mouse X/Y JA SAO DELTAS por frame. NAO multiplique por deltaTime.
        float mx = Input.GetAxis("Mouse X") * sensibilidade;
        float my = Input.GetAxis("Mouse Y") * sensibilidade;

        transform.Rotate(0f, mx, 0f);     // gira o corpo no Y
        pitch = Mathf.Clamp(pitch - my, -85f, 85f);
        camera.localEulerAngles = new Vector3(pitch, 0f, 0f);

        // Esc libera o cursor (util durante teste).
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            Cursor.lockState = CursorLockMode.None;
            Cursor.visible = true;
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// O mesmo FPS escrito com Input System novo (leitura direta).
using UnityEngine;
using UnityEngine.InputSystem;

public class FpsNovo : MonoBehaviour
{
    public Transform camera;
    public float velocidade = 5f;
    public float sensibilidade = 0.1f; // delta do novo sistema vem em pixels
    private float pitch;

    void Start()
    {
        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;
    }

    void Update()
    {
        var kb = Keyboard.current;
        var mouse = Mouse.current;
        if (kb == null || mouse == null) return;

        // Construimos o vetor de movimento manualmente a partir das teclas.
        Vector2 mov = Vector2.zero;
        if (kb.wKey.isPressed) mov.y += 1f;
        if (kb.sKey.isPressed) mov.y -= 1f;
        if (kb.dKey.isPressed) mov.x += 1f;
        if (kb.aKey.isPressed) mov.x -= 1f;
        mov = mov.normalized;

        Vector3 dir = transform.right * mov.x + transform.forward * mov.y;
        transform.position += dir * velocidade * Time.deltaTime;

        // delta.ReadValue() devolve quantos pixels o mouse andou desde o ultimo frame.
        Vector2 olhar = mouse.delta.ReadValue() * sensibilidade;
        transform.Rotate(0f, olhar.x, 0f);
        pitch = Mathf.Clamp(pitch - olhar.y, -85f, 85f);
        camera.localEulerAngles = new Vector3(pitch, 0f, 0f);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Mira por raycast: clique do mouse projeta um raio no mundo.
// Padrao usado em FPS, click-to-move, seleção de unidades.
using UnityEngine;
using UnityEngine.InputSystem;

public class CliqueNoMundo : MonoBehaviour
{
    public Camera cam;
    public float alcance = 100f;

    void Update()
    {
        var mouse = Mouse.current;
        if (mouse == null) return;

        if (mouse.leftButton.wasPressedThisFrame)
        {
            // ScreenPointToRay converte coordenadas de tela em raio no mundo.
            Vector2 pos = mouse.position.ReadValue();
            Ray raio = cam.ScreenPointToRay(pos);

            // Physics.Raycast preenche RaycastHit se acertar algum collider.
            if (Physics.Raycast(raio, out RaycastHit hit, alcance))
            {
                Debug.Log($"Acertei {hit.collider.name} em {hit.point}");
                Debug.DrawLine(raio.origin, hit.point, Color.red, 1f);
            }
            else
            {
                Debug.Log("Errei: nada no caminho.");
            }
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Detectando clique sobre UI vs sobre o mundo 3D.
// Sem isso, voce dispara no jogo ao clicar em botoes do menu.
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem;

public class CliqueRespeitaUI : MonoBehaviour
{
    void Update()
    {
        var mouse = Mouse.current;
        if (mouse == null) return;
        if (!mouse.leftButton.wasPressedThisFrame) return;

        // EventSystem.current.IsPointerOverGameObject retorna true
        // quando o ponteiro esta sobre um elemento de UI.
        // Voce precisa de um EventSystem na cena (vem com Canvas).
        if (EventSystem.current != null && EventSystem.current.IsPointerOverGameObject())
        {
            Debug.Log("Clicou na UI, ignorando o tiro.");
            return;
        }

        Debug.Log("Clicou no mundo: dispara!");
    }
}`,
      },
    ],
    points: [
      "Mouse X / Mouse Y (legacy) e Mouse.current.delta (novo) ja sao deltas: nao multiplique por deltaTime.",
      "mousePosition vem em pixels com (0,0) no canto INFERIOR esquerdo.",
      "Cursor.lockState = Locked + Cursor.visible = false e o padrao de FPS.",
      "Camera.ScreenPointToRay + Physics.Raycast e a base de qualquer mira ou click-to-world.",
      "EventSystem.IsPointerOverGameObject evita disparar tiro ao clicar em botoes da UI.",
      "No sistema novo, sempre cheque Keyboard.current != null antes de usar.",
      "Em multiplas plataformas, considere que mobile pode nao ter teclado nem mouse.",
      "Para mira super-precisa, use camera.pixelHeight / pixelWidth ao calcular centro da tela.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Multiplicar o delta do mouse por Time.deltaTime e o erro mais comum de iniciante em camera FPS. Resultado: camera lenta em PCs rapidos e rapida em PCs lentos. O delta JA incorpora tempo.",
      },
      {
        type: "tip",
        content: "Sensibilidade do mouse no Input System novo costuma ser ~10x menor que no legacy, porque o delta vem em pixels brutos, nao normalizado. Se a camera ficou maluca, divida sensibilidade por 10.",
      },
      {
        type: "warning",
        content: "Cursor.lockState mantem o cursor lockado ate voce ALT+TAB. Em build standalone, valide com pause: clicar fora pode liberar e voce precisa relockar manualmente em OnApplicationFocus.",
      },
    ],
  },
  {
    slug: "gamepad",
    section: "input",
    title: "Gamepad: Xbox, PlayStation e o sonho do plug-and-play",
    difficulty: "intermediario",
    subtitle: "Sticks analógicos, gatilhos, vibração e diferenças entre controles.",
    intro: `Gamepad é a alma de muitos gêneros — plataforma, ação, corrida, esporte. E historicamente, fazer um jogo Unity reconhecer corretamente um controle Xbox numa máquina, um DualShock noutra e um genérico chinês na terceira foi um pesadelo no sistema legacy. Os números dos botões mudavam, os eixos eram numerados diferente, o gatilho do Xbox era um eixo (-1 a 1) enquanto o do PlayStation era dois eixos separados, e cada SO mapeava as coisas de um jeito. O Input System novo nasceu para resolver isso de uma vez, com uma camada de abstração chamada HID layout.

A ideia é simples: você programa contra a abstração Gamepad.current e o sistema faz o trabalho sujo de mapear o controle físico (XInputController, DualShockGamepad, SwitchProControllerHID) para os campos comuns leftStick, rightStick, buttonSouth (A no Xbox, X no PlayStation), buttonEast (B/Circle), leftTrigger, rightTrigger, dpad e por aí vai. Os botões usam nomes de posição (north, south, east, west) justamente para você não cair na pegadinha de "o A do Xbox é o X do PlayStation". O X do PlayStation está na posição sul, igual ao A do Xbox. Programa contra "south" e funciona nos dois.

Outro ganho enorme é a vibração (rumble). No legacy você precisava de plugin para fazer rumble; no novo, é uma chamada direta SetMotorSpeeds(low, high). E mais: você consegue ler o controle por evento (.performed) ou polling (.isPressed), pareá-lo com um jogador específico e até detectar quando um controle foi conectado ou desconectado em runtime.

Neste capítulo você vai aprender a ler stick analógico com deadzone, a usar gatilhos como acelerador, a vibrar o controle ao tomar dano, a detectar conexão e desconexão de gamepad e a evitar a maior pegadinha do legacy: tratar gamepad e teclado com a mesma API. Vamos focar no Input System novo, que é onde gamepad realmente brilha.`,
    codes: [
      {
        lang: "csharp",
        code: `// Lendo stick analogico e botoes do gamepad.
using UnityEngine;
using UnityEngine.InputSystem;

public class JogadorGamepad : MonoBehaviour
{
    public float velocidade = 5f;
    public float deadzone = 0.15f;

    void Update()
    {
        var pad = Gamepad.current;
        // null = nenhum gamepad conectado nesse instante.
        if (pad == null) return;

        // ReadValue() devolve Vector2 com x e y entre -1 e 1.
        Vector2 stick = pad.leftStick.ReadValue();

        // Aplicacao manual de deadzone radial: ignora movimentos minusculos
        // que viriam de imprecisao mecanica do stick em repouso.
        if (stick.magnitude < deadzone)
            stick = Vector2.zero;

        Vector3 mov = new Vector3(stick.x, 0f, stick.y);
        transform.Translate(mov * velocidade * Time.deltaTime, Space.World);

        // Botoes por posicao. buttonSouth = A (Xbox) = X (PlayStation).
        if (pad.buttonSouth.wasPressedThisFrame)
            Debug.Log("Botao SUL (A/Cross) pressionado");

        if (pad.buttonEast.wasPressedThisFrame)
            Debug.Log("Botao LESTE (B/Circle) pressionado");

        // D-pad como Vector2 (ja com deadzone interna).
        Vector2 dpad = pad.dpad.ReadValue();
        if (dpad != Vector2.zero)
            Debug.Log($"D-pad: {dpad}");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Gatilhos analogicos como acelerador e freio (jogo de corrida).
using UnityEngine;
using UnityEngine.InputSystem;

public class CarroSimples : MonoBehaviour
{
    public float aceleracao = 20f;
    public float velocidadeMaxima = 30f;
    private float velocidade;

    void Update()
    {
        var pad = Gamepad.current;
        if (pad == null) return;

        // Triggers vao de 0 (solto) a 1 (totalmente pressionado).
        // Diferentemente de botoes binarios, voce tem CONTROLE FINO.
        float acelerar = pad.rightTrigger.ReadValue();
        float frear    = pad.leftTrigger.ReadValue();

        velocidade += (acelerar - frear) * aceleracao * Time.deltaTime;
        velocidade = Mathf.Clamp(velocidade, -velocidadeMaxima * 0.3f, velocidadeMaxima);

        // Atrito leve quando solta tudo.
        if (acelerar < 0.05f && frear < 0.05f)
            velocidade = Mathf.MoveTowards(velocidade, 0f, 5f * Time.deltaTime);

        transform.Translate(Vector3.forward * velocidade * Time.deltaTime);

        // Rotacao baseada no stick esquerdo X, escalada pela velocidade
        // (sem velocidade, nao vira — fisica de carro de verdade).
        float dir = pad.leftStick.x.ReadValue();
        transform.Rotate(0f, dir * 60f * Time.deltaTime * (velocidade / velocidadeMaxima), 0f);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Vibracao (rumble) ao tomar dano.
// Os dois motores: lowFrequency (motor grande, baixa frequencia)
// e highFrequency (motor pequeno, alta frequencia, sensacao de "buzz").
using System.Collections;
using UnityEngine;
using UnityEngine.InputSystem;

public class VibrarAoDano : MonoBehaviour
{
    public void TomarDano(float intensidade)
    {
        var pad = Gamepad.current;
        if (pad == null) return;

        StartCoroutine(RotinaVibrar(pad, intensidade));
    }

    private IEnumerator RotinaVibrar(Gamepad pad, float forca)
    {
        // SetMotorSpeeds(low, high). Valores entre 0 e 1.
        pad.SetMotorSpeeds(forca, forca * 0.5f);

        yield return new WaitForSeconds(0.25f);

        // SEMPRE pare a vibracao depois. Esquecer disso = controle vibrando
        // ate o jogador fechar o jogo. Erro classico em produtos finais.
        pad.SetMotorSpeeds(0f, 0f);
    }

    void OnDisable()
    {
        // Se o objeto for destruido durante a vibracao, garantimos parar.
        Gamepad.current?.SetMotorSpeeds(0f, 0f);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Detectando conexao e desconexao de controles em runtime.
// Util para mostrar "Controle desconectado, reconecte" e pausar o jogo.
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.Users;

public class GerenciadorGamepad : MonoBehaviour
{
    void OnEnable()
    {
        InputSystem.onDeviceChange += AoMudarDispositivo;
    }

    void OnDisable()
    {
        InputSystem.onDeviceChange -= AoMudarDispositivo;
    }

    void AoMudarDispositivo(InputDevice device, InputDeviceChange change)
    {
        // Filtra apenas gamepads para nao reagir a teclados, mouses etc.
        if (!(device is Gamepad)) return;

        switch (change)
        {
            case InputDeviceChange.Added:
                Debug.Log($"Gamepad conectado: {device.displayName}");
                break;
            case InputDeviceChange.Removed:
                Debug.Log("Gamepad desconectado! Pausando o jogo...");
                Time.timeScale = 0f;
                break;
            case InputDeviceChange.Reconnected:
                Debug.Log("Gamepad reconectado!");
                Time.timeScale = 1f;
                break;
        }
    }
}`,
      },
    ],
    points: [
      "Gamepad.current da acesso ao primeiro gamepad ativo; pode ser null.",
      "Use buttonSouth/East/West/North no codigo, nao A/B/X/Y (que mudam por marca).",
      "leftStick e rightStick devolvem Vector2 (-1 a 1); aplique deadzone radial.",
      "Triggers analogicos (0 a 1) sao perfeitos para acelerador/freio/carregar tiro.",
      "SetMotorSpeeds(low, high) faz vibracao; sempre desligue ao fim.",
      "Inscreva InputSystem.onDeviceChange para reagir a conexao/desconexao.",
      "DualShock, Xbox e Switch Pro funcionam todos atraves da abstracao Gamepad.",
      "Para jogos com 2+ jogadores no mesmo PC, use PlayerInputManager (proximo capitulo).",
    ],
    alerts: [
      {
        type: "warning",
        content: "Esquecer de chamar SetMotorSpeeds(0,0) deixa o controle vibrando ate o usuario fechar o jogo. Coloque um failsafe em OnApplicationQuit, OnDestroy e ao pausar o jogo.",
      },
      {
        type: "info",
        content: "DualSense (PS5) tem features extras (gatilhos adaptativos, alto-falante) que NAO sao expostas pela API Gamepad padrao. Voce precisa do pacote Unity 'PlayStation' (so funciona ao publicar no PS5) ou de plugins terceiros para PC.",
      },
      {
        type: "tip",
        content: "Sempre teste seu jogo com pelo menos um controle fisico desconectado para garantir que o codigo lida com Gamepad.current == null sem crashar. Iniciante adora esquecer essa checagem.",
      },
    ],
  },
  {
    slug: "touch-mobile",
    section: "input",
    title: "Touch e mobile: dedos no lugar de mouse",
    difficulty: "intermediario",
    subtitle: "Touchscreen.current, multi-touch, gestos e considerações de UX para mobile.",
    intro: `Quando seu jogo vai para Android ou iOS, o paradigma de input muda completamente. Não existe teclado, não existe gamepad (na maioria dos casos), não existe hover do mouse. Existe um vidro com vários dedos que pressionam, arrastam, fazem pinça e soltam. Modelar isso direito no código é o que separa um jogo mobile que parece nativo de um port preguiçoso de PC. A boa notícia é que a Unity moderna trata touch como um cidadão de primeira classe via Touchscreen.current no Input System novo, e pelo Input.touches no legacy.

Antes de mergulhar em código, três conceitos. Primeiro: touch tem fases. Um toque começa (Began), continua (Moved/Stationary) e termina (Ended ou Canceled). Você não está só lendo "está pressionado", está lendo um ciclo de vida. Segundo: existem múltiplos dedos ao mesmo tempo. Tela inteira pode ter 5, 10 toques simultâneos, e cada um tem um fingerId que identifica unicamente aquele dedo até ele subir. Terceiro: a tela mobile tem DPIs muito diferentes (de 200 a 600+), então usar pixels brutos para distância de gesto é um erro — você usa cm ou polegadas com Screen.dpi.

Outro pulo do gato é simular touch no Editor. A Unity tem um modo de simulação chamado Simulate Touch que mapeia o clique do mouse para um touch, evitando que você precise rebuildar a cada teste no celular. Existe também o Device Simulator (Window > General > Device Simulator) que simula resoluções de iPhone, iPad e Android com diferentes notches. Aprender essa caixa de ferramentas economiza horas.

Neste capítulo você vai aprender a detectar tap simples, a fazer drag com um dedo, a implementar pinch-to-zoom com dois dedos, a reconhecer um swipe direcional e a usar joystick virtual. Tudo com Input System novo (porque é o caminho recomendado para mobile hoje), com observações sobre o legacy. Ao final você terá um kit de gestos pronto para colar em qualquer jogo mobile.`,
    codes: [
      {
        lang: "csharp",
        code: `// Tap simples e arrastar (drag) com um dedo.
// Touchscreen.current da acesso ao toque ativo.
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.EnhancedTouch;
using ETouch = UnityEngine.InputSystem.EnhancedTouch.Touch;

public class TapEDrag : MonoBehaviour
{
    void OnEnable()
    {
        // EnhancedTouch precisa ser ativado explicitamente.
        // Sem isso, ETouch.activeTouches fica sempre vazio.
        EnhancedTouchSupport.Enable();
    }

    void OnDisable()
    {
        EnhancedTouchSupport.Disable();
    }

    void Update()
    {
        // activeTouches devolve todos os dedos ativos no frame.
        foreach (ETouch touch in ETouch.activeTouches)
        {
            switch (touch.phase)
            {
                case UnityEngine.InputSystem.TouchPhase.Began:
                    Debug.Log($"Toque iniciado em {touch.screenPosition} (id={touch.finger.index})");
                    break;
                case UnityEngine.InputSystem.TouchPhase.Moved:
                    // delta = quanto o dedo se moveu desde o frame anterior.
                    Debug.Log($"Arrastando: delta={touch.delta}");
                    break;
                case UnityEngine.InputSystem.TouchPhase.Ended:
                    Debug.Log("Toque terminou (dedo subiu).");
                    break;
            }
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Pinch-to-zoom: dois dedos se afastam para dar zoom in.
// Padrao classico em mapas, fotos e RTS mobile.
using UnityEngine;
using UnityEngine.InputSystem.EnhancedTouch;
using ETouch = UnityEngine.InputSystem.EnhancedTouch.Touch;

public class PinchZoom : MonoBehaviour
{
    public Camera cam;
    public float velocidadeZoom = 0.01f;
    private float distanciaAnterior;

    void OnEnable() => EnhancedTouchSupport.Enable();
    void OnDisable() => EnhancedTouchSupport.Disable();

    void Update()
    {
        // So agimos com EXATAMENTE 2 dedos na tela.
        if (ETouch.activeTouches.Count != 2)
        {
            distanciaAnterior = 0f;
            return;
        }

        var t1 = ETouch.activeTouches[0];
        var t2 = ETouch.activeTouches[1];
        float distanciaAtual = Vector2.Distance(t1.screenPosition, t2.screenPosition);

        // Primeiro frame com dois dedos: so guarda a referencia.
        if (distanciaAnterior == 0f)
        {
            distanciaAnterior = distanciaAtual;
            return;
        }

        float diff = distanciaAtual - distanciaAnterior;
        // Camera ortografica usa orthographicSize.
        // Camera perspectiva: ajuste fieldOfView ou cam.transform.position.
        cam.orthographicSize -= diff * velocidadeZoom;
        cam.orthographicSize = Mathf.Clamp(cam.orthographicSize, 2f, 20f);

        distanciaAnterior = distanciaAtual;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Detectando swipe direcional (esquerda/direita/cima/baixo).
// Util para card games, jogos casual, navegacao por gesto.
using UnityEngine;
using UnityEngine.InputSystem.EnhancedTouch;
using ETouch = UnityEngine.InputSystem.EnhancedTouch.Touch;

public class DetectorSwipe : MonoBehaviour
{
    public float distanciaMinimaCm = 1.5f;
    public float tempoMaximo = 0.5f;

    private Vector2 inicioPos;
    private float inicioTempo;

    void OnEnable() => EnhancedTouchSupport.Enable();
    void OnDisable() => EnhancedTouchSupport.Disable();

    void Update()
    {
        if (ETouch.activeTouches.Count == 0) return;

        var t = ETouch.activeTouches[0];

        if (t.phase == UnityEngine.InputSystem.TouchPhase.Began)
        {
            inicioPos = t.screenPosition;
            inicioTempo = Time.time;
        }
        else if (t.phase == UnityEngine.InputSystem.TouchPhase.Ended)
        {
            float tempo = Time.time - inicioTempo;
            if (tempo > tempoMaximo) return;

            Vector2 delta = t.screenPosition - inicioPos;
            // Converte pixels em cm usando o DPI da tela.
            float deltaCm = delta.magnitude / Screen.dpi * 2.54f;
            if (deltaCm < distanciaMinimaCm) return;

            // Decide a direcao dominante (horizontal x vertical).
            if (Mathf.Abs(delta.x) > Mathf.Abs(delta.y))
                Debug.Log(delta.x > 0 ? "Swipe DIREITA" : "Swipe ESQUERDA");
            else
                Debug.Log(delta.y > 0 ? "Swipe CIMA" : "Swipe BAIXO");
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Joystick virtual basico: arrasta um circulo dentro de uma area.
// Funciona como input continuo para mover personagem em jogos mobile.
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class JoystickVirtual : MonoBehaviour, IDragHandler, IPointerUpHandler, IPointerDownHandler
{
    public RectTransform fundo;     // circulo grande
    public RectTransform alavanca;  // bolinha que se mexe
    public Vector2 direcao;         // saida normalizada -1..1

    public void OnPointerDown(PointerEventData ev) => OnDrag(ev);

    public void OnDrag(PointerEventData ev)
    {
        Vector2 pos;
        // Converte clique de tela em coordenada local do fundo.
        RectTransformUtility.ScreenPointToLocalPointInRectangle(
            fundo, ev.position, ev.pressEventCamera, out pos);

        // Normaliza pelo tamanho do fundo para virar -1..1.
        pos.x = pos.x / fundo.sizeDelta.x * 2f;
        pos.y = pos.y / fundo.sizeDelta.y * 2f;

        direcao = (pos.magnitude > 1f) ? pos.normalized : pos;

        alavanca.anchoredPosition = new Vector2(
            direcao.x * (fundo.sizeDelta.x / 3f),
            direcao.y * (fundo.sizeDelta.y / 3f));
    }

    public void OnPointerUp(PointerEventData ev)
    {
        direcao = Vector2.zero;
        alavanca.anchoredPosition = Vector2.zero;
    }
}`,
      },
    ],
    points: [
      "Touchscreen.current + EnhancedTouchSupport.Enable() e o caminho moderno para touch.",
      "Cada toque tem fingerId, phase (Began/Moved/Ended) e delta por frame.",
      "Use Screen.dpi para converter pixels em cm: gestos consistentes em qualquer tela.",
      "Pinch-to-zoom = comparar distancia entre 2 dedos frame a frame.",
      "Swipe = inicio + fim + tempo + distancia minima.",
      "Joystick virtual usa IDragHandler/IPointerDown/IPointerUp do EventSystem.",
      "Sempre teste no Device Simulator antes de buildar para celular.",
      "Cuidado com botoes proximos da borda inferior (gesto do iOS) e do topo (notch).",
    ],
    alerts: [
      {
        type: "warning",
        content: "Esquecer EnhancedTouchSupport.Enable() faz EnhancedTouch.Touch.activeTouches ficar SEMPRE vazio. Nao da erro, so silencio. E a pegadinha numero um de touch no Input System novo.",
      },
      {
        type: "tip",
        content: "Em mobile, baterya e CPU sao caros. Evite Update() com loops grandes lendo touch toda hora; prefira o callback de InputAction ou checar Touchscreen.current.touches[0].press.wasPressedThisFrame.",
      },
      {
        type: "info",
        content: "iOS reserva ~20 pixels da borda inferior para o gesto de home. Botoes nessa zona ficam difíceis de tocar e podem disparar o gesto do sistema. Use Safe Area (Screen.safeArea) ao posicionar UI.",
      },
    ],
  },
  {
    slug: "action-maps",
    section: "input",
    title: "Action Maps: organizando contextos de jogo",
    difficulty: "intermediario",
    subtitle: "Player, UI, Driving — separar mapas por contexto evita conflitos de input.",
    intro: `Imagine que o seu jogo tem três modos: você anda a pé, entra num carro e dirige, e abre um menu de pausa. Em cada modo, os mesmos botões fazem coisas completamente diferentes. Apertar A a pé pode pular; no carro, freia de mão; no menu, confirma a opção. Se você tentar tratar isso com um único bloco de ifs no código, vira um bolo. A solução do Input System novo se chama Action Map: um agrupamento nomeado de ações que você pode ligar e desligar como um todo. É como ter três mesas de mixer separadas e escolher qual está ativa a cada momento.

Action Maps moram dentro do Input Action Asset (.inputactions). Você cria mapas como "Player", "Driving", "UI" e dentro de cada um define as ações relevantes. "Player" tem Move, Jump, Fire, Interact. "Driving" tem Steer, Accelerate, Brake, Honk. "UI" tem Navigate, Submit, Cancel. Cada ação pode ter bindings diferentes em cada mapa: o stick esquerdo é movimento no Player, mas é direção no Driving. Quando o jogador entra no carro, você desliga "Player" e liga "Driving". Quando abre o menu, desliga ambos e liga "UI". O resto do código nem sabe que existem outros mapas.

A lógica é poderosíssima por três razões. Primeira: nada de "se está dirigindo, ignore Jump". O input simplesmente não chega. Segunda: você pode ter combinações de teclas iguais em mapas diferentes sem conflito (Esc abre menu no Player, fecha menu no UI). Terceira: testes ficam fáceis — para testar o modo carro, basta ativar só o mapa Driving num cenário controlado.

Neste capítulo você vai criar três Action Maps no asset, vai aprender a alternar entre eles via código, vai entender o caso especial do mapa "UI" (que se integra ao EventSystem para fazer botões funcionarem com gamepad e teclado) e vai pegar dicas de organização: por que evitar 50 ações num mapa só, como nomear ações de forma consistente e como compartilhar bindings entre mapas. Vamos partir do princípio que você já criou um asset .inputactions; se não, volte ao capítulo de Input System novo.`,
    codes: [
      {
        lang: "json",
        code: `// Estrutura simplificada de um arquivo .inputactions com 3 maps.
// Voce nao costuma editar isso na mao — usa o editor visual da Unity —
// mas conhecer o formato ajuda a entender o que esta acontecendo.
{
  "name": "PlayerControls",
  "maps": [
    {
      "name": "Player",
      "actions": [
        { "name": "Move", "type": "Value", "expectedControlType": "Vector2" },
        { "name": "Jump", "type": "Button" },
        { "name": "Fire", "type": "Button" }
      ]
    },
    {
      "name": "Driving",
      "actions": [
        { "name": "Steer",      "type": "Value", "expectedControlType": "Axis" },
        { "name": "Accelerate", "type": "Value", "expectedControlType": "Axis" },
        { "name": "Brake",      "type": "Button" },
        { "name": "ExitCar",    "type": "Button" }
      ]
    },
    {
      "name": "UI",
      "actions": [
        { "name": "Navigate", "type": "Value", "expectedControlType": "Vector2" },
        { "name": "Submit",   "type": "Button" },
        { "name": "Cancel",   "type": "Button" }
      ]
    }
  ]
}`,
      },
      {
        lang: "csharp",
        code: `// Alternando entre Action Maps via codigo (classe gerada).
// Cenario: jogador esta a pe, entra num carro, depois sai.
using UnityEngine;

public class GerenteDeContexto : MonoBehaviour
{
    private PlayerControls controls;

    void Awake()
    {
        controls = new PlayerControls();

        // No inicio, so o mapa Player esta ativo.
        controls.Player.Enable();

        // Acoes de transicao.
        controls.Player.Interact.performed += _ => EntrarNoCarro();
        controls.Driving.ExitCar.performed += _ => SairDoCarro();
    }

    void OnDisable()
    {
        // Garante limpeza.
        controls.Player.Disable();
        controls.Driving.Disable();
    }

    void EntrarNoCarro()
    {
        Debug.Log("Entrou no carro: Player OFF, Driving ON.");
        controls.Player.Disable();
        controls.Driving.Enable();
    }

    void SairDoCarro()
    {
        Debug.Log("Saiu do carro: Driving OFF, Player ON.");
        controls.Driving.Disable();
        controls.Player.Enable();
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Pausando o jogo: desliga Player E Driving, liga UI.
// Esse padrao garante que o gamepad navegue o menu sem mover o personagem.
using UnityEngine;

public class GerentePausa : MonoBehaviour
{
    public PlayerControls controls;
    public GameObject painelMenu;
    private bool pausado;

    void Awake()
    {
        controls.UI.Cancel.performed += _ => Alternar();
        controls.Player.Enable();
    }

    void Alternar()
    {
        pausado = !pausado;

        if (pausado)
        {
            Time.timeScale = 0f;
            painelMenu.SetActive(true);
            // Desliga TUDO de gameplay e ativa so a UI.
            controls.Player.Disable();
            controls.Driving.Disable();
            controls.UI.Enable();
        }
        else
        {
            Time.timeScale = 1f;
            painelMenu.SetActive(false);
            controls.UI.Disable();
            controls.Player.Enable();
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Usando PlayerInput component + SwitchCurrentActionMap.
// Forma sem precisar guardar referencia explicita aos maps.
using UnityEngine;
using UnityEngine.InputSystem;

[RequireComponent(typeof(PlayerInput))]
public class TrocaMapaAuto : MonoBehaviour
{
    private PlayerInput input;

    void Awake() => input = GetComponent<PlayerInput>();

    public void EntrarNoCarro()
    {
        // Passa o NOME do action map. Case-sensitive!
        input.SwitchCurrentActionMap("Driving");
    }

    public void AbrirMenu()
    {
        input.SwitchCurrentActionMap("UI");
    }

    public void VoltarAoJogo()
    {
        input.SwitchCurrentActionMap("Player");
    }

    // Voce pode descobrir qual mapa esta ativo agora.
    void Update()
    {
        if (Input.GetKeyDown(KeyCode.F1))
            Debug.Log("Mapa atual: " + input.currentActionMap.name);
    }
}`,
      },
    ],
    points: [
      "Action Maps agrupam acoes por contexto: Player, Driving, UI etc.",
      "Apenas um (ou poucos) maps ficam Enabled por vez para evitar conflito.",
      "controls.MapaX.Enable() / .Disable() liga e desliga em bloco.",
      "PlayerInput.SwitchCurrentActionMap('Nome') troca via componente.",
      "Mapa UI integra com EventSystem: gamepad e teclado navegam botoes naturalmente.",
      "Use Cancel para abrir/fechar menu — funciona em qualquer dispositivo.",
      "Case-sensitive: 'player' nao e o mesmo que 'Player' nas chamadas por nome.",
      "Cada mapa tem seu proprio conjunto de bindings; tecla pode existir em varios maps sem conflito.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Quando o jogador abrir o menu de pausa, sempre desligue mapas de gameplay E zere movimento (movimentoAtual = Vector2.zero). Senao o personagem continua andando porque o input ficou 'pendurado' no ultimo valor.",
      },
      {
        type: "warning",
        content: "Esquecer de chamar Enable em algum mapa e o motivo numero um de 'meu input nao funciona'. Verifique no Inspector do PlayerInput o campo 'Default Map' e o estado dos checkboxes.",
      },
      {
        type: "info",
        content: "O mapa UI deve ser referenciado em InputSystemUIInputModule (no objeto EventSystem) para botoes do Canvas funcionarem com gamepad. Sem esse hook, navegar UI por gamepad simplesmente nao acontece.",
      },
    ],
  },
  {
    slug: "devices-binding",
    section: "input",
    title: "Devices, bindings e control schemes",
    difficulty: "intermediario",
    subtitle: "Pareando jogadores a controles, rebindings em runtime e suporte a multiplas plataformas.",
    intro: `Quando seu jogo cresce, três perguntas começam a aparecer. Como suportar dois jogadores no mesmo PC com gamepads diferentes? Como deixar o jogador remapear teclas no menu de opções? Como um único build funcionar bem tanto com teclado/mouse quanto com gamepad sem perguntar nada? As respostas estão nos conceitos de Device, Binding e Control Scheme do Input System novo. Eles parecem abstratos no começo, mas resolvem problemas muito concretos.

Device é a representação de um hardware específico: um teclado, um gamepad Xbox, um touchscreen. O Input System mantém uma lista de todos os devices conectados, e cada Action pode estar "ouvindo" um subconjunto deles. Binding é a ligação entre uma Action ("Jump") e um controle físico ("Space" no teclado, "buttonSouth" no gamepad). Uma Action geralmente tem vários bindings, um por dispositivo. Control Scheme é um agrupamento nomeado de devices: "Keyboard&Mouse" exige um Keyboard e um Mouse; "Gamepad" exige um Gamepad. Quando você está num scheme, o Input System aceita inputs apenas dos devices declarados nele.

Por que essa estratificação importa? Porque resolve elegantemente cenários reais. Multiplayer local: você cria dois schemes "Gamepad" e usa PlayerInputManager com Join action — o primeiro jogador a apertar START vira Player 1 com o gamepad dele, o segundo vira Player 2 com o outro gamepad, e os inputs ficam isolados. Ícone dinâmico de prompt: você troca de "Press Space to Jump" para "Press A to Jump" automaticamente quando detecta que o jogador está usando gamepad, lendo currentControlScheme. Rebinding em runtime: o jogador clica "trocar tecla de pulo", aperta T, e o asset é atualizado em memória (e salvo em JSON para persistir).

Neste capítulo você vai aprender a definir control schemes no asset, a parear devices a jogadores específicos, a ler qual scheme está ativo para mostrar prompts certos, a permitir o jogador remapear teclas e a salvar/carregar essas mudanças. Esse é o capítulo que separa um joguinho de um produto polido — usuário que pode customizar input se sente respeitado e joga mais.`,
    codes: [
      {
        lang: "csharp",
        code: `// Detectando qual control scheme esta ativo para trocar prompts.
// Use isso para mostrar 'Aperte A' vs 'Aperte Espaco' nas dicas.
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.UI;

[RequireComponent(typeof(PlayerInput))]
public class PromptDinamico : MonoBehaviour
{
    public Text textoPrompt;
    private PlayerInput input;

    void Awake() => input = GetComponent<PlayerInput>();

    void OnEnable()
    {
        // Disparado sempre que o jogador troca de dispositivo.
        input.onControlsChanged += AoMudarControles;
        Atualizar();
    }

    void OnDisable() => input.onControlsChanged -= AoMudarControles;

    void AoMudarControles(PlayerInput pi) => Atualizar();

    void Atualizar()
    {
        // currentControlScheme bate com os nomes definidos no asset.
        switch (input.currentControlScheme)
        {
            case "Keyboard&Mouse":
                textoPrompt.text = "Aperte ESPACO para pular";
                break;
            case "Gamepad":
                textoPrompt.text = "Aperte A para pular";
                break;
            default:
                textoPrompt.text = "Aperte para pular";
                break;
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Multiplayer local: cada gamepad vira um jogador.
// Adicione um GameObject vazio com PlayerInputManager.
// Configure: Join Behavior = JoinPlayersWhenButtonIsPressed
//            Player Prefab = prefab do jogador (com PlayerInput configurado)
using UnityEngine;
using UnityEngine.InputSystem;

public class GerenteMultiplayer : MonoBehaviour
{
    public PlayerInputManager manager;

    void OnEnable()
    {
        manager.onPlayerJoined += AoEntrarJogador;
        manager.onPlayerLeft   += AoSairJogador;
    }

    void OnDisable()
    {
        manager.onPlayerJoined -= AoEntrarJogador;
        manager.onPlayerLeft   -= AoSairJogador;
    }

    void AoEntrarJogador(PlayerInput pi)
    {
        Debug.Log($"Jogador {pi.playerIndex} entrou usando {pi.currentControlScheme}");
        // Aqui voce posiciona o jogador na cena, atribui cor, camera split, etc.
        pi.transform.position = new Vector3(pi.playerIndex * 3f, 0f, 0f);
    }

    void AoSairJogador(PlayerInput pi)
    {
        Debug.Log($"Jogador {pi.playerIndex} desconectou.");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Rebinding em runtime: jogador escolhe nova tecla para uma acao.
// Chame Iniciar('Jump') quando o usuario clicar 'Trocar tecla de pulo'.
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.UI;

public class RemapearTecla : MonoBehaviour
{
    public InputActionAsset asset;
    public Text statusTexto;
    private InputActionRebindingExtensions.RebindingOperation operacao;

    public void Iniciar(string nomeAcao)
    {
        var acao = asset.FindAction(nomeAcao);
        if (acao == null) { Debug.LogError("Acao nao encontrada"); return; }

        // Acoes precisam ser desativadas antes de rebind.
        acao.Disable();
        statusTexto.text = "Aperte qualquer tecla...";

        operacao = acao.PerformInteractiveRebinding()
            .WithControlsExcluding("<Mouse>/position")  // ignora movimento de mouse
            .WithCancelingThrough("<Keyboard>/escape")  // Esc cancela
            .OnComplete(op =>
            {
                statusTexto.text = $"Nova tecla: {acao.GetBindingDisplayString()}";
                acao.Enable();
                op.Dispose();
            })
            .OnCancel(op =>
            {
                statusTexto.text = "Cancelado.";
                acao.Enable();
                op.Dispose();
            })
            .Start();
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Salvando e carregando os bindings customizados em PlayerPrefs (JSON).
// Sem isso, o jogador remapeia as teclas e perde tudo ao fechar o jogo.
using UnityEngine;
using UnityEngine.InputSystem;

public class SalvarBindings : MonoBehaviour
{
    public InputActionAsset asset;
    private const string CHAVE = "rebinds";

    void OnEnable()
    {
        // Carrega no inicio (se existir).
        string json = PlayerPrefs.GetString(CHAVE, string.Empty);
        if (!string.IsNullOrEmpty(json))
        {
            asset.LoadBindingOverridesFromJson(json);
            Debug.Log("Bindings customizados carregados.");
        }
    }

    void OnDisable()
    {
        // Salva ao fechar/cena trocar.
        string json = asset.SaveBindingOverridesAsJson();
        PlayerPrefs.SetString(CHAVE, json);
        PlayerPrefs.Save();
    }

    // Botao 'Restaurar Padroes' no menu de opcoes.
    public void Resetar()
    {
        foreach (var map in asset.actionMaps)
            map.RemoveAllBindingOverrides();
        PlayerPrefs.DeleteKey(CHAVE);
        Debug.Log("Bindings resetados.");
    }
}`,
      },
    ],
    points: [
      "Device = hardware fisico; Binding = mapa Action <-> controle; Scheme = grupo de devices.",
      "currentControlScheme te diz se o jogador esta no teclado/mouse ou no gamepad.",
      "onControlsChanged dispara quando o player muda de dispositivo: troque prompts ali.",
      "PlayerInputManager + Join action = multiplayer local com pareamento automatico.",
      "PerformInteractiveRebinding() implementa a tela 'aperte uma tecla' do menu de opcoes.",
      "WithControlsExcluding e WithCancelingThrough evitam capturas indesejadas.",
      "SaveBindingOverridesAsJson + LoadBindingOverridesFromJson persistem mudancas.",
      "Sempre exclua mouse/position do rebind; senao virar a cabeca define a tecla.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Para mostrar um icone do botao certo (ex.: sprite do A do Xbox vs Cross do PS), use o pacote 'Input Icons' da Unity ou assets como 'InputHelper'. Tentar gerar isso na mao da muito trabalho e fica feio.",
      },
      {
        type: "warning",
        content: "Sempre Disable() a Action antes de iniciar rebinding e Enable() depois. Esquecer disso causa o famoso 'a tecla nova so funciona depois de salvar e reabrir o jogo'.",
      },
      {
        type: "danger",
        content: "Em PlayerInputManager com 'Join when button pressed', o BOTAO de join precisa ser uma action no Action Asset apontada para todos os devices (<Keyboard>/anyKey, <Gamepad>/start). Esquecer um device deixa aquele jogador 'orfao' sem conseguir entrar.",
      },
    ],
  },
];
