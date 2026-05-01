import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type WidgetType =
  | 'calendar'
  | 'todo'
  | 'inbox'
  | 'classview'
  | 'notes'
  | 'latex'
  | 'handwriting'
  | 'mindmap'
  | 'pomodoro'
  | 'fileviewer';

export interface CanvasWidget {
  id: string;
  type: WidgetType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  collapsed: boolean;
  zIndex: number;
}

export interface UserDashboardPage {
  id: string;
  name: string;
}

type PageTemplate = 'main' | 'class' | 'custom';

export interface CanvasBounds {
  width: number;
  height: number;
}

interface PersistedState {
  isEditing: boolean;
  userPages: UserDashboardPage[];
  widgetsByPage: Record<string, CanvasWidget[]>;
  pageTitlesByKey: Record<string, string>;
  hiddenPageKeys: string[];
}

interface DashboardCustomizationState {
  isEditing: boolean;
  userPages: UserDashboardPage[];
  widgetsByPage: Record<string, CanvasWidget[]>;
  setEditing: (editing: boolean) => void;
  ensurePageLayout: (pageKey: string, template: PageTemplate) => void;
  createUserPage: (name?: string, template?: PageTemplate) => string;
  duplicateIntoUserPage: (sourcePageKey: string, sourceName: string) => string;
  deletePageByKey: (pageKey: string) => void;
  renamePageByKey: (pageKey: string, name: string) => void;
  resolvePageName: (pageKey: string, fallback: string) => string;
  isPageVisible: (pageKey: string) => boolean;
  addWidget: (pageKey: string, type: WidgetType) => void;
  addWidgetAtPosition: (pageKey: string, type: WidgetType, x: number, y: number, bounds: CanvasBounds) => boolean;
  canPlaceWidget: (
    pageKey: string,
    x: number,
    y: number,
    width: number,
    height: number,
    bounds: CanvasBounds,
    excludeId?: string,
  ) => boolean;
  updateWidget: (pageKey: string, widgetId: string, patch: Partial<CanvasWidget>) => void;
  removeWidget: (pageKey: string, widgetId: string) => void;
  bringToFront: (pageKey: string, widgetId: string) => void;
}

const STORAGE_KEY = 'student-dashboard-customization-v3';
export const GRID_SIZE = 24;

const widgetTitleMap: Record<WidgetType, string> = {
  calendar: 'Calendar',
  todo: 'To-Do List',
  inbox: 'Inbox',
  classview: 'Class View',
  notes: 'Notes',
  latex: 'LaTeX Editor',
  handwriting: 'Handwriting',
  mindmap: 'Mind Map',
  pomodoro: 'Pomodoro Timer',
  fileviewer: 'File Viewer',
};

const defaultSizes: Record<WidgetType, { width: number; height: number }> = {
  calendar: { width: 420, height: 340 },
  todo: { width: 360, height: 400 },
  inbox: { width: 420, height: 360 },
  classview: { width: 360, height: 320 },
  notes: { width: 420, height: 360 },
  latex: { width: 480, height: 400 },
  handwriting: { width: 440, height: 380 },
  mindmap: { width: 520, height: 420 },
  pomodoro: { width: 300, height: 300 },
  fileviewer: { width: 440, height: 360 },
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const snap = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

function newWidget(type: WidgetType, x: number, y: number, zIndex: number): CanvasWidget {
  const size = defaultSizes[type];
  return {
    id: uid(),
    type,
    title: widgetTitleMap[type],
    x,
    y,
    width: size.width,
    height: size.height,
    collapsed: false,
    zIndex,
  };
}

function seedTemplate(template: PageTemplate): CanvasWidget[] {
  if (template === 'main') {
    return [
      newWidget('calendar', 24, 24, 1),
      newWidget('todo', 468, 24, 2),
      newWidget('inbox', 852, 24, 3),
      newWidget('pomodoro', 24, 388, 4),
    ];
  }

  if (template === 'class') {
    return [
      newWidget('classview', 24, 24, 1),
      newWidget('calendar', 408, 24, 2),
      newWidget('todo', 852, 24, 3),
      newWidget('notes', 24, 372, 4),
    ];
  }

  return [
    newWidget('notes', 24, 24, 1),
    newWidget('todo', 468, 24, 2),
    newWidget('mindmap', 24, 412, 3),
  ];
}

function canPlace(
  widgets: CanvasWidget[],
  x: number,
  y: number,
  width: number,
  height: number,
  bounds: CanvasBounds,
  excludeId?: string,
) {
  if (x < 0 || y < 0 || x + width > bounds.width || y + height > bounds.height) {
    return false;
  }

  for (const widget of widgets) {
    if (excludeId && widget.id === excludeId) continue;

    const overlaps =
      x < widget.x + widget.width &&
      x + width > widget.x &&
      y < widget.y + widget.height &&
      y + height > widget.y;

    if (overlaps) return false;
  }

  return true;
}

function findNearestPlacement(
  widgets: CanvasWidget[],
  x: number,
  y: number,
  width: number,
  height: number,
  bounds: CanvasBounds,
  excludeId?: string,
) {
  const originX = snap(x);
  const originY = snap(y);
  const maxX = Math.max(0, bounds.width - width);
  const maxY = Math.max(0, bounds.height - height);
  const maxCols = Math.floor(maxX / GRID_SIZE);
  const maxRows = Math.floor(maxY / GRID_SIZE);

  const candidates: Array<{ x: number; y: number; distance: number }> = [];

  for (let row = 0; row <= maxRows; row += 1) {
    for (let col = 0; col <= maxCols; col += 1) {
      const cx = col * GRID_SIZE;
      const cy = row * GRID_SIZE;
      const distance = Math.abs(cx - originX) + Math.abs(cy - originY);
      candidates.push({ x: cx, y: cy, distance });
    }
  }

  candidates.sort((a, b) => {
    if (a.distance !== b.distance) return a.distance - b.distance;
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });

  for (const candidate of candidates) {
    if (canPlace(widgets, candidate.x, candidate.y, width, height, bounds, excludeId)) {
      return { x: candidate.x, y: candidate.y };
    }
  }

  return null;
}

const defaultState: PersistedState = {
  isEditing: false,
  userPages: [],
  widgetsByPage: {
    main: seedTemplate('main'),
  },
  pageTitlesByKey: {},
  hiddenPageKeys: [],
};

function loadInitialState(): PersistedState {
  if (typeof window === 'undefined') return defaultState;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState;

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      isEditing: Boolean(parsed.isEditing),
      userPages: Array.isArray(parsed.userPages) ? parsed.userPages : [],
      widgetsByPage: parsed.widgetsByPage && typeof parsed.widgetsByPage === 'object'
        ? parsed.widgetsByPage
        : defaultState.widgetsByPage,
      pageTitlesByKey: parsed.pageTitlesByKey && typeof parsed.pageTitlesByKey === 'object'
        ? parsed.pageTitlesByKey
        : {},
      hiddenPageKeys: Array.isArray(parsed.hiddenPageKeys) ? parsed.hiddenPageKeys : [],
    };
  } catch {
    return defaultState;
  }
}

const DashboardCustomizationContext = createContext<DashboardCustomizationState | null>(null);

function usePersistedState() {
  const [state, setState] = useState<PersistedState>(() => loadInitialState());

  const setPersisted = useCallback((updater: (prev: PersistedState) => PersistedState) => {
    setState((prev) => {
      const next = updater(prev);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  return [state, setPersisted] as const;
}

export function DashboardCustomizationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = usePersistedState();

  const setEditing = useCallback((editing: boolean) => {
    setState((prev) => ({ ...prev, isEditing: editing }));
  }, [setState]);

  const resolvePageName = useCallback((pageKey: string, fallback: string) => {
    return state.pageTitlesByKey[pageKey] ?? fallback;
  }, [state.pageTitlesByKey]);

  const isPageVisible = useCallback((pageKey: string) => {
    return !state.hiddenPageKeys.includes(pageKey);
  }, [state.hiddenPageKeys]);

  const ensurePageLayout = useCallback((pageKey: string, template: PageTemplate) => {
    setState((prev) => {
      const nextHidden = prev.hiddenPageKeys.filter((key) => key !== pageKey);

      if (prev.widgetsByPage[pageKey]) {
        if (nextHidden.length === prev.hiddenPageKeys.length) {
          return prev;
        }

        return {
          ...prev,
          hiddenPageKeys: nextHidden,
        };
      }

      return {
        ...prev,
        hiddenPageKeys: nextHidden,
        widgetsByPage: {
          ...prev.widgetsByPage,
          [pageKey]: seedTemplate(template),
        },
      };
    });
  }, [setState]);

  const createUserPage = useCallback((name?: string, template: PageTemplate = 'custom') => {
    const pageId = uid();
    const pageName = name?.trim() || `Page ${state.userPages.length + 1}`;

    setState((prev) => ({
      ...prev,
      userPages: [...prev.userPages, { id: pageId, name: pageName }],
      hiddenPageKeys: prev.hiddenPageKeys.filter((key) => key !== `custom:${pageId}`),
      widgetsByPage: {
        ...prev.widgetsByPage,
        [`custom:${pageId}`]: seedTemplate(template),
      },
    }));

    return pageId;
  }, [setState, state.userPages.length]);

  const duplicateIntoUserPage = useCallback((sourcePageKey: string, sourceName: string) => {
    const pageId = uid();

    setState((prev) => ({
      ...prev,
      userPages: [...prev.userPages, { id: pageId, name: `${sourceName} Copy` }],
      widgetsByPage: {
        ...prev.widgetsByPage,
        [`custom:${pageId}`]: (prev.widgetsByPage[sourcePageKey] ?? seedTemplate('custom')).map((widget) => ({
          ...widget,
          id: uid(),
        })),
      },
      hiddenPageKeys: prev.hiddenPageKeys.filter((key) => key !== `custom:${pageId}`),
    }));

    return pageId;
  }, [setState]);

  const renamePageByKey = useCallback((pageKey: string, name: string) => {
    const nextName = name.trim();
    if (!nextName) return;

    if (pageKey.startsWith('custom:')) {
      const customId = pageKey.replace('custom:', '');
      setState((prev) => ({
        ...prev,
        userPages: prev.userPages.map((page) => (
          page.id === customId ? { ...page, name: nextName } : page
        )),
        pageTitlesByKey: {
          ...prev.pageTitlesByKey,
          [pageKey]: nextName,
        },
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      pageTitlesByKey: {
        ...prev.pageTitlesByKey,
        [pageKey]: nextName,
      },
    }));
  }, [setState]);

  const deletePageByKey = useCallback((pageKey: string) => {
    if (pageKey.startsWith('custom:')) {
      const customId = pageKey.replace('custom:', '');
      setState((prev) => {
        const nextWidgets = { ...prev.widgetsByPage };
        delete nextWidgets[pageKey];

        const nextTitles = { ...prev.pageTitlesByKey };
        delete nextTitles[pageKey];

        return {
          ...prev,
          userPages: prev.userPages.filter((page) => page.id !== customId),
          widgetsByPage: nextWidgets,
          pageTitlesByKey: nextTitles,
          hiddenPageKeys: prev.hiddenPageKeys.filter((key) => key !== pageKey),
        };
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      hiddenPageKeys: prev.hiddenPageKeys.includes(pageKey)
        ? prev.hiddenPageKeys
        : [...prev.hiddenPageKeys, pageKey],
    }));
  }, [setState]);

  const canPlaceWidget = useCallback((
    pageKey: string,
    x: number,
    y: number,
    width: number,
    height: number,
    bounds: CanvasBounds,
    excludeId?: string,
  ) => {
    const widgets = state.widgetsByPage[pageKey] ?? [];
    return canPlace(widgets, x, y, width, height, bounds, excludeId);
  }, [state.widgetsByPage]);

  const addWidgetAtPosition = useCallback((
    pageKey: string,
    type: WidgetType,
    x: number,
    y: number,
    bounds: CanvasBounds,
  ) => {
    const size = defaultSizes[type];
    const widgets = state.widgetsByPage[pageKey] ?? [];
    const placement = findNearestPlacement(widgets, x, y, size.width, size.height, bounds);
    if (!placement) return false;

    setState((prev) => {
      const currentWidgets = prev.widgetsByPage[pageKey] ?? [];
      const maxZ = currentWidgets.reduce((max, widget) => Math.max(max, widget.zIndex), 0);
      const widget = newWidget(type, placement.x, placement.y, maxZ + 1);

      return {
        ...prev,
        widgetsByPage: {
          ...prev.widgetsByPage,
          [pageKey]: [...currentWidgets, widget],
        },
      };
    });

    return true;
  }, [setState, state.widgetsByPage]);

  const addWidget = useCallback((pageKey: string, type: WidgetType) => {
    addWidgetAtPosition(pageKey, type, 24, 24, { width: 1800, height: 1200 });
  }, [addWidgetAtPosition]);

  const updateWidget = useCallback((pageKey: string, widgetId: string, patch: Partial<CanvasWidget>) => {
    setState((prev) => ({
      ...prev,
      widgetsByPage: {
        ...prev.widgetsByPage,
        [pageKey]: (prev.widgetsByPage[pageKey] ?? []).map((widget) => (
          widget.id === widgetId ? { ...widget, ...patch } : widget
        )),
      },
    }));
  }, [setState]);

  const removeWidget = useCallback((pageKey: string, widgetId: string) => {
    setState((prev) => ({
      ...prev,
      widgetsByPage: {
        ...prev.widgetsByPage,
        [pageKey]: (prev.widgetsByPage[pageKey] ?? []).filter((widget) => widget.id !== widgetId),
      },
    }));
  }, [setState]);

  const bringToFront = useCallback((pageKey: string, widgetId: string) => {
    setState((prev) => {
      const widgets = prev.widgetsByPage[pageKey] ?? [];
      const maxZ = widgets.reduce((max, widget) => Math.max(max, widget.zIndex), 0);
      return {
        ...prev,
        widgetsByPage: {
          ...prev.widgetsByPage,
          [pageKey]: widgets.map((widget) => (
            widget.id === widgetId ? { ...widget, zIndex: maxZ + 1 } : widget
          )),
        },
      };
    });
  }, [setState]);

  const value = useMemo<DashboardCustomizationState>(() => ({
    isEditing: state.isEditing,
    userPages: state.userPages,
    widgetsByPage: state.widgetsByPage,
    setEditing,
    ensurePageLayout,
    createUserPage,
    duplicateIntoUserPage,
    deletePageByKey,
    renamePageByKey,
    resolvePageName,
    isPageVisible,
    addWidget,
    addWidgetAtPosition,
    canPlaceWidget,
    updateWidget,
    removeWidget,
    bringToFront,
  }), [
    state.isEditing,
    state.userPages,
    state.widgetsByPage,
    setEditing,
    ensurePageLayout,
    createUserPage,
    duplicateIntoUserPage,
    deletePageByKey,
    renamePageByKey,
    resolvePageName,
    isPageVisible,
    addWidget,
    addWidgetAtPosition,
    canPlaceWidget,
    updateWidget,
    removeWidget,
    bringToFront,
  ]);

  return (
    <DashboardCustomizationContext.Provider value={value}>
      {children}
    </DashboardCustomizationContext.Provider>
  );
}

export function useDashboardCustomization() {
  const ctx = useContext(DashboardCustomizationContext);
  if (!ctx) {
    throw new Error('useDashboardCustomization must be used inside DashboardCustomizationProvider');
  }
  return ctx;
}
