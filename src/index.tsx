import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import '../style/index.css';
import { INotebookTracker, 
  NotebookPanel,
  //  NotebookActions, 
  //  NotebookPanel 
  } from '@jupyterlab/notebook';
// import ProseMirrorEditor from './ProsemirrorWidget';
// import { ProseMirrorEditor } from './prosemirror/ProseMirrorEditor';
import { MarkdownCell } from '@jupyterlab/cells';
// import {
//   // Panel,
//   PanelLayout
// } from '@phosphor/widgets';
import ContentFactoryEditor from './factory';

import { ProsemirrorWidget } from './widget';
import { CommandRegistry } from '@phosphor/commands';
import { ContextMenu, Menu } from '@phosphor/widgets';
import { ProseMirrorEditor } from './prosemirror/ProseMirrorEditor';
// import { MathJaxTypesetter } from "@jupyterlab/mathjax2";
// import { PageConfig } from "@jupyterlab/coreutils";


//@ts-ignore
function activateMarkdownTest(app: JupyterFrontEnd, nbTracker: INotebookTracker) {
  let prosemirrorWidget = new ProsemirrorWidget(app.commands);
  
  addKeybindings(app.commands, nbTracker, prosemirrorWidget);
  addContextMenuItems(app.contextMenu, app.commands);
  nbTracker.currentChanged.connect(() => {
    if (nbTracker.currentWidget) {
      nbTracker.currentWidget.toolbar.insertAfter("cellType", "rich-text-menu", prosemirrorWidget);
      nbTracker.activeCellChanged.connect(() => {
        let activeCell = nbTracker.activeCell;
          
          if (activeCell instanceof MarkdownCell) { 
            activeCell.editor.focus();
            console.log(activeCell.editor.hasFocus);
            prosemirrorWidget.renderMenu(activeCell);
          }
          else {
            prosemirrorWidget.renderInactiveMenu();
          }
  
        })
    }
    // nbTracker.currentWidget.toolbar.insertAfter("cellType", "heading-menu", menu_scripts.createHeadingMenu(app.commands));

  })

}

function addContextMenuItems(contextMenu: ContextMenu, commands: CommandRegistry) {
  contextMenu.addItem({
    command: "prosemirror-copy-menu",
    selector: ".jp-Notebook .jp-Cell",
    rank: 10
  })

  let markdownSubmenu = new Menu({commands});
  markdownSubmenu.title.label = "Markdown Cell Editor View";
  markdownSubmenu.addItem({
    command: "prosemirror-switch-to-markdown",
  });
  markdownSubmenu.addItem({
    command: "prosemirror-switch-from-markdown",
  });
  contextMenu.addItem({

    selector: ".jp-mod-active .ProseMirror",
    submenu: markdownSubmenu,
    type: "submenu",
  })
}

function addKeybindings(commands: CommandRegistry, nbTracker: INotebookTracker, prosemirrorWidget: ProsemirrorWidget) {

  commands.addCommand("prosemirror-bold", {
    execute: () => {
      let currentEditor = document.querySelector(".ProseMirror-focused");
      currentEditor.dispatchEvent(new KeyboardEvent("keydown", {metaKey: true, key: "b"}));
    }
  })

  commands.addCommand("prosemirror-italic", {
    execute: () => {
      let currentEditor = document.querySelector(".ProseMirror-focused");
      currentEditor.dispatchEvent(new KeyboardEvent("keydown", {metaKey: true, key: "i"}));
    }
  })
  commands.addCommand("prosemirror-tab", {
    execute: () => {
      let currentEditor = document.querySelector(".ProseMirror-focused");
      currentEditor.dispatchEvent(new KeyboardEvent("keydown", {key: "Tab"}));
    }
  })

  commands.addCommand("prosemirror-shift-tab", {
    execute: () => {
      let currentEditor = document.querySelector(".ProseMirror-focused");
      console.log(currentEditor.dispatchEvent(new KeyboardEvent("keydown", {shiftKey: true, key: "Tab"})));
    }
  })
  commands.addCommand("prosemirror-copy-menu", {
    label: "Copy Content",
    execute: () => {
      let currentEditor = document.querySelector(".jp-mod-active .ProseMirror");
      // currentEditor.addEventListener("copy", (e: Event) => {
      //   console.log("!!!");
      //   console.log(e.target);
      // }, true);
      console.log(currentEditor.dispatchEvent(new ClipboardEvent("copy")));
    }
  })

  commands.addCommand("prosemirror-switch-mode", {
    execute: () => {
      (nbTracker.activeCell.editor as ProseMirrorEditor).switchEditor();
      prosemirrorWidget.renderMenu(nbTracker.activeCell);
    }
  });

  commands.addCommand("prosemirror-switch-to-markdown", {
    label: "Raw Markdown",
    isToggled: () => {
      return nbTracker.activeCell ? nbTracker.activeCell.model.metadata.get("markdownMode") === true : false;
    },
    execute: () => {
      if (nbTracker.activeCell.model.metadata.get("markdownMode") === false) {
        commands.execute("prosemirror-switch-mode");
      }
    }
  })

  commands.addCommand("prosemirror-switch-from-markdown", {
    label: "Rich Text",
    isToggled: () => {
      let isMarkdown = nbTracker.activeCell ? nbTracker.activeCell.model.metadata.get("markdownMode") : true;
      return isMarkdown === undefined ? true : !isMarkdown
    },
    execute: () => {
      if (nbTracker.activeCell.model.metadata.get("markdownMode") === true) {
        commands.execute("prosemirror-switch-mode");
      }

    }
  })


  // commands.addCommand("prosemirror-strikethrough", {
  //   execute: () => {
  //     let currentEditor = document.querySelector(".ProseMirror-focused");
  //     currentEditor.dispatchEvent(new KeyboardEvent("keydown", {metaKey: true, shiftKey: true, key: "k"}));
  //     console.log("strikethrough!")
  //   }
  // })

  commands.addKeyBinding({
    command: "prosemirror-bold",
    keys: ['Accel B'],
    selector: '.ProseMirror-focused'
  });

  commands.addKeyBinding({
    command: "prosemirror-italic",
    keys: ['Accel I'],
    selector: '.ProseMirror-focused'
  });

  commands.addKeyBinding({
    command: "prosemirror-tab",
    keys: ["Tab"],
    selector: ".ProseMirror-focused"
  });

  commands.addKeyBinding({
    command: "prosemirror-shift-tab",
    keys: ["Shift Tab"],
    selector: ".ProseMirror-focused"
  });

  commands.addKeyBinding({
    command: "prosemirror-switch-mode",
    keys: ['Accel M'],
    selector: '.ProseMirror-focused'
  });

  commands.addKeyBinding({
    command: "prosemirror-switch-mode",
    keys: ['Accel M'],
    selector: '.jp-mod-active .ProseMirror .CodeMirror-focused'
  });
  // commands.addKeyBinding({
  //   command: "prosemirror-strikethrough",
  //   keys: ['Cmd Shift K'],
  //   selector: '.ProseMirror-focused'
  // })
}
/**
 * Overrides the NotebookPanel content factory to replace Markdown editor with ProseMirror editor.
 * @param app - Application front end.
 */
//@ts-ignore
function overrideContentFactory(app: JupyterFrontEnd) {
  console.log("rich-text-mode:add-editor activated!");
  return new ContentFactoryEditor();
}

/**
 * Initialization data for the rich-text-editor extension.
 */
const markdownTest: JupyterFrontEndPlugin<void> = {
  id: 'test-markdown',
  autoStart: true,
  requires: [INotebookTracker],
  activate: activateMarkdownTest
};

const addEditorExtension: JupyterFrontEndPlugin<NotebookPanel.IContentFactory> = {
  id: 'rich-text-mode:add-editor',
  autoStart: true,
  provides: NotebookPanel.IContentFactory,
  activate: overrideContentFactory
}


export default [
  markdownTest, 
  addEditorExtension];
