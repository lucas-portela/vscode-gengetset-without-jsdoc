import { CompleteActionProvider } from "./bulb";
import { DefinitionProvider } from "./provider";
import { addSingleImport, optimizeImports } from "./import";
import {
  generateClassesList,
  EType,
  quickPickItemListFrom,
  generateCode,
  generateAllGetterAndSetter,
} from "./getset";
import * as vscode from "vscode";

const TYPESCRIPT: vscode.DocumentFilter = { language: "typescript" };

function readyCheck() {
  if (vscode.window.activeTextEditor === undefined) {
    vscode.window.showWarningMessage(
      "Need an active TypeScript document opened in the editor to function."
    );
    return false;
  }
  if (
    DefinitionProvider.instance.cachedExports === null ||
    DefinitionProvider.instance.cachedExports === undefined
  ) {
    vscode.window
      .showWarningMessage(
        "Please wait a few seconds longer until the export cache has been build.",
        "Refresh"
      )
      .then((r) => {
        DefinitionProvider.instance.refreshExports();
      });
    return false;
  }
  return true;
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      TYPESCRIPT,
      new CompleteActionProvider()
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "genGetSet.addImport",
      function (item?: string) {
        if (readyCheck()) {
          if (!item) {
            vscode.window
              .showQuickPick(DefinitionProvider.instance.toQuickPickItemList())
              .then((pickedItem) => {
                if (!pickedItem) return;
                addSingleImport(
                  DefinitionProvider.instance.cachedExports,
                  pickedItem.label
                );
              });
          } else {
            addSingleImport(DefinitionProvider.instance.cachedExports, item);
          }
        }
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("genGetSet.sortImports", function () {
      if (readyCheck()) {
        optimizeImports(DefinitionProvider.instance.cachedExports);
      }
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("genGetSet.scanImports", function () {
      if (readyCheck()) DefinitionProvider.instance.refreshExports();
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("genGetSet.getter", function () {
      const classesList = generateClassesList(EType.GETTER);
      vscode.window
        .showQuickPick(quickPickItemListFrom(classesList, EType.GETTER))
        .then((pickedItem) => {
          generateCode(classesList, EType.GETTER, pickedItem);
        });
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("genGetSet.setter", function () {
      const classesList = generateClassesList(EType.SETTER);
      vscode.window
        .showQuickPick(quickPickItemListFrom(classesList, EType.SETTER))
        .then((pickedItem) => {
          generateCode(classesList, EType.SETTER, pickedItem);
        });
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "genGetSet.allGetterAndSetter",
      function () {
        const classesListGetter = generateClassesList(EType.GETTER);
        const classesListSetter = generateClassesList(EType.SETTER);

        generateAllGetterAndSetter(classesListGetter, classesListSetter);
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("genGetSet.allGetter", function () {
      const classesListGetter = generateClassesList(EType.GETTER);

      generateAllGetterAndSetter(classesListGetter, null);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("genGetSet.allSetter", function () {
      const classesListSetter = generateClassesList(EType.SETTER);

      generateAllGetterAndSetter(null, classesListSetter);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("genGetSet.getterAndSetter", function () {
      const classesList = generateClassesList(EType.BOTH);
      vscode.window
        .showQuickPick(quickPickItemListFrom(classesList, EType.BOTH))
        .then((pickedItem) => {
          generateCode(classesList, EType.BOTH, pickedItem);
        });
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("genGetSet.constructor", function () {
      const classesList = generateClassesList(EType.BOTH);
      generateCode(classesList, EType.CONSTRUCTOR);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("genGetSet.popup", function () {
      vscode.window
        .showQuickPick([
          <vscode.QuickPickItem>{
            label: "Add Import",
            description: "add and search through available imports",
          },
          <vscode.QuickPickItem>{
            label: "Optimize Imports",
            description: "sort and import missing libraries",
          },
          <vscode.QuickPickItem>{
            label: "Rescan Workspace",
            description: "rescan all files in the workscape for exports",
          },
          <vscode.QuickPickItem>{
            label: "Constructor",
            description: "generate a constructor based on privates",
          },
          <vscode.QuickPickItem>{
            label: "ALL Getter and Setter",
            description: "generate all setter and getter for your class",
          },
          <vscode.QuickPickItem>{
            label: "Getter ALL",
            description: "generate all getter for your class",
          },
          <vscode.QuickPickItem>{
            label: "Setter ALL",
            description: "generate all setter for your class",
          },
          <vscode.QuickPickItem>{
            label: "Getter and Setter",
            description: "generate a getter and setter public function",
          },
          <vscode.QuickPickItem>{
            label: "Getter",
            description: "generate a getter public function",
          },
          <vscode.QuickPickItem>{
            label: "Setter",
            description: "generate a setter public function",
          },
        ])
        .then((result) => {
          if (result) {
            if (result.label.indexOf("Add Import") !== -1) {
              vscode.commands.executeCommand("genGetSet.addImport");
            } else if (result.label.indexOf("Optimize Imports") !== -1) {
              vscode.commands.executeCommand("genGetSet.sortImports");
            } else if (result.label.indexOf("Rescan Workspace") !== -1) {
              vscode.commands.executeCommand("genGetSet.scanImports");
            } else if (result.label.indexOf("Getter and Setter") !== -1) {
              vscode.commands.executeCommand("genGetSet.getterAndSetter");
            } else if (result.label.indexOf("ALL Getter and Setter") !== -1) {
              vscode.commands.executeCommand("genGetSet.allGetterAndSetter");
            } else if (result.label.indexOf("ALL Getter") !== -1) {
              vscode.commands.executeCommand("genGetSet.allGetter");
            } else if (result.label.indexOf("ALL Setter") !== -1) {
              vscode.commands.executeCommand("genGetSet.allSetter");
            } else if (result.label.indexOf("Getter") !== -1) {
              vscode.commands.executeCommand("genGetSet.getter");
            } else if (result.label.indexOf("Setter") !== -1) {
              vscode.commands.executeCommand("genGetSet.setter");
            } else {
              vscode.commands.executeCommand("genGetSet.constructor");
            }
          }
        });
    })
  );
}

export function deactivate() {}
