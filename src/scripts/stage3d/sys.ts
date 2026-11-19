/**
 * Pieza 3D de la línea SYS: módulos de servidor de vidrio que encajan en un
 * rack (ver sys-shapes.ts). Se importa con import() desde ServiceStage.astro.
 */
import { mountStage3D } from './core';
import { kitPlugin } from './glass-kit-3d';
import { SYS_KIT } from './sys-shapes';

export function mount(stage: HTMLElement) {
  return mountStage3D(stage, kitPlugin(SYS_KIT));
}
