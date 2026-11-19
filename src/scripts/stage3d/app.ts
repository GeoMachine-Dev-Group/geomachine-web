/**
 * Pieza 3D de la línea APP: un móvil con la pantalla hecha de capas de vidrio
 * (ver app-shapes.ts). Se importa con import() desde ServiceStage.astro.
 */
import { mountStage3D } from './core';
import { kitPlugin } from './glass-kit-3d';
import { APP_KIT } from './app-shapes';

export function mount(stage: HTMLElement) {
  return mountStage3D(stage, kitPlugin(APP_KIT));
}
