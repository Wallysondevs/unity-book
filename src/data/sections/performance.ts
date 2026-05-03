import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "profiler",
    section: "performance",
    title: "Profiler: medir antes de otimizar",
    difficulty: "avancado",
    subtitle: "Como usar o Unity Profiler para descobrir onde seu jogo está gastando tempo de verdade.",
    intro: `Otimizar sem medir é como tentar emagrecer no escuro: você corta coisas no chute e quase sempre erra. Existe uma frase clássica na engenharia de software, atribuída a Donald Knuth, que diz que otimização prematura é a raiz de todo mal. No Unity isso é especialmente verdade, porque a engine faz tantas coisas por trás dos panos (renderização, física, áudio, animação, scripts, garbage collector) que adivinhar qual delas está pesando é praticamente loteria. O Profiler existe justamente para tirar essa adivinhação do caminho.

O Profiler do Unity é uma janela (Window > Analysis > Profiler) que grava, frame a frame, quanto tempo cada subsistema gastou em milissegundos. Pense nele como um eletrocardiograma do seu jogo. Se um frame durou 33 ms (ou seja, você está rodando a 30 FPS) e você quer chegar a 60 FPS, precisa baixar para no máximo 16,6 ms por frame. O Profiler te mostra exatamente quem está consumindo esses milissegundos: o seu Update, a renderização, a física, o garbage collector ou um asset gigante carregando do disco.

Ele se divide em módulos: CPU Usage mostra o tempo gasto em cada função do seu código e da engine; GPU Usage mostra o que a placa de vídeo está fazendo; Memory mostra alocações de heap, texturas, meshes e vazamentos; Rendering mostra draw calls, batches e triângulos; Audio mostra vozes simultâneas e DSP; Physics mostra colisões e raycasts. Cada módulo conta uma parte da história, e juntos eles te dão o diagnóstico completo.

A regra de ouro é: nunca otimize no editor sem antes rodar no dispositivo final. Um frame que dura 8 ms no seu PC pode durar 40 ms num celular Android intermediário. Use Build And Run com Development Build e Autoconnect Profiler ligados, conecte o cabo USB e meça lá. O editor adiciona uma sobrecarga enorme (chamada de overhead do editor) que distorce os números. Quem otimiza só no editor está otimizando um jogo que ninguém vai jogar.`,
    codes: [
      {
        lang: "csharp",
        code: `// Exemplo de script com marcadores customizados no Profiler.
// Use Profiler.BeginSample / EndSample para criar entradas com nome
// próprio que aparecem dentro do CPU Usage.
using UnityEngine;
using UnityEngine.Profiling;

public class InimigoIA : MonoBehaviour
{
    void Update()
    {
        // Marcador customizado: vai aparecer como "IA.Pensar" no Profiler.
        Profiler.BeginSample("IA.Pensar");
        DecidirProximaAcao();
        Profiler.EndSample();

        Profiler.BeginSample("IA.Mover");
        AtualizarMovimento();
        Profiler.EndSample();
    }

    void DecidirProximaAcao() { /* lógica de decisão */ }
    void AtualizarMovimento() { /* lógica de movimento */ }
}`,
      },
      {
        lang: "csharp",
        code: `// Versão moderna usando ProfilerMarker (mais barata e recomendada
// a partir do Unity 2019). Crie o marker uma vez como static readonly
// para evitar alocação a cada frame.
using Unity.Profiling;
using UnityEngine;

public class GerenciadorOndas : MonoBehaviour
{
    static readonly ProfilerMarker s_MarkerSpawn = new ProfilerMarker("Ondas.Spawn");
    static readonly ProfilerMarker s_MarkerLimpeza = new ProfilerMarker("Ondas.Limpeza");

    void Update()
    {
        using (s_MarkerSpawn.Auto())
        {
            // Tudo dentro deste bloco é medido como "Ondas.Spawn".
            SpawnInimigos();
        }

        using (s_MarkerLimpeza.Auto())
        {
            RemoverInimigosMortos();
        }
    }

    void SpawnInimigos() { /* spawna */ }
    void RemoverInimigosMortos() { /* limpa */ }
}`,
      },
      {
        lang: "csharp",
        code: `// Dica avançada: ler estatísticas do Profiler em runtime para mostrar
// um overlay de FPS e memória dentro do próprio jogo.
using Unity.Profiling;
using UnityEngine;

public class HudPerformance : MonoBehaviour
{
    ProfilerRecorder mainThreadTimeRecorder;
    ProfilerRecorder gcMemoryRecorder;

    void OnEnable()
    {
        // Mede tempo do main thread em nanosegundos.
        mainThreadTimeRecorder = ProfilerRecorder.StartNew(
            ProfilerCategory.Internal, "Main Thread", 15);

        // Mede memória reservada pelo GC.
        gcMemoryRecorder = ProfilerRecorder.StartNew(
            ProfilerCategory.Memory, "GC Reserved Memory");
    }

    void OnDisable()
    {
        mainThreadTimeRecorder.Dispose();
        gcMemoryRecorder.Dispose();
    }

    void OnGUI()
    {
        // Tempo médio em milissegundos.
        double mediaMs = 0;
        for (int i = 0; i < mainThreadTimeRecorder.Count; i++)
            mediaMs += mainThreadTimeRecorder.GetSample(i).Value;
        mediaMs /= mainThreadTimeRecorder.Count * 1_000_000.0;

        long gcKb = gcMemoryRecorder.LastValue / 1024;
        GUI.Label(new Rect(10, 10, 300, 40),
            $"Main: {mediaMs:F2} ms  |  GC: {gcKb} KB");
    }
}`,
      },
      {
        lang: "bash",
        code: `# Build com profiler conectado para Android (linha de comando).
# Esta é a forma profissional de profilar no dispositivo final.

# 1. Habilite Development Build e Autoconnect Profiler em Build Settings.
# 2. Conecte o celular via USB com depuração ativada.
# 3. Verifique que o adb enxerga o aparelho:
adb devices

# 4. Faça o build pelo Unity (File > Build And Run).
# 5. Abra o Profiler (Ctrl+7) e selecione o dispositivo no dropdown
#    "Editor" no topo da janela. Escolha o processo do seu jogo.

# Para profilar via Wi-Fi (depois de conectado uma vez no USB):
adb tcpip 5555
adb connect 192.168.0.42:5555`,
      },
    ],
    points: [
      "Sempre meça antes de otimizar. Adivinhar gargalo é perda de tempo.",
      "Profile no dispositivo final, não no editor. O editor adiciona overhead enorme.",
      "Habilite Development Build e Autoconnect Profiler antes de buildar.",
      "Use ProfilerMarker em vez de BeginSample/EndSample em código novo.",
      "Crie ProfilerMarker como static readonly para não alocar a cada frame.",
      "Compare frames bons e ruins lado a lado para isolar o que mudou.",
      "16,6 ms por frame é o orçamento para 60 FPS; 33,3 ms para 30 FPS.",
      "Memory Profiler (pacote separado) é melhor para investigar vazamentos.",
    ],
    alerts: [
      {
        type: "warning",
        content: "O modo Play do editor pode ser 2 a 5 vezes mais lento que um build de release. Nunca tome decisões de otimização baseadas só no que vê no editor; sempre confirme num build no hardware alvo.",
      },
      {
        type: "tip",
        content: "Use Deep Profile com cautela: ele instrumenta toda chamada de método e deixa o jogo lentíssimo, mas é ótimo quando você não sabe nem por onde começar a procurar. Desligue depois para ter números reais.",
      },
      {
        type: "info",
        content: "A partir do Unity 2022, o Profile Analyzer (pacote do Package Manager) permite comparar duas capturas .data lado a lado e ver exatamente quais métodos pioraram entre versões. Essencial em times grandes.",
      },
    ],
  },
  {
    slug: "frame-debugger",
    section: "performance",
    title: "Frame Debugger: dissecando cada draw call",
    difficulty: "avancado",
    subtitle: "Pause o jogo num frame específico e veja a renderização aparecer pixel por pixel.",
    intro: `Imagine que cada frame do seu jogo é um filme de stop motion: a placa de vídeo desenha objeto por objeto, em uma certa ordem, até que a tela fique pronta para mostrar. O Frame Debugger é o botão de pausa desse filme. Ele captura um frame inteiro e te deixa avançar passo a passo, vendo a tela ser construída do zero. Isso parece simples, mas resolve uma quantidade enorme de problemas que o Profiler sozinho não revela.

Por que isso importa? Porque renderização é onde a maioria dos jogos morre em performance, especialmente em mobile. Quando você abre o Frame Debugger (Window > Analysis > Frame Debugger) e clica em Enable, o Unity congela no último frame e mostra uma lista hierárquica à esquerda com cada draw call em ordem. Você clica em qualquer linha e vê a Game View parar exatamente naquele ponto da renderização. Isso permite descobrir coisas como: por que aquele objeto invisível está sendo desenhado, por que a UI está quebrando o batching, por que existe um draw call duplicado para a sombra.

O Frame Debugger também mostra, para cada draw call, qual mesh está sendo renderizado, qual material e shader, qual câmera e por que aquele draw call não foi unido com o anterior (o famoso campo "Why this draw call can't be batched with the previous one"). Esse motivo é ouro: pode ser "Different Material", "Different Shader Pass", "Lightmap index difference", entre outros. Cada motivo aponta para uma correção concreta no projeto.

Quando usar e quando não: use sempre que ver muitos draw calls no Stats ou no Profiler. Não use para medir tempo (ele não mede milissegundos por draw call, só ordem e estado). Para tempo de GPU use o Profiler GPU ou ferramentas externas como RenderDoc, NVIDIA Nsight ou Xcode GPU Frame Capture. O Frame Debugger é sobre estrutura, não sobre velocidade absoluta. Combinando os dois, você entende não só quanto a renderização demora, mas por que ela está estruturada do jeito que está.`,
    codes: [
      {
        lang: "csharp",
        code: `// Como ativar o Frame Debugger por código (útil para debug automatizado).
// Em produção você normalmente usa pela janela, mas a API existe.
using UnityEditor;
using UnityEngine;

public class CapturaFrame : MonoBehaviour
{
    void Update()
    {
        // Tecla F9: captura um frame e abre o Frame Debugger.
        if (Input.GetKeyDown(KeyCode.F9))
        {
#if UNITY_EDITOR
            // Habilita o Frame Debugger no próximo frame.
            UnityEditorInternal.FrameDebuggerUtility.SetEnabled(true, 0);
            Debug.Log("Frame capturado! Abra Window > Analysis > Frame Debugger.");
#endif
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Exemplo prático: agrupar objetos com o mesmo material para reduzir
// draw calls. Aqui criamos 100 cubos compartilhando UM material.
// No Frame Debugger você vai ver isso virar pouquíssimos draw calls
// graças ao SRP Batcher ou GPU Instancing.
using UnityEngine;

public class FabricaDeCubos : MonoBehaviour
{
    [SerializeField] Material materialCompartilhado;
    [SerializeField] Mesh meshCubo;

    void Start()
    {
        // ERRADO: criar material novo para cada cubo quebra o batching.
        // Material instancia = new Material(materialCompartilhado);

        for (int i = 0; i < 100; i++)
        {
            var go = new GameObject($"Cubo_{i}");
            go.transform.position = new Vector3(i % 10, 0, i / 10);

            var mf = go.AddComponent<MeshFilter>();
            mf.sharedMesh = meshCubo;

            var mr = go.AddComponent<MeshRenderer>();
            // CERTO: todos compartilham a MESMA referência de material.
            mr.sharedMaterial = materialCompartilhado;
        }
    }
}`,
      },
      {
        lang: "shaderlab",
        code: `// Shader compatível com o SRP Batcher. A diferença chave é declarar
// todas as propriedades dentro de um CBUFFER chamado UnityPerMaterial.
// Sem isso, o SRP Batcher é desligado para esse shader e o Frame Debugger
// vai mostrar muitos draw calls separados.
Shader "Custom/SRPBatcherCompativel"
{
    Properties
    {
        _BaseColor ("Cor", Color) = (1,1,1,1)
        _BaseMap ("Textura", 2D) = "white" {}
    }

    SubShader
    {
        Tags { "RenderPipeline" = "UniversalPipeline" }

        Pass
        {
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            // Bloco obrigatório para o SRP Batcher funcionar.
            CBUFFER_START(UnityPerMaterial)
                float4 _BaseColor;
                float4 _BaseMap_ST;
            CBUFFER_END

            TEXTURE2D(_BaseMap);
            SAMPLER(sampler_BaseMap);

            struct Attributes { float4 positionOS : POSITION; float2 uv : TEXCOORD0; };
            struct Varyings   { float4 positionHCS : SV_POSITION; float2 uv : TEXCOORD0; };

            Varyings vert(Attributes IN)
            {
                Varyings OUT;
                OUT.positionHCS = TransformObjectToHClip(IN.positionOS.xyz);
                OUT.uv = TRANSFORM_TEX(IN.uv, _BaseMap);
                return OUT;
            }

            half4 frag(Varyings IN) : SV_Target
            {
                return SAMPLE_TEXTURE2D(_BaseMap, sampler_BaseMap, IN.uv) * _BaseColor;
            }
            ENDHLSL
        }
    }
}`,
      },
    ],
    points: [
      "Frame Debugger congela um frame e te deixa percorrer a renderização passo a passo.",
      "Cada linha mostra mesh, material, shader e câmera usados naquele draw call.",
      "O campo 'Why this draw call can't be batched' aponta a correção exata.",
      "Use Frame Debugger para estrutura; use Profiler GPU para tempo.",
      "UI no Canvas costuma aparecer aqui como o maior vilão de draw calls.",
      "Sombras geram passes extras: cada light pode dobrar ou triplicar os draws.",
      "Compare antes e depois ao otimizar batching, GPU instancing ou atlas.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Quando o Frame Debugger mostrar vários draw calls de UI separados, abra o Canvas e verifique se você está misturando texturas de atlas diferentes ou se algum elemento está com Material customizado. Esses dois são as causas mais comuns de quebra de batch em UGUI.",
      },
      {
        type: "warning",
        content: "Em URP e HDRP, o Frame Debugger lista passes internos como Depth, Shadows, Opaque, Transparent. Não confunda esses passes com draw calls do seu código; eles são parte do pipeline e existem mesmo num cenário vazio.",
      },
    ],
  },
  {
    slug: "draw-calls-batching",
    section: "performance",
    title: "Draw calls e batching: a moeda da renderização",
    difficulty: "avancado",
    subtitle: "Static batching, dynamic batching, GPU Instancing e SRP Batcher explicados na prática.",
    intro: `Cada vez que a CPU pede para a GPU desenhar alguma coisa, é feita uma chamada chamada draw call. Imagine um chef gritando o pedido para a cozinha: cada grito custa tempo, mesmo que o prato seja simples. Se você grita mil vezes por frame, a cozinha (a GPU) fica esperando você terminar de gritar. Em mobile, mil draw calls por frame já é considerado muito; em PC moderno você consegue mais, mas o princípio é o mesmo: menos chamadas, mais frames por segundo.

Batching é o nome geral de juntar várias chamadas em uma só. O Unity oferece quatro mecanismos principais. Static Batching combina, em tempo de carregamento, vários objetos marcados como Static que compartilham o mesmo material em um único mesh gigante. Funciona muito bem para cenários (paredes, móveis, pedras), mas aumenta o uso de memória porque copia geometria. Dynamic Batching faz o mesmo para objetos pequenos que se movem, mas só funciona se cada mesh tiver no máximo cerca de 300 vértices e o custo de combinar na CPU às vezes ser maior que o ganho.

GPU Instancing renderiza várias cópias do mesmo mesh com uma chamada só, passando para a GPU um array de matrizes de transformação. É perfeito para árvores, grama, partículas, exércitos de inimigos iguais. Cada instância pode ter cores ou pequenas variações via MaterialPropertyBlock. Por fim, o SRP Batcher (URP e HDRP) não reduz o número de draw calls em si, mas reduz drasticamente o custo de cada um, agrupando os dados constantes em buffers persistentes na GPU. Esse é hoje o batcher mais importante: ele transforma 1000 draw calls em algo barato desde que todos os shaders sejam compatíveis.

Quando usar cada um? Static para cenário fixo. Dynamic está caindo em desuso, costuma ser desligado. GPU Instancing para multidões de objetos iguais. SRP Batcher é sempre ligado por padrão em URP/HDRP e exige só que seus shaders sejam compatíveis (com CBUFFER UnityPerMaterial). Combinar SRP Batcher com GPU Instancing onde faz sentido entrega o melhor resultado em quase qualquer projeto moderno.`,
    codes: [
      {
        lang: "csharp",
        code: `// Marcando objetos como Static por código.
// Static Batching exige a flag StaticEditorFlags.BatchingStatic.
// Em prefabs e cenário pré-feito, prefira marcar pelo Inspector
// (canto superior direito do GameObject, dropdown Static).
using UnityEngine;
#if UNITY_EDITOR
using UnityEditor;
#endif

public class MarcaStatic : MonoBehaviour
{
    [ContextMenu("Marcar filhos como Static")]
    void MarcarFilhos()
    {
#if UNITY_EDITOR
        foreach (Transform t in GetComponentsInChildren<Transform>())
        {
            // Marca para Batching, Lightmap, Occluder, Occludee.
            GameObjectUtility.SetStaticEditorFlags(
                t.gameObject,
                StaticEditorFlags.BatchingStatic |
                StaticEditorFlags.ContributeGI   |
                StaticEditorFlags.OccluderStatic |
                StaticEditorFlags.OccludeeStatic);
        }
#endif
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Renderizar 10.000 cubos com GPU Instancing usando
// Graphics.DrawMeshInstanced. UM draw call (na verdade alguns,
// pois o limite por chamada é 1023 instancias) para milhares de objetos.
using UnityEngine;

public class FlorestaInstanciada : MonoBehaviour
{
    [SerializeField] Mesh meshArvore;
    [SerializeField] Material materialArvore; // marque "Enable GPU Instancing"
    const int TOTAL = 10000;
    Matrix4x4[] matrizes;

    void Start()
    {
        matrizes = new Matrix4x4[TOTAL];
        for (int i = 0; i < TOTAL; i++)
        {
            Vector3 pos = new Vector3(
                Random.Range(-100f, 100f), 0,
                Random.Range(-100f, 100f));
            Quaternion rot = Quaternion.Euler(0, Random.Range(0, 360), 0);
            matrizes[i] = Matrix4x4.TRS(pos, rot, Vector3.one);
        }
    }

    void Update()
    {
        // DrawMeshInstanced renderiza em lotes de até 1023 por chamada.
        // O Unity divide automaticamente o array em chunks.
        for (int i = 0; i < TOTAL; i += 1023)
        {
            int qtd = Mathf.Min(1023, TOTAL - i);
            Graphics.DrawMeshInstanced(
                meshArvore, 0, materialArvore,
                matrizes, qtd);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Variação por instância usando MaterialPropertyBlock.
// Permite trocar cor, valor de offset etc por objeto sem quebrar
// o batching nem criar materiais novos (que matam o SRP Batcher).
using UnityEngine;

public class CorPorInstancia : MonoBehaviour
{
    static readonly int CorID = Shader.PropertyToID("_BaseColor");
    MaterialPropertyBlock mpb;

    void Start()
    {
        mpb = new MaterialPropertyBlock();
        var mr = GetComponent<Renderer>();

        // Pega o bloco atual (preserva o que já foi setado).
        mr.GetPropertyBlock(mpb);

        // Atribui cor aleatória apenas para esta instância.
        mpb.SetColor(CorID, Random.ColorHSV());
        mr.SetPropertyBlock(mpb);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Inspecionando estatísticas de renderização em runtime.
// Útil para um HUD interno de debug em builds de teste.
using UnityEngine;
using UnityEngine.Rendering;

public class StatsRender : MonoBehaviour
{
    void OnGUI()
    {
        // Em builds de release algumas dessas APIs voltam zero.
        // Em Development Build elas funcionam.
        var info = "";
        info += $"DrawCalls: {UnityStats.drawCalls}\\n";
        info += $"Batches:   {UnityStats.batches}\\n";
        info += $"Tris:      {UnityStats.triangles}\\n";
        info += $"SetPass:   {UnityStats.setPassCalls}\\n";
        GUI.Label(new Rect(10, 10, 300, 100), info);
    }
}

// UnityStats fica em UnityEditor.UnityStats no editor.
// Para builds use Unity.Profiling.Recorder com nomes
// como "Batches Count" e "Draw Calls Count".`,
      },
    ],
    points: [
      "Draw call é cada pedido CPU -> GPU. Menos chamadas, mais FPS.",
      "Static Batching: combina cenário fixo no load. Custa memória.",
      "Dynamic Batching: limitado a meshes pequenos, hoje pouco usado.",
      "GPU Instancing: ideal para multidões de cópias do mesmo mesh.",
      "SRP Batcher: padrão em URP/HDRP, exige shaders com CBUFFER UnityPerMaterial.",
      "Use MaterialPropertyBlock para variar parâmetros sem quebrar batch.",
      "Compartilhe materiais (sharedMaterial) em vez de instanciar materiais novos.",
      "Atlas de texturas e mesh combining ajudam quando o batcher não pega.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Acessar renderer.material (sem ser sharedMaterial) cria uma cópia do material no primeiro acesso e quebra todo o batching daquele objeto. Esse é um dos erros mais comuns que jogam draw calls de 50 para 5000 sem aviso. Use sharedMaterial sempre que possível e MaterialPropertyBlock para variações.",
      },
      {
        type: "info",
        content: "Em URP, GPU Instancing e SRP Batcher são mutuamente exclusivos para o mesmo material: o SRP Batcher tem prioridade. Se você precisa de instancing puro (DrawMeshInstanced), o material será excluído do SRP Batcher automaticamente. Não é problema, apenas saiba que está acontecendo.",
      },
      {
        type: "tip",
        content: "Antes de quebrar a cabeça otimizando batching, abra o painel Stats (botão no topo da Game View). Se 'Batches' está perto de 'DrawCalls' você já está bem; se está muito menor, o batcher já está fazendo o trabalho. Foque o esforço no que realmente está alto.",
      },
    ],
  },
  {
    slug: "gc-allocations",
    section: "performance",
    title: "GC Allocations: o assassino silencioso do frame rate",
    difficulty: "avancado",
    subtitle: "Por que alocar memória no Update gera engasgos e como escrever código zero alloc.",
    intro: `O C# usado pelo Unity tem um Garbage Collector, um sistema que limpa memória automaticamente quando objetos não são mais usados. Isso é maravilhoso para produtividade: você não precisa liberar memória manualmente como em C++. O preço, porém, é alto em jogos: quando o GC decide rodar, ele para tudo, varre a heap inteira e só então libera o jogo para continuar. Esse intervalo aparece na tela como um engasgo, um stutter, um espinho no gráfico de FPS. Em mobile pode passar de 30 ms num único frame.

O culpado não é o GC em si, é o que o alimenta: alocações dentro do Update, do FixedUpdate, do LateUpdate ou de loops chamados muitas vezes por segundo. Cada vez que você concatena strings (a + b + c), faz foreach numa lista do tipo IList, captura uma variável local em uma lambda, instancia uma classe nova ou chama new List<T>(), você está colocando lixo na heap. Esse lixo se acumula até atingir um limite, e aí o GC roda. Em produção, jogos bem otimizados fazem zero alocações por frame depois da inicialização.

Para ver isso, abra o Profiler, módulo CPU, ative a coluna GC Alloc. Cada frame mostra quantos bytes foram alocados. O ideal é ver zero ou números pequenos e estáveis. Picos altos significam que algo no seu Update está alocando: uma string nova, um array novo, um delegate sendo criado. O Profiler te leva direto ao método culpado.

As soluções são bem conhecidas: use StringBuilder em vez de concatenação repetida, use for em vez de foreach quando puder (ou itere sobre List<T> diretamente, que tem enumerator de struct), faça pooling de objetos que você cria e destrói com frequência, evite Linq em hot paths (Where, Select, ToList alocam muito), prefira structs para tipos pequenos e imutáveis, cache componentes em Awake em vez de chamar GetComponent toda hora. Não é sobre escrever código feio para economizar bytes, é sobre escrever código consciente, sabendo onde a memória nasce e morre.`,
    codes: [
      {
        lang: "csharp",
        code: `// PROBLEMA: este Update aloca dezenas de bytes por frame.
// Em 60 FPS são milhares por segundo, e o GC vai rodar várias vezes
// por minuto causando stutters perceptíveis.
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public class HudMeio : MonoBehaviour
{
    public List<Inimigo> inimigos;
    public TMPro.TMP_Text texto;

    void Update()
    {
        // 1) Concatenacao de string aloca uma string nova a cada frame.
        string nome = "Inimigos: " + inimigos.Count + " ativos";

        // 2) foreach em IList<T> aloca um enumerator (boxing).
        int totalVida = 0;
        foreach (Inimigo i in (IList<Inimigo>)inimigos)
            totalVida += i.vida;

        // 3) Linq aloca lambda, iterators e a lista final.
        var fortes = inimigos.Where(x => x.vida > 50).ToList();

        texto.text = nome + " | Total HP: " + totalVida;
    }
}

public class Inimigo { public int vida; }`,
      },
      {
        lang: "csharp",
        code: `// SOLUCAO: a mesma logica, agora com zero alocacoes.
using System.Text;
using System.Collections.Generic;
using UnityEngine;

public class HudMeio : MonoBehaviour
{
    public List<Inimigo> inimigos;
    public TMPro.TMP_Text texto;

    // StringBuilder reutilizado: aloca uma vez na vida do objeto.
    readonly StringBuilder sb = new StringBuilder(64);
    // Buffer de "fortes" reaproveitado a cada frame.
    readonly List<Inimigo> fortesBuffer = new List<Inimigo>(32);

    void Update()
    {
        sb.Clear();
        sb.Append("Inimigos: ").Append(inimigos.Count).Append(" ativos");

        // for em vez de foreach: enumerator de struct, sem alocacao.
        int totalVida = 0;
        fortesBuffer.Clear();
        for (int i = 0; i < inimigos.Count; i++)
        {
            var inim = inimigos[i];
            totalVida += inim.vida;
            if (inim.vida > 50) fortesBuffer.Add(inim);
        }

        sb.Append(" | Total HP: ").Append(totalVida);

        // SetText evita a alocacao que .text = string faria internamente.
        texto.SetText(sb);
    }
}

public class Inimigo { public int vida; }`,
      },
      {
        lang: "csharp",
        code: `// Object Pool simples para projeteis. Em vez de Instantiate/Destroy,
// reutiliza objetos. Alem de zerar GC, e muito mais rapido.
using System.Collections.Generic;
using UnityEngine;

public class PoolProjetil : MonoBehaviour
{
    [SerializeField] Projetil prefab;
    [SerializeField] int tamanhoInicial = 50;

    readonly Stack<Projetil> disponiveis = new Stack<Projetil>();

    void Awake()
    {
        for (int i = 0; i < tamanhoInicial; i++)
            disponiveis.Push(CriarNovo());
    }

    Projetil CriarNovo()
    {
        var p = Instantiate(prefab, transform);
        p.gameObject.SetActive(false);
        p.OnDevolver = Devolver; // callback para devolver ao pool
        return p;
    }

    public Projetil Pegar(Vector3 pos, Quaternion rot)
    {
        var p = disponiveis.Count > 0 ? disponiveis.Pop() : CriarNovo();
        p.transform.SetPositionAndRotation(pos, rot);
        p.gameObject.SetActive(true);
        return p;
    }

    void Devolver(Projetil p)
    {
        p.gameObject.SetActive(false);
        disponiveis.Push(p);
    }
}

public class Projetil : MonoBehaviour
{
    public System.Action<Projetil> OnDevolver;
    void OnBecameInvisible() => OnDevolver?.Invoke(this);
}`,
      },
      {
        lang: "csharp",
        code: `// Cache de componentes: GetComponent e barato mas nao gratis.
// Em scripts chamados muito (centenas de inimigos), faz diferenca.
using UnityEngine;

public class InimigoOtimizado : MonoBehaviour
{
    // Caches feitos UMA vez.
    Rigidbody rb;
    Animator anim;
    Transform alvo;

    // Hashes de Animator: muito mais rapido que strings.
    static readonly int HashCorrer = Animator.StringToHash("Correr");

    void Awake()
    {
        rb   = GetComponent<Rigidbody>();
        anim = GetComponent<Animator>();
        alvo = GameObject.FindWithTag("Player").transform;
    }

    void FixedUpdate()
    {
        Vector3 dir = (alvo.position - rb.position).normalized;
        rb.MovePosition(rb.position + dir * 3f * Time.fixedDeltaTime);
        anim.SetBool(HashCorrer, true);
    }
}`,
      },
    ],
    points: [
      "GC roda quando a heap enche; isso pausa o jogo e causa stutters.",
      "A solucao e nao alimentar o GC: zero alocacoes por frame em hot paths.",
      "Strings concatenadas, Linq, foreach em IList e lambdas com captura geram lixo.",
      "Use StringBuilder, for, pooling de objetos e cache de componentes.",
      "List<T> tem enumerator de struct: foreach direto nao aloca.",
      "Animator.StringToHash + cache evita parse repetido de strings.",
      "TMP_Text.SetText(StringBuilder) evita alocacao que .text = causa.",
      "Profile com a coluna GC Alloc ligada para encontrar o culpado.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Cuidado com closures: uma lambda que captura uma variavel local cria uma classe escondida toda vez que e atingida. Esse tipo de alocacao some no codigo fonte mas aparece no Profiler como 'CompilerGenerated'. Promova a variavel para campo da classe ou use uma lambda sem captura.",
      },
      {
        type: "tip",
        content: "Para projetos novos a partir do Unity 2021, prefira o ObjectPool<T> oficial (UnityEngine.Pool). Ele ja faz o ciclo Get/Release e tem versao thread-safe para uso com Jobs. Menos codigo seu, comportamento padronizado.",
      },
      {
        type: "info",
        content: "O Unity oferece o Incremental GC (Project Settings > Player > Use incremental GC). Ele divide a coleta em pedacinhos por frame em vez de uma pausa enorme. Nao elimina o problema, mas suaviza. Use junto com a estrategia de zero alocacoes, nao no lugar dela.",
      },
    ],
  },
  {
    slug: "jobs-system",
    section: "performance",
    title: "Jobs System: paralelismo seguro no Unity",
    difficulty: "avancado",
    subtitle: "Use todos os nucleos da CPU sem pesadelos de threading.",
    intro: `Computadores modernos tem 4, 8, 16 nucleos. Por padrao, seu codigo de Unity (MonoBehaviour) roda inteiro em UM unico nucleo, o main thread. Os outros ficam ociosos. O Jobs System foi criado para resolver isso: ele permite escrever pequenas unidades de trabalho (jobs) que rodam em threads de background, distribuidas pelos nucleos disponiveis, sem que voce precise lidar diretamente com locks, mutex, race conditions e os bugs medonhos que multithreading tradicional traz.

A magia esta em duas restricoes: jobs so podem trabalhar com tipos blittable (structs simples, nada de classes ou referencias managed) e os dados sao passados via NativeArray, NativeList, NativeHashMap (containers de memoria nativa, fora do GC). Essas restricoes parecem chatas, mas existem porque permitem ao Unity garantir, em tempo de compilacao, que dois jobs nao vao pisar no mesmo dado ao mesmo tempo. O Safety System detecta race conditions antes mesmo do jogo rodar.

Os tres tipos principais sao IJob (uma execucao em uma thread, util para tarefas isoladas), IJobParallelFor (executa o mesmo codigo para muitos indices em paralelo, como processar mil inimigos ao mesmo tempo) e IJobParallelForTransform (versao especial para mexer em Transforms). Cada Schedule devolve um JobHandle, que voce pode encadear (job B depende de job A), agrupar e dar Complete quando precisar dos resultados de volta no main thread.

Quando usar: trabalho pesado e paralelo (pathfinding em massa, fisica customizada, geracao procedural, simulacao de boids, atualizar posicoes de milhares de projeteis). Quando NAO usar: tarefas pequenas (overhead de schedule supera o ganho), tarefas que precisam acessar GameObjects/Transforms direto (use TransformAccessArray), ou logica que muda toda hora (debug de jobs e mais chato). Combinado com Burst (proximo capitulo), o ganho costuma ser de 5x a 50x sobre codigo C# normal.`,
    codes: [
      {
        lang: "csharp",
        code: `// IJob simples: roda em uma unica thread de background.
// Util para calculos isolados que nao bloqueiam o main thread.
using Unity.Collections;
using Unity.Jobs;
using UnityEngine;

public struct SomaJob : IJob
{
    [ReadOnly] public NativeArray<int> entrada;
    public NativeArray<int> resultado; // tamanho 1: guarda a soma

    public void Execute()
    {
        int soma = 0;
        for (int i = 0; i < entrada.Length; i++)
            soma += entrada[i];
        resultado[0] = soma;
    }
}

public class ExemploSomaJob : MonoBehaviour
{
    void Start()
    {
        // Allocator.TempJob: vida curta, ate 4 frames.
        var dados = new NativeArray<int>(1_000_000, Allocator.TempJob);
        var resultado = new NativeArray<int>(1, Allocator.TempJob);
        for (int i = 0; i < dados.Length; i++) dados[i] = 1;

        var job = new SomaJob { entrada = dados, resultado = resultado };
        JobHandle handle = job.Schedule();
        handle.Complete(); // espera terminar (bloqueia o main thread)

        Debug.Log($"Soma = {resultado[0]}"); // 1.000.000

        dados.Dispose();
        resultado.Dispose();
    }
}`,
      },
      {
        lang: "csharp",
        code: `// IJobParallelFor: o mesmo Execute(int index) roda em paralelo
// para cada indice. Aqui movemos 100.000 posicoes em paralelo.
using Unity.Collections;
using Unity.Jobs;
using Unity.Mathematics;
using UnityEngine;

public struct MoverJob : IJobParallelFor
{
    public float deltaTime;
    public NativeArray<float3> posicoes;
    [ReadOnly] public NativeArray<float3> velocidades;

    public void Execute(int i)
    {
        posicoes[i] += velocidades[i] * deltaTime;
    }
}

public class Boids : MonoBehaviour
{
    NativeArray<float3> posicoes;
    NativeArray<float3> velocidades;
    JobHandle handle;

    void Start()
    {
        posicoes    = new NativeArray<float3>(100_000, Allocator.Persistent);
        velocidades = new NativeArray<float3>(100_000, Allocator.Persistent);
        for (int i = 0; i < 100_000; i++)
            velocidades[i] = new float3(1f, 0f, 0f);
    }

    void Update()
    {
        var job = new MoverJob {
            deltaTime  = Time.deltaTime,
            posicoes   = posicoes,
            velocidades = velocidades
        };
        // 64 = innerloopBatchCount. Quantos indices cada thread pega
        // por vez. Valores tipicos: 32 a 128.
        handle = job.Schedule(posicoes.Length, 64);
    }

    void LateUpdate()
    {
        handle.Complete(); // garante terminar antes de renderizar
    }

    void OnDestroy()
    {
        handle.Complete();
        posicoes.Dispose();
        velocidades.Dispose();
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Encadeando dependencias entre jobs.
// Job B so comeca quando Job A termina. O Unity gerencia tudo.
using Unity.Collections;
using Unity.Jobs;

public struct PreencheJob : IJobParallelFor
{
    public NativeArray<int> dados;
    public void Execute(int i) => dados[i] = i * 2;
}

public struct DobraJob : IJobParallelFor
{
    public NativeArray<int> dados;
    public void Execute(int i) => dados[i] *= 2;
}

public static class Pipeline
{
    public static void Rodar()
    {
        var arr = new NativeArray<int>(10_000, Allocator.TempJob);

        var preenche = new PreencheJob { dados = arr };
        JobHandle h1 = preenche.Schedule(arr.Length, 64);

        var dobra = new DobraJob { dados = arr };
        // h1 e dependencia: dobra so comeca depois de preenche acabar.
        JobHandle h2 = dobra.Schedule(arr.Length, 64, h1);

        h2.Complete();
        arr.Dispose();
    }
}`,
      },
    ],
    points: [
      "Jobs distribuem trabalho entre os nucleos da CPU sem locks manuais.",
      "Use NativeArray, NativeList, NativeHashMap (memoria fora do GC).",
      "Tipos dentro do job devem ser blittable: structs com primitivos.",
      "IJob: 1 thread. IJobParallelFor: muitas threads, um indice cada.",
      "Schedule devolve JobHandle; chame Complete antes de usar o resultado.",
      "Use [ReadOnly] e [WriteOnly] para o Safety System otimizar.",
      "Allocator.Temp (frame), TempJob (4 frames), Persistent (manual).",
      "Sempre Dispose os containers ou voce vaza memoria nativa.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Esquecer de chamar Dispose em um NativeArray Persistent gera vazamento real de memoria nativa, fora do alcance do GC. O Unity loga isso ao parar o Play, mas em build ele apenas vaza. Crie o habito de Dispose no OnDestroy e teste entrando/saindo do Play varias vezes.",
      },
      {
        type: "warning",
        content: "Nunca acesse Transform, GameObject ou qualquer API do main thread de dentro de um job. O Safety System lanca excecao no editor, mas em build pode dar comportamento indefinido. Para mexer em Transforms use IJobParallelForTransform com TransformAccessArray.",
      },
      {
        type: "tip",
        content: "Comece sempre rodando o codigo em um IJob serial e meca. Se ja for rapido o suficiente, pare. So vale a pena migrar para IJobParallelFor + Burst quando o trabalho for grande, repetitivo e isolavel. Job para coisa pequena custa mais em overhead de schedule do que economiza.",
      },
    ],
  },
  {
    slug: "burst-compiler",
    section: "performance",
    title: "Burst Compiler: C# que vira codigo nativo SIMD",
    difficulty: "avancado",
    subtitle: "Marque um job com [BurstCompile] e ganhe 10x a 100x de velocidade quase de graca.",
    intro: `O C# normal do Unity roda em cima do Mono ou do IL2CPP. Os dois sao decentes, mas ainda longe do desempenho de C++ ou Rust. O Burst Compiler muda esse jogo: ele e um compilador especializado da Unity que pega seu codigo de Job (HPC#, um subset restrito de C#) e gera codigo nativo otimizado, com vetorizacao SIMD (Single Instruction Multiple Data), inlining agressivo e otimizacoes de loop tao boas quanto compiladores como Clang ou MSVC.

A analogia e a de um tradutor especializado. O Mono traduz cada linha do seu C# para uma forma generica que roda em qualquer lugar. O Burst pega aquele Job especifico, conhece a CPU alvo (x64, ARM), conhece os tipos exatos (float3, NativeArray) e gera assembly sob medida usando registradores SSE, AVX ou NEON. O resultado tipico e um job que era 5 ms virar 0,3 ms. Em pipelines de simulacao isso e a diferenca entre 10 inimigos e 10.000.

Para usar e literalmente uma linha: anote a struct do job com [BurstCompile]. O Burst compila em background no editor (voce ve um spinner no canto inferior direito) e o build final ja vai com tudo compilado em AOT. As restricoes herdam as do Jobs System (so blittable, sem managed objects, sem strings, sem excecoes em runtime), mas em troca voce ganha velocidade de C nativo escrevendo C#.

Quando usar: sempre que escrever um Job. Se o Job e grande o suficiente para justificar Schedule, ele tambem justifica Burst. Quando NAO usar: codigo MonoBehaviour comum (Burst nao roda ali; precisa estar dentro de Job ou de funcao [BurstCompile] estatica chamada por Jobs). Combinado com Unity.Mathematics (a biblioteca de matematica vetorial otimizada para Burst), voce escreve codigo que parece shader e roda em CPU com performance de C++.`,
    codes: [
      {
        lang: "csharp",
        code: `// Mesmo job do capitulo anterior, agora com Burst.
// Basta uma anotacao para ganhar potencialmente 10x ou mais.
using Unity.Burst;
using Unity.Collections;
using Unity.Jobs;
using Unity.Mathematics;

[BurstCompile(CompileSynchronously = false,
              FloatPrecision = FloatPrecision.Standard,
              FloatMode = FloatMode.Fast)]
public struct MoverJobBurst : IJobParallelFor
{
    public float deltaTime;
    public NativeArray<float3> posicoes;
    [ReadOnly] public NativeArray<float3> velocidades;

    public void Execute(int i)
    {
        // math.* da Unity.Mathematics e otimizado para SIMD pelo Burst.
        // Use float3 e math.normalize em vez de Vector3.normalized.
        posicoes[i] += velocidades[i] * deltaTime;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Funcao estatica Burst-compiled para usar dentro de varios jobs.
// Pode ser chamada via FunctionPointer (sem managed call overhead).
using Unity.Burst;
using Unity.Mathematics;

[BurstCompile]
public static class MathUtil
{
    // Esta funcao especifica sera compilada por Burst.
    [BurstCompile]
    public static float DistanciaQuadrada(in float3 a, in float3 b)
    {
        float3 d = a - b;
        return math.dot(d, d);
    }

    // Funcao mais util: recebe dois NativeArray e calcula vizinhos.
    [BurstCompile]
    public static void MaisProximo(
        in NativeArray<float3> pontos,
        in float3 alvo,
        out int indice,
        out float dist)
    {
        indice = -1;
        dist = float.MaxValue;
        for (int i = 0; i < pontos.Length; i++)
        {
            float d = DistanciaQuadrada(pontos[i], alvo);
            if (d < dist) { dist = d; indice = i; }
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Comparando Vector3 (managed) vs float3 (Burst friendly).
// O Burst nao otimiza bem Vector3 porque ele tem propriedades e
// chamadas de metodo que nao inlinam no SIMD. Use float3.
using Unity.Burst;
using Unity.Collections;
using Unity.Jobs;
using Unity.Mathematics;
using UnityEngine; // para Vector3

[BurstCompile]
public struct JobLento : IJobParallelFor
{
    public NativeArray<Vector3> dados; // RUIM no Burst
    public void Execute(int i)
    {
        dados[i] = dados[i].normalized * 2f;
    }
}

[BurstCompile]
public struct JobRapido : IJobParallelFor
{
    public NativeArray<float3> dados; // OTIMO no Burst
    public void Execute(int i)
    {
        dados[i] = math.normalize(dados[i]) * 2f;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Inspecionando o assembly gerado pelo Burst.
// No editor, abra Jobs > Burst > Open Inspector.
// Voce ve, para cada metodo [BurstCompile], o codigo Assembly,
// LLVM IR e ate diagnosticos de vetorizacao.
//
// Coisas para procurar no Assembly:
// - Instrucoes vXXXps / vXXXpd (SSE/AVX) -> vetorizou bem
// - Mensagens "loop vectorized" no painel de diagnostics
// - Aviso "could not vectorize" -> seu codigo tem branch ou
//   acesso de memoria que impede SIMD; refatore.
//
// Dica: marque o job com FloatMode.Fast quando precisao
// numerica nao e critica (jogos quase sempre nao e).
// Isso libera o Burst para reordenar operacoes e ganhar mais SIMD.`,
      },
    ],
    points: [
      "Burst transforma Jobs em codigo nativo SIMD, com performance de C.",
      "Anote a struct do job com [BurstCompile] e pronto.",
      "Use Unity.Mathematics (float3, math.*) em vez de Vector3/Mathf.",
      "FloatMode.Fast da mais SIMD ao custo de pequena imprecisao.",
      "Burst Inspector mostra o assembly e diz se vetorizou.",
      "Burst nao ajuda MonoBehaviour comum; so dentro de Jobs/funcoes marcadas.",
      "Compila AOT no build final, JIT em background no editor.",
      "Ideal para simulacoes, geracao procedural e fisica customizada.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Sempre que Vector3 aparecer dentro de um Burst job, troque por float3. A diferenca de performance pode passar de 5x simplesmente porque o Burst consegue empacotar 4 ou 8 float3 num registrador SIMD, coisa que com Vector3 (que usa propriedades) ele nao faz.",
      },
      {
        type: "warning",
        content: "Burst nao suporta excecoes em runtime, debug puts, allocators managed nem chamadas para a maioria das APIs do UnityEngine. Se seu job precisa logar, marque com [BurstDiscard] o trecho de log; o Burst ignora aquele bloco no codigo nativo e usa a versao Mono so quando rodar fora do Burst.",
      },
      {
        type: "info",
        content: "A primeira vez que voce roda um job Burst no editor pode ter um pequeno engasgo enquanto ele compila JIT. Para testes consistentes, use [BurstCompile(CompileSynchronously = true)] para forcar a compilacao antes do Schedule. Em build essa flag nao tem efeito (ja e tudo AOT).",
      },
    ],
  },
  {
    slug: "dots-ecs",
    section: "performance",
    title: "DOTS e ECS: arquitetura orientada a dados",
    difficulty: "avancado",
    subtitle: "Entity, IComponentData, ISystem e o futuro do Unity para jogos massivos.",
    intro: `O modelo classico de GameObject + MonoBehaviour e otimo para prototipagem e jogos pequenos a medios, mas tem limites duros. Cada GameObject carrega componentes que sao classes managed espalhadas pela memoria, com referencias indiretas, vtables, e logica acoplada aos dados. Quando voce tem 100 inimigos, isso e irrelevante. Quando voce quer 100.000 unidades em um RTS, ou 1 milhao de partes em uma simulacao, o cache da CPU passa o tempo todo perdendo (cache miss) e o jogo morre.

DOTS (Data-Oriented Technology Stack) e a resposta da Unity para isso. Ele e composto por tres pilares: ECS (Entity Component System), o Jobs System (visto antes) e o Burst Compiler (visto antes). O ECS muda a forma de pensar: em vez de objetos com comportamento, voce tem Entidades (so um ID), Componentes (struct puros de dados, IComponentData) e Sistemas (codigo que processa todas as entidades com certos componentes). Os dados ficam alinhados em memoria, em arrays contiguos chamados chunks, que a CPU le sequencialmente, com cache feliz, e o Burst paraleliza facil.

A analogia e a diferenca entre uma caixa de ferramentas onde cada ferramenta esta numa caixinha separada (OOP classico) e uma gaveta organizada onde todos os parafusos estao juntos, todas as porcas juntas, todas as chaves juntas (DOTS). Quando voce precisa apertar mil parafusos, abrir uma gaveta de parafusos e aplicar o mesmo movimento mil vezes e absurdamente mais rapido do que abrir mil caixinhas diferentes.

Quando usar: jogos com muitos objetos similares (RTS, simulacoes, exercitos, sistemas de particulas customizados, jogos tipo Vampire Survivors). Quando NAO usar: prototipos rapidos, jogos com poucos objetos complexos e unicos (adventure narrativo, puzzle), times sem experiencia (a curva de aprendizado e real). DOTS hoje (a partir de Entities 1.0, Unity 2022.3+) ja e estavel para producao, mas ainda exige reaprender bastante coisa. O ROI vem quando o numero de entidades cresce.`,
    codes: [
      {
        lang: "csharp",
        code: `// Componente DOTS: struct puro de dados, sem comportamento.
// Implementa IComponentData (marcador) para o Unity reconhecer.
using Unity.Entities;
using Unity.Mathematics;

public struct Vida : IComponentData
{
    public float valor;
}

public struct Velocidade : IComponentData
{
    public float3 valor;
}

// Tag component: zero bytes, so marca a entidade como inimigo.
public struct TagInimigo : IComponentData {}`,
      },
      {
        lang: "csharp",
        code: `// Sistema DOTS moderno (ISystem, Unity Entities 1.0+).
// Processa TODAS as entidades que tem Velocidade + LocalTransform.
using Unity.Burst;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;

[BurstCompile]
public partial struct MoverSystem : ISystem
{
    [BurstCompile]
    public void OnCreate(ref SystemState state)
    {
        // Exige que existam essas duas: senao o sistema nao roda.
        state.RequireForUpdate<Velocidade>();
    }

    [BurstCompile]
    public void OnUpdate(ref SystemState state)
    {
        float dt = SystemAPI.Time.DeltaTime;

        // Idiomatic foreach: percorre todas as entidades com os
        // componentes pedidos, usando chunk iteration por baixo.
        foreach (var (transform, vel) in
                 SystemAPI.Query<RefRW<LocalTransform>, RefRO<Velocidade>>())
        {
            transform.ValueRW.Position += vel.ValueRO.valor * dt;
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Spawnando 100.000 entidades programaticamente.
// EntityManager e a API para criar, destruir e modificar entidades.
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;
using UnityEngine;

public class SpawnerInimigos : MonoBehaviour
{
    [SerializeField] int quantidade = 100_000;

    void Start()
    {
        var world = World.DefaultGameObjectInjectionWorld;
        var em = world.EntityManager;

        // Arquetipo: define quais componentes a entidade tem.
        var arquetipo = em.CreateArchetype(
            typeof(LocalTransform),
            typeof(Velocidade),
            typeof(Vida),
            typeof(TagInimigo));

        // Cria todas as entidades de uma vez (muito mais rapido).
        var entidades = new Unity.Collections.NativeArray<Entity>(
            quantidade, Unity.Collections.Allocator.Temp);
        em.CreateEntity(arquetipo, entidades);

        for (int i = 0; i < quantidade; i++)
        {
            em.SetComponentData(entidades[i], LocalTransform.FromPosition(
                new float3(i % 100, 0, i / 100)));
            em.SetComponentData(entidades[i], new Velocidade {
                valor = new float3(0, 0, 1f)
            });
            em.SetComponentData(entidades[i], new Vida { valor = 100f });
        }

        entidades.Dispose();
    }
}`,
      },
      {
        lang: "csharp",
        code: `// IJobEntity: a forma mais ergonomica de paralelizar logica DOTS.
// O codeg do source generator transforma em IJobChunk por baixo.
using Unity.Burst;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;

[BurstCompile]
public partial struct DanoAreaJob : IJobEntity
{
    public float3 centro;
    public float raio;
    public float dano;

    void Execute(ref Vida vida, in LocalTransform t)
    {
        if (math.distance(t.Position, centro) <= raio)
            vida.valor -= dano;
    }
}

[BurstCompile]
public partial struct DanoSystem : ISystem
{
    public void OnUpdate(ref SystemState state)
    {
        var job = new DanoAreaJob {
            centro = float3.zero,
            raio   = 10f,
            dano   = 5f * SystemAPI.Time.DeltaTime
        };
        // ScheduleParallel distribui entre threads automaticamente.
        job.ScheduleParallel();
    }
}`,
      },
    ],
    points: [
      "DOTS = ECS + Jobs + Burst. Tres pilares trabalhando juntos.",
      "Entity e so um ID; Component e dado puro; System e logica.",
      "Memoria fica em chunks contiguos; cache da CPU adora isso.",
      "Use ISystem (struct) e IJobEntity para o caminho mais moderno.",
      "EntityManager.CreateEntity em lote e muitas vezes mais rapido.",
      "Tag components (zero bytes) ajudam a filtrar queries de graca.",
      "Vale a pena quando voce tem milhares ou milhoes de entidades.",
      "Para jogos pequenos ou narrativos, GameObject classico ainda vence.",
    ],
    alerts: [
      {
        type: "warning",
        content: "DOTS exige instalar varios pacotes (Entities, Entities Graphics, Collections) pelo Package Manager e nao funciona com o pipeline Built-in: e necessario URP ou HDRP. Em projetos hibridos, voce convive com GameObject + Entity ao mesmo tempo via SubScene e Baking, o que adiciona bastante complexidade.",
      },
      {
        type: "info",
        content: "A API DOTS mudou bastante entre Entities 0.x (DOTS Preview) e Entities 1.0 (release oficial). Tutoriais antigos com Entities.ForEach, JobComponentSystem e ConvertToEntity estao desatualizados. Procure conteudo de 2023 em diante e use ISystem / IJobEntity / Baker.",
      },
      {
        type: "tip",
        content: "Antes de migrar um projeto inteiro para DOTS, faca um prototipo isolado da parte mais critica (por exemplo: simulacao de inimigos). Se o ganho de performance compensa a curva, migre por modulos. Reescrever um jogo inteiro de uma vez para DOTS quase sempre da errado.",
      },
    ],
  },
  {
    slug: "occlusion-lod",
    section: "performance",
    title: "Occlusion Culling, LOD e Billboards: nao desenhe o que ninguem ve",
    difficulty: "avancado",
    subtitle: "Tecnicas classicas de renderizacao para cenarios grandes rodarem em qualquer maquina.",
    intro: `O jeito mais rapido de renderizar um objeto e nao renderizar o objeto. Parece obvio, mas a maioria dos jogos perde performance desenhando coisas que o jogador nem ve: paredes do outro lado de uma porta, arvores muito longe que ocupam 2 pixels na tela, montanhas atras de uma colina. As tecnicas deste capitulo existem para que a engine pule essas renderizacoes inuteis automaticamente, sem voce ter que pensar a cada frame.

Frustum Culling e gratis e ja vem ligado: o Unity desenha so o que esta dentro do tronco de visao da camera. Mas isso nao resolve oclusao real (o Unity ainda desenha a parede inteira atras de uma porta fechada). Para isso existe Occlusion Culling, um sistema que voce assa (bake) no editor: o Unity divide a cena em celulas, calcula qual celula ve quais objetos, e em runtime usa essa tabela para descartar tudo que esta atras de algo. O resultado e brutal em interiores, masmorras e cidades.

LOD (Level of Detail) ataca outro angulo: objetos longe nao precisam de geometria detalhada. Voce cria 2 ou 3 versoes do mesmo modelo (LOD0 alta poligonagem, LOD1 media, LOD2 baixa) e o Unity troca automaticamente conforme a distancia. Para vegetacao e multidoes, a tecnica final e o Billboard: substituir um modelo 3D por um quadrilatero com a textura do objeto, sempre virado para a camera. Uma floresta de 10.000 arvores billboard custa o mesmo que algumas dezenas de arvores reais.

Quando usar: cenarios grandes (mundos abertos, cidades, dungeons), vegetacao em massa, jogos mobile onde cada draw call importa. Quando NAO usar com cuidado: cenas pequenas (overhead do bake nao compensa), objetos dinamicos (Occlusion Culling estatico nao acompanha), ou conteudo procedural (precisa de Occlusion dinamica como umbra ou GPU-driven). Combinando os tres com batching e instancing voce roda mundos enormes ate em hardware mediano.`,
    codes: [
      {
        lang: "csharp",
        code: `// Configurando LOD por codigo. Normalmente voce faz isso pelo
// Inspector com o componente LODGroup, mas saber a API ajuda em
// pipelines automatizados de import.
using UnityEngine;

[RequireComponent(typeof(LODGroup))]
public class ConfiguraLOD : MonoBehaviour
{
    [SerializeField] Renderer rendererAlta;   // LOD0
    [SerializeField] Renderer rendererMedia;  // LOD1
    [SerializeField] Renderer rendererBaixa;  // LOD2

    void Awake()
    {
        var grupo = GetComponent<LODGroup>();

        // Cada LOD tem um screenRelativeTransitionHeight:
        // valor entre 0 e 1 = quanto da altura da tela o objeto
        // ocupa para AINDA usar este nivel. Abaixo disso, troca.
        var lods = new LOD[]
        {
            new LOD(0.5f,  new Renderer[] { rendererAlta }),
            new LOD(0.2f,  new Renderer[] { rendererMedia }),
            new LOD(0.05f, new Renderer[] { rendererBaixa }),
            // Abaixo de 0.05, o objeto e descartado totalmente (Culled).
        };

        grupo.SetLODs(lods);
        grupo.RecalculateBounds();
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Marcando objetos como Occluder (bloqueia visao) ou Occludee
// (e bloqueavel) por codigo. Depois e necessario rodar o bake
// em Window > Rendering > Occlusion Culling > Bake.
using UnityEditor;
using UnityEngine;

#if UNITY_EDITOR
public static class MarcarOcclusion
{
    [MenuItem("Tools/Marcar Cenario para Occlusion")]
    static void Marcar()
    {
        foreach (var go in Selection.gameObjects)
        {
            // Occluder: paredes, predios, montanhas (bloqueiam).
            // Occludee: tudo que pode ser bloqueado (default para tudo).
            GameObjectUtility.SetStaticEditorFlags(go,
                GameObjectUtility.GetStaticEditorFlags(go) |
                StaticEditorFlags.OccluderStatic |
                StaticEditorFlags.OccludeeStatic);
        }
        Debug.Log($"Marcados {Selection.gameObjects.Length} objetos.");
    }
}
#endif`,
      },
      {
        lang: "csharp",
        code: `// Billboard simples: faz o objeto sempre olhar para a camera.
// Util para arvores distantes, particulas, indicadores de UI no mundo.
// Para vegetacao em massa prefira BillboardAsset (sistema oficial)
// ou shader graph com billboard no vertex shader.
using UnityEngine;

[ExecuteAlways]
public class BillboardSimples : MonoBehaviour
{
    Camera cam;

    void OnEnable() => cam = Camera.main;

    void LateUpdate()
    {
        if (cam == null) cam = Camera.main;
        if (cam == null) return;

        // Aponta o objeto para a camera (mas mantem eixo Y do mundo).
        Vector3 dir = transform.position - cam.transform.position;
        dir.y = 0;
        if (dir.sqrMagnitude > 0.001f)
            transform.rotation = Quaternion.LookRotation(dir);
    }
}`,
      },
      {
        lang: "shaderlab",
        code: `// Billboard no vertex shader: muito mais rapido que mexer Transform
// na CPU. Toda a transformacao acontece na GPU, gratis.
Shader "Custom/BillboardSimples"
{
    Properties
    {
        _BaseMap ("Textura", 2D) = "white" {}
    }

    SubShader
    {
        Tags { "RenderType"="Opaque" "Queue"="Geometry" }

        Pass
        {
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            sampler2D _BaseMap;

            struct appdata { float4 vertex : POSITION; float2 uv : TEXCOORD0; };
            struct v2f     { float4 pos : SV_POSITION; float2 uv : TEXCOORD0; };

            v2f vert(appdata v)
            {
                v2f o;
                // Pega a posicao do centro do objeto em world space.
                float3 centroMundo = unity_ObjectToWorld._m03_m13_m23;
                // Reconstroi a matriz de view sem rotacao para que
                // o quad sempre fique de frente para a camera.
                float3 cam_right = UNITY_MATRIX_V._m00_m01_m02;
                float3 cam_up    = UNITY_MATRIX_V._m10_m11_m12;
                float3 deslocado = centroMundo
                                 + cam_right * v.vertex.x
                                 + cam_up    * v.vertex.y;
                o.pos = mul(UNITY_MATRIX_VP, float4(deslocado, 1.0));
                o.uv  = v.uv;
                return o;
            }

            half4 frag(v2f i) : SV_Target
            {
                return tex2D(_BaseMap, i.uv);
            }
            ENDHLSL
        }
    }
}`,
      },
    ],
    points: [
      "Frustum culling e automatico; Occlusion Culling precisa ser baked.",
      "Marque cenario solido como OccluderStatic + OccludeeStatic.",
      "LOD troca meshes por versoes mais simples conforme a distancia.",
      "screenRelativeTransitionHeight controla quando trocar de LOD.",
      "Billboard substitui modelos 3D distantes por quads texturizados.",
      "Faca billboard no vertex shader, nao com Transform na CPU.",
      "Cenarios grandes precisam dos tres juntos: occlusion + LOD + instancing.",
      "Occlusion estatico nao funciona para objetos dinamicos; use HLOD ou GPU-driven.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Occlusion Culling baked aumenta o tempo de build e o tamanho da cena. Em mundos abertos enormes, pode nao caber. Considere dividir em SubScenes, usar Streaming ou solucoes dinamicas como Umbra (paga) ou GPU Occlusion no HDRP. Faca testes de tamanho antes de comprometer a arquitetura.",
      },
      {
        type: "tip",
        content: "Crie LODs com diferenca real de poligonagem (50%, 80% de reducao por nivel) usando ferramentas como InstaLOD, Simplygon ou o auto-LOD do ProBuilder. Se LOD1 tem so 10% menos triangulos que LOD0, voce so adiciona overhead de troca sem ganhar nada.",
      },
      {
        type: "info",
        content: "No Unity 2022 LTS o componente Tree e os Speed Trees ja vem com billboard automatico no nivel mais distante. Para vegetacao grande use o Terrain com Detail Mesh + Billboard, ou o pacote Foliage Shader Pack. Implementar billboard manual so vale para casos bem especificos.",
      },
    ],
  },
];
