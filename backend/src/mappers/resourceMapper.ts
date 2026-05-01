import { AppFile, AppModule } from '../types/app.js';
import { CanvasFile, CanvasModule } from '../types/canvas.js';

export function mapFile(file: CanvasFile): AppFile {
  return {
    id: String(file.id),
    name: file.display_name,
    fileName: file.filename,
    contentType: file.content_type,
    size: file.size,
    url: file.url,
    updatedAt: file.updated_at,
  };
}

export function mapModule(module: CanvasModule): AppModule {
  return {
    id: String(module.id),
    name: module.name,
    unlockAt: module.unlock_at || undefined,
    state: module.state || 'active',
    itemCount: module.items_count || 0,
    items: (module.items || []).map((item) => ({
      id: String(item.id),
      title: item.title || 'Untitled item',
      type: item.type || 'Unknown',
      url: item.html_url,
    })),
  };
}
