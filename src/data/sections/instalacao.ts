import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "unity-hub",
    section: "instalacao",
    title: "Unity Hub: o ponto de partida",
    difficulty: "iniciante",
    subtitle: "O gerenciador oficial que organiza versões, projetos e licenças do Unity.",
    intro: `Antes de qualquer coisa, é importante entender que o Unity não é um programa só. Ele é uma família de programas, e cada projeto que você cria fica preso a uma versão específica da engine. Se você abrir um projeto feito no Unity 2021 com o Unity 2023, a engine vai tentar converter os arquivos automaticamente, e às vezes coisas quebram. Por isso, profissionais costumam ter três, quatro ou cinco versões do Unity instaladas ao mesmo tempo na mesma máquina, cada uma servindo a um projeto diferente.

Para gerenciar essa bagunça, a Unity Technologies criou o Unity Hub. Pense nele como o "Steam dos seus projetos Unity": é um aplicativo pequeno que fica instalado no seu computador e cuida de três coisas que você não quer fazer no braço. Primeiro, ele instala e mantém múltiplas versões do editor lado a lado, sem conflito. Segundo, ele guarda a lista de projetos que você abriu recentemente, com a versão correta de cada um, e abre o projeto na versão certa com um clique. Terceiro, ele cuida da sua licença Unity, seja a gratuita Personal, a Plus, a Pro ou a Enterprise.

Sem o Hub, instalar Unity vira um pesadelo: você teria que baixar instaladores manualmente do site, configurar variáveis de ambiente, lidar com módulos de plataforma (Android, iOS, WebGL) separados, e ainda assim correr o risco de abrir o projeto errado na versão errada. Com o Hub, tudo isso é UI clicável. É a primeira coisa que qualquer pessoa instala antes de pensar em Unity.

Uma observação importante: o Hub é gratuito, sempre. A licença Unity Personal também é gratuita para uso pessoal e para empresas que faturam menos de 200 mil dólares por ano. Você só precisa criar uma conta Unity ID, que é grátis, para ativar a licença. Não caia em sites estranhos prometendo Unity "crackeado" — não há por que piratear algo que já é gratuito.`,
    codes: [
      {
        lang: "bash",
        code: `# Windows: baixe o instalador oficial direto do site da Unity.
# https://unity.com/download
# O arquivo se chama algo como UnityHubSetup.exe (cerca de 130 MB).
# Clique duas vezes, aceite a licença e siga o assistente. Padrão funciona.

# macOS: baixe o UnityHubSetup.dmg, arraste para Applications, abra.
# Pode pedir permissão de acessibilidade nas Preferências do Sistema.

# Linux: a Unity oferece um AppImage oficial.
# Baixe o arquivo UnityHub.AppImage e dê permissão de execução:
chmod +x UnityHub.AppImage
./UnityHub.AppImage`,
      },
      {
        lang: "bash",
        code: `# Em alguns Linux (Ubuntu, Debian) há um pacote .deb não oficial.
# A forma recomendada pela Unity em distros baseadas em Debian:
wget -qO - https://hub.unity3d.com/linux/keys/public | gpg --dearmor | sudo tee /usr/share/keyrings/Unity_Technologies_ApS.gpg > /dev/null
sudo sh -c 'echo "deb [signed-by=/usr/share/keyrings/Unity_Technologies_ApS.gpg] https://hub.unity3d.com/linux/repos/deb stable main" > /etc/apt/sources.list.d/unityhub.list'
sudo apt update
sudo apt install unityhub`,
      },
      {
        lang: "json",
        code: `// O Unity Hub guarda configurações em um arquivo JSON na sua pasta do usuário.
// Windows: %APPDATA%\\UnityHub\\
// macOS:   ~/Library/Application Support/UnityHub/
// Linux:   ~/.config/UnityHub/
// Exemplo simplificado de secondaryInstallPath.json (onde futuras versões serão instaladas):
{
  "secondaryInstallPath": "D:/Unity/Editores",
  "machineName": "PC-DEV-01",
  "lastSelectedProjectPath": "D:/Projetos/MeuJogo"
}`,
      },
      {
        lang: "bash",
        code: `# O Hub também aceita comandos via terminal (modo headless).
# Útil para CI/CD ou para automatizar instalação em máquinas novas.

# Listar versões instaladas:
"C:\\Program Files\\Unity Hub\\Unity Hub.exe" -- --headless editors --installed

# Instalar uma versão específica com o módulo Android:
"C:\\Program Files\\Unity Hub\\Unity Hub.exe" -- --headless install --version 2022.3.20f1 --module android

# No macOS o caminho é:
# /Applications/Unity\\ Hub.app/Contents/MacOS/Unity\\ Hub -- --headless ...`,
      },
    ],
    points: [
      "O Unity Hub é gratuito e obrigatório para gerenciar versões e licenças.",
      "Cada projeto Unity fica preso à versão da engine em que foi criado.",
      "Você pode ter quantas versões do editor instaladas ao mesmo tempo quiser.",
      "A licença Personal é gratuita para faturamentos abaixo de 200 mil dólares por ano.",
      "Sempre baixe o Hub do site oficial unity.com/download, nunca de terceiros.",
      "Iniciante comum: instalar o editor Unity sem o Hub e depois ficar sem como atualizar.",
      "Iniciante comum: abrir um projeto antigo na versão mais nova sem fazer backup.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Antes de abrir um projeto numa versão diferente, faça backup da pasta Assets, Packages e ProjectSettings. A conversão de versão muitas vezes não tem volta.",
      },
      {
        type: "tip",
        content: "Configure o Hub para instalar futuras versões num disco com bastante espaço (cada versão do editor ocupa entre 5 GB e 15 GB com módulos). Vá em Preferences > Installs > Installs location.",
      },
      {
        type: "info",
        content: "Se você trabalha em equipe, combinem todos a mesma versão LTS exata (até o patch). Diferenças mínimas como 2022.3.20f1 vs 2022.3.21f1 podem gerar conflitos no controle de versão.",
      },
    ],
  },
  {
    slug: "instalacao-unity",
    section: "instalacao",
    title: "Instalando o editor Unity",
    difficulty: "iniciante",
    subtitle: "Como escolher versão, módulos de plataforma e ativar sua licença.",
    intro: `Com o Unity Hub instalado, você ainda não tem o Unity de verdade. O Hub é só o gerente; o editor é o programa de bilhões de pixels onde você vai realmente trabalhar. A próxima etapa é dizer ao Hub qual versão do editor baixar. E aqui mora uma escolha importante: Unity tem dois tipos de release. As versões LTS (Long Term Support) recebem correções de bugs por dois anos e são as recomendadas para qualquer projeto sério. As versões TECH são mais experimentais, com recursos novos, mas podem ter regressões.

Para começar a estudar, sempre prefira a LTS mais recente. No momento em que este livro está sendo escrito, a recomendação é a linha 2022.3 LTS ou a 2023.2 LTS. Você vai escolher uma e seguir o livro inteiro com ela. Não fique trocando de versão a cada capítulo, isso só atrapalha. A diferença prática entre LTS e TECH para iniciantes é zero — você não vai usar os recursos experimentais nesta fase.

Junto com o editor, o Hub te oferece módulos opcionais. Esses módulos são suportes para gerar builds em plataformas específicas: Android, iOS, WebGL, Windows, macOS, Linux, consoles. Você não precisa instalar todos. Se seu projeto é só para Windows, instale apenas o módulo Windows Build Support (que já vem por padrão). Cada módulo extra pesa entre 500 MB e 2 GB, então economize espaço instalando só o que vai usar. Pode adicionar mais depois, sem reinstalar o editor.

A última peça é a licença. Quando abrir o editor pela primeira vez, ele vai pedir para você fazer login com seu Unity ID e ativar uma licença. Para a maioria das pessoas, a opção é Personal, que é gratuita. Marque a opção, confirme que você se enquadra nas regras de faturamento, e pronto. A licença fica armazenada na sua máquina e renovada automaticamente. Se você usar Unity em outro computador, repita o processo — uma licença Personal pode ser usada em quantas máquinas você quiser, desde que sejam suas.`,
    codes: [
      {
        lang: "bash",
        code: `# Passos práticos no Hub (interface gráfica):
# 1. Abra o Unity Hub
# 2. Clique em "Installs" na barra lateral
# 3. Clique no botão "Install Editor"
# 4. Escolha a aba "Official Releases"
# 5. Procure pela versão marcada com "LTS" mais recente
# 6. Clique em "Install"
# 7. Marque os módulos de plataforma que vai usar
#    - Documentation (sempre marque, ajuda offline é muito útil)
#    - Visual Studio (no Windows, vem como editor padrão)
#    - Android Build Support (se for fazer jogos para celular Android)
#    - iOS Build Support (só funciona quando você for buildar; mas instale)
#    - WebGL Build Support (para publicar jogos em navegador)
# 8. Aceite licenças e clique em "Continue"
# 9. Aguarde o download (pode passar de 10 GB com módulos)`,
      },
      {
        lang: "bash",
        code: `# Tamanhos típicos para você se planejar:
# Editor base ............................ 5 GB
# Documentation .......................... 600 MB
# Android Build Support .................. 1.6 GB (com SDK e NDK)
# iOS Build Support ......................  900 MB
# WebGL Build Support .................... 1.2 GB
# Windows IL2CPP .........................  400 MB
# Linux Build Support ....................  500 MB

# Total realista para um setup completo de desenvolvedor mobile + web:
# cerca de 10 a 12 GB por versão do editor.`,
      },
      {
        lang: "bash",
        code: `# Verificar e gerenciar licenças via linha de comando.
# Útil em servidor de build (CI) sem interface gráfica.

# Mostrar status atual da licença:
"C:\\Program Files\\Unity\\Hub\\Editor\\2022.3.20f1\\Editor\\Unity.exe" \\
  -batchmode -quit -nographics -logFile - \\
  -username "voce@email.com" -password "SUA_SENHA"

# Liberar a licença antes de mover de máquina:
Unity.exe -batchmode -quit -returnlicense -logFile -`,
      },
      {
        lang: "json",
        code: `// O editor guarda metadados da licença em arquivos como:
// Windows: C:\\ProgramData\\Unity\\Unity_lic.ulf
// macOS:   /Library/Application Support/Unity/Unity_lic.ulf
// Linux:   /var/cache/unity3d/Unity_lic.ulf
// Você normalmente não mexe nesses arquivos manualmente.
// Mas em equipes corporativas (licença Pro flutuante), o admin sabe que eles existem.
{
  "licenseType": "Personal",
  "serial": "SC-XXXX-XXXX-XXXX-XXXX-XXXX",
  "machineBindings": "machineGuid+userGuid",
  "expires": "2025-12-31"
}`,
      },
    ],
    points: [
      "Sempre prefira a versão LTS mais recente para projetos reais.",
      "Não troque de versão no meio do projeto sem necessidade forte.",
      "Instale apenas os módulos de plataforma que realmente vai usar.",
      "Marque o módulo Documentation: ter o manual offline salva o dia sem internet.",
      "Faça login com Unity ID e ative a licença Personal logo na primeira execução.",
      "Cada versão LTS recebe correções por cerca de 2 anos a partir do lançamento.",
      "Iniciante comum: baixar a versão TECH mais nova achando que é melhor; LTS é melhor.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Nunca cancele a instalação no meio. Um editor parcialmente instalado costuma ficar quebrado e a desinstalação pelo Hub pode falhar. Sempre deixe terminar.",
      },
      {
        type: "tip",
        content: "Se sua internet é instável, use o instalador da versão direto do Unity Download Archive (unity.com/releases/editor/archive). Ele baixa o ISO completo e você pode retomar.",
      },
      {
        type: "info",
        content: "No Windows, o instalador do Unity também oferece o Visual Studio Community como editor de código. Aceite. É gratuito, integrado ao Unity e tem IntelliSense para C#.",
      },
    ],
  },
  {
    slug: "criar-projeto",
    section: "instalacao",
    title: "Criando seu primeiro projeto",
    difficulty: "iniciante",
    subtitle: "Templates, organização de pastas e o que cada arquivo significa.",
    intro: `Com editor instalado, você está finalmente pronto para criar um projeto. Um projeto Unity é basicamente uma pasta no seu disco que contém todos os assets (modelos, texturas, scripts, sons, cenas) e configurações da sua aplicação. Diferente de outros softwares onde você cria um "arquivo" único, no Unity tudo vive numa árvore de pastas, e o editor monta a experiência em cima dessa árvore. Por isso é tão importante escolher o local com cuidado e nunca renomear pastas dentro do projeto pelo Explorer/Finder, sempre pelo editor.

Quando você clica em "New project" no Hub, vê uma lista de templates. Cada template não é um jogo pronto, é só um conjunto de configurações iniciais e pacotes pré-instalados que economizam seu tempo. Os principais são: 2D (configurações para jogos 2D, câmera ortográfica, sprites), 3D Built-in Render Pipeline (visual clássico, padrão antigo), 3D URP (Universal Render Pipeline, recomendado para 2D e 3D modernos, roda em mobile e PC), 3D HDRP (High Definition Render Pipeline, para PC e consoles potentes, com gráficos AAA). Há ainda templates específicos para VR, Mobile e mais.

Para 95% dos iniciantes, a recomendação é começar com 3D URP ou 2D URP. O URP é o futuro do Unity, é mais leve, mais flexível e tem suporte ativo. O Built-in está em modo de manutenção. O HDRP é overkill para aprendizado: pesa muito, exige placa de vídeo dedicada e atrapalha quem ainda está entendendo o básico. Você pode trocar de pipeline depois, mas é trabalhoso, então escolha bem.

Outra decisão importante é onde salvar o projeto. Evite caminhos com acentos, espaços ou caracteres especiais (como "C:/Meus Projetos/João"). Unity em geral aguenta, mas algumas ferramentas externas (como o NDK Android) quebram em caminhos exóticos. Use algo curto como "D:/Dev/MeuJogo". E por favor, não salve dentro do OneDrive, Dropbox ou Google Drive. A sincronização em tempo real corrompe os caches do Unity de forma silenciosa. Use Git ou Plastic SCM para versionamento — esses sim são feitos para isso.`,
    codes: [
      {
        lang: "bash",
        code: `# Estrutura de pastas que o Unity cria automaticamente em cada projeto novo:
MeuJogo/
  Assets/              # Tudo o que VOCÊ cria: scripts, cenas, modelos, texturas
    Scenes/            # Cenas (.unity) ficam aqui por convenção
  Packages/            # Lista de pacotes via Package Manager (gerenciado)
    manifest.json
    packages-lock.json
  ProjectSettings/     # Configurações do projeto (input, gráficos, qualidade)
  Library/             # Cache do editor, NÃO versionar (gigantes e gerados)
  Logs/                # Logs de execução, NÃO versionar
  Temp/                # Temporários, NÃO versionar
  obj/                 # Compilação C# intermediária, NÃO versionar
  .vs/ ou .idea/       # Configs do IDE, NÃO versionar`,
      },
      {
        lang: "bash",
        code: `# .gitignore essencial para projetos Unity.
# Crie este arquivo na raiz do projeto, antes do primeiro commit.

# Pastas geradas pelo Unity
[Ll]ibrary/
[Tt]emp/
[Oo]bj/
[Bb]uild/
[Bb]uilds/
[Ll]ogs/
[Uu]ser[Ss]ettings/

# Caches de compilação
*.csproj
*.sln
*.suo
*.user
*.userprefs

# Visual Studio / Rider
.vs/
.idea/

# OS junk
.DS_Store
Thumbs.db

# Arquivos de build
*.apk
*.aab
*.ipa
*.exe`,
      },
      {
        lang: "json",
        code: `// Packages/manifest.json — define quais pacotes o projeto usa.
// Editar isso à mão é raro; o Package Manager (Window > Package Manager) cuida.
{
  "dependencies": {
    "com.unity.collab-proxy": "2.2.0",
    "com.unity.feature.development": "1.0.1",
    "com.unity.render-pipelines.universal": "14.0.10",
    "com.unity.test-framework": "1.1.33",
    "com.unity.textmeshpro": "3.0.6",
    "com.unity.timeline": "1.7.6",
    "com.unity.ugui": "1.0.0",
    "com.unity.visualscripting": "1.9.1",
    "com.unity.modules.ai": "1.0.0",
    "com.unity.modules.audio": "1.0.0",
    "com.unity.modules.physics": "1.0.0"
  }
}`,
      },
      {
        lang: "bash",
        code: `# Convenção de organização de pastas (não obrigatória, mas adotada na indústria):
Assets/
  _Project/            # Tudo do SEU jogo, com underscore para ficar no topo
    Scripts/           # Códigos C#
    Scenes/            # Cenas
    Prefabs/           # Objetos reutilizáveis
    Materials/         # Materiais e shaders
    Textures/          # Texturas e sprites
    Models/            # Meshes (FBX, OBJ)
    Audio/             # Sons e músicas
    Animations/        # Animator controllers e clips
    UI/                # Sprites e fontes de interface
  Plugins/             # SDKs de terceiros (Firebase, ads, etc.)
  ThirdParty/          # Assets comprados na Asset Store
  StreamingAssets/     # Arquivos copiados crus para o build
  Resources/           # USE COM PARCIMÔNIA: tudo aqui vai pro build, sempre`,
      },
    ],
    points: [
      "Um projeto Unity é uma pasta no disco; trate ela com carinho.",
      "Escolha o template URP para começar, é o caminho moderno recomendado.",
      "Evite caminhos com acentos, espaços ou caracteres especiais no path do projeto.",
      "NUNCA salve um projeto Unity dentro do OneDrive, Dropbox ou Google Drive.",
      "Configure um .gitignore antes do primeiro commit para não versionar Library/.",
      "A pasta Library pode ser apagada à vontade: o Unity reconstrói no próximo open.",
      "Iniciante comum: arrastar arquivos pelo Explorer e quebrar referências (.meta).",
    ],
    alerts: [
      {
        type: "danger",
        content: "Cada arquivo em Assets/ tem um arquivo .meta gerado pelo Unity. Apagar ou renomear arquivos fora do editor quebra referências de cenas e prefabs. Use sempre a janela Project do Unity.",
      },
      {
        type: "warning",
        content: "Resources/ é uma pasta especial: TUDO dentro dela vai parar no build final, mesmo que você nunca use. Use só para o que realmente precisa carregar dinamicamente. Para o resto, prefira Addressables.",
      },
      {
        type: "tip",
        content: "Use o prefixo underscore em pastas que você quer no topo do Project (ex: _Project, _Game). O Unity ordena alfabeticamente e o _ vem antes das letras.",
      },
    ],
  },
  {
    slug: "interface-editor",
    section: "instalacao",
    title: "Conhecendo a interface do editor",
    difficulty: "iniciante",
    subtitle: "Scene, Game, Hierarchy, Project, Inspector e Console — as seis janelas que você vai morar dentro.",
    intro: `Quando você abre o Unity pela primeira vez, a tela parece um cockpit de avião: dezenas de painéis, botões, abas e ícones. A boa notícia é que, por trás dessa aparente confusão, existe uma lógica simples. O Unity é organizado em janelas independentes que você pode mover, redimensionar, empilhar em abas ou desencaixar em monitores diferentes. O layout que vem por padrão se chama Default. Existem outros pré-configurados (Tall, Wide, 2 by 3) no menu Window > Layouts. Para começar, fique no Default.

Há seis janelas que você vai usar 95% do tempo. A Hierarchy, normalmente à esquerda, lista todos os GameObjects da cena atual em forma de árvore. Pense nela como o "índice" do que existe naquele momento na cena. A Scene View, no centro, é a sua janela 3D de edição: você arrasta objetos, gira a câmera, posiciona luzes. A Game View é uma aba ao lado da Scene e mostra como o jogo realmente vai aparecer pela câmera principal quando você clicar Play. A Project, geralmente embaixo, mostra todos os arquivos da pasta Assets. A Inspector, à direita, exibe as propriedades do que estiver selecionado (um GameObject, um material, um asset). E a Console, em outra aba embaixo, mostra mensagens, avisos e erros que o Unity ou seus scripts geram.

Entender o fluxo entre essas janelas é o primeiro grande salto. Você seleciona um asset na Project, arrasta para a Scene, ele aparece na Hierarchy, e quando você clica nele, suas propriedades aparecem no Inspector, onde você pode adicionar componentes (Rigidbody, Collider, scripts). Apertou Play? A Game View toma o foco e mostra o resultado. Erro de código? A Console pisca em vermelho. Esse loop seleciona-edita-roda-debuga é a essência do trabalho diário com Unity.

Há também a barra de ferramentas no topo: os botões Hand/Move/Rotate/Scale/Rect (Q, W, E, R, T) que controlam como você manipula objetos na Scene; o botão Play (Ctrl+P) que entra e sai do modo de execução; e o seletor de pivot e local/global. Decore esses atalhos cedo: vão economizar horas. E lembre-se de uma regra de ouro: não edite valores no Inspector durante o Play e espere que sejam salvos. Quando você sair do Play, o Unity descarta tudo que mudou. Essa é a pegadinha mais frustrante para iniciantes.`,
    codes: [
      {
        lang: "csharp",
        code: `// Toda janela do editor pode ser pesquisada via barra de busca no topo.
// Mas você também pode criar suas próprias janelas customizadas.
// Exemplo: uma janela que conta quantos GameObjects existem na cena.
using UnityEditor;          // só funciona dentro da pasta Editor/
using UnityEngine;

public class ContadorObjetos : EditorWindow
{
    // Adiciona um item no menu Tools > Contador de Objetos
    [MenuItem("Tools/Contador de Objetos")]
    public static void Abrir()
    {
        // Cria e mostra a janela como qualquer outra
        GetWindow<ContadorObjetos>("Contador");
    }

    // Chamado pelo Unity para desenhar a UI da janela
    private void OnGUI()
    {
        // Conta todos os GameObjects da cena ativa
        int total = FindObjectsOfType<GameObject>().Length;
        GUILayout.Label("GameObjects na cena: " + total, EditorStyles.boldLabel);

        // Botão que recarrega a contagem
        if (GUILayout.Button("Atualizar"))
        {
            Repaint(); // pede para o Unity redesenhar a janela
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Mensagens na Console aparecem com 3 níveis. Use cada um no contexto certo.
using UnityEngine;

public class ExemploLog : MonoBehaviour
{
    private void Start()
    {
        // Log normal: informação para você acompanhar
        Debug.Log("Cena iniciada com sucesso.");

        // Aviso: algo estranho mas não fatal
        Debug.LogWarning("Velocidade do player está zerada — verifique o Inspector.");

        // Erro: algo está quebrado e precisa de atenção
        Debug.LogError("Referência da câmera principal não encontrada!");

        // Dica avançada: clicando na mensagem da Console, o Unity pula para o GameObject
        Debug.Log("Eu sou este objeto", this);
    }
}`,
      },
      {
        lang: "bash",
        code: `# Atalhos essenciais que você precisa decorar nos primeiros dias:

# Manipulação de objetos na Scene
Q     # Hand tool (mover a câmera arrastando)
W     # Move tool (mover o objeto selecionado)
E     # Rotate tool (girar)
R     # Scale tool (escalar)
T     # Rect tool (redimensionar como UI)

# Visualização da Scene
F        # Foca a câmera no objeto selecionado (frame selected)
Alt+LMB  # Orbita a câmera ao redor do alvo
Alt+RMB  # Zoom da câmera
MMB      # Pan (arrasta a câmera lateralmente)

# Geral
Ctrl+P            # Play / Stop
Ctrl+Shift+P      # Pause
Ctrl+S            # Salvar a cena atual
Ctrl+Z / Ctrl+Y   # Undo / Redo
Ctrl+D            # Duplicar objeto selecionado
Ctrl+Shift+F      # Alinha o objeto à view atual da Scene`,
      },
      {
        lang: "csharp",
        code: `// O Inspector pode ser customizado. Atributos básicos que mudam tudo:
using UnityEngine;

public class ExemploInspector : MonoBehaviour
{
    [Header("Configurações de Movimento")]
    [Tooltip("Velocidade em unidades por segundo")]
    [Range(0f, 20f)]                           // vira um slider no Inspector
    public float velocidade = 5f;

    [Space(10)]                                // espaço em branco
    [SerializeField] private int vidas = 3;    // privado, mas aparece no Inspector

    [TextArea(3, 6)]                           // campo de texto com 3 a 6 linhas
    public string descricao;

    [HideInInspector]                          // public mas escondido na UI
    public int contadorInterno;
}`,
      },
    ],
    points: [
      "Seis janelas dominam o dia a dia: Scene, Game, Hierarchy, Project, Inspector, Console.",
      "Você pode mover e empilhar janelas livremente; salve layouts via Window > Layouts.",
      "A barra de ferramentas Q W E R T controla como você manipula objetos na Scene.",
      "Aperte F com um objeto selecionado para focar a câmera nele.",
      "Erros e logs vivem na Console; clique numa mensagem para ir direto ao código fonte.",
      "Iniciante comum: editar valores em modo Play e perder tudo ao parar.",
      "Iniciante comum: confundir Hierarchy (cena atual) com Project (todos os assets).",
    ],
    alerts: [
      {
        type: "warning",
        content: "Mudanças feitas no Inspector enquanto o Play está ativo são DESCARTADAS quando você para. Para preservar, copie os valores antes ou use o botão direito > Copy Component / Paste Component Values.",
      },
      {
        type: "tip",
        content: "Mude a cor de fundo do editor enquanto está em Play (Edit > Preferences > Colors > Playmode tint). Cor diferente evita o erro clássico de editar achando que está fora do Play.",
      },
      {
        type: "info",
        content: "Aperte Ctrl+Shift+C para abrir a Console rapidamente. Acostume-se a deixá-la sempre visível: 80% dos problemas são detectados ali antes de virar dor de cabeça.",
      },
    ],
  },
  {
    slug: "primeira-cena",
    section: "instalacao",
    title: "Sua primeira cena",
    difficulty: "iniciante",
    subtitle: "GameObjects, componentes e o conceito que define o Unity.",
    intro: `O Unity é construído em cima de uma ideia central, e entender ela bem desde o início vai facilitar o resto da sua vida com a engine: tudo que existe num jogo Unity é um GameObject, e GameObjects são apenas containers vazios que ganham comportamento ao receber componentes. Um cubo na tela é um GameObject com um componente Transform (posição, rotação, escala), um MeshFilter (qual modelo 3D), um MeshRenderer (como desenhar) e talvez um BoxCollider (formato físico). A câmera é um GameObject com um componente Camera. A luz é um GameObject com um componente Light. Não existe hierarquia de classes complicada: é tudo composição.

Esse padrão se chama Entity-Component System na sua versão mais simples, e foi uma escolha deliberada. Em vez de você criar uma classe Inimigo que herda de Personagem que herda de Ente que herda de SerVivo (uma confusão), você cria um GameObject vazio chamado Inimigo e adiciona os componentes que ele precisa: Health, Movement, AI, Renderer, Audio. Quer que ele dispare? Adiciona o componente Shooter. Não quer mais? Remove. Isso torna o Unity flexível e modular de um jeito que poucas engines conseguem.

A cena (Scene) é o palco onde os GameObjects vivem. Você pode pensar nela como uma fase do jogo, mas pode ser mais geral: o menu principal é uma cena, a tela de carregamento é uma cena, cada nível é uma cena, a tela de game over é uma cena. Cenas são arquivos .unity dentro de Assets/Scenes/. Cada projeto tem pelo menos uma cena, e você troca entre elas em runtime com SceneManager.LoadScene().

Para criar sua primeira cena de verdade, você só precisa de três coisas: uma luz (já vem por padrão), uma câmera (já vem por padrão como Main Camera) e algo para olhar. Vá em GameObject > 3D Object > Cube. Pronto, um cubo apareceu no centro do mundo. Aperte Play. Ele está ali, parado, iluminado. Não é jogo ainda, mas é o esqueleto. Tudo dali em diante é adicionar componentes e scripts.`,
    codes: [
      {
        lang: "csharp",
        code: `// O componente mais básico: um script que faz o cubo girar.
// Salve em Assets/Scripts/Girador.cs e arraste no Inspector do cubo.
using UnityEngine;

// MonoBehaviour é a classe base de todo script de comportamento Unity.
// Herdando dela, esse arquivo vira um Component que pode ser anexado a GameObjects.
public class Girador : MonoBehaviour
{
    // [SerializeField] expõe o campo no Inspector mesmo sendo privado.
    [SerializeField] private Vector3 velocidade = new Vector3(0f, 90f, 0f);

    // Update é chamado uma vez por frame. 60 FPS = 60 chamadas por segundo.
    private void Update()
    {
        // transform é o componente Transform deste GameObject (posição/rotação/escala)
        // Rotate gira o objeto. Multiplicamos por Time.deltaTime para que a velocidade
        // seja em "graus por segundo" e não dependa do FPS da máquina.
        transform.Rotate(velocidade * Time.deltaTime);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Criar GameObjects inteiros via código, sem usar o menu.
using UnityEngine;

public class CriadorDeCena : MonoBehaviour
{
    // Start roda uma vez, no primeiro frame em que o objeto está ativo.
    private void Start()
    {
        // Cria um cubo primitivo já com mesh, material e collider
        GameObject cubo = GameObject.CreatePrimitive(PrimitiveType.Cube);
        cubo.name = "Cubo Vermelho";
        cubo.transform.position = new Vector3(0f, 1f, 0f);

        // Pega o componente Renderer do cubo recém-criado e muda a cor
        Renderer renderer = cubo.GetComponent<Renderer>();
        renderer.material.color = Color.red;

        // Adiciona um componente Rigidbody (físico) em runtime
        Rigidbody rb = cubo.AddComponent<Rigidbody>();
        rb.mass = 2f;

        // Cria também um plano para o cubo cair em cima
        GameObject chao = GameObject.CreatePrimitive(PrimitiveType.Plane);
        chao.transform.position = Vector3.zero;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Comunicação entre componentes: pegar referências de outros componentes.
using UnityEngine;

public class ExemploReferencias : MonoBehaviour
{
    // Referências preenchidas pelo Inspector arrastando no editor
    [SerializeField] private Transform alvo;
    [SerializeField] private Light luzPrincipal;

    // Cache de componentes deste mesmo GameObject (mais rápido que pegar todo frame)
    private Rigidbody _rigidbody;
    private MeshRenderer _mesh;

    private void Awake()
    {
        // Awake roda antes do Start, ideal para inicializar referências
        _rigidbody = GetComponent<Rigidbody>();
        _mesh = GetComponent<MeshRenderer>();

        // GetComponentInChildren busca em filhos da hierarquia
        // GetComponentInParent busca em pais
        // FindObjectOfType<Tipo>() busca na cena toda (lento, evite no Update)
    }

    private void Update()
    {
        if (alvo != null)
        {
            // Olha sempre na direção do alvo
            transform.LookAt(alvo);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Trocando de cena em runtime — útil para menus, fases, game over.
using UnityEngine;
using UnityEngine.SceneManagement;   // namespace específico para cenas

public class ControleDeCenas : MonoBehaviour
{
    // Carrega cena pelo nome (precisa estar adicionada em File > Build Settings)
    public void IrParaMenu()
    {
        SceneManager.LoadScene("MenuPrincipal");
    }

    // Carrega pelo índice na Build Settings (0 é a primeira)
    public void IrParaPrimeiraFase()
    {
        SceneManager.LoadScene(1);
    }

    // Recarrega a cena atual — útil em "Tente novamente"
    public void Reiniciar()
    {
        Scene atual = SceneManager.GetActiveScene();
        SceneManager.LoadScene(atual.name);
    }

    // Carrega de forma assíncrona (não trava o jogo durante o load)
    public void IrParaFaseAssincrono(string nome)
    {
        SceneManager.LoadSceneAsync(nome);
    }
}`,
      },
    ],
    points: [
      "Tudo no Unity é um GameObject; comportamento vem de Components anexados.",
      "Composição vence herança: monte entidades juntando componentes pequenos.",
      "Cenas (.unity) são arquivos que guardam o estado dos GameObjects do palco.",
      "Toda cena precisa de pelo menos uma câmera e uma luz para você ver algo.",
      "Multiplique sempre velocidades por Time.deltaTime para independência de FPS.",
      "GetComponent é caro: cacheie referências em Awake/Start, não chame todo Update.",
      "Iniciante comum: criar 50 scripts gigantes em vez de muitos pequenos e modulares.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Sempre nomeie GameObjects de forma descritiva (Player, MainCamera, FloorTile_01). 'Cube (3)' vai te perseguir nos pesadelos durante debug.",
      },
      {
        type: "warning",
        content: "Não esqueça de adicionar suas cenas em File > Build Settings > Scenes In Build. Cenas fora dessa lista não podem ser carregadas em runtime e o jogo crasha ao chamá-las.",
      },
      {
        type: "info",
        content: "Salve sua cena com Ctrl+S frequentemente. O Unity costuma crashar se você abusar de scripts pesados, e mudanças não salvas na cena vão pro limbo.",
      },
    ],
  },
  {
    slug: "projeto-2d-vs-3d",
    section: "instalacao",
    title: "Projeto 2D ou 3D? Built-in, URP ou HDRP?",
    difficulty: "iniciante",
    subtitle: "Entenda o que cada template muda e qual escolher para o seu projeto.",
    intro: `Quando você cria um projeto novo, a tela de templates pode parecer ameaçadora. 2D, 3D, URP, HDRP, VR, Mobile 2D, Mobile 3D... e a maioria dos tutoriais antigos não menciona metade dessas opções. Vamos esclarecer de uma vez: a escolha de template afeta basicamente duas coisas — qual render pipeline o projeto usa e quais pacotes vêm pré-instalados. Tudo o resto pode ser adicionado depois.

A diferença entre projeto 2D e 3D é mais cosmética do que estrutural. O Unity é uma engine 3D no fundo, e o "modo 2D" é só uma configuração da câmera (ortográfica em vez de perspectiva), do importador de texturas (assume sprite em vez de texture) e da física (usa Box2D em vez de PhysX). Você pode misturar 2D e 3D no mesmo projeto sem problemas — muitos jogos modernos fazem isso. A única decisão real é: meu jogo vai parecer 2D? Se sim, escolha um template 2D para já vir tudo configurado.

A escolha de render pipeline é mais séria. O Built-in Render Pipeline é o histórico do Unity, ainda funciona, mas está em modo de manutenção: nenhuma feature nova vai chegar ali. URP (Universal) é o caminho moderno: roda em mobile, console, PC, web; é altamente customizável via Shader Graph; e suporta tanto 2D quanto 3D. HDRP (High Definition) é o monstro de gráficos: ray tracing, volumetric clouds, materiais físicos avançados — mas só roda decentemente em PC/console com placa de vídeo dedicada e não tem suporte mobile.

A regra prática para 2024 e além: se for mobile, web ou seu primeiro projeto, use URP. Se for PC AAA com gráficos de impressionar, considere HDRP. Built-in só se você precisar manter um projeto legado. Trocar de pipeline depois de iniciado é doloroso (todos os materiais quebram, shaders precisam ser reconstruídos), então pense antes. E não se assuste: o que você aprende em URP vale para HDRP, são primos próximos. As diferenças aparecem mesmo em shaders avançados e configurações de iluminação, coisas que você só vai ver em capítulos avançados deste livro.`,
    codes: [
      {
        lang: "csharp",
        code: `// Verificar em runtime qual render pipeline está ativo.
using UnityEngine;
using UnityEngine.Rendering;

public class DetectorPipeline : MonoBehaviour
{
    private void Start()
    {
        // GraphicsSettings.currentRenderPipeline é null no Built-in
        var pipeline = GraphicsSettings.currentRenderPipeline;

        if (pipeline == null)
        {
            Debug.Log("Estamos no Built-in Render Pipeline.");
        }
        else
        {
            // O nome do tipo identifica URP ou HDRP
            string nome = pipeline.GetType().Name;
            Debug.Log("Pipeline ativo: " + nome);
            // UniversalRenderPipelineAsset → URP
            // HDRenderPipelineAsset → HDRP
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Diferença concreta entre câmera 2D e 3D.
// Câmera 3D padrão (perspectiva) — objetos longe parecem menores
using UnityEngine;

public class ConfiguradorCamera : MonoBehaviour
{
    [SerializeField] private bool usarComo2D = true;

    private void Awake()
    {
        Camera cam = GetComponent<Camera>();

        if (usarComo2D)
        {
            // Projeção ortográfica: sem perspectiva, ideal para 2D
            cam.orthographic = true;
            cam.orthographicSize = 5f;   // metade da altura visível em unidades
        }
        else
        {
            // Projeção perspectiva: padrão 3D
            cam.orthographic = false;
            cam.fieldOfView = 60f;       // FOV típico de jogo 3D
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Física 2D vs 3D — usam APIs diferentes mesmo conceitos parecidos.

// Para objetos 2D (sprite + Rigidbody2D + Collider2D):
using UnityEngine;
public class JogadorMovimento2D : MonoBehaviour
{
    private Rigidbody2D _rb;
    [SerializeField] private float velocidade = 5f;

    private void Awake() => _rb = GetComponent<Rigidbody2D>();

    private void FixedUpdate()
    {
        // Vector2 é usado em todo o sistema 2D
        float h = Input.GetAxis("Horizontal");
        _rb.linearVelocity = new Vector2(h * velocidade, _rb.linearVelocity.y);
    }
}

// Para objetos 3D (mesh + Rigidbody + Collider):
public class JogadorMovimento3D : MonoBehaviour
{
    private Rigidbody _rb;
    [SerializeField] private float velocidade = 5f;

    private void Awake() => _rb = GetComponent<Rigidbody>();

    private void FixedUpdate()
    {
        // Vector3 no 3D
        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");
        _rb.linearVelocity = new Vector3(h * velocidade, _rb.linearVelocity.y, v * velocidade);
    }
}`,
      },
      {
        lang: "json",
        code: `// O pipeline ativo é configurado no ProjectSettings/GraphicsSettings.asset.
// Você vê e troca isso em Edit > Project Settings > Graphics > Scriptable Render Pipeline Asset.
// Trocar de pipeline pelo Inspector troca todos os shaders padrão do projeto.

// Resumo prático para você decidir:
{
  "Built-in": {
    "quando_usar": "manutenção de projetos antigos",
    "performance_mobile": "ok",
    "shaders_modernos": "limitado",
    "futuro": "modo de manutenção, sem novas features"
  },
  "URP": {
    "quando_usar": "mobile, web, console, PC, primeiro projeto",
    "performance_mobile": "excelente",
    "shaders_modernos": "Shader Graph 2D e 3D",
    "futuro": "ativo, recebe atualizações constantes"
  },
  "HDRP": {
    "quando_usar": "PC e console AAA com hardware dedicado",
    "performance_mobile": "nao_suportado",
    "shaders_modernos": "máximo, ray tracing, volumetrics",
    "futuro": "ativo, foco em fidelidade gráfica"
  }
}`,
      },
    ],
    points: [
      "2D e 3D são templates de configuração; o Unity é 3D por baixo dos panos.",
      "Você pode misturar 2D e 3D no mesmo projeto sem problemas técnicos.",
      "URP é a recomendação atual para 95% dos projetos novos.",
      "HDRP só vale a pena para PC/console AAA com hardware dedicado.",
      "Built-in está em modo de manutenção: evite começar projeto novo nele.",
      "Trocar de pipeline depois de iniciar quebra todos os materiais e shaders.",
      "Física 2D usa Rigidbody2D/Collider2D; física 3D usa Rigidbody/Collider sem o sufixo.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Se você importar assets da Asset Store feitos para Built-in num projeto URP, os materiais ficam roxos (shader não encontrado). Use Edit > Rendering > Materials > Convert Selected Built-in Materials to URP para converter em massa.",
      },
      {
        type: "tip",
        content: "Para mobile, sempre URP com Renderer Asset ajustado. Desligue features pesadas (HDR, MSAA alto, Soft Shadows). A diferença de performance entre URP bem configurado e mal configurado é de 3x ou mais.",
      },
      {
        type: "info",
        content: "Não existe template 'VR' ou 'AR' separado nas versões mais recentes — você cria um projeto URP e instala o XR Plug-in Management depois via Package Manager. Mais flexível.",
      },
    ],
  },
  {
    slug: "versoes-unity-lts",
    section: "instalacao",
    title: "LTS, TECH e o ciclo de versões do Unity",
    difficulty: "iniciante",
    subtitle: "Entendendo a numeração, o suporte e como decidir quando atualizar.",
    intro: `O Unity tem um esquema de versionamento próprio que confunde quem vem de outras ferramentas. Uma versão é algo como 2022.3.20f1. Vamos quebrar isso: 2022 é o ano, 3 é o ciclo (a cada ano há ciclos 1, 2 e 3), 20 é o patch dentro do ciclo, e f1 indica que é uma final release (sufixos como a, b, p, rc indicam alpha, beta, patch e release candidate). Conforme o ciclo avança, vão saindo patches: f1, f2, f3, e assim por diante. Você sempre quer o patch mais recente da sua linha.

Os ciclos são divididos em duas categorias: TECH e LTS. As versões TECH (como 2023.1, 2023.2) são lançadas periodicamente trazendo novas features, mudanças de API e às vezes regressões. Cada TECH dura cerca de quatro meses e é substituída pela seguinte. As versões LTS (Long Term Support) são lançadas uma vez por ano (ex: 2022.3 LTS) e recebem dois anos de correções de bugs, sem novas features. LTS é a versão "boring" — e isso é bom, porque você quer que seu projeto seja chato e estável, não cheio de surpresas.

A regra prática que toda empresa usa: para projetos em produção, sempre LTS. Para experimentar features novíssimas, TECH. Para iniciantes aprendendo, LTS, sem dúvida. A versão LTS 2022.3 ainda é o "ouro" no momento da escrita deste livro porque tem dois anos de patches por trás dela, ecossistema de pacotes maduro, e a maioria dos tutoriais funciona nela. A LTS 2023.2 é a próxima, com URP e HDRP mais maduros.

Outra coisa importante: o Unity não é retrocompatível. Um projeto criado em 2022.3 abre normalmente em 2023.2 (com upgrade), mas um projeto em 2023.2 não abre em 2022.3 — ponto. Por isso, antes de atualizar, faça backup, leia o changelog e teste. E nunca atualize um projeto no meio de um sprint de produção. Atualizações de Unity são tarefas de uma semana inteira de QA num projeto médio, e podem virar um mês num projeto grande.`,
    codes: [
      {
        lang: "csharp",
        code: `// Conferir a versão Unity em runtime — útil em logs e telas de debug.
using UnityEngine;

public class InfoVersao : MonoBehaviour
{
    private void Start()
    {
        // Application.unityVersion devolve algo como "2022.3.20f1"
        Debug.Log("Unity: " + Application.unityVersion);
        Debug.Log("Plataforma: " + Application.platform);
        Debug.Log("Versão do app: " + Application.version);
        Debug.Log("Identificador: " + Application.identifier);

        // Em scripts de Editor, há mais detalhes em InternalEditorUtility
        // (mas só funcionam dentro de pasta Editor/)
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Compilação condicional por versão Unity (preprocessor directives).
// O Unity define símbolos como UNITY_2022_3_OR_NEWER automaticamente.
using UnityEngine;

public class CompatibilidadeVersao : MonoBehaviour
{
    private void Awake()
    {
#if UNITY_2023_1_OR_NEWER
        // Código que só roda no Unity 2023.1 ou mais novo
        Debug.Log("Usando API moderna disponível no 2023.1+");
#elif UNITY_2022_3_OR_NEWER
        // Fallback para 2022.3
        Debug.Log("Usando API do 2022.3");
#else
        // Versão antiga
        Debug.LogWarning("Atualize seu Unity, esta versão está obsoleta.");
#endif

        // Direcionamento por plataforma também funciona
#if UNITY_EDITOR
        Debug.Log("Rodando dentro do editor.");
#elif UNITY_ANDROID
        Debug.Log("Build Android.");
#elif UNITY_IOS
        Debug.Log("Build iOS.");
#elif UNITY_WEBGL
        Debug.Log("Build WebGL.");
#endif
    }
}`,
      },
      {
        lang: "json",
        code: `// O arquivo ProjectSettings/ProjectVersion.txt registra a versão exata.
// Ele é texto puro e deve ser commitado no controle de versão.
// Exemplo de conteúdo:
m_EditorVersion: 2022.3.20f1
m_EditorVersionWithRevision: 2022.3.20f1 (61c2feb0970d)

// Quando o time inteiro tem essa versão exata, o Hub abre na versão certa
// automaticamente (quando você dá double-click no projeto pelo Hub).`,
      },
      {
        lang: "bash",
        code: `# Como decidir quando atualizar:

# 1. Você está em pré-produção (sem código de jogo ainda)?
#    → Atualize para a LTS mais nova. Custo zero.

# 2. Você está em produção ativa?
#    → NÃO atualize a menos que tenha um bug bloqueador corrigido.
#    → Se atualizar, faça em um branch separado e teste por dias.

# 3. Você está perto do release?
#    → NUNCA atualize. Trave a versão e suba o jogo.

# 4. Surgiu uma versão LTS nova (ex: 2023.2 LTS)?
#    → Espere os primeiros 3-4 patches (2023.2.10f1+) antes de migrar.
#    → As primeiras LTS sempre têm bugs que aparecem após semanas de uso.

# 5. Como rebaixar uma versão?
#    → Não dá. Backups antes de tudo.`,
      },
    ],
    points: [
      "Versões Unity seguem o formato AAAA.C.PPpP (ano.ciclo.patchTipo).",
      "TECH = features novas com risco; LTS = estabilidade com 2 anos de suporte.",
      "Para projetos sérios, sempre LTS — sem exceção.",
      "Espere os primeiros 3-4 patches antes de migrar para uma LTS recém-lançada.",
      "Projetos não voltam de versão: backup antes de qualquer atualização.",
      "Use compilação condicional (#if UNITY_2023_1_OR_NEWER) para suportar múltiplas versões.",
      "ProjectSettings/ProjectVersion.txt deve estar no Git para o time abrir na mesma versão.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Nunca atualize a versão Unity no meio de um sprint de release. Atualizações comem 1 a 4 semanas de QA em projetos médios. Trave a versão até o jogo estar fora.",
      },
      {
        type: "warning",
        content: "Versões 'b' (beta) e 'a' (alpha) NÃO devem ser usadas para projetos reais. São laboratório. Use só se você tem motivo específico para testar features novas.",
      },
      {
        type: "tip",
        content: "Marque no calendário releases de novas LTS (geralmente em junho/julho). Planeje migração com 2-3 meses de antecedência para colher patches estáveis.",
      },
    ],
  },
  {
    slug: "primeiro-cubo-rolando",
    section: "instalacao",
    title: "Primeiro projeto: cubo que rola com WASD",
    difficulty: "iniciante",
    subtitle: "Mini-projeto completo unindo cena, física, input e câmera — seu primeiro 'jogo' funcional.",
    intro: `Chegou a hora de juntar tudo o que vimos e fazer algo que se mexe. Este capítulo é um mini-projeto completo: você vai criar uma cena com chão, um cubo controlado pelo teclado WASD, física aplicando inércia e uma câmera que segue o jogador. Quando terminar, você terá feito seu primeiro "jogo" Unity. Não é Mario, mas é o esqueleto de quase qualquer jogo: input → física → render. Esse loop é o coração de toda a engine.

Vamos passo a passo. Primeiro a cena: crie um projeto 3D URP. Depois adicione um Plane (GameObject > 3D Object > Plane) que será o chão, e um Cube (GameObject > 3D Object > Cube) que será o jogador. Posicione o cubo um pouco acima do plano (Y = 1) para ele cair em cima por gravidade. Selecione o cubo, vá no Inspector e clique em Add Component > Rigidbody. Pronto, agora ele tem física: pode cair, ricochetear, ser empurrado.

Agora o script. Crie uma pasta Scripts em Assets, depois clique direito > Create > C# Script e nomeie como CubeController. Abra o arquivo no Visual Studio ou Rider. O script vai ler o input do teclado e aplicar uma força no Rigidbody para o cubo rolar. Usar AddForce em vez de mover o transform diretamente é importante: assim a física do Unity continua respeitando colisões, atrito, massa. Se você mexesse no transform, o cubo atravessaria paredes.

Por último, a câmera. Por padrão a Main Camera fica parada num canto. Vamos fazer ela seguir o cubo suavemente. Crie outro script chamado CameraFollow, anexe à Main Camera, e arraste o cubo no campo "alvo" do Inspector. O resultado: você aperta WASD, o cubo rola, a câmera persegue suavemente. Quando você ver isso funcionando pela primeira vez, é um momento marcante. A partir daqui, você só está adicionando complexidade ao mesmo loop básico.`,
    codes: [
      {
        lang: "csharp",
        code: `// Assets/Scripts/CubeController.cs
// Anexe este script ao Cube. Ele precisa de um Rigidbody.
using UnityEngine;

// RequireComponent garante que o GameObject tenha um Rigidbody.
// Se não tiver, o Unity adiciona automaticamente ao anexar este script.
[RequireComponent(typeof(Rigidbody))]
public class CubeController : MonoBehaviour
{
    [Header("Movimento")]
    [Tooltip("Força aplicada por frame ao apertar WASD")]
    [SerializeField] private float forca = 10f;

    [Tooltip("Limite de velocidade horizontal para o cubo não disparar")]
    [SerializeField] private float velocidadeMaxima = 8f;

    private Rigidbody _rb;

    private void Awake()
    {
        // Cache da referência do Rigidbody (não pegar todo frame).
        _rb = GetComponent<Rigidbody>();
    }

    // FixedUpdate é chamado em intervalos fixos (50x por segundo por padrão).
    // Sempre faça física (AddForce, velocity) em FixedUpdate, nunca em Update.
    private void FixedUpdate()
    {
        // Lê o input do teclado. Os eixos "Horizontal" e "Vertical" já vêm
        // configurados no Project Settings > Input Manager para WASD e setas.
        float horizontal = Input.GetAxis("Horizontal");  // A/D ou setas esquerda/direita
        float vertical = Input.GetAxis("Vertical");      // W/S ou setas cima/baixo

        // Cria o vetor de direção (X = direita/esquerda, Z = frente/trás).
        // Y fica em zero para não tentar empurrar o cubo para cima.
        Vector3 direcao = new Vector3(horizontal, 0f, vertical);

        // Aplica a força no Rigidbody. ForceMode.Force respeita massa e dt.
        _rb.AddForce(direcao * forca, ForceMode.Force);

        // Limita a velocidade horizontal para o cubo não virar foguete.
        Vector3 velPlana = new Vector3(_rb.linearVelocity.x, 0f, _rb.linearVelocity.z);
        if (velPlana.magnitude > velocidadeMaxima)
        {
            velPlana = velPlana.normalized * velocidadeMaxima;
            // Mantém a velocidade vertical (queda livre, pulo etc.) intacta
            _rb.linearVelocity = new Vector3(velPlana.x, _rb.linearVelocity.y, velPlana.z);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Assets/Scripts/CameraFollow.cs
// Anexe este script à Main Camera. Arraste o cubo no campo "alvo" do Inspector.
using UnityEngine;

public class CameraFollow : MonoBehaviour
{
    [Header("Alvo")]
    [Tooltip("O Transform que a câmera vai seguir (arraste o Cube aqui)")]
    [SerializeField] private Transform alvo;

    [Header("Configuração da câmera")]
    [Tooltip("Distância da câmera em relação ao alvo (offset inicial)")]
    [SerializeField] private Vector3 offset = new Vector3(0f, 5f, -8f);

    [Tooltip("Suavidade do movimento. Valores menores = câmera mais 'preguiçosa'")]
    [SerializeField] private float suavidade = 5f;

    // LateUpdate roda DEPOIS de todos os Update do frame.
    // Ideal para câmera, garantindo que o jogador já se moveu antes da câmera reagir.
    private void LateUpdate()
    {
        if (alvo == null) return;  // segurança contra alvo não atribuído

        // Posição que a câmera deveria estar idealmente
        Vector3 destino = alvo.position + offset;

        // Lerp suaviza a transição entre posição atual e destino.
        // Time.deltaTime * suavidade torna o movimento independente do FPS.
        transform.position = Vector3.Lerp(transform.position, destino, Time.deltaTime * suavidade);

        // Faz a câmera olhar sempre para o cubo
        transform.LookAt(alvo);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Bônus: adicionar pulo. Anexe ao mesmo cubo (ou edite CubeController).
using UnityEngine;

[RequireComponent(typeof(Rigidbody))]
public class CubeJump : MonoBehaviour
{
    [SerializeField] private float forcaPulo = 6f;

    private Rigidbody _rb;
    private bool _noChao;

    private void Awake() => _rb = GetComponent<Rigidbody>();

    private void Update()
    {
        // Input.GetKeyDown só dispara no frame em que a tecla é pressionada.
        // Update é o lugar certo para ler input pontual (não FixedUpdate).
        if (Input.GetKeyDown(KeyCode.Space) && _noChao)
        {
            // Impulse aplica força instantânea, ideal para pulos.
            _rb.AddForce(Vector3.up * forcaPulo, ForceMode.Impulse);
            _noChao = false;
        }
    }

    // OnCollisionEnter dispara quando o collider deste GameObject toca outro.
    private void OnCollisionEnter(Collision colisao)
    {
        // Verifica se a superfície tocada está abaixo (chão).
        // contacts[0].normal.y > 0.5 = inclinação inferior a ~60 graus.
        if (colisao.contacts[0].normal.y > 0.5f)
        {
            _noChao = true;
        }
    }
}`,
      },
      {
        lang: "bash",
        code: `# Roteiro completo do mini-projeto, do zero ao Play:

# 1. Hub > New project > 3D (URP) > nome "CuboRolante" > Create
# 2. Espere o editor abrir (primeira vez demora mais)
# 3. Hierarchy: clique direito > 3D Object > Plane (esse é o chão)
# 4. Hierarchy: clique direito > 3D Object > Cube (esse é o jogador)
# 5. Selecione o Cube, no Inspector mude Position Y para 1
# 6. Com o Cube selecionado, clique Add Component > Rigidbody
# 7. Project: clique direito > Create > Folder > "Scripts"
# 8. Dentro de Scripts: clique direito > Create > C# Script > "CubeController"
# 9. Cole o código do CubeController.cs (mostrado acima)
# 10. Arraste o script CubeController da pasta Project para o Cube na Hierarchy
# 11. Crie outro script "CameraFollow" e arraste para a Main Camera
# 12. Selecione a Main Camera e arraste o Cube da Hierarchy para o campo "Alvo"
# 13. Salve a cena (Ctrl+S, escolha um nome como "MainScene")
# 14. Aperte Play (Ctrl+P)
# 15. Use WASD ou as setas. Aperte Espaço se adicionou o CubeJump.

# Está funcionando? Parabéns, você fez seu primeiro jogo Unity.
# Não está? Olhe a Console (Ctrl+Shift+C) para mensagens de erro.`,
      },
    ],
    points: [
      "Use AddForce em FixedUpdate para movimento físico que respeita colisões.",
      "Input.GetAxis suaviza entrada de teclado; Input.GetKeyDown captura pressão única.",
      "Cacheie GetComponent em Awake para não buscar componentes todo frame.",
      "RequireComponent garante dependências e adiciona automaticamente o que falta.",
      "Câmera deve seguir em LateUpdate, depois do movimento do jogador.",
      "Vector3.Lerp com Time.deltaTime cria seguimento suave independente do FPS.",
      "Limite a velocidade máxima do Rigidbody para evitar 'foguetes' indesejados.",
      "Iniciante comum: mover transform diretamente e ver o objeto atravessando paredes.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Se o cubo cair muito devagar, ajuste a Mass do Rigidbody (padrão 1) ou aumente Physics > Gravity em Project Settings. Gravidade padrão é -9.81 no eixo Y, igual ao mundo real.",
      },
      {
        type: "warning",
        content: "Nunca misture transform.position e Rigidbody no mesmo frame. Escolha um: ou você usa física (AddForce/velocity) ou movimento direto (transform). Misturar gera bugs sutis e tremores.",
      },
      {
        type: "success",
        content: "Esse mini-projeto é a base de muitos jogos. Adicione obstáculos, colete moedas (com OnTriggerEnter), conte pontos numa UI Text, e você já tem um jogo completo de uma noite de trabalho.",
      },
    ],
  },
];
