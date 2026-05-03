import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "build-windows",
    section: "deploy-projetos",
    title: "Build para Windows (.exe)",
    difficulty: "intermediario",
    subtitle: "Como transformar seu projeto Unity em um executável que qualquer pessoa pode rodar no PC.",
    intro: `Até agora, tudo o que você fez aconteceu dentro do Editor do Unity. Para mostrar seu jogo para um amigo, mandar para um cliente ou colocar na Steam, você precisa gerar um executável. No Windows, esse executável é um arquivo .exe acompanhado de uma pasta com recursos (texturas, sons, modelos, DLLs do Mono ou IL2CPP). Pense nisso como cozinhar: o Editor é a cozinha cheia de utensílios, e a build é o prato pronto, embalado para viagem.

A build do Windows é a mais simples de fazer e a melhor para começar a entender o pipeline. O Unity pega seu projeto, compila os scripts C# para uma forma que a máquina entende (Mono ou IL2CPP), inclui só os assets que estão dentro de cenas listadas no Build Settings ou marcados como Resources/Addressables, e empacota tudo. O resto fica de fora — o que significa que se você esqueceu uma cena no Build Settings, ela simplesmente não vai existir no jogo final, mesmo que funcione no Editor.

Existem dois "backends de scripting" possíveis: Mono e IL2CPP. Mono é mais rápido para fazer build e bom para protótipos. IL2CPP gera C++ a partir do seu C# e compila nativo, ficando mais rápido em runtime e mais difícil de fazer engenharia reversa — é o recomendado para produção. Você também escolhe entre x86_64 (padrão) e arm64 (para PCs ARM, ainda raros).

Antes de gerar a build, sempre revise o Player Settings: nome da empresa, nome do produto, ícone, splash screen (que só some se você tiver Unity Pro ou Plus), resolução padrão, modo janela ou tela cheia. Esses detalhes parecem bobos, mas são a primeira impressão do seu jogador. Um .exe chamado "MyGame.exe" com ícone branco do Unity transmite "projeto inacabado" antes mesmo de abrir.

Neste capítulo você vai aprender a configurar tudo, gerar a build pelo menu e também via script (útil para CI/CD), e entender por que o Unity gera aquela pasta _Data ao lado do .exe que você nunca pode apagar.`,
    codes: [
      {
        lang: "csharp",
        code: `// Editor/BuildScript.cs
// Script de build automatizado. Coloque dentro de uma pasta chamada "Editor".
// Permite gerar a build pela linha de comando ou pelo menu Tools > Build > Windows.
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

public static class BuildScript
{
    [MenuItem("Tools/Build/Windows x64")]
    public static void BuildWindows()
    {
        // Lista todas as cenas que estao habilitadas no Build Settings.
        string[] scenes = EditorBuildSettingsScene.GetActiveSceneList(
            EditorBuildSettings.scenes
        );

        // Caminho de saida da build (pasta Builds/Windows na raiz do projeto).
        string outputDir = Path.Combine(Directory.GetCurrentDirectory(), "Builds", "Windows");
        Directory.CreateDirectory(outputDir);
        string exePath = Path.Combine(outputDir, "MeuJogo.exe");

        // Define backend IL2CPP (mais rapido em runtime e mais seguro).
        PlayerSettings.SetScriptingBackend(NamedBuildTarget.Standalone, ScriptingImplementation.IL2CPP);
        PlayerSettings.SetIl2CppCompilerConfiguration(NamedBuildTarget.Standalone, Il2CppCompilerConfiguration.Master);

        BuildPlayerOptions options = new BuildPlayerOptions
        {
            scenes = scenes,
            locationPathName = exePath,
            target = BuildTarget.StandaloneWindows64,
            options = BuildOptions.None,
        };

        BuildReport report = BuildPipeline.BuildPlayer(options);
        BuildSummary summary = report.summary;

        if (summary.result == BuildResult.Succeeded)
            Debug.Log($"Build OK: {summary.totalSize / 1024 / 1024} MB em {exePath}");
        else
            Debug.LogError($"Build falhou: {summary.result}");
    }
}`,
      },
      {
        lang: "bash",
        code: `# Rodando a build pela linha de comando (util para CI/CD).
# O Unity precisa estar fechado, e o caminho do executavel varia por versao.
# Substitua o caminho pelo da sua instalacao.

"C:\\Program Files\\Unity\\Hub\\Editor\\2022.3.20f1\\Editor\\Unity.exe" ^
  -batchmode ^
  -nographics ^
  -quit ^
  -projectPath "C:\\Projetos\\MeuJogo" ^
  -executeMethod BuildScript.BuildWindows ^
  -logFile "Builds\\build.log"

# Apos rodar, abra Builds\\build.log para ver erros.
# Codigo de saida 0 = sucesso, qualquer outro = falha.`,
      },
      {
        lang: "csharp",
        code: `// Runtime/AppInfo.cs
// Util para mostrar versao do build dentro do jogo (canto da tela, menu de pause).
// Ajuda a identificar qual versao o tester esta rodando quando reporta bug.
using UnityEngine;
using UnityEngine.UI;

public class AppInfo : MonoBehaviour
{
    [SerializeField] private Text label;

    private void Start()
    {
        // Application.version vem do Player Settings > Version.
        // Application.platform diz onde estamos rodando (Windows, Android, etc).
        label.text = $"v{Application.version} | {Application.platform} | {Application.unityVersion}";
    }
}`,
      },
      {
        lang: "json",
        code: `{
  "_comentario": "Estrutura tipica da pasta de build no Windows",
  "MeuJogo.exe": "executavel principal, abre o jogo",
  "UnityPlayer.dll": "engine Unity em formato nativo",
  "MeuJogo_Data/": {
    "Managed/": "DLLs do seu codigo C# (no Mono)",
    "Plugins/": "bibliotecas nativas (Steamworks, FMOD, etc)",
    "Resources/": "assets carregados via Resources.Load",
    "StreamingAssets/": "arquivos copiados como estao (videos, jsons)",
    "globalgamemanagers": "configuracoes globais e build settings",
    "level0, level1...": "cenas serializadas",
    "sharedassets0.assets": "assets compartilhados entre cenas"
  },
  "_aviso": "Nunca apague pastas _Data ou DLLs ao distribuir. Zipe a pasta inteira."
}`,
      },
    ],
    points: [
      "Build do Windows gera um .exe + pasta _Data; ambos precisam ser distribuidos juntos.",
      "Sempre adicione todas as cenas no Build Settings, ou elas nao existirao no jogo final.",
      "Use IL2CPP em producao: codigo nativo, mais rapido e mais dificil de pirataria.",
      "Configure icone, nome do produto e versao no Player Settings antes de buildar.",
      "Automatize builds via script Editor para nao depender de cliques manuais.",
      "Application.version e Application.platform ajudam a debugar reports de testers.",
      "Distribua sempre zipado: usuarios costumam apagar arquivos achando que sao lixo.",
      "Use modo Development Build para perfilar; nunca entregue Development Build ao usuario final.",
    ],
    alerts: [
      {
        type: "warning",
        content: "A pasta _Data parece 'cheia de lixo' mas e essencial. Se distribuir so o .exe, o jogo abre uma janela preta e fecha. Sempre zipe a pasta inteira.",
      },
      {
        type: "tip",
        content: "Antes de cada build de release, suba a versao no Player Settings e marque Development Build como desligado. Builds de development sao 30 a 50 por cento mais lentas e expoem informacoes internas.",
      },
      {
        type: "info",
        content: "IL2CPP exige Visual Studio com 'Desktop development with C++' instalado no Windows. Sem isso a build falha com erro de cl.exe nao encontrado.",
      },
    ],
  },
  {
    slug: "build-android",
    section: "deploy-projetos",
    title: "Build para Android (APK e AAB)",
    difficulty: "intermediario",
    subtitle: "Gerando APK para teste e AAB assinado para publicar na Google Play.",
    intro: `Publicar um jogo no Android tem dois mundos: o teste rapido (você instala um APK direto no celular via cabo USB) e a publicacao oficial (você sobe um AAB assinado na Google Play Console). Os dois usam o mesmo botao de Build no Unity, mas exigem configuracoes diferentes. Entender essa diferenca evita semanas perdidas tentando publicar um APK que a Play rejeita.

APK significa Android Package. E o formato historico, um zip que o Android instala direto. Bom para testar no seu celular ou mandar para um colega. AAB significa Android App Bundle, formato moderno e obrigatorio na Google Play desde 2021. O AAB nao e um app instalavel — e um pacote que a Google usa para gerar APKs especificos para cada modelo de aparelho, reduzindo o tamanho do download. Voce gera um AAB assinado, sobe na Play Console, e ela cuida do resto.

Para qualquer build de Android voce precisa de tres coisas: o Android SDK (kit de desenvolvimento), o NDK (kit nativo, necessario para IL2CPP) e o JDK (Java Development Kit). O Unity Hub instala tudo isso automaticamente se voce marcar 'Android Build Support' ao instalar o Editor. Se voce instalou e esqueceu, va em Unity Hub > Installs > o tres pontinhos > Add Modules.

Para publicar oficialmente, voce precisa assinar o app com uma keystore. Pense na keystore como o RG do seu app: e um arquivo criptografado que prova que aquela atualizacao veio de voce, nao de um pirata. Se voce perder a keystore depois de publicar, nao consegue mais atualizar o app — vai precisar publicar como app novo, perdendo todos os usuarios. Faca backup em pelo menos dois lugares fisicamente diferentes.

A arquitetura tambem importa. Telefones modernos sao ARM64 (arm64-v8a). Telefones antigos podem ser ARMv7. Para a Play, voce precisa entregar suporte para ARM64 obrigatoriamente desde 2019. No Unity, marque ARMv7 e ARM64 nas Player Settings > Other Settings > Target Architectures.`,
    codes: [
      {
        lang: "csharp",
        code: `// Editor/AndroidBuildScript.cs
// Build automatizado para Android com switch entre APK (debug) e AAB (release).
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

public static class AndroidBuildScript
{
    [MenuItem("Tools/Build/Android APK (Debug)")]
    public static void BuildApkDebug() => Build(false);

    [MenuItem("Tools/Build/Android AAB (Release)")]
    public static void BuildAabRelease() => Build(true);

    private static void Build(bool releaseAab)
    {
        // Configuracoes obrigatorias.
        EditorUserBuildSettings.buildAppBundle = releaseAab;
        PlayerSettings.SetScriptingBackend(NamedBuildTarget.Android, ScriptingImplementation.IL2CPP);
        PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARMv7 | AndroidArchitecture.ARM64;

        // Versao do app: versionCode e numero inteiro que SEMPRE sobe a cada release.
        // Se voce subir AAB com versionCode igual ou menor que o anterior, a Play recusa.
        PlayerSettings.Android.bundleVersionCode++;

        // Assinatura (so para release).
        if (releaseAab)
        {
            PlayerSettings.Android.useCustomKeystore = true;
            PlayerSettings.Android.keystoreName = "keys/meujogo.keystore";
            PlayerSettings.Android.keystorePass = System.Environment.GetEnvironmentVariable("KEYSTORE_PASS");
            PlayerSettings.Android.keyaliasName = "meujogo";
            PlayerSettings.Android.keyaliasPass = System.Environment.GetEnvironmentVariable("KEYALIAS_PASS");
        }

        string ext = releaseAab ? "aab" : "apk";
        string outputDir = Path.Combine(Directory.GetCurrentDirectory(), "Builds", "Android");
        Directory.CreateDirectory(outputDir);
        string outputPath = Path.Combine(outputDir, $"MeuJogo_v{PlayerSettings.Android.bundleVersionCode}.{ext}");

        BuildPlayerOptions options = new BuildPlayerOptions
        {
            scenes = EditorBuildSettingsScene.GetActiveSceneList(EditorBuildSettings.scenes),
            locationPathName = outputPath,
            target = BuildTarget.Android,
            options = releaseAab ? BuildOptions.None : BuildOptions.Development | BuildOptions.AllowDebugging,
        };

        BuildReport report = BuildPipeline.BuildPlayer(options);
        Debug.Log($"Build {ext.ToUpper()}: {report.summary.result} -> {outputPath}");
    }
}`,
      },
      {
        lang: "bash",
        code: `# Gerar uma keystore nova (faca isso UMA vez por jogo, e nunca perca).
# Requer o JDK instalado (vem com o Unity Hub).
# Validade de 50 anos (Google exige no minimo ate 2033).

keytool -genkeypair \\
  -v \\
  -keystore meujogo.keystore \\
  -alias meujogo \\
  -keyalg RSA \\
  -keysize 2048 \\
  -validity 18250 \\
  -storepass "SUA_SENHA_FORTE" \\
  -keypass "SUA_SENHA_FORTE" \\
  -dname "CN=Seu Nome, O=Sua Empresa, C=BR"

# Backup OBRIGATORIO: copie meujogo.keystore para um pendrive E para a nuvem privada.
# Se perder, nunca mais conseguira atualizar o app na Play.`,
      },
      {
        lang: "bash",
        code: `# Instalar APK gerado direto no celular (modo desenvolvedor + USB debugging ligados).
# adb vem dentro do Android SDK que o Unity Hub instalou.

adb devices                                    # confirma que o celular esta listado
adb install -r Builds/Android/MeuJogo_v1.apk   # -r reinstala por cima
adb logcat -s Unity                            # mostra logs do Unity em tempo real

# Para desinstalar:
adb uninstall com.suaempresa.meujogo`,
      },
      {
        lang: "csharp",
        code: `// Runtime/AndroidPermissions.cs
// Pedir permissoes de runtime no Android 6+ (camera, microfone, localizacao).
// Sem isso, o app abre mas nao consegue usar o recurso e parece bugado.
using UnityEngine;
using UnityEngine.Android;

public class AndroidPermissions : MonoBehaviour
{
    private void Start()
    {
        // Exemplo: pedir permissao de microfone para um jogo de karaoke.
        if (!Permission.HasUserAuthorizedPermission(Permission.Microphone))
        {
            var callbacks = new PermissionCallbacks();
            callbacks.PermissionGranted += p => Debug.Log($"Permitido: {p}");
            callbacks.PermissionDenied  += p => Debug.LogWarning($"Negado: {p}");
            Permission.RequestUserPermission(Permission.Microphone, callbacks);
        }
    }
}`,
      },
    ],
    points: [
      "APK e para teste local; AAB e obrigatorio para publicar na Google Play.",
      "Marque ARMv7 e ARM64 nas Target Architectures; ARM64 e exigencia da Play.",
      "versionCode tem que subir a cada upload, ou a Play rejeita o AAB.",
      "Keystore = identidade do app. Perdeu, perdeu acesso de atualizacao para sempre.",
      "Use IL2CPP no Android: melhor performance e exigido pela Play para 64 bits.",
      "Pacote (com.empresa.jogo) e definitivo apos primeiro upload na Play.",
      "Senhas de keystore nunca devem ir para o git; use variaveis de ambiente.",
      "Use adb logcat para debugar problemas que so aparecem no celular real.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Faca backup da keystore em PELO MENOS dois lugares (pendrive + nuvem privada). Sem ela voce literalmente nao consegue mais atualizar seu app na Google Play, e a Google nao tem como recuperar.",
      },
      {
        type: "warning",
        content: "Nunca commite a keystore nem as senhas no git. Adicione *.keystore ao .gitignore. Vazamento de keystore permite a terceiros publicar atualizacoes maliciosas no SEU app.",
      },
      {
        type: "tip",
        content: "Antes do primeiro release, teste o AAB usando bundletool localmente. Ele simula o que a Play vai gerar e pega erros antes do upload.",
      },
    ],
  },
  {
    slug: "build-ios",
    section: "deploy-projetos",
    title: "Build para iOS (Xcode e provisioning)",
    difficulty: "avancado",
    subtitle: "Do projeto Unity ao app instalado no iPhone, passando pelo Xcode e pela Apple Developer.",
    intro: `Build de iOS e fundamentalmente diferente de Windows e Android: o Unity NAO gera o .ipa (instalavel) diretamente. Ele gera um projeto Xcode, e voce abre esse projeto no Xcode (que so existe no macOS) para gerar o app final. Isso significa que voce precisa de um Mac (fisico ou virtual) e de uma conta Apple Developer paga (99 dolares por ano) para qualquer publicacao real.

A razao desse pipeline duplo e historica e tecnica: a Apple controla rigidamente o que roda no iPhone e exige que toda compilacao final passe pelas ferramentas oficiais (clang, codesign, xcodebuild). O Unity gera codigo C++ (via IL2CPP, obrigatorio no iOS) junto com um projeto Xcode pronto, e o Xcode finaliza a compilacao nativa, assina e empacota.

Voce vai esbarrar em conceitos novos: Bundle Identifier (identificador unico do app, parecido com pacote Android), Team ID (sua conta de desenvolvedor), Provisioning Profile (autorizacao para instalar o app em determinados aparelhos ou na App Store) e Signing Certificate (certificado que prova que voce e voce). A Apple combina esses quatro para autorizar a instalacao. Se um deles bate errado, o app nao instala e o erro raramente e claro.

Existem dois tipos principais de provisioning: Development (para testar em iPhones especificos cadastrados no portal) e Distribution (para enviar para a App Store ou TestFlight). Para o seu primeiro teste, use Development. Conecte seu iPhone via cabo USB, autorize o Mac no telefone, e o Xcode pode instalar a build direto.

Um detalhe critico que pega todo iniciante: se voce mudar qualquer coisa no Player Settings do Unity (icone, orientacao, plugins) e re-gerar o projeto Xcode, ele sobrescreve mudancas que voce tenha feito no Xcode. Por isso, a regra de ouro e: configure tudo dentro do Unity (incluindo entradas no Info.plist via Xcode Project Modifier scripts) e use o Xcode so para build final.`,
    codes: [
      {
        lang: "csharp",
        code: `// Editor/iOSBuildScript.cs
// Gera o projeto Xcode e configura o BundleIdentifier.
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

public static class iOSBuildScript
{
    [MenuItem("Tools/Build/iOS Xcode Project")]
    public static void BuildIOS()
    {
        // BundleIdentifier deve ser unico globalmente e bater com o do Apple Developer.
        PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.iOS, "com.suaempresa.meujogo");

        // Versao visivel para o usuario (1.0, 1.1) e build interna (1, 2, 3).
        PlayerSettings.bundleVersion = "1.0.0";
        PlayerSettings.iOS.buildNumber = "1";

        // iOS exige IL2CPP. Mono nao e suportado faz tempo.
        PlayerSettings.SetScriptingBackend(NamedBuildTarget.iOS, ScriptingImplementation.IL2CPP);
        PlayerSettings.SetArchitecture(NamedBuildTarget.iOS, 1); // ARM64

        // Versao minima do iOS suportada.
        PlayerSettings.iOS.targetOSVersionString = "13.0";

        string outputDir = Path.Combine(Directory.GetCurrentDirectory(), "Builds", "iOS");
        Directory.CreateDirectory(outputDir);

        BuildPlayerOptions options = new BuildPlayerOptions
        {
            scenes = EditorBuildSettingsScene.GetActiveSceneList(EditorBuildSettings.scenes),
            locationPathName = outputDir,
            target = BuildTarget.iOS,
            options = BuildOptions.None,
        };

        BuildReport report = BuildPipeline.BuildPlayer(options);
        Debug.Log($"Xcode project gerado em: {outputDir} - {report.summary.result}");
        Debug.Log("Agora abra Unity-iPhone.xcworkspace no Xcode e Archive.");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Editor/PostBuildIOS.cs
// Roda apos o Unity gerar o projeto Xcode e modifica Info.plist e Capabilities.
// Sem isso voce teria que fazer essas mudancas no Xcode toda vez (e perder ao re-buildar).
#if UNITY_IOS
using UnityEditor;
using UnityEditor.Callbacks;
using UnityEditor.iOS.Xcode;

public static class PostBuildIOS
{
    [PostProcessBuild(45)]
    public static void OnPostProcessBuild(BuildTarget target, string pathToBuiltProject)
    {
        if (target != BuildTarget.iOS) return;

        // 1) Adicionar entradas no Info.plist (descricoes de permissao OBRIGATORIAS no iOS).
        string plistPath = pathToBuiltProject + "/Info.plist";
        PlistDocument plist = new PlistDocument();
        plist.ReadFromFile(plistPath);

        // Sem essas strings, a Apple rejeita o app na revisao.
        plist.root.SetString("NSCameraUsageDescription", "Usamos a camera para tirar foto do avatar.");
        plist.root.SetString("NSMicrophoneUsageDescription", "Gravamos audio para chat de voz no jogo.");
        plist.root.SetString("NSPhotoLibraryUsageDescription", "Salvamos screenshots na sua galeria.");

        // Esconder a barra de status no jogo.
        plist.root.SetBoolean("UIStatusBarHidden", true);
        plist.WriteToFile(plistPath);

        // 2) Adicionar Capability (ex: Push Notifications, Game Center, In-App Purchase).
        string projPath = PBXProject.GetPBXProjectPath(pathToBuiltProject);
        PBXProject proj = new PBXProject();
        proj.ReadFromFile(projPath);
        string targetGuid = proj.GetUnityMainTargetGuid();
        proj.AddCapability(targetGuid, PBXCapabilityType.GameCenter);
        proj.WriteToFile(projPath);
    }
}
#endif`,
      },
      {
        lang: "bash",
        code: `# Apos o Unity gerar o projeto Xcode, voce pode arquivar e exportar via linha de comando.
# Util para CI/CD em macOS (fastlane, GitHub Actions com runner macOS).

cd Builds/iOS

# 1) Archive (gera o .xcarchive).
xcodebuild -workspace Unity-iPhone.xcworkspace \\
  -scheme Unity-iPhone \\
  -configuration Release \\
  -archivePath build/MeuJogo.xcarchive \\
  archive

# 2) Exportar IPA usando ExportOptions.plist (definindo distribution method).
xcodebuild -exportArchive \\
  -archivePath build/MeuJogo.xcarchive \\
  -exportPath build/ipa \\
  -exportOptionsPlist ExportOptions.plist

# 3) Subir para TestFlight via altool ou Transporter.
xcrun altool --upload-app -f build/ipa/MeuJogo.ipa \\
  -u "seuemail@apple.com" -p "@keychain:AC_PASSWORD"`,
      },
      {
        lang: "json",
        code: `{
  "_arquivo": "ExportOptions.plist em formato JSON para visualizacao",
  "method": "app-store",
  "teamID": "ABCD123456",
  "uploadBitcode": false,
  "uploadSymbols": true,
  "signingStyle": "automatic",
  "stripSwiftSymbols": true,
  "_observacao": "method pode ser: development, ad-hoc, enterprise ou app-store"
}`,
      },
    ],
    points: [
      "Unity gera projeto Xcode; o Xcode (so no Mac) gera o IPA final.",
      "Conta Apple Developer paga (99 USD/ano) e obrigatoria para instalar em qualquer iPhone real.",
      "iOS exige IL2CPP + ARM64; Mono nao e mais suportado.",
      "Bundle Identifier deve ser unico e bater com o cadastrado no Apple Developer.",
      "Info.plist precisa de NSXxxUsageDescription para cada permissao, ou a Apple rejeita.",
      "Use PostProcessBuild para configurar Info.plist e Capabilities, nao mexa direto no Xcode.",
      "Provisioning Development = teste em devices listados; Distribution = App Store/TestFlight.",
      "buildNumber tem que subir a cada upload no App Store Connect, mesmo na mesma versao.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Toda permissao usada (camera, microfone, foto, localizacao, bluetooth) precisa de uma string de descricao no Info.plist explicando POR QUE o app usa. App sem isso crasha ao pedir a permissao e e rejeitado na revisao.",
      },
      {
        type: "info",
        content: "Voce nao precisa de um Mac fisico se nao quiser. Servicos como MacinCloud ou GitHub Actions com runner macOS permitem buildar iOS de Windows/Linux por hora ou por mes.",
      },
      {
        type: "tip",
        content: "Use TestFlight para testes beta antes de submeter para a App Store. Voce pode convidar ate 10 mil testers externos sem passar pela revisao formal de cada release.",
      },
    ],
  },
  {
    slug: "build-webgl",
    section: "deploy-projetos",
    title: "Build para WebGL (jogo no navegador)",
    difficulty: "avancado",
    subtitle: "Publicando seu jogo Unity em qualquer site, sem instalar nada.",
    intro: `WebGL transforma seu projeto Unity em um conjunto de arquivos HTML, JavaScript e binarios WebAssembly que rodam direto no navegador, sem download nem instalacao. Isso e magico para distribuicao: voce manda um link no WhatsApp e o amigo abre no celular, sem Play Store, sem App Store, sem nada. E a forma mais barata de fazer game jam, prototipo viral ou portfolio jogavel.

Em termos tecnicos, o Unity converte seu C# para C++ via IL2CPP, depois compila esse C++ para WebAssembly via Emscripten. O resultado e um pacote leve (relativamente) que o navegador executa quase com performance nativa. Mas atencao: WebGL no Unity tem limitacoes serias. Nao tem acesso ao sistema de arquivos local, nao suporta multithreading da mesma forma que builds nativas, e a memoria e pre-alocada num heap fixo.

Tres pilares dominam uma build WebGL bem feita: compressao, memoria e tempo de carregamento. Compressao Brotli reduz o tamanho dos arquivos pela metade comparado a Gzip, mas exige configuracao no servidor. Memoria pre-alocada significa que voce define quantos megabytes o jogo vai usar — se passar, ele crasha com 'Out of memory'. Tempo de carregamento e o pior inimigo: builds WebGL pesadas (50+ MB) afastam jogadores. Cada segundo de loading reduz a taxa de jogadores que ficam.

Use WebGL para: prototipos, game jams (itch.io), demos jogaveis em portfolio, jogos casuais 2D, marketing interativo. Nao use para: jogos 3D pesados (texturas pesadas, muitos modelos), jogos que precisam de muita RAM, jogos que dependem de salvar arquivos grandes localmente, ou jogos com codigo nativo (DLLs, plugins de SO).

A pasta gerada pelo Unity tem index.html, Build/ (com .data, .wasm, .framework.js, .loader.js) e StreamingAssets/. Voce sobe tudo isso para qualquer servico estatico (itch.io, GitHub Pages, Netlify, Vercel, S3). Itch.io ate descompacta um zip direto e ja serve com headers corretos.`,
    codes: [
      {
        lang: "csharp",
        code: `// Editor/WebGLBuildScript.cs
// Build otimizada de WebGL com compressao Brotli e memoria adequada.
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

public static class WebGLBuildScript
{
    [MenuItem("Tools/Build/WebGL")]
    public static void BuildWebGL()
    {
        // Compressao: Brotli e menor mas exige header do servidor.
        // Disabled = arquivos crus (testar localmente sem servidor configurado).
        PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Brotli;

        // Memoria heap inicial: comecar pequeno e deixar o navegador crescer ate o maximo.
        PlayerSettings.WebGL.memorySize = 256;       // MB iniciais
        PlayerSettings.WebGL.exceptionSupport = WebGLExceptionSupport.None; // libera 30% de tamanho

        // Template define o HTML que envolve o jogo (loader, barra de progresso).
        // 'Default' funciona, 'Minimal' e mais limpo para portfolio.
        PlayerSettings.WebGL.template = "PROJECT:Minimal";

        // Caching: assets ficam no IndexedDB do browser, evitando re-download na proxima visita.
        PlayerSettings.WebGL.dataCaching = true;

        // Linker: 'Speed' resulta em build maior e jogo mais rapido. 'Size' o oposto.
        PlayerSettings.WebGL.linkerTarget = WebGLLinkerTarget.Wasm;

        string outputDir = Path.Combine(Directory.GetCurrentDirectory(), "Builds", "WebGL");
        Directory.CreateDirectory(outputDir);

        BuildPlayerOptions options = new BuildPlayerOptions
        {
            scenes = EditorBuildSettingsScene.GetActiveSceneList(EditorBuildSettings.scenes),
            locationPathName = outputDir,
            target = BuildTarget.WebGL,
            options = BuildOptions.None,
        };

        BuildReport report = BuildPipeline.BuildPlayer(options);
        long mb = report.summary.totalSize / (1024 * 1024);
        Debug.Log($"Build WebGL: {report.summary.result} - {mb} MB total - em {outputDir}");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Runtime/WebGLBridge.cs
// Como chamar JavaScript a partir do C# (e vice-versa).
// Util para integrar com APIs do navegador: localStorage, share, leaderboards web.
using System.Runtime.InteropServices;
using UnityEngine;

public class WebGLBridge : MonoBehaviour
{
    // Importa funcao definida em um arquivo .jslib dentro de Assets/Plugins/WebGL/.
    [DllImport("__Internal")]
    private static extern void SalvarNoLocalStorage(string chave, string valor);

    [DllImport("__Internal")]
    private static extern string LerDoLocalStorage(string chave);

    public void SalvarPontuacao(int pontos)
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        SalvarNoLocalStorage("highscore", pontos.ToString());
#else
        PlayerPrefs.SetInt("highscore", pontos);
#endif
    }

    public int LerPontuacao()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        string s = LerDoLocalStorage("highscore");
        return string.IsNullOrEmpty(s) ? 0 : int.Parse(s);
#else
        return PlayerPrefs.GetInt("highscore", 0);
#endif
    }

    // Metodo chamado pelo JavaScript: SendMessage('NomeGameObject', 'OnNavegadorEvento', 'dados').
    public void OnNavegadorEvento(string dados)
    {
        Debug.Log($"Recebido do JS: {dados}");
    }
}`,
      },
      {
        lang: "json",
        code: `{
  "_arquivo": "Assets/Plugins/WebGL/LocalStorage.jslib",
  "_descricao": "Plugin JS que expoe localStorage para C#",
  "_conteudo_real": "mergeInto(LibraryManager.library, { SalvarNoLocalStorage: function(chave, valor) { var c = UTF8ToString(chave); var v = UTF8ToString(valor); window.localStorage.setItem(c, v); }, LerDoLocalStorage: function(chave) { var c = UTF8ToString(chave); var v = window.localStorage.getItem(c) || ''; var len = lengthBytesUTF8(v) + 1; var ptr = _malloc(len); stringToUTF8(v, ptr, len); return ptr; } });"
}`,
      },
      {
        lang: "bash",
        code: `# Servir a build WebGL localmente para testar (sem isso, browsers bloqueiam por CORS).
# Opcao 1: Python (vem com qualquer Mac/Linux).
cd Builds/WebGL
python3 -m http.server 8080
# Abra http://localhost:8080 no navegador.

# Opcao 2: Node + http-server (suporta Brotli/Gzip nativamente).
npm install -g http-server
http-server Builds/WebGL -p 8080 --gzip --brotli

# Opcao 3: Subir para itch.io (zipa a pasta inteira e arrasta).
cd Builds && zip -r MeuJogo.zip WebGL/

# Para Netlify/Vercel/GitHub Pages, configurar headers:
# Content-Encoding: br para arquivos .br
# Content-Encoding: gzip para arquivos .gz`,
      },
    ],
    points: [
      "WebGL gera HTML + WASM que roda em qualquer navegador moderno, sem instalacao.",
      "Compressao Brotli reduz o tamanho pela metade mas exige header configurado no servidor.",
      "Memoria e pre-alocada: dimensione bem em Player Settings > WebGL > Memory Size.",
      "Desabilitar Exception Support reduz build em 20-30 por cento; reative se precisar debugar.",
      "Use .jslib para chamar JavaScript do navegador a partir do C#.",
      "Itch.io e a forma mais rapida e barata de hospedar jogo WebGL.",
      "Evite WebGL para jogos 3D pesados, multiplayer com plugins nativos ou que precisem de muita RAM.",
      "Cada segundo de loading reduz drasticamente a taxa de jogadores que ficam.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Voce nao consegue testar WebGL abrindo index.html direto no navegador (file://). O browser bloqueia por CORS. Sempre use um servidor HTTP local (python3 -m http.server ou http-server do npm).",
      },
      {
        type: "danger",
        content: "WebGL no Unity NAO suporta System.Threading da mesma forma que builds nativas. Codigo com Thread.Start ou Task.Run pesado pode travar o jogo no navegador. Use coroutines e async/await com cuidado.",
      },
      {
        type: "tip",
        content: "Antes de fazer release, baixe sua propria build de uma rede 4G no celular. Se demora mais de 15 segundos para carregar, otimize texturas e remova assets nao usados antes de qualquer outra coisa.",
      },
    ],
  },
  {
    slug: "otimizacao-mobile",
    section: "deploy-projetos",
    title: "Otimizacao para Mobile",
    difficulty: "avancado",
    subtitle: "Drawing call, batching, atlas, occlusion e tudo que faz seu jogo rodar a 60 FPS no celular.",
    intro: `Otimizar para mobile e ciencia, paciencia e medicao constante. Um celular medio tem entre 5 e 10 vezes menos poder de GPU que um PC gamer e 20 vezes menos memoria de video. O que roda a 200 FPS no seu notebook pode rodar a 12 FPS num Galaxy A30. Pior: vai esquentar o aparelho, esgotar a bateria e fazer o jogador desinstalar nas primeiras horas. Performance mobile nao e luxo, e sobrevivencia.

Os tres viloes maiores em mobile sao: draw calls, fill rate e overdraw. Draw call e cada vez que a CPU pede para a GPU desenhar algo (um sprite, um modelo). Cada draw call tem custo fixo, e celulares aguentam bem menos draw calls que PCs (mire em menos de 100 por frame em mobile baixo, idealmente). Fill rate e quantos pixels a GPU pinta por segundo — se voce tem efeitos transparentes em tela cheia, a GPU repinta os mesmos pixels varias vezes (overdraw) e morre.

Texturas sao o segundo grande problema. Uma textura RGBA 2048x2048 nao comprimida ocupa 16 MB de memoria de video. Cinco dessas e voce ja consumiu mais memoria que muitos celulares tem disponivel para um app. A solucao e compressao especifica de plataforma: ASTC para Android moderno e iOS, ETC2 para Android antigo. O Unity faz isso por padrao, mas voce precisa conferir nas Texture Import Settings.

Batching e a magia que junta varias chamadas de draw em uma so. Static Batching agrupa objetos parados que compartilham material. Dynamic Batching faz o mesmo para objetos pequenos em movimento. GPU Instancing renderiza varios objetos identicos numa unica chamada (ideal para arvores, inimigos repetidos). SRP Batcher (URP/HDRP) agrupa objetos que compartilham shader, mesmo com materiais diferentes — quase sempre vale ligar.

Por fim, profile sempre. O Unity Profiler conectado ao celular real mostra exatamente onde o frame esta gastando tempo. Adivinhar otimizacao e perda de tempo. Um simulador no PC mente. So a medicao no aparelho real (de preferencia o pior aparelho que voce pretende suportar) revela a verdade.`,
    codes: [
      {
        lang: "csharp",
        code: `// Runtime/MobileQuality.cs
// Detecta o tier do celular e ajusta qualidade automaticamente.
// Coloque este script num GameObject persistente da primeira cena.
using UnityEngine;

public class MobileQuality : MonoBehaviour
{
    private void Awake()
    {
        // Frame rate alvo: 60 em high-end, 30 em low-end (poupa bateria).
        Application.targetFrameRate = 60;
        QualitySettings.vSyncCount = 0;

        int memoria = SystemInfo.systemMemorySize; // MB
        int gpuMem = SystemInfo.graphicsMemorySize; // MB

        if (memoria < 3000 || gpuMem < 1024)
            AplicarQualidadeBaixa();
        else if (memoria < 6000)
            AplicarQualidadeMedia();
        else
            AplicarQualidadeAlta();
    }

    private void AplicarQualidadeBaixa()
    {
        QualitySettings.SetQualityLevel(0, true);            // preset Low
        Screen.SetResolution(Screen.width / 2, Screen.height / 2, true); // renderiza em metade
        Application.targetFrameRate = 30;
        QualitySettings.shadows = ShadowQuality.Disable;
        QualitySettings.antiAliasing = 0;
        Debug.Log("Modo de qualidade BAIXA ativado.");
    }

    private void AplicarQualidadeMedia()
    {
        QualitySettings.SetQualityLevel(2, true);
        QualitySettings.shadows = ShadowQuality.HardOnly;
        QualitySettings.antiAliasing = 2;
        Debug.Log("Modo de qualidade MEDIA ativado.");
    }

    private void AplicarQualidadeAlta()
    {
        QualitySettings.SetQualityLevel(4, true);
        QualitySettings.antiAliasing = 4;
        Debug.Log("Modo de qualidade ALTA ativado.");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Runtime/PoolDeBalas.cs
// Object Pool: reutiliza objetos em vez de Instantiate/Destroy (que aloca lixo e roda GC).
// Cada Instantiate em mobile pode causar stutter de frame por causa do GC.
using System.Collections.Generic;
using UnityEngine;

public class PoolDeBalas : MonoBehaviour
{
    [SerializeField] private GameObject prefabBala;
    [SerializeField] private int tamanhoInicial = 30;

    private readonly Queue<GameObject> disponiveis = new Queue<GameObject>();

    private void Awake()
    {
        // Pre-aloca o pool no inicio: zero alocacao depois disso.
        for (int i = 0; i < tamanhoInicial; i++)
            disponiveis.Enqueue(CriarNova());
    }

    private GameObject CriarNova()
    {
        var bala = Instantiate(prefabBala, transform);
        bala.SetActive(false);
        return bala;
    }

    public GameObject Pegar(Vector3 pos, Quaternion rot)
    {
        // Se o pool esvaziou, cria mais. Em jogo bem dimensionado isso quase nunca acontece.
        GameObject bala = disponiveis.Count > 0 ? disponiveis.Dequeue() : CriarNova();
        bala.transform.SetPositionAndRotation(pos, rot);
        bala.SetActive(true);
        return bala;
    }

    public void Devolver(GameObject bala)
    {
        bala.SetActive(false);
        disponiveis.Enqueue(bala);
    }
}`,
      },
      {
        lang: "shaderlab",
        code: `// Assets/Shaders/MobileSimples.shader
// Shader Unlit minimalista: sem iluminacao = quase de graca para a GPU.
// Use em sprites, particulas e elementos de UI que nao precisam de luz dinamica.
Shader "MeuJogo/MobileUnlit"
{
    Properties
    {
        _MainTex ("Textura", 2D) = "white" {}
        _Color   ("Cor", Color) = (1,1,1,1)
    }

    SubShader
    {
        Tags { "RenderType"="Opaque" "Queue"="Geometry" }
        LOD 100

        Pass
        {
            // Sem ZWrite extra, sem fog. Cada linha removida economiza GPU em mobile.
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma multi_compile_instancing  // habilita GPU Instancing
            #include "UnityCG.cginc"

            sampler2D _MainTex;
            float4 _Color;

            struct appdata { float4 vertex : POSITION; float2 uv : TEXCOORD0; UNITY_VERTEX_INPUT_INSTANCE_ID };
            struct v2f    { float4 pos : SV_POSITION; float2 uv : TEXCOORD0; UNITY_VERTEX_INPUT_INSTANCE_ID };

            v2f vert(appdata v)
            {
                v2f o;
                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_TRANSFER_INSTANCE_ID(v, o);
                o.pos = UnityObjectToClipPos(v.vertex);
                o.uv = v.uv;
                return o;
            }

            fixed4 frag(v2f i) : SV_Target
            {
                return tex2D(_MainTex, i.uv) * _Color;
            }
            ENDCG
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Runtime/FpsMonitor.cs
// HUD simples para monitorar FPS em build real (sem Profiler conectado).
// Esquerda: FPS atual. Direita: media e pior frame nos ultimos 60 frames.
using UnityEngine;

public class FpsMonitor : MonoBehaviour
{
    private float[] historico = new float[60];
    private int idx;
    private GUIStyle estilo;

    private void Update()
    {
        historico[idx] = 1f / Time.unscaledDeltaTime;
        idx = (idx + 1) % historico.Length;
    }

    private void OnGUI()
    {
        if (estilo == null)
        {
            estilo = new GUIStyle(GUI.skin.label) { fontSize = 28, normal = { textColor = Color.green } };
        }

        float soma = 0f, pior = 9999f;
        foreach (var f in historico) { soma += f; if (f < pior) pior = f; }
        float media = soma / historico.Length;

        GUI.Label(new Rect(20, 20, 600, 40), $"FPS atual: {historico[idx == 0 ? historico.Length - 1 : idx - 1]:0}", estilo);
        GUI.Label(new Rect(20, 60, 600, 40), $"Media: {media:0.0}  Pior: {pior:0.0}", estilo);
    }
}`,
      },
    ],
    points: [
      "Mire em menos de 100 draw calls em mobile baixo; ative SRP Batcher e GPU Instancing.",
      "Compressao de textura: ASTC para Android/iOS modernos; ETC2 para Android antigo.",
      "Use Object Pool para tudo que nasce e morre rapido (balas, particulas, inimigos).",
      "Application.targetFrameRate = 60 sem vSync para controle previsivel em mobile.",
      "Profile no aparelho real, nunca no Editor; o pior aparelho da sua lista alvo manda na decisao.",
      "Atlas de sprites e atlas de UI reduzem dramaticamente draw calls de UI.",
      "Particulas com transparencia em tela cheia matam GPU mobile; reduza count e tamanho.",
      "Garbage Collection causa stutter; evite Instantiate/Destroy no Update e use cache de strings.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Texturas configuradas como RGBA 32 sem compressao matam memoria mobile. Sempre cheque Texture Import Settings > Override for Android/iOS e use ASTC 6x6 como ponto de partida.",
      },
      {
        type: "danger",
        content: "Sombras dinamicas em tempo real sao caras em mobile. Para chao e cenarios use light baking. Para personagens, considere blob shadow (um sprite de sombra projetado).",
      },
      {
        type: "tip",
        content: "Conecte o celular via USB e use o Unity Profiler com Build Development. A primeira coisa a olhar e a coluna 'CPU Usage > Rendering'. Se passar de 8 ms por frame, voce nao chega aos 60 FPS.",
      },
    ],
  },
  {
    slug: "projeto-pong",
    section: "deploy-projetos",
    title: "Projeto: Pong em 2D",
    difficulty: "intermediario",
    subtitle: "Recriando o classico de 1972 com fisica 2D, pontuacao e dois jogadores locais.",
    intro: `O Pong foi o primeiro jogo comercial de sucesso, lancado pela Atari em 1972. Por tras da simplicidade absoluta — duas raquetes e uma bola — existe uma licao perfeita de game design: input direto, regras claras em cinco segundos, feedback imediato. Reproduzir o Pong em Unity e o melhor primeiro projeto completo porque cobre input, fisica, colisao, pontuacao, UI e reset de estado, sem perder voce em complexidade visual.

Voce vai criar tres elementos principais: duas raquetes (sprites brancos) controladas por teclado, uma bola que se move com fisica e quica nas paredes e raquetes, e dois textos de UI mostrando a pontuacao. A bola usa Rigidbody2D em modo dinamico com velocidade constante. As raquetes usam Rigidbody2D em modo Kinematic (movido por codigo, nao afetado por forcas) com BoxCollider2D. As paredes superior e inferior sao colliders estaticos sem sprite (ou com sprite de borda).

A magica do Pong esta no detalhe da reflexao da bola. Se a bola simplesmente quica como uma esfera em fisica real, o jogo fica mecanico e injusto. A solucao classica e: quando a bola bate na raquete, calcular a posicao do impacto em relacao ao centro da raquete e ajustar o angulo proporcionalmente. Bater no canto superior da raquete manda a bola para cima em angulo agudo; bater no centro mantem ela horizontal. Isso da controle ao jogador e e o que torna o Pong um jogo de habilidade, nao de sorte.

Este projeto te ensina o ciclo basico: receber input no Update, aplicar fisica no FixedUpdate, detectar colisao em OnCollisionEnter2D, atualizar UI quando o estado muda. Se voce dominar isso, ja tem o esqueleto de qualquer jogo 2D. Plataformer, top-down, puzzle — todos seguem o mesmo padrao com variacoes.

Antes de copiar o codigo, monte a cena: GameObject 'Bola' com SpriteRenderer (circulo), Rigidbody2D (Gravity Scale 0, Collision Detection Continuous), CircleCollider2D, e Material 2D com Friction 0 e Bounciness 1. Duas raquetes 'RaqueteEsq' e 'RaqueteDir' como retangulos com Rigidbody2D Kinematic e BoxCollider2D. Quatro paredes (cima, baixo, dois 'gols' invisiveis). Canvas com dois Text para placar.`,
    codes: [
      {
        lang: "csharp",
        code: `// Runtime/Pong/Raquete.cs
// Controla uma raquete via teclado. Configure 'teclaSobe' e 'teclaDesce' no Inspector.
using UnityEngine;

[RequireComponent(typeof(Rigidbody2D))]
public class Raquete : MonoBehaviour
{
    [SerializeField] private KeyCode teclaSobe  = KeyCode.W;
    [SerializeField] private KeyCode teclaDesce = KeyCode.S;
    [SerializeField] private float velocidade = 8f;
    [SerializeField] private float limiteY = 4f; // limite vertical da arena

    private Rigidbody2D rb;
    private float direcao;

    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        rb.bodyType = RigidbodyType2D.Kinematic; // movido por codigo, nao por fisica
    }

    private void Update()
    {
        // Le input no Update (frame de tela).
        direcao = 0f;
        if (Input.GetKey(teclaSobe))  direcao = +1f;
        if (Input.GetKey(teclaDesce)) direcao = -1f;
    }

    private void FixedUpdate()
    {
        // Aplica movimento no FixedUpdate (frame de fisica).
        Vector2 pos = rb.position + Vector2.up * direcao * velocidade * Time.fixedDeltaTime;
        pos.y = Mathf.Clamp(pos.y, -limiteY, limiteY);
        rb.MovePosition(pos);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Runtime/Pong/Bola.cs
// Bola que comeca parada, lanca em direcao aleatoria e ajusta angulo no impacto com raquete.
using UnityEngine;

[RequireComponent(typeof(Rigidbody2D), typeof(CircleCollider2D))]
public class Bola : MonoBehaviour
{
    [SerializeField] private float velocidadeInicial = 6f;
    [SerializeField] private float aceleracaoPorBatida = 0.3f;
    [SerializeField] private float velocidadeMaxima = 14f;

    private Rigidbody2D rb;
    private float velocidadeAtual;

    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        rb.gravityScale = 0f;
        rb.collisionDetectionMode = CollisionDetectionMode2D.Continuous;
    }

    private void Start() => Reiniciar();

    public void Reiniciar()
    {
        // Pequena pausa antes de lancar (UX).
        rb.linearVelocity = Vector2.zero;
        transform.position = Vector3.zero;
        velocidadeAtual = velocidadeInicial;
        Invoke(nameof(Lancar), 1f);
    }

    private void Lancar()
    {
        // Direcao aleatoria horizontal predominante.
        float x = Random.value < 0.5f ? -1f : 1f;
        float y = Random.Range(-0.5f, 0.5f);
        rb.linearVelocity = new Vector2(x, y).normalized * velocidadeAtual;
    }

    private void OnCollisionEnter2D(Collision2D col)
    {
        // Se colidiu com raquete, ajusta angulo baseado no ponto de impacto.
        if (col.transform.TryGetComponent<Raquete>(out _))
        {
            float ladoY = (transform.position.y - col.transform.position.y) / col.collider.bounds.size.y;
            ladoY = Mathf.Clamp(ladoY, -0.8f, 0.8f);

            float dirX = Mathf.Sign(rb.linearVelocity.x) * -1f; // inverte X
            Vector2 nova = new Vector2(dirX, ladoY * 1.2f).normalized;

            velocidadeAtual = Mathf.Min(velocidadeAtual + aceleracaoPorBatida, velocidadeMaxima);
            rb.linearVelocity = nova * velocidadeAtual;
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Runtime/Pong/Gol.cs
// Trigger nas paredes laterais. Quando a bola entra, marca ponto e reinicia.
using UnityEngine;

public class Gol : MonoBehaviour
{
    public enum Lado { Esquerda, Direita }

    [SerializeField] private Lado lado;
    [SerializeField] private GameManager gameManager;

    private void OnTriggerEnter2D(Collider2D other)
    {
        if (other.TryGetComponent<Bola>(out var bola))
        {
            // Quando a bola passa do gol esquerdo, quem pontua e o jogador da DIREITA.
            if (lado == Lado.Esquerda)
                gameManager.PontoDireita();
            else
                gameManager.PontoEsquerda();

            bola.Reiniciar();
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Runtime/Pong/GameManager.cs
// Mantem placar e atualiza UI.
using TMPro;
using UnityEngine;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{
    [SerializeField] private TMP_Text placarEsq;
    [SerializeField] private TMP_Text placarDir;
    [SerializeField] private int pontosParaVencer = 7;

    private int pE, pD;

    public void PontoEsquerda()
    {
        pE++;
        Atualizar();
        VerificarFim();
    }

    public void PontoDireita()
    {
        pD++;
        Atualizar();
        VerificarFim();
    }

    private void Atualizar()
    {
        placarEsq.text = pE.ToString();
        placarDir.text = pD.ToString();
    }

    private void VerificarFim()
    {
        if (pE >= pontosParaVencer || pD >= pontosParaVencer)
        {
            Debug.Log(pE > pD ? "Jogador Esquerda venceu!" : "Jogador Direita venceu!");
            Invoke(nameof(Recomecar), 2f);
        }
    }

    private void Recomecar() => SceneManager.LoadScene(SceneManager.GetActiveScene().name);
}`,
      },
    ],
    points: [
      "Raquete usa Rigidbody2D Kinematic + MovePosition no FixedUpdate.",
      "Bola usa Rigidbody2D Dynamic com Gravity Scale 0 e Continuous collision.",
      "Material 2D com Friction 0 e Bounciness 1 garante quique perfeito nas paredes.",
      "Reflexao da bola na raquete deve depender do ponto de impacto (estilo Pong original).",
      "Use OnTriggerEnter2D para detectar gol; nao use OnCollision (a bola precisa atravessar).",
      "Acelere a bola a cada batida para aumentar tensao ao longo do rally.",
      "Use TextMeshPro para placar; o Text legado tem renderizacao pior.",
      "Reinicie a bola com pequena pausa (Invoke 1s) para o jogador se preparar.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Se a bola estiver atravessando paredes em alta velocidade, mude Collision Detection da Rigidbody2D para Continuous. Em Discrete a bola pode pular o collider entre frames.",
      },
      {
        type: "info",
        content: "Use Physics2D.gravity = Vector2.zero ou GravityScale 0 na bola, mas mantenha gravidade global se outros objetos da cena precisarem cair. Configurar por objeto e mais flexivel.",
      },
    ],
  },
  {
    slug: "projeto-platformer",
    section: "deploy-projetos",
    title: "Projeto: Platformer 2D",
    difficulty: "avancado",
    subtitle: "Player com pulo, plataformas, colecionaveis e detector de chao decente.",
    intro: `Plataformer 2D e o teste de fogo de qualquer programador de jogos. Parece simples — andar e pular — mas envolve detalhes que separam um jogo gostoso de jogar de um jogo frustrante. Mario, Sonic, Celeste e Hollow Knight gastaram meses ajustando coisas que voce nem percebe: peso do pulo, coyote time, jump buffering, aceleracao no chao versus no ar, deteccao de chao confiavel.

Neste projeto voce vai construir o esqueleto de um plataformer com Player que anda nos dois lados, pula com altura variavel (segurar = pulo mais alto), tem coyote time (pode pular um frame depois de sair da plataforma, perdoando timing humano) e jump buffering (se voce apertar pulo um pouco antes de tocar o chao, ele guarda o input e pula assim que pousa). Esses dois truques sao invisiveis para o jogador mas fazem o controle parecer 'magicamente bom'.

Voce vai aprender o padrao de deteccao de chao por raycast: em vez de confiar em OnCollisionStay, voce dispara um raio curto para baixo a cada frame e checa se ele bateu em algo na layer 'Chao'. E mais previsivel, mais barato e te da informacao extra (distancia do chao, normal da superficie). E o padrao de qualquer engine de plataformer profissional.

A camera vai seguir o player com suavidade (Lerp) e ter limites para nao sair do mapa. Colecionaveis vao usar OnTriggerEnter2D, somar pontos e tocar um som. As plataformas vao ter dois tipos: solidas e 'one-way' (player sobe por baixo mas pode pular em cima). Inimigos basicos vao patrulhar entre dois pontos e matar o player no toque.

Tudo isso em scripts limpos, separados por responsabilidade: PlayerController para input/movimento, GroundCheck embutido, Coletavel como component reutilizavel, CameraFollow autonoma, GameState centralizando vida/pontos. Esse padrao de separacao e o que faz codigo de jogo nao virar bagunca quando o projeto cresce.`,
    codes: [
      {
        lang: "csharp",
        code: `// Runtime/Platformer/PlayerController.cs
// Controle de plataformer com coyote time, jump buffer, pulo de altura variavel.
using UnityEngine;

[RequireComponent(typeof(Rigidbody2D), typeof(BoxCollider2D))]
public class PlayerController : MonoBehaviour
{
    [Header("Movimento")]
    [SerializeField] private float velocidade = 7f;
    [SerializeField] private float aceleracaoSolo = 50f;
    [SerializeField] private float aceleracaoAr = 20f;

    [Header("Pulo")]
    [SerializeField] private float forcaPulo = 14f;
    [SerializeField] private float gravidadeBase = 3f;
    [SerializeField] private float gravidadeQueda = 5f;       // cai mais rapido que sobe (game feel)
    [SerializeField] private float coyoteTime = 0.12f;         // tempo de gracia apos sair da plataforma
    [SerializeField] private float jumpBufferTime = 0.15f;     // tempo guardando input de pulo

    [Header("Chao")]
    [SerializeField] private LayerMask layerChao;
    [SerializeField] private float distanciaRaio = 0.1f;

    private Rigidbody2D rb;
    private BoxCollider2D col;
    private float coyoteTimer, jumpBufferTimer;
    private bool noChao;
    private float inputX;

    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        col = GetComponent<BoxCollider2D>();
    }

    private void Update()
    {
        // Input.
        inputX = Input.GetAxisRaw("Horizontal"); // -1, 0 ou +1

        if (Input.GetButtonDown("Jump"))
            jumpBufferTimer = jumpBufferTime;
        else
            jumpBufferTimer -= Time.deltaTime;

        // Pulo de altura variavel: solta o botao = corta o impulso.
        if (Input.GetButtonUp("Jump") && rb.linearVelocity.y > 0f)
            rb.linearVelocity = new Vector2(rb.linearVelocity.x, rb.linearVelocity.y * 0.5f);

        // Vira sprite na direcao do movimento.
        if (inputX != 0)
            transform.localScale = new Vector3(Mathf.Sign(inputX), 1f, 1f);
    }

    private void FixedUpdate()
    {
        ChecarChao();

        // Movimento horizontal com aceleracao diferente em solo vs ar.
        float alvo = inputX * velocidade;
        float ace = noChao ? aceleracaoSolo : aceleracaoAr;
        float novoX = Mathf.MoveTowards(rb.linearVelocity.x, alvo, ace * Time.fixedDeltaTime);
        rb.linearVelocity = new Vector2(novoX, rb.linearVelocity.y);

        // Coyote time.
        if (noChao) coyoteTimer = coyoteTime;
        else        coyoteTimer -= Time.fixedDeltaTime;

        // Executa pulo se ha buffer e coyote disponiveis.
        if (jumpBufferTimer > 0f && coyoteTimer > 0f)
        {
            rb.linearVelocity = new Vector2(rb.linearVelocity.x, forcaPulo);
            jumpBufferTimer = 0f;
            coyoteTimer = 0f;
        }

        // Gravidade variavel: pesada na queda, normal na subida.
        rb.gravityScale = rb.linearVelocity.y < 0f ? gravidadeQueda : gravidadeBase;
    }

    private void ChecarChao()
    {
        // Raycast curto a partir do meio do collider para baixo.
        Vector2 origem = (Vector2)transform.position + col.offset + Vector2.down * (col.size.y * 0.5f - 0.02f);
        RaycastHit2D hit = Physics2D.Raycast(origem, Vector2.down, distanciaRaio, layerChao);
        noChao = hit.collider != null;
        Debug.DrawRay(origem, Vector2.down * distanciaRaio, noChao ? Color.green : Color.red);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Runtime/Platformer/Coletavel.cs
// Moeda/item que some ao tocar e adiciona pontos.
using UnityEngine;

[RequireComponent(typeof(Collider2D))]
public class Coletavel : MonoBehaviour
{
    [SerializeField] private int pontos = 10;
    [SerializeField] private AudioClip somColeta;

    private void Reset()
    {
        // Garante que o collider seja trigger (quando arrastar o script no Editor).
        GetComponent<Collider2D>().isTrigger = true;
    }

    private void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Player"))
        {
            GameState.Instance.AdicionarPontos(pontos);
            if (somColeta != null)
                AudioSource.PlayClipAtPoint(somColeta, transform.position);
            Destroy(gameObject);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Runtime/Platformer/GameState.cs
// Singleton simples para guardar pontos, vidas, e pulos. Persistente entre cenas.
using UnityEngine;
using UnityEngine.SceneManagement;
using TMPro;

public class GameState : MonoBehaviour
{
    public static GameState Instance { get; private set; }

    [SerializeField] private TMP_Text textoPontos;
    [SerializeField] private TMP_Text textoVidas;

    public int Pontos { get; private set; }
    public int Vidas { get; private set; } = 3;

    private void Awake()
    {
        if (Instance != null && Instance != this) { Destroy(gameObject); return; }
        Instance = this;
        DontDestroyOnLoad(gameObject);
        Atualizar();
    }

    public void AdicionarPontos(int v)
    {
        Pontos += v;
        Atualizar();
    }

    public void TomarDano()
    {
        Vidas--;
        Atualizar();
        if (Vidas <= 0)
            SceneManager.LoadScene(SceneManager.GetActiveScene().name);
    }

    private void Atualizar()
    {
        if (textoPontos != null) textoPontos.text = $"Pontos: {Pontos}";
        if (textoVidas  != null) textoVidas.text  = $"Vidas: {Vidas}";
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Runtime/Platformer/CameraFollow.cs
// Camera que segue o player com Lerp e respeita limites do mapa.
using UnityEngine;

public class CameraFollow : MonoBehaviour
{
    [SerializeField] private Transform alvo;
    [SerializeField] private float suavidade = 5f;
    [SerializeField] private Vector2 minLimite, maxLimite;
    [SerializeField] private Vector2 offset = new Vector2(0f, 1.5f);

    private void LateUpdate()
    {
        if (alvo == null) return;

        // LateUpdate roda DEPOIS do movimento do player; evita tremor de camera.
        Vector3 desejada = new Vector3(alvo.position.x + offset.x, alvo.position.y + offset.y, transform.position.z);
        desejada.x = Mathf.Clamp(desejada.x, minLimite.x, maxLimite.x);
        desejada.y = Mathf.Clamp(desejada.y, minLimite.y, maxLimite.y);

        transform.position = Vector3.Lerp(transform.position, desejada, suavidade * Time.deltaTime);
    }
}`,
      },
    ],
    points: [
      "Coyote time perdoa o jogador que pulou um frame depois de sair da plataforma.",
      "Jump buffering guarda input de pulo se apertado um pouco antes de pousar.",
      "Pulo de altura variavel: solte o botao para cortar o impulso (controle fino).",
      "Use Raycast para detectar chao; mais previsivel que OnCollisionStay.",
      "Gravidade maior na queda do que na subida = pulo com peso e responsividade.",
      "Camera com LateUpdate + Lerp evita tremor visual e da suavidade.",
      "Singleton de GameState centraliza vida/pontos e persiste entre cenas.",
      "OnTriggerEnter2D para colecionaveis; OnCollisionEnter2D para colisao solida.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Coyote time entre 0.08 e 0.15 segundos e o sweet spot. Menos disso parece duro, mais que isso parece bug. Teste com varios amigos e ajuste.",
      },
      {
        type: "warning",
        content: "Nunca coloque movimento de Rigidbody no Update. Use FixedUpdate. Senao a fisica fica dependente do FPS e o jogo se comporta diferente em cada maquina.",
      },
      {
        type: "info",
        content: "Rigidbody2D.velocity foi renomeado para Rigidbody2D.linearVelocity no Unity 6. Em versoes anteriores use velocity diretamente. Se der erro, esta e a causa.",
      },
    ],
  },
  {
    slug: "projeto-fps-mini",
    section: "deploy-projetos",
    title: "Projeto: Mini FPS (camera + tiro + alvo)",
    difficulty: "avancado",
    subtitle: "Camera em primeira pessoa, movimento WASD, tiro com Raycast e alvos destrutiveis.",
    intro: `Construir um FPS, mesmo minimalista, e o melhor caminho para entender 3D em Unity. Voce vai mexer com camera filha do player, mouse com travamento de cursor, movimento com CharacterController, tiro instantaneo via Raycast (o padrao para armas hitscan como pistola, rifle, sniper) e alvos com sistema de vida que somem ao morrer. Esse miolo basico e o mesmo de Counter-Strike, Valorant, Call of Duty — mudam os assets e o polish, mas o esqueleto e identico.

Voce vai usar CharacterController em vez de Rigidbody. CharacterController e otimizado para personagens humanoides: lida com escadas, slopes, colisoes laterais e nao gira sozinho com a fisica. Voce empurra ele com Move() e pronto. A unica coisa que voce mesmo simula e gravidade (uma linha) e pulo (outra linha).

A camera fica como filha do GameObject Player, posicionada na altura dos olhos. O mouse no eixo X gira o player (yaw). O mouse no eixo Y gira so a camera (pitch), com clamp para nao virar a cabeca de ponta cabeca. Esse padrao de duas rotacoes separadas e o que faz o controle parecer natural — qualquer outro jeito da nausea.

Tiro com Raycast funciona assim: voce dispara um raio do centro da camera para frente. Se ele bate em algo com componente Alvo, voce reduz a vida desse alvo. Sem velocidade de bala, sem fisica de projetil, sem queda — o tiro e instantaneo, como uma luz. E o que se chama de hitscan. Para armas que voce quer ver a bala viajando (lancador de foguetes, arco e flecha), voce usa um Rigidbody projetil de verdade.

Alvos vao ter um component Alvo com vida em HP. Quando levam tiro, perdem HP. Ao chegar em zero, podem instanciar um efeito de particulas, tocar som e se destruir. Voce tambem vai criar uma mira simples na UI (um ponto no centro da tela), uma HUD com municao restante e uma tela de game over quando todos os alvos forem destruidos.`,
    codes: [
      {
        lang: "csharp",
        code: `// Runtime/FPS/PlayerFPS.cs
// Movimento WASD + camera com mouse + pulo + gravidade.
using UnityEngine;

[RequireComponent(typeof(CharacterController))]
public class PlayerFPS : MonoBehaviour
{
    [Header("Movimento")]
    [SerializeField] private float velocidade = 6f;
    [SerializeField] private float forcaPulo = 5f;
    [SerializeField] private float gravidade = -20f;

    [Header("Camera")]
    [SerializeField] private Transform cameraTransform;
    [SerializeField] private float sensibilidade = 2f;
    [SerializeField] private float pitchMin = -85f;
    [SerializeField] private float pitchMax = 85f;

    private CharacterController cc;
    private Vector3 velocidadeVertical;
    private float pitchAtual;

    private void Awake()
    {
        cc = GetComponent<CharacterController>();
        // Trava cursor no centro da tela (escapa com ESC durante teste no Editor).
        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;
    }

    private void Update()
    {
        OlharComMouse();
        MoverComTeclado();
    }

    private void OlharComMouse()
    {
        float mx = Input.GetAxis("Mouse X") * sensibilidade;
        float my = Input.GetAxis("Mouse Y") * sensibilidade;

        // Yaw: rotaciona o PLAYER no eixo Y (corpo inteiro).
        transform.Rotate(Vector3.up, mx);

        // Pitch: rotaciona so a camera no eixo X, com clamp.
        pitchAtual = Mathf.Clamp(pitchAtual - my, pitchMin, pitchMax);
        cameraTransform.localEulerAngles = new Vector3(pitchAtual, 0f, 0f);
    }

    private void MoverComTeclado()
    {
        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");
        Vector3 direcao = transform.right * h + transform.forward * v;
        cc.Move(direcao * velocidade * Time.deltaTime);

        // Gravidade simulada manualmente.
        if (cc.isGrounded && velocidadeVertical.y < 0f)
            velocidadeVertical.y = -2f; // gruda no chao

        if (cc.isGrounded && Input.GetButtonDown("Jump"))
            velocidadeVertical.y = forcaPulo;

        velocidadeVertical.y += gravidade * Time.deltaTime;
        cc.Move(velocidadeVertical * Time.deltaTime);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Runtime/FPS/Arma.cs
// Tiro hitscan com Raycast a partir da camera.
using UnityEngine;

public class Arma : MonoBehaviour
{
    [Header("Configuracao")]
    [SerializeField] private Camera cameraJogador;
    [SerializeField] private float alcance = 100f;
    [SerializeField] private int dano = 25;
    [SerializeField] private float cadenciaPorSegundo = 5f;
    [SerializeField] private LayerMask layersAtingiveis = ~0;

    [Header("Feedback")]
    [SerializeField] private GameObject prefabImpacto;
    [SerializeField] private LineRenderer trilha;
    [SerializeField] private AudioSource audioTiro;

    private float proximoTiro;

    private void Update()
    {
        // Botao esquerdo do mouse, respeitando cadencia.
        if (Input.GetButton("Fire1") && Time.time >= proximoTiro)
        {
            proximoTiro = Time.time + 1f / cadenciaPorSegundo;
            Atirar();
        }
    }

    private void Atirar()
    {
        if (audioTiro != null) audioTiro.Play();

        Vector3 origem = cameraJogador.transform.position;
        Vector3 direcao = cameraJogador.transform.forward;

        // Raycast: dispara raio do centro da camera para frente.
        if (Physics.Raycast(origem, direcao, out RaycastHit hit, alcance, layersAtingiveis))
        {
            // Se atingiu um Alvo, aplica dano.
            if (hit.collider.TryGetComponent<Alvo>(out var alvo))
                alvo.LevarDano(dano);

            // Aplica forca em corpos rigidos (caixas, barris).
            if (hit.rigidbody != null)
                hit.rigidbody.AddForceAtPosition(direcao * 5f, hit.point, ForceMode.Impulse);

            // Spawna efeito de impacto orientado pela normal da superficie.
            if (prefabImpacto != null)
                Instantiate(prefabImpacto, hit.point, Quaternion.LookRotation(hit.normal));

            DesenharTrilha(origem, hit.point);
        }
        else
        {
            DesenharTrilha(origem, origem + direcao * alcance);
        }
    }

    private void DesenharTrilha(Vector3 a, Vector3 b)
    {
        if (trilha == null) return;
        trilha.positionCount = 2;
        trilha.SetPosition(0, a);
        trilha.SetPosition(1, b);
        // Some apos breve momento.
        CancelInvoke(nameof(LimparTrilha));
        Invoke(nameof(LimparTrilha), 0.05f);
    }

    private void LimparTrilha() => trilha.positionCount = 0;
}`,
      },
      {
        lang: "csharp",
        code: `// Runtime/FPS/Alvo.cs
// Componente que recebe dano. Coloque em qualquer GameObject com Collider.
using UnityEngine;

public class Alvo : MonoBehaviour
{
    [SerializeField] private int vidaMaxima = 100;
    [SerializeField] private GameObject prefabExplosao;
    [SerializeField] private AudioClip somMorte;

    public int VidaAtual { get; private set; }

    public static int AlvosVivos { get; private set; }

    private void Awake()
    {
        VidaAtual = vidaMaxima;
        AlvosVivos++;
    }

    public void LevarDano(int valor)
    {
        VidaAtual -= valor;
        Debug.Log($"{name} levou {valor} de dano. Vida restante: {VidaAtual}");
        if (VidaAtual <= 0)
            Morrer();
    }

    private void Morrer()
    {
        if (prefabExplosao != null)
            Instantiate(prefabExplosao, transform.position, Quaternion.identity);
        if (somMorte != null)
            AudioSource.PlayClipAtPoint(somMorte, transform.position);

        AlvosVivos--;
        if (AlvosVivos <= 0)
            Debug.Log("Todos os alvos destruidos! Voce venceu.");

        Destroy(gameObject);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Runtime/FPS/HudFPS.cs
// HUD basica: mira no centro, contador de alvos restantes, indicador de FPS.
using UnityEngine;
using TMPro;

public class HudFPS : MonoBehaviour
{
    [SerializeField] private RectTransform mira;
    [SerializeField] private TMP_Text textoAlvos;
    [SerializeField] private TMP_Text textoFPS;

    private float tempoAcumulado;
    private int frames;

    private void Update()
    {
        // Atualiza alvos restantes a cada frame (custo desprezivel).
        if (textoAlvos != null)
            textoAlvos.text = $"Alvos: {Alvo.AlvosVivos}";

        // FPS suavizado a cada 0.5s.
        frames++;
        tempoAcumulado += Time.unscaledDeltaTime;
        if (tempoAcumulado >= 0.5f)
        {
            float fps = frames / tempoAcumulado;
            if (textoFPS != null) textoFPS.text = $"{fps:0} FPS";
            frames = 0;
            tempoAcumulado = 0f;
        }

        // Pequena animacao de respiro na mira.
        if (mira != null)
        {
            float s = 1f + Mathf.Sin(Time.time * 3f) * 0.05f;
            mira.localScale = new Vector3(s, s, 1f);
        }
    }
}`,
      },
    ],
    points: [
      "Use CharacterController para personagem FPS; ele lida com slopes e colisoes laterais.",
      "Camera filha do player: mouse X gira o player; mouse Y gira so a camera (com clamp).",
      "Trave o cursor com Cursor.lockState = CursorLockMode.Locked para FPS de verdade.",
      "Tiro hitscan e implementado com Physics.Raycast a partir da camera.",
      "Use TryGetComponent em vez de GetComponent + null check; e mais limpo e rapido.",
      "AddForceAtPosition em hit.rigidbody adiciona reacao fisica a impacto realista.",
      "Implemente cadencia de tiro com Time.time + intervalo, nao com coroutine para tiros simples.",
      "Use Quaternion.LookRotation(hit.normal) para alinhar efeito de impacto a superficie.",
    ],
    alerts: [
      {
        type: "tip",
        content: "No Editor, ESC libera o cursor mas o jogo continua. Pressione Play novamente para travar. Em build final, voce precisa de menu de pause que solte e prenda o cursor explicitamente.",
      },
      {
        type: "warning",
        content: "CharacterController.isGrounded pode dar falso negativo em rampas ou bordas. Para deteccao mais robusta, combine com SphereCast a partir dos pes do personagem.",
      },
      {
        type: "info",
        content: "Para projeteis visiveis (foguete, arco) use Rigidbody com AddForce, nao Raycast. Raycast e instantaneo e e usado so para armas hitscan (pistola, rifle, laser).",
      },
    ],
  },
];
