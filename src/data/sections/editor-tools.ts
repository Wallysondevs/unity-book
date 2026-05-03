import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "inspector-customizado",
    section: "editor-tools",
    title: "Inspector customizado com CustomEditor",
    difficulty: "avancado",
    subtitle: "Transforme o painel padrão do Inspector em uma interface sob medida para seus designers.",
    intro: `Imagine que você fez um script chamado SpawnerInimigos com vinte campos públicos: tipo de inimigo, raio, intervalo, número máximo, curva de dificuldade, lista de waves, e por aí vai. O Inspector padrão do Unity vai mostrar tudo isso como uma sopa de campos empilhados, sem agrupar nada, sem botões para testar e sem feedback visual. O designer da sua equipe vai abrir esse componente e olhar para você com cara de poucos amigos. É exatamente esse problema que o Inspector customizado resolve.

Por baixo dos panos, cada componente que aparece no Inspector é desenhado por uma classe chamada Editor. Quando você não escreve uma, o Unity usa uma genérica que olha os campos serializáveis e desenha cada um com o controle padrão. Quando você cria a sua própria classe Editor e marca com [CustomEditor(typeof(SeuComponente))], o Unity passa a chamar o seu OnInspectorGUI no lugar do desenho padrão. A partir daí, você é o dono do que aparece naquele painel: pode agrupar campos, esconder coisas condicionalmente, adicionar botões que executam funções, mostrar avisos coloridos e até desenhar miniaturas em tempo real.

Existe uma regra de ouro que muita gente esquece: scripts de editor só podem existir em pastas chamadas Editor. O Unity reconhece esse nome especial e os exclui da build final do jogo. Se você colocar um using UnityEditor dentro de um arquivo fora de Editor, vai compilar dentro do Unity, mas a build do jogo vai quebrar com erros do tipo "type or namespace UnityEditor not found". Isso confunde principalmente quem está começando porque parece um bug aleatório que aparece só na hora errada.

Outra coisa importante é entender a diferença entre mexer direto nos campos e usar o sistema de SerializedProperty. Quando você altera target.algumCampo no editor, o Unity não registra o Undo, não marca a cena como suja e não respeita o Multi-Object Editing. Quando você usa serializedObject.FindProperty e EditorGUILayout.PropertyField, todas essas coisas vêm de graça. A primeira forma é mais curta de escrever, mas a segunda é a forma profissional. Use sempre SerializedProperty para campos persistentes e troque para acesso direto só quando estiver chamando métodos ou rodando lógica de teste.

Use Inspectors customizados quando o componente é central para o fluxo de um time, quando há muitas dependências cruzadas entre campos, ou quando faz sentido ter botões para gerar conteúdo. Não invista tempo em CustomEditor para componentes triviais com três campos: o Inspector padrão já é ótimo e atributos como [Header], [Range] e [Tooltip] resolvem 80% dos casos sem uma linha de C#.`,
    codes: [
      {
        lang: "csharp",
        code: `// Arquivo: Assets/Scripts/SpawnerInimigos.cs
// Componente normal de jogo. Não tem nada de editor aqui.
using UnityEngine;

public class SpawnerInimigos : MonoBehaviour
{
    [Header("Configuracao basica")]
    public GameObject prefabInimigo;
    public float raioSpawn = 5f;
    public int quantidade = 10;

    [Header("Tempo")]
    public float intervalo = 1.5f;
    public bool spawnAutomatico = true;

    // Metodo publico que o Inspector customizado vai chamar via botao.
    public void SpawnarAgora()
    {
        for (int i = 0; i < quantidade; i++)
        {
            Vector2 ponto = Random.insideUnitCircle * raioSpawn;
            Vector3 pos = transform.position + new Vector3(ponto.x, 0, ponto.y);
            Instantiate(prefabInimigo, pos, Quaternion.identity, transform);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Arquivo: Assets/Scripts/Editor/SpawnerInimigosEditor.cs
// IMPORTANTE: precisa estar dentro de uma pasta chamada "Editor"
// para nao ser incluido na build final do jogo.
using UnityEditor;
using UnityEngine;

[CustomEditor(typeof(SpawnerInimigos))]
[CanEditMultipleObjects] // permite editar varios objetos selecionados juntos
public class SpawnerInimigosEditor : Editor
{
    // Cache das SerializedProperties: pega uma vez no OnEnable, usa em todo lugar.
    SerializedProperty prefabProp;
    SerializedProperty raioProp;
    SerializedProperty quantidadeProp;
    SerializedProperty intervaloProp;
    SerializedProperty automaticoProp;

    void OnEnable()
    {
        // serializedObject ja existe na classe base Editor.
        prefabProp = serializedObject.FindProperty("prefabInimigo");
        raioProp = serializedObject.FindProperty("raioSpawn");
        quantidadeProp = serializedObject.FindProperty("quantidade");
        intervaloProp = serializedObject.FindProperty("intervalo");
        automaticoProp = serializedObject.FindProperty("spawnAutomatico");
    }

    public override void OnInspectorGUI()
    {
        // Sincroniza o objeto serializado com o estado atual no disco.
        serializedObject.Update();

        EditorGUILayout.LabelField("Spawner de Inimigos", EditorStyles.boldLabel);
        EditorGUILayout.Space();

        // PropertyField cuida de Undo, multi-edit e prefab override sozinho.
        EditorGUILayout.PropertyField(prefabProp);

        if (prefabProp.objectReferenceValue == null)
        {
            EditorGUILayout.HelpBox("Defina um prefab antes de spawnar.", MessageType.Warning);
        }

        EditorGUILayout.PropertyField(raioProp);
        EditorGUILayout.PropertyField(quantidadeProp);

        // Mostra o intervalo so quando o spawn automatico estiver ligado.
        EditorGUILayout.PropertyField(automaticoProp);
        if (automaticoProp.boolValue)
        {
            EditorGUI.indentLevel++;
            EditorGUILayout.PropertyField(intervaloProp);
            EditorGUI.indentLevel--;
        }

        EditorGUILayout.Space();

        // Botao que chama um metodo do componente. So aparece no editor.
        using (new EditorGUI.DisabledScope(!Application.isPlaying))
        {
            if (GUILayout.Button("Spawnar agora (so em Play Mode)"))
            {
                // 'target' eh o componente sendo editado.
                ((SpawnerInimigos)target).SpawnarAgora();
            }
        }

        // Aplica as mudancas e registra Undo automaticamente.
        serializedObject.ApplyModifiedProperties();
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Truque profissional: marcar a cena como suja quando voce muda
// algo via codigo (fora de PropertyField). Sem isso, o Unity nao salva.
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

public static class EditorMarkDirtyHelper
{
    public static void MarcarComoModificado(Object alvo)
    {
        if (alvo == null) return;

        // Registra a operacao para o Ctrl+Z funcionar.
        Undo.RecordObject(alvo, "Modificar via codigo");

        // Marca o componente como sujo (precisa ser salvo).
        EditorUtility.SetDirty(alvo);

        // Se for um componente de cena, marca a cena tambem.
        if (alvo is Component componente)
        {
            EditorSceneManager.MarkSceneDirty(componente.gameObject.scene);
        }
    }
}`,
      },
    ],
    points: [
      "Scripts de editor obrigatoriamente vivem em pastas chamadas Editor.",
      "Use [CustomEditor(typeof(MeuComponente))] para sobrescrever o desenho do Inspector.",
      "Prefira SerializedProperty + PropertyField em vez de mexer direto no target.",
      "serializedObject.Update() no inicio e ApplyModifiedProperties() no fim de OnInspectorGUI.",
      "Adicione [CanEditMultipleObjects] para suportar selecao em massa.",
      "Use HelpBox para validar configurações ruins e guiar o designer visualmente.",
      "Botoes via GUILayout.Button sao a forma mais simples de adicionar acoes ao Inspector.",
      "Lembre de Undo.RecordObject e EditorUtility.SetDirty quando alterar dados fora do PropertyField.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Esquecer de chamar serializedObject.ApplyModifiedProperties() faz com que mudanças no Inspector pareçam funcionar mas sumam ao reabrir a cena. É uma das pegadinhas mais frequentes para quem está começando com Editor scripting.",
      },
      {
        type: "tip",
        content: "Antes de partir para CustomEditor, tente resolver com atributos: [Header], [Tooltip], [Range], [SerializeField], [HideInInspector] e [TextArea]. Eles cobrem a maioria dos casos sem nenhum código extra.",
      },
      {
        type: "info",
        content: "A partir do Unity 2019 existe o UI Toolkit (antigo UIElements) como alternativa ao IMGUI usado em OnInspectorGUI. Para projetos novos vale conhecer, mas IMGUI continua oficialmente suportado e é o que aparece em quase todos os tutoriais.",
      },
    ],
  },
  {
    slug: "editorwindow",
    section: "editor-tools",
    title: "EditorWindow: criando janelas customizadas no Unity",
    difficulty: "avancado",
    subtitle: "Construa ferramentas internas com sua própria janela acoplável no editor.",
    intro: `Toda janela que você abre no Unity, do Inspector ao Console, do Animator ao Profiler, é uma EditorWindow. Quando o seu projeto cresce, surge a necessidade de painéis próprios: um gerenciador de waves, um visualizador de dados de save, uma calculadora de balanceamento, um exportador para uma planilha. Em vez de obrigar o time a abrir scripts e mexer em variáveis no Inspector, você cria uma janela bonita, focada, com botões e gráficos. Isso transforma uma tarefa chata e propensa a erro em um clique.

A ideia central é criar uma classe que herda de EditorWindow e expor um menu item que abre essa janela. O Unity cuida do ciclo de vida: ele guarda a janela, salva a posição quando você fecha o editor, permite ancorar na lateral como qualquer outra view nativa. Você desenha o conteúdo da janela dentro do método OnGUI usando a mesma API IMGUI do Inspector customizado: GUILayout.Button, EditorGUILayout.IntField, EditorGUILayout.Foldout, e por aí vai. Se já fez um Inspector custom, está em casa.

Comparado ao CustomEditor, a EditorWindow é mais livre. O CustomEditor está preso ao componente que decora; ele só aparece quando você seleciona aquele tipo de objeto. A EditorWindow é independente: ela vive sozinha, pode ser chamada a qualquer momento, pode interagir com qualquer asset do projeto, e não precisa de um GameObject selecionado para funcionar. Use EditorWindow quando a ferramenta é geral (não amarrada a um componente específico) e CustomEditor quando ela é íntima de um tipo de dado.

O ciclo de vida da janela tem alguns pontos importantes. O método OnEnable é chamado quando a janela abre ou quando o Unity recompila scripts (porque ele recria todas as janelas abertas). Se você guarda dados que precisam sobreviver à recompilação, marque-os como [SerializeField] privados na própria janela. Se guardar como variáveis comuns sem [SerializeField], você vai perder tudo quando salvar um arquivo de código. Esse é um pulo do gato que economiza horas de "por que sumiu meu progresso?".

Janelas mais complexas valem a pena quando você nota que três pessoas do time estão fazendo a mesma sequência manual repetidamente. Esse é o sinal: automatize. Mas resista à tentação de criar uma janela para tudo. Janelas que ninguém usa entopem o menu Window e viram débito técnico. Comece pequeno, com um menu item, uma janela de uma tela, e cresça conforme a dor real do time aparecer.`,
    codes: [
      {
        lang: "csharp",
        code: `// Arquivo: Assets/Editor/GerenciadorWaves.cs
// Janela customizada simples que cria GameObjects de wave na cena.
using UnityEditor;
using UnityEngine;

public class GerenciadorWaves : EditorWindow
{
    // [SerializeField] garante que o valor sobreviva quando o Unity
    // recompilar scripts enquanto a janela esta aberta.
    [SerializeField] int numeroWaves = 3;
    [SerializeField] float intervaloEntreWaves = 5f;
    [SerializeField] GameObject prefabInimigo;

    Vector2 scroll;

    // O atributo MenuItem cria a entrada no menu superior do Unity.
    // O atalho %#w eh Ctrl+Shift+W (Cmd+Shift+W no Mac).
    [MenuItem("Ferramentas/Gerenciador de Waves %#w")]
    public static void Abrir()
    {
        // GetWindow cria a janela ou foca uma existente.
        var janela = GetWindow<GerenciadorWaves>("Waves");
        janela.minSize = new Vector2(320, 200);
    }

    void OnGUI()
    {
        scroll = EditorGUILayout.BeginScrollView(scroll);

        EditorGUILayout.LabelField("Configuracao", EditorStyles.boldLabel);

        numeroWaves = EditorGUILayout.IntSlider("Numero de Waves", numeroWaves, 1, 20);
        intervaloEntreWaves = EditorGUILayout.FloatField("Intervalo (s)", intervaloEntreWaves);
        prefabInimigo = (GameObject)EditorGUILayout.ObjectField(
            "Prefab Inimigo", prefabInimigo, typeof(GameObject), false);

        EditorGUILayout.Space();

        // Desabilita o botao se faltar configuracao essencial.
        using (new EditorGUI.DisabledScope(prefabInimigo == null))
        {
            if (GUILayout.Button("Gerar Waves na Cena"))
            {
                GerarWaves();
            }
        }

        if (prefabInimigo == null)
        {
            EditorGUILayout.HelpBox("Arraste um prefab para liberar a geracao.", MessageType.Info);
        }

        EditorGUILayout.EndScrollView();
    }

    void GerarWaves()
    {
        // Cria um pai para organizar.
        var pai = new GameObject("Waves Geradas");
        // Registra para Ctrl+Z funcionar desfazendo a operacao inteira.
        Undo.RegisterCreatedObjectUndo(pai, "Gerar Waves");

        for (int i = 0; i < numeroWaves; i++)
        {
            var wave = new GameObject($"Wave {i + 1}");
            wave.transform.SetParent(pai.transform);
            // PrefabUtility mantem a ligacao com o prefab original.
            var instancia = (GameObject)PrefabUtility.InstantiatePrefab(prefabInimigo, wave.transform);
            instancia.transform.localPosition = new Vector3(i * 2f, 0, 0);
            Undo.RegisterCreatedObjectUndo(instancia, "Gerar Waves");
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Janela com abas (Tabs) para organizar varias ferramentas no mesmo lugar.
using UnityEditor;
using UnityEngine;

public class CaixaDeFerramentas : EditorWindow
{
    [MenuItem("Ferramentas/Caixa de Ferramentas")]
    public static void Abrir() => GetWindow<CaixaDeFerramentas>("Ferramentas");

    enum Aba { Cena, Assets, Build }
    Aba abaAtual = Aba.Cena;

    void OnGUI()
    {
        // Toolbar nativa do editor para trocar de aba.
        abaAtual = (Aba)GUILayout.Toolbar((int)abaAtual, new[] { "Cena", "Assets", "Build" });
        EditorGUILayout.Space();

        switch (abaAtual)
        {
            case Aba.Cena:
                if (GUILayout.Button("Selecionar todas as cameras"))
                {
                    Selection.objects = FindObjectsByType<Camera>(FindObjectsSortMode.None);
                }
                break;

            case Aba.Assets:
                if (GUILayout.Button("Refresh do Asset Database"))
                {
                    AssetDatabase.Refresh();
                }
                break;

            case Aba.Build:
                EditorGUILayout.LabelField("Plataforma atual:",
                    EditorUserBuildSettings.activeBuildTarget.ToString());
                if (GUILayout.Button("Abrir Build Settings"))
                {
                    EditorWindow.GetWindow(System.Type.GetType("UnityEditor.BuildPlayerWindow,UnityEditor"));
                }
                break;
        }
    }
}`,
      },
    ],
    points: [
      "EditorWindow é a base de toda janela acoplável no Unity, incluindo Inspector e Console.",
      "Crie um método estático com [MenuItem] que chama GetWindow<T>() para abrir.",
      "Marque campos persistentes como [SerializeField] para sobreviver à recompilação de scripts.",
      "Use OnGUI para desenhar com a API IMGUI (mesma do Inspector customizado).",
      "Defina minSize para evitar que o usuário esconda controles importantes.",
      "Registre Undo (Undo.RegisterCreatedObjectUndo) ao criar objetos pela ferramenta.",
      "EditorWindow é independente; CustomEditor depende de um componente selecionado.",
      "Não crie uma janela para cada coisinha; comece simples e cresça pela dor real do time.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Os modificadores de atalho do MenuItem são: % = Ctrl/Cmd, # = Shift, & = Alt. Por exemplo, %#t vira Ctrl+Shift+T. Use com parcimônia para não conflitar com atalhos nativos do Unity.",
      },
      {
        type: "warning",
        content: "Variáveis sem [SerializeField] em uma EditorWindow podem ser zeradas a qualquer recompilação de script (qualquer Ctrl+S em arquivo .cs). Se você está perdendo estado, este é quase sempre o motivo.",
      },
      {
        type: "info",
        content: "A partir do Unity 2020 dá para escrever EditorWindow com UI Toolkit (UXML + USS) em vez de IMGUI. UXML é mais reativo e moderno, mas tem curva de aprendizado maior. Para ferramentas internas rápidas, IMGUI ainda é o caminho mais produtivo.",
      },
    ],
  },
  {
    slug: "gizmos-handles",
    section: "editor-tools",
    title: "Gizmos e Handles: visualização e manipulação na Scene View",
    difficulty: "avancado",
    subtitle: "Desenhe ajudas visuais e controles arrastáveis diretamente no viewport do editor.",
    intro: `Quando você seleciona uma luz no Unity, vê um símbolo de sol amarelo no viewport. Quando seleciona uma câmera, aparece o tronco da pirâmide de visão. Quando seleciona um Collider, aparece o contorno verde. Nada disso existe no jogo final. São desenhos que o Unity faz só dentro do editor, para você entender espacialmente o que aquele objeto invisível representa. Esse sistema se chama Gizmos, e você pode usá-lo nos seus próprios componentes.

A diferença entre OnDrawGizmos e OnDrawGizmosSelected é simples: o primeiro desenha sempre, mesmo quando o objeto não está selecionado; o segundo só quando o objeto está selecionado. Use o segundo por padrão. Gizmos desenhados sempre poluem a Scene View se houver muitos objetos do mesmo tipo no mapa, e isso atrapalha quem está editando o nível. Reserve OnDrawGizmos para coisas que precisam ser vistas mesmo de longe (como rotas de patrulha de IA) e use OnDrawGizmosSelected para o resto.

Gizmos são apenas para visualização: linhas, esferas, cubos, ícones. Não dá para clicar e arrastar um Gizmo. Para isso existe o sistema de Handles, que é uma camada acima. Handles são interativos: a seta do Move Tool, o anel do Rotate Tool e o cubo do Scale Tool são todos Handles internos do Unity. Quando você quer expor um valor (uma posição, um raio, um ângulo) para o designer ajustar visualmente em vez de digitar números no Inspector, é Handles que você quer.

Handles vivem dentro de um Editor customizado, no método OnSceneGUI. Esse método é chamado pelo Unity sempre que a Scene View redesenha e o componente correspondente está selecionado. A partir daí você pode usar Handles.PositionHandle para desenhar a setinha de mover, Handles.RadiusHandle para um anel de raio, Handles.Label para escrever texto flutuante. Cada controle retorna o valor novo após o usuário arrastar, e cabe a você guardar essa mudança usando o padrão EditorGUI.BeginChangeCheck / EndChangeCheck junto com Undo.RecordObject.

A pegadinha clássica de Gizmos é a cor. Gizmos.color é uma variável global compartilhada por todos. Se você define vermelho num componente e esquece de resetar, todos os Gizmos depois vão ser vermelhos. Sempre salve a cor antes (var anterior = Gizmos.color) e restaure no final. Outro detalhe: a matriz Gizmos.matrix permite desenhar em coordenadas locais do objeto, o que simplifica muito quando o GameObject está rotacionado ou escalado. Ferramentas que parecem mágica geralmente abusam dessas duas variáveis.`,
    codes: [
      {
        lang: "csharp",
        code: `// Arquivo: Assets/Scripts/AreaPatrulha.cs
// Componente que define uma area circular onde um inimigo patrulha.
using UnityEngine;

public class AreaPatrulha : MonoBehaviour
{
    public float raio = 5f;
    public Color cor = new Color(0f, 1f, 0f, 0.25f);
    public Vector3[] pontos = new Vector3[0];

    // Desenhado SEMPRE, mesmo quando o objeto nao esta selecionado.
    // Usado para mostrar rotas que precisam ser vistas mesmo de longe.
    void OnDrawGizmos()
    {
        if (pontos == null || pontos.Length < 2) return;

        // Salva a cor atual e restaura no final (boa pratica).
        Color anterior = Gizmos.color;
        Gizmos.color = Color.yellow;

        for (int i = 0; i < pontos.Length - 1; i++)
        {
            Gizmos.DrawLine(transform.position + pontos[i],
                            transform.position + pontos[i + 1]);
        }

        Gizmos.color = anterior;
    }

    // Desenhado SO quando o objeto esta selecionado.
    // Use isto para detalhes que so importam durante a edicao.
    void OnDrawGizmosSelected()
    {
        Color anterior = Gizmos.color;
        Gizmos.color = cor;
        // DrawSphere desenha solido; DrawWireSphere desenha so o contorno.
        Gizmos.DrawSphere(transform.position, raio);
        Gizmos.color = anterior;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Arquivo: Assets/Scripts/Editor/AreaPatrulhaEditor.cs
// Editor customizado que adiciona Handles interativos na Scene View.
using UnityEditor;
using UnityEngine;

[CustomEditor(typeof(AreaPatrulha))]
public class AreaPatrulhaEditor : Editor
{
    void OnSceneGUI()
    {
        var area = (AreaPatrulha)target;

        // Handle de raio: mostra um anel arrastavel ao redor do objeto.
        EditorGUI.BeginChangeCheck();
        float novoRaio = Handles.RadiusHandle(
            Quaternion.identity,
            area.transform.position,
            area.raio);

        if (EditorGUI.EndChangeCheck())
        {
            // Registra Undo antes de modificar.
            Undo.RecordObject(area, "Mudar raio de patrulha");
            area.raio = novoRaio;
            // Marca como modificado para o Unity salvar.
            EditorUtility.SetDirty(area);
        }

        // Label flutuante perto do objeto.
        Handles.Label(area.transform.position + Vector3.up * (area.raio + 0.5f),
                      $"Raio: {area.raio:F2} m");

        // Handles de posicao para cada ponto da patrulha.
        if (area.pontos == null) return;

        for (int i = 0; i < area.pontos.Length; i++)
        {
            EditorGUI.BeginChangeCheck();
            Vector3 worldPos = area.transform.position + area.pontos[i];
            Vector3 novaPos = Handles.PositionHandle(worldPos, Quaternion.identity);

            if (EditorGUI.EndChangeCheck())
            {
                Undo.RecordObject(area, "Mover ponto de patrulha");
                area.pontos[i] = novaPos - area.transform.position;
                EditorUtility.SetDirty(area);
            }

            Handles.Label(worldPos, $"P{i}");
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Truque avancado: Gizmos.matrix para desenhar em espaco LOCAL do objeto.
// Sem isso, voce precisa transformar cada ponto manualmente.
using UnityEngine;

public class CaixaDeColisaoCustomizada : MonoBehaviour
{
    public Vector3 tamanho = new Vector3(2, 1, 2);
    public Vector3 centroLocal = Vector3.zero;

    void OnDrawGizmosSelected()
    {
        Color corAnterior = Gizmos.color;
        Matrix4x4 matrizAnterior = Gizmos.matrix;

        // A partir daqui, todo desenho usa as coordenadas LOCAIS do objeto.
        // Posicao, rotacao e escala do transform sao aplicadas automaticamente.
        Gizmos.matrix = transform.localToWorldMatrix;
        Gizmos.color = new Color(1f, 0.5f, 0f, 0.3f);

        // Os valores aqui sao em espaco local, simples de pensar.
        Gizmos.DrawCube(centroLocal, tamanho);
        Gizmos.color = Color.white;
        Gizmos.DrawWireCube(centroLocal, tamanho);

        // Restaura sempre, senao quebra os Gizmos de outros componentes.
        Gizmos.matrix = matrizAnterior;
        Gizmos.color = corAnterior;
    }
}`,
      },
    ],
    points: [
      "OnDrawGizmos desenha sempre; OnDrawGizmosSelected só com o objeto selecionado.",
      "Gizmos são apenas visuais; para interação use Handles dentro de OnSceneGUI.",
      "Handles vivem dentro de uma classe Editor (com [CustomEditor]).",
      "Use BeginChangeCheck/EndChangeCheck + Undo.RecordObject para registrar mudanças.",
      "Sempre salve e restaure Gizmos.color e Gizmos.matrix para não vazar estado.",
      "Gizmos.matrix = transform.localToWorldMatrix permite desenhar em coordenadas locais.",
      "Handles.Label é ótimo para mostrar valores em tempo real ao lado do objeto.",
      "Gizmos não aparecem em build; é seguro deixar nos seus scripts de gameplay.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Esquecer de restaurar Gizmos.color e Gizmos.matrix é um dos bugs mais difíceis de rastrear: o Gizmo do seu colega fica vermelho misteriosamente porque o seu componente alterou e não voltou. Use blocos try/finally se a função for complexa.",
      },
      {
        type: "tip",
        content: "Você pode ligar e desligar Gizmos por tipo de componente no botão Gizmos no topo da Scene View. Útil para iniciantes que se assustam ao ver tudo desenhado de uma vez em uma cena cheia.",
      },
      {
        type: "info",
        content: "Existe também Gizmos.DrawIcon, que mostra um sprite na posição do objeto. É como o Unity desenha o ícone de luz e câmera. Coloque o PNG em Assets/Gizmos/ e referencie pelo nome do arquivo.",
      },
    ],
  },
  {
    slug: "propertydrawer",
    section: "editor-tools",
    title: "PropertyDrawer: desenhando atributos customizados",
    difficulty: "avancado",
    subtitle: "Crie atributos reutilizáveis que mudam como qualquer campo é desenhado no Inspector.",
    intro: `O atributo [Range(0, 100)] que você usa para colocar um slider em um campo float não tem nada de mágico: existe uma classe RangeDrawer dentro do Unity que descreve como desenhar campos marcados com esse atributo. PropertyDrawer é o nome dessa categoria de extensões. Ela permite que você crie atributos próprios que mudam o desenho de qualquer campo, em qualquer componente, sem precisar escrever um Editor inteiro para cada classe.

A vantagem é a reutilização. Imagine que você quer um atributo [PorcentagemMaxima] que mostra um slider de 0 a 1 e exibe o valor formatado como percentual ao lado. Sem PropertyDrawer, você teria que escrever esse desenho em todo Inspector customizado dos componentes que usam esse campo. Com PropertyDrawer, você escreve uma vez e usa em todo lugar com [PorcentagemMaxima]. É a mesma filosofia de [Header] e [Tooltip], só que com a sua lógica.

Existem dois tipos parecidos mas diferentes: PropertyDrawer e DecoratorDrawer. PropertyDrawer está ligado a um campo (modifica como o valor é apresentado e editado). DecoratorDrawer está ligado ao espaço entre campos (adiciona linhas, espaços, títulos, sem modificar valor). [Header] é um DecoratorDrawer; [Range] é um PropertyDrawer. Para 95% dos casos, você quer PropertyDrawer.

A estrutura é simples: você cria duas classes. A primeira é o atributo em si, herdando de PropertyAttribute, que pode receber parâmetros no construtor. A segunda é o drawer, marcado com [CustomPropertyDrawer(typeof(SeuAtributo))], que sobrescreve OnGUI e desenha o controle. Importante: o drawer mora dentro de uma pasta Editor; o atributo, não. O atributo precisa estar acessível para os componentes do jogo, então fica fora.

Use PropertyDrawer quando o mesmo padrão visual aparece em vários componentes diferentes. Não use para casos únicos: se o campo só existe em um lugar, faça um Inspector custom direto, é menos código. Outra hora ótima para PropertyDrawer é quando você cria classes serializáveis próprias (como uma struct Wave com vários campos) e quer um desenho compacto delas no Inspector. Aí o [CustomPropertyDrawer(typeof(Wave))] entra sem nem precisar de atributo.`,
    codes: [
      {
        lang: "csharp",
        code: `// Arquivo: Assets/Scripts/Atributos/PorcentagemAttribute.cs
// Atributo PUBLICO. Fica fora da pasta Editor porque scripts de jogo usam.
using UnityEngine;

public class PorcentagemAttribute : PropertyAttribute
{
    public readonly float min;
    public readonly float max;
    public readonly bool mostrarPercentual;

    public PorcentagemAttribute(float min = 0f, float max = 1f, bool mostrarPercentual = true)
    {
        this.min = min;
        this.max = max;
        this.mostrarPercentual = mostrarPercentual;
    }
}

// Exemplo de uso em qualquer MonoBehaviour:
// [Porcentagem(0f, 1f)]
// public float chanceDeCritico = 0.15f;`,
      },
      {
        lang: "csharp",
        code: `// Arquivo: Assets/Scripts/Editor/PorcentagemDrawer.cs
// O DRAWER mora em pasta Editor (nao vai para a build).
using UnityEditor;
using UnityEngine;

[CustomPropertyDrawer(typeof(PorcentagemAttribute))]
public class PorcentagemDrawer : PropertyDrawer
{
    public override void OnGUI(Rect position, SerializedProperty property, GUIContent label)
    {
        // Pega a referencia tipada do atributo aplicado.
        var attr = (PorcentagemAttribute)attribute;

        // PropertyDrawer so funciona para tipos compativeis. Validamos.
        if (property.propertyType != SerializedPropertyType.Float)
        {
            EditorGUI.LabelField(position, label.text,
                "Use [Porcentagem] apenas em float.");
            return;
        }

        // Inicia uma "sessao" de propriedade para multi-edit funcionar.
        EditorGUI.BeginProperty(position, label, property);

        // Divide o retangulo em duas partes: slider grande e label pequeno.
        Rect sliderRect = new Rect(position.x, position.y,
                                   position.width - 50, position.height);
        Rect labelRect = new Rect(position.x + position.width - 45, position.y,
                                  45, position.height);

        // Slider que ja respeita Undo automaticamente.
        property.floatValue = EditorGUI.Slider(sliderRect, label,
            property.floatValue, attr.min, attr.max);

        // Texto a direita: percentual ou valor cru.
        if (attr.mostrarPercentual)
        {
            EditorGUI.LabelField(labelRect, $"{property.floatValue * 100f:F1}%");
        }
        else
        {
            EditorGUI.LabelField(labelRect, $"{property.floatValue:F2}");
        }

        EditorGUI.EndProperty();
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Exemplo: PropertyDrawer para uma STRUCT serializavel propria.
// Aqui nao usamos atributo: o drawer eh aplicado diretamente ao tipo.
using System;
using UnityEngine;

[Serializable]
public struct Wave
{
    public string nome;
    public int quantidadeInimigos;
    public float intervaloSpawn;
}

public class GerenciadorOnda : MonoBehaviour
{
    public Wave[] waves; // sera desenhado pelo drawer abaixo
}`,
      },
      {
        lang: "csharp",
        code: `// Arquivo: Assets/Scripts/Editor/WaveDrawer.cs
using UnityEditor;
using UnityEngine;

[CustomPropertyDrawer(typeof(Wave))]
public class WaveDrawer : PropertyDrawer
{
    public override void OnGUI(Rect position, SerializedProperty property, GUIContent label)
    {
        EditorGUI.BeginProperty(position, label, property);

        // Reduz a indentacao para alinhar com o label principal.
        int indentAnterior = EditorGUI.indentLevel;
        EditorGUI.indentLevel = 0;

        float largura = position.width / 3f;
        Rect r1 = new Rect(position.x,                position.y, largura - 4, position.height);
        Rect r2 = new Rect(position.x + largura,      position.y, largura - 4, position.height);
        Rect r3 = new Rect(position.x + 2 * largura,  position.y, largura - 4, position.height);

        EditorGUI.PropertyField(r1, property.FindPropertyRelative("nome"), GUIContent.none);
        EditorGUI.PropertyField(r2, property.FindPropertyRelative("quantidadeInimigos"), GUIContent.none);
        EditorGUI.PropertyField(r3, property.FindPropertyRelative("intervaloSpawn"), GUIContent.none);

        EditorGUI.indentLevel = indentAnterior;
        EditorGUI.EndProperty();
    }
}`,
      },
    ],
    points: [
      "PropertyDrawer reutiliza um padrão visual em vários Inspectors sem repetir código.",
      "O atributo herda de PropertyAttribute e fica em pasta normal (não Editor).",
      "O drawer herda de PropertyDrawer, é marcado com [CustomPropertyDrawer] e fica em /Editor.",
      "Sempre envolva o desenho em EditorGUI.BeginProperty/EndProperty para multi-edit funcionar.",
      "Valide property.propertyType antes de assumir que é o tipo esperado.",
      "Você pode aplicar PropertyDrawer direto a uma struct serializável, sem atributo.",
      "Para alterar altura, sobrescreva também GetPropertyHeight.",
      "DecoratorDrawer é para enfeites entre campos; PropertyDrawer para o campo em si.",
    ],
    alerts: [
      {
        type: "warning",
        content: "PropertyDrawer não funciona com listas/arrays do tipo customizado em versões antigas do Unity (anterior a 2020.1) sem o pacote UI Toolkit. Em Unity moderno funciona, mas se você está em LTS antigo, teste antes de assumir que vai cobrir o caso de array.",
      },
      {
        type: "tip",
        content: "Para drawers com altura variável (mostrar mais ou menos linhas dependendo de algo), sobrescreva GetPropertyHeight retornando EditorGUIUtility.singleLineHeight * numeroDeLinhas + espaçamento. Sem isso, o drawer corta ou sobrepõe o próximo campo.",
      },
      {
        type: "info",
        content: "O atributo [SerializeReference] (Unity 2019.3+) abre um mundo paralelo de PropertyDrawers para classes polimórficas. Vale estudar quando você precisa de hierarquias serializáveis no Inspector.",
      },
    ],
  },
  {
    slug: "asset-postprocessor",
    section: "editor-tools",
    title: "AssetPostprocessor: automatizando importação de assets",
    difficulty: "avancado",
    subtitle: "Aplique configurações automaticamente toda vez que um asset entra no projeto.",
    intro: `Todo time que cresce passa pela mesma dor: alguém arrasta uma textura para o projeto e esquece de marcar como Sprite, ou importa um modelo 3D com escala errada, ou deixa um áudio em estéreo quando deveria ser mono. Multiplique isso por 200 assets por semana e você tem uma bagunça que come horas de revisão. AssetPostprocessor é a resposta automatizada do Unity para esse problema. É um sistema de hooks que roda toda vez que um asset é importado, permitindo configurar e validar automaticamente.

A ideia é simples: você cria uma classe que herda de AssetPostprocessor (em pasta Editor) e implementa métodos com nomes específicos como OnPreprocessTexture, OnPreprocessModel, OnPreprocessAudio, OnPostprocessAllAssets. O Unity reconhece esses nomes mágicos e chama no momento certo. Pre-process roda antes do asset ser importado: é onde você muda configurações (compressão, max size, tipo de textura) que afetam o resultado. Post-process roda depois: serve para validar, mover para outra pasta, ou reportar erros.

Uma analogia útil é uma esteira de fábrica. O asset entra cru pela esteira; cada estação (cada AssetPostprocessor) faz uma operação. Texturas com nome terminando em _N viram normal map; modelos dentro de Personagens/ recebem rig humanoide; sprites em UI/ ficam com point filtering. Isso transforma a importação em algo previsível e padronizado, e elimina a perda de tempo com configurações repetitivas.

Tem uma pegadinha grande: as mudanças que você faz em OnPreprocess** alteram o assetImporter, não o asset final. Não tente acessar a textura ou o mesh nesse momento, porque eles ainda não existem. Use OnPostprocess** para olhar o resultado pronto. E cuidado com performance: se sua lógica é pesada (faz I/O em disco, chama Internet), ela vai tornar a reimportação do projeto inteira lenta. Mantenha lógica de postprocessor simples e rápida.

Use AssetPostprocessor quando o time importa muitos assets parecidos e você quer impor um padrão sem depender da memória de cada um. Combine com convenções de nome de pasta ou de arquivo (como _N para normal, _R para roughness) para deixar a regra explícita. Não use postprocessor para coisas que precisam de decisão humana, porque ele vai sobrescrever e frustrar quem está editando manualmente.`,
    codes: [
      {
        lang: "csharp",
        code: `// Arquivo: Assets/Editor/TexturasPreprocessor.cs
// Aplica regras automaticas em texturas baseado em pasta e nome.
using UnityEditor;
using UnityEngine;

public class TexturasPreprocessor : AssetPostprocessor
{
    // Chamado ANTES da textura ser de fato importada.
    void OnPreprocessTexture()
    {
        // 'assetImporter' eh herdado da classe base. Aqui sera TextureImporter.
        var importer = (TextureImporter)assetImporter;

        // Regra 1: tudo dentro de Assets/Sprites/ vira Sprite 2D.
        if (assetPath.Contains("/Sprites/"))
        {
            importer.textureType = TextureImporterType.Sprite;
            importer.spriteImportMode = SpriteImportMode.Single;
            importer.filterMode = FilterMode.Point;
            importer.mipmapEnabled = false;
        }

        // Regra 2: arquivos terminando em _N sao normal maps.
        if (assetPath.EndsWith("_N.png") || assetPath.EndsWith("_N.jpg"))
        {
            importer.textureType = TextureImporterType.NormalMap;
        }

        // Regra 3: texturas dentro de UI/ devem ter alpha respeitado.
        if (assetPath.Contains("/UI/"))
        {
            importer.alphaIsTransparency = true;
            importer.maxTextureSize = 512;
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Arquivo: Assets/Editor/ModelosPreprocessor.cs
// Padroniza importacao de FBX e modelos.
using UnityEditor;
using UnityEngine;

public class ModelosPreprocessor : AssetPostprocessor
{
    void OnPreprocessModel()
    {
        var importer = (ModelImporter)assetImporter;

        // Modelos dentro de Personagens/ ja recebem rig humanoide.
        if (assetPath.Contains("/Personagens/"))
        {
            importer.animationType = ModelImporterAnimationType.Human;
            importer.optimizeGameObjects = true;
        }

        // Modelos de cenario nao precisam de animacao nem materiais embutidos.
        if (assetPath.Contains("/Cenario/"))
        {
            importer.animationType = ModelImporterAnimationType.None;
            importer.materialImportMode = ModelImporterMaterialImportMode.None;
            importer.importBlendShapes = false;
            // Escala global comum para FBX exportado de Blender.
            importer.globalScale = 1f;
        }

        // Sempre desliga camera e luzes vindas do FBX (causam confusao).
        importer.importCameras = false;
        importer.importLights = false;
    }

    // Roda DEPOIS, com o GameObject final ja construido.
    void OnPostprocessModel(GameObject raiz)
    {
        // Exemplo: garantir que todos os MeshRenderer projetam sombra.
        foreach (var mr in raiz.GetComponentsInChildren<MeshRenderer>())
        {
            mr.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.On;
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// AssetPostprocessor "global" que reage a qualquer mudanca no projeto.
// Util para logs, mover arquivos automaticamente, ou avisar sobre nomes ruins.
using UnityEditor;
using UnityEngine;

public class GuardiaoDeAssets : AssetPostprocessor
{
    static void OnPostprocessAllAssets(
        string[] importados,
        string[] deletados,
        string[] movidos,
        string[] caminhosAntigos)
    {
        foreach (var caminho in importados)
        {
            // Avisa quem colocou textura em pasta errada.
            if (caminho.EndsWith(".png") && !caminho.Contains("/Sprites/")
                && !caminho.Contains("/Texturas/") && !caminho.Contains("/UI/"))
            {
                Debug.LogWarning(
                    $"[GuardiaoDeAssets] Textura fora de pasta padrao: {caminho}");
            }

            // Avisa nomes com espaco (causam problemas em build em algumas plataformas).
            string nomeArquivo = System.IO.Path.GetFileName(caminho);
            if (nomeArquivo.Contains(" "))
            {
                Debug.LogWarning(
                    $"[GuardiaoDeAssets] Asset com espaco no nome: {caminho}");
            }
        }
    }
}`,
      },
    ],
    points: [
      "AssetPostprocessor herda de uma classe base e usa nomes mágicos como OnPreprocessTexture.",
      "OnPreprocess** modifica o assetImporter; OnPostprocess** mexe no resultado já pronto.",
      "Combine com convenções de pasta e sufixo de nome para ter regras claras.",
      "Use OnPostprocessAllAssets para reagir globalmente a qualquer mudança no projeto.",
      "Mantenha a lógica leve para não tornar reimportações dolorosas.",
      "Não use para configurações que precisam de decisão caso a caso.",
      "Reimporte (Right Click → Reimport) para aplicar as regras a assets já existentes.",
      "Mude as regras com cuidado: pode disparar reimportação de centenas de arquivos.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Para aplicar uma regra recém-criada a assets antigos, faça Right Click no asset (ou pasta) → Reimport. O Unity só roda o postprocessor automaticamente quando o asset entra ou muda.",
      },
      {
        type: "warning",
        content: "Não tente acessar property.GetTexture() ou similares dentro de OnPreprocessTexture. O recurso ainda não existe; você só configura o importer. Use OnPostprocessTexture(Texture2D textura) se precisar do resultado final.",
      },
      {
        type: "info",
        content: "Em projetos grandes, considere desabilitar regras temporariamente (com uma EditorPref ou flag) ao importar grandes lotes vindos de outros times, para evitar que processamento custoso atrase o trabalho.",
      },
    ],
  },
  {
    slug: "package-manager",
    section: "editor-tools",
    title: "Package Manager: organizando dependências do projeto",
    difficulty: "avancado",
    subtitle: "Use packages oficiais, locais e do Git para modularizar e versionar seu código.",
    intro: `Antigamente, todo código de Unity vivia solto dentro da pasta Assets. Se você queria reutilizar um sistema entre projetos, copiava as pastas no braço, e quando atualizava um lado o outro ficava desatualizado. Era doloroso. A partir do Unity 2018, surgiu o Package Manager (UPM), uma forma estruturada de declarar dependências do projeto, parecida com o npm do JavaScript ou o pip do Python. Hoje quase todas as funcionalidades novas do Unity são entregues como packages: URP, Cinemachine, Input System, ProBuilder, Timeline.

A peça central é um arquivo chamado Packages/manifest.json. Ele lista todos os pacotes que o projeto usa, com nome e versão. Ao abrir o projeto, o Unity baixa as versões certas e coloca dentro de Library/PackageCache (não em Assets, justamente para você não ficar editando código que pertence a outro projeto). O resultado é que o seu Assets fica limpo, contendo só os scripts, cenas e arte do seu jogo.

Existem três fontes principais de pacotes. A primeira é o Unity Registry, com pacotes oficiais e verificados. A segunda é Git: você pode declarar uma URL e o Unity clona o repositório como pacote. A terceira é local: aponta para uma pasta no disco. Local é ouro durante o desenvolvimento de uma biblioteca interna, porque você edita e o Unity recarrega na hora. Git é o que você usa para empacotar bibliotecas internas que o time inteiro consome.

Para que uma pasta seja um pacote válido, ela precisa de um arquivo package.json no formato esperado, com pelo menos name e version. O nome deve seguir o padrão de domínio reverso (com.suaempresa.suaferramenta) e a versão segue o SemVer (1.0.0, 1.2.3-preview.1). Adicionar Assembly Definitions é praticamente obrigatório, porque sem elas o pacote vai bater de frente com nomes do projeto principal.

Use packages internos quando o mesmo código aparece em mais de um projeto da empresa, ou quando você quer separar a evolução de uma parte estável (uma biblioteca de utilidades, um sistema de rede) do resto do jogo. Não converta tudo em package: o overhead de manter changelog, versionar e atualizar não compensa para sistemas pequenos que só serão usados naquele projeto. A regra é: package quando o reuso ou a estabilidade compensam o custo administrativo.`,
    codes: [
      {
        lang: "json",
        code: `{
  "dependencies": {
    "com.unity.render-pipelines.universal": "14.0.11",
    "com.unity.cinemachine": "2.10.1",
    "com.unity.inputsystem": "1.7.0",
    "com.unity.ide.visualstudio": "2.0.22",
    "com.unity.timeline": "1.7.6",

    "com.minhaempresa.utilidades": "file:../packages/utilidades",

    "com.minhaempresa.rede": "https://github.com/minhaempresa/unity-rede.git#v1.2.0"
  },
  "scopedRegistries": [
    {
      "name": "OpenUPM",
      "url": "https://package.openupm.com",
      "scopes": [
        "com.openupm",
        "com.coffee"
      ]
    }
  ]
}`,
      },
      {
        lang: "json",
        code: `{
  "name": "com.minhaempresa.utilidades",
  "version": "1.0.0",
  "displayName": "Utilidades da Empresa",
  "description": "Conjunto de helpers compartilhados entre projetos: extensoes de Vector, pool de objetos, eventos genericos.",
  "unity": "2022.3",
  "author": {
    "name": "Time de Tecnologia",
    "email": "tech@minhaempresa.com"
  },
  "dependencies": {
    "com.unity.mathematics": "1.2.6"
  },
  "keywords": ["utilities", "helpers", "internal"]
}`,
      },
      {
        lang: "json",
        code: `{
  "name": "MinhaEmpresa.Utilidades",
  "rootNamespace": "MinhaEmpresa.Utilidades",
  "references": [
    "GUID:e0cd26848372d4e5c891c569017e11f1"
  ],
  "includePlatforms": [],
  "excludePlatforms": [],
  "allowUnsafeCode": false,
  "overrideReferences": false,
  "precompiledReferences": [],
  "autoReferenced": true,
  "defineConstraints": [],
  "versionDefines": [],
  "noEngineReferences": false
}`,
      },
      {
        lang: "bash",
        code: `# Estrutura tipica de um pacote local na pasta packages/utilidades/
# (fora do Assets do projeto consumidor)

packages/utilidades/
  package.json                       # metadata do pacote
  README.md
  CHANGELOG.md
  LICENSE.md
  Runtime/
    MinhaEmpresa.Utilidades.asmdef   # Assembly Definition de Runtime
    Extensions/
      VectorExtensions.cs
      StringExtensions.cs
    Pool/
      ObjectPool.cs
  Editor/
    MinhaEmpresa.Utilidades.Editor.asmdef
    Inspectors/
      PoolInspector.cs
  Tests/
    Runtime/
      MinhaEmpresa.Utilidades.Tests.asmdef
      VectorExtensionsTests.cs

# Para usar localmente, no manifest.json do projeto consumidor:
# "com.minhaempresa.utilidades": "file:../packages/utilidades"

# Para versionar via Git:
# git tag v1.0.0
# git push origin v1.0.0
# E no manifest:
# "com.minhaempresa.utilidades": "https://github.com/empresa/utilidades.git#v1.0.0"`,
      },
      {
        lang: "csharp",
        code: `// Exemplo de codigo dentro do pacote, em Runtime/Extensions/VectorExtensions.cs
using UnityEngine;

namespace MinhaEmpresa.Utilidades
{
    public static class VectorExtensions
    {
        // Retorna o Vector3 com Y zerado (util para mover so no plano XZ).
        public static Vector3 NoChao(this Vector3 v) => new Vector3(v.x, 0f, v.z);

        // Distancia ignorando o eixo vertical.
        public static float DistanciaPlana(this Vector3 a, Vector3 b)
        {
            return Vector3.Distance(a.NoChao(), b.NoChao());
        }
    }
}

// Em qualquer projeto que importar o pacote, basta:
// using MinhaEmpresa.Utilidades;
// transform.position.NoChao();`,
      },
    ],
    points: [
      "Packages/manifest.json declara todas as dependências do projeto Unity.",
      "Pacotes ficam em Library/PackageCache, fora do Assets, para evitar edição acidental.",
      "Nome de pacote segue domínio reverso (com.suaempresa.suaferramenta) e versão segue SemVer.",
      "Três fontes: Unity Registry, Git (com tags) e file: para pacotes locais.",
      "Adicionar Assembly Definitions evita conflitos de nome com o código do projeto.",
      "Pacotes locais (file:) recarregam na hora; ótimos para desenvolvimento.",
      "scopedRegistries permite usar repositórios externos como OpenUPM.",
      "Package só compensa quando há reuso real ou separação clara de estabilidade.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Para versionar pacotes via Git, sempre use tags (#v1.0.0). Apontar para um branch faz o Unity puxar o último commit a cada Resolve, e isso quebra builds de forma imprevisível em diferentes máquinas do time.",
      },
      {
        type: "warning",
        content: "Nunca edite arquivos dentro de Library/PackageCache. Eles são deletados e recriados quando o Unity faz Resolve. Se precisa modificar um pacote oficial, use o botão 'Embed' no Package Manager para movê-lo para Packages/ (aí vira parte do projeto e pode ser editado).",
      },
      {
        type: "info",
        content: "OpenUPM (openupm.com) é um registro comunitário com centenas de pacotes open source para Unity. Use scopedRegistries no manifest para ter acesso. Útil para encontrar bibliotecas que não estão no registro oficial da Unity.",
      },
    ],
  },
];
