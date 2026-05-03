// Aggregator — content lives in sections/<sectionId>.ts (one file per trail)
import type { Chapter, Section } from './types';
import { chapters as s0 } from './sections/boas-vindas';
import { chapters as s1 } from './sections/instalacao';
import { chapters as s2 } from './sections/csharp-unity';
import { chapters as s3 } from './sections/gameobjects';
import { chapters as s4 } from './sections/scripting';
import { chapters as s5 } from './sections/input';
import { chapters as s6 } from './sections/fisica-3d';
import { chapters as s7 } from './sections/fisica-2d';
import { chapters as s8 } from './sections/animacao';
import { chapters as s9 } from './sections/graficos-luz';
import { chapters as s10 } from './sections/ui';
import { chapters as s11 } from './sections/audio';
import { chapters as s12 } from './sections/persistencia';
import { chapters as s13 } from './sections/multiplayer';
import { chapters as s14 } from './sections/performance';
import { chapters as s15 } from './sections/editor-tools';
import { chapters as s16 } from './sections/ai-gameplay';
import { chapters as s17 } from './sections/deploy-projetos';

export type { Chapter, Section, Difficulty, AlertType, CodeSample, AlertSpec } from './types';

export const sections: Section[] = [
  {
    id: "boas-vindas",
    icon: "BookOpen",
    label: "Boas-vindas e Fundamentos",
    chapterSlugs: ["bem-vindo", "por-que-unity", "historia-unity", "motores-comparados", "onde-unity-roda"]
  },
  {
    id: "instalacao",
    icon: "Download",
    label: "Instalação e Primeiros Passos",
    chapterSlugs: ["unity-hub", "instalacao-unity", "criar-projeto", "interface-editor", "primeira-cena", "projeto-2d-vs-3d", "versoes-unity-lts", "primeiro-cubo-rolando"]
  },
  {
    id: "csharp-unity",
    icon: "Code2",
    label: "C# para Unity",
    chapterSlugs: ["csharp-intro", "variaveis", "tipos-primitivos", "operadores", "condicionais", "loops", "metodos", "classes-objetos", "heranca-poly", "namespaces-using", "listas-arrays", "eventos-delegates"]
  },
  {
    id: "gameobjects",
    icon: "Box",
    label: "GameObjects e Componentes",
    chapterSlugs: ["gameobject-intro", "transform-component", "hierarquia", "prefabs", "prefab-variants", "tags-layers", "parent-child", "instanciar-destruir", "scriptable-objects-intro"]
  },
  {
    id: "scripting",
    icon: "FileCode2",
    label: "Scripting Básico",
    chapterSlugs: ["monobehaviour", "awake-start", "update-fixedupdate", "lateupdate", "coroutines", "time-deltatime", "getcomponent", "find-objects", "ordem-execucao", "debug-log"]
  },
  {
    id: "input",
    icon: "Gamepad2",
    label: "Input e Controles",
    chapterSlugs: ["input-legado", "input-system", "teclado-mouse", "gamepad", "touch-mobile", "action-maps", "devices-binding"]
  },
  {
    id: "fisica-3d",
    icon: "Atom",
    label: "Física 3D",
    chapterSlugs: ["rigidbody", "colliders-3d", "triggers-3d", "materiais-fisicos", "raycast", "layers-fisica", "joints-3d", "character-controller", "deteccao-colisao"]
  },
  {
    id: "fisica-2d",
    icon: "Square",
    label: "Física 2D",
    chapterSlugs: ["rigidbody2d", "colliders-2d", "triggers-2d", "raycast-2d", "joints-2d", "plataforma-2d"]
  },
  {
    id: "animacao",
    icon: "Film",
    label: "Animação e Mecanim",
    chapterSlugs: ["animator", "animation-clips", "blend-trees", "parametros-animator", "transicoes-animator", "timeline", "root-motion", "animation-events"]
  },
  {
    id: "graficos-luz",
    icon: "Sun",
    label: "Gráficos, Materiais e Iluminação",
    chapterSlugs: ["render-pipelines", "materiais-shader-intro", "shader-graph", "iluminacao-tipos", "lightmap-baking", "post-processing", "particle-system", "vfx-graph", "sombras", "urp-vs-hdrp"]
  },
  {
    id: "ui",
    icon: "Layout",
    label: "UI e UX no Unity",
    chapterSlugs: ["canvas-ui", "anchors-pivot", "ui-elementos", "eventos-ui", "ugui-vs-toolkit", "ui-toolkit", "tmp-text", "ui-mobile"]
  },
  {
    id: "audio",
    icon: "Volume2",
    label: "Áudio e Som",
    chapterSlugs: ["audio-source-listener", "audio-mixer", "3d-sound", "snapshots-audio", "importacao-audio"]
  },
  {
    id: "persistencia",
    icon: "Save",
    label: "Persistência e Save Games",
    chapterSlugs: ["playerprefs", "json-utility", "binary-save", "save-system", "addressables", "asset-bundles", "scriptable-saves"]
  },
  {
    id: "multiplayer",
    icon: "Network",
    label: "Multiplayer e Rede",
    chapterSlugs: ["multiplayer-intro", "netcode-gameobjects", "mirror-networking", "sincronizacao", "lobby-relay"]
  },
  {
    id: "performance",
    icon: "Gauge",
    label: "Performance e Otimização",
    chapterSlugs: ["profiler", "frame-debugger", "draw-calls-batching", "gc-allocations", "jobs-system", "burst-compiler", "dots-ecs", "occlusion-lod"]
  },
  {
    id: "editor-tools",
    icon: "Wrench",
    label: "Editor e Ferramentas",
    chapterSlugs: ["inspector-customizado", "editorwindow", "gizmos-handles", "propertydrawer", "asset-postprocessor", "package-manager"]
  },
  {
    id: "ai-gameplay",
    icon: "Brain",
    label: "IA e Gameplay",
    chapterSlugs: ["navmesh", "navmesh-agent", "state-machine", "behaviour-trees", "sensores-ai", "ml-agents"]
  },
  {
    id: "deploy-projetos",
    icon: "Rocket",
    label: "Deploy e Projetos Práticos",
    chapterSlugs: ["build-windows", "build-android", "build-ios", "build-webgl", "otimizacao-mobile", "projeto-pong", "projeto-platformer", "projeto-fps-mini"]
  }
];

export const chapters: Chapter[] = [
  ...s0, ...s1, ...s2, ...s3, ...s4, ...s5, ...s6, ...s7, ...s8,
  ...s9, ...s10, ...s11, ...s12, ...s13, ...s14, ...s15, ...s16, ...s17
];

export const chapterMap: Record<string, Chapter> = Object.fromEntries(
  chapters.map(c => [c.slug, c])
);

export function chapterIndex(slug: string): number {
  return chapters.findIndex(c => c.slug === slug);
}
