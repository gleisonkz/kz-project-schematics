import { strings } from '@angular-devkit/core';
import {
    apply, chain, externalSchematic, mergeWith, move, Rule, SchematicContext, SchematicsException,
    template, Tree, url
} from '@angular-devkit/schematics';

interface SchemaOptions {
  name: string;
  shouldCreateCoreLayer: boolean;
  shouldCreateDomainLayer: boolean;
  shouldCreateWidgetLayer: boolean;
  shouldCreateSharedLayer: boolean;
}

export function main(schemaOptions: SchemaOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const createLayers = chain([
      createSassLayer(schemaOptions),
      createCoreLayer(schemaOptions),
      createSharedLayer(schemaOptions),
      createWidgetLayer(schemaOptions),
      createDomainLayer(schemaOptions),
    ]);

    const rule = chain([
      runNgNewSchematics(schemaOptions),
      createLayers,
      updateTsConfig(schemaOptions),
    ]);

    return rule(tree, _context);
  };
}

function createSassLayer({ name }: SchemaOptions) {
  return (_: Tree, _context: SchematicContext) => {
    const templateSource = apply(url("./files/sass"), [move(`${name}/src/sass`)]);
    return mergeWith(templateSource);
  };
}

function createCoreLayer({ name, shouldCreateCoreLayer }: SchemaOptions) {
  return (tree: Tree, _context: SchematicContext) => {
    if (shouldCreateCoreLayer) {
      tree.create(`${name}/src/app/core/.gitkeep`, "");
    }
  };
}

function createDomainLayer({ name, shouldCreateDomainLayer }: SchemaOptions) {
  return (tree: Tree, _context: SchematicContext) => {
    if (shouldCreateDomainLayer) {
      tree.create(`${name}/src/app/domain/.gitkeep`, "");
    }
  };
}

function createWidgetLayer({ name, shouldCreateWidgetLayer }: SchemaOptions) {
  return (_: Tree, _context: SchematicContext) => {
    if (shouldCreateWidgetLayer) {
      const templateSource = apply(url("./files/widget"), [
        move(`${name}/src/app/widget`),
        template({
          ...{ name },
          ...strings,
        }),
      ]);

      return mergeWith(templateSource);
    }
  };
}

function createSharedLayer({ name, shouldCreateSharedLayer }: SchemaOptions) {
  return (_: Tree, _context: SchematicContext) => {
    if (shouldCreateSharedLayer) {
      const templateSource = apply(url("./files/shared"), [
        move(`${name}/src/app/shared`),
      ]);

      return mergeWith(templateSource);
    }
  };
}

function runNgNewSchematics({ name }: SchemaOptions) {
  return externalSchematic("@schematics/angular", "ng-new", {
    name,
    version: "13.3.2",
    directory: name,
    routing: false,
    style: "scss",
    inlineStyle: false,
    inlineTemplate: false,
  });
}

function updateTsConfig(schemaOptions: SchemaOptions): Rule {
  const {
    name,
    shouldCreateCoreLayer,
    shouldCreateDomainLayer,
    shouldCreateSharedLayer,
    shouldCreateWidgetLayer,
  } = schemaOptions;
  return (tree: Tree, _context: SchematicContext) => {
    const tsConfigPath = `${name}/tsconfig.json`;
    const tsConfigFile = tree.read(tsConfigPath);

    if (!tsConfigFile) throw new SchematicsException(`Could not find ${tsConfigPath}`);

    const tsConfigWithoutComments = removeComments(tsConfigFile!.toString());
    const tsConfig = JSON.parse(tsConfigWithoutComments);
    const APP_PREFIX = getProjectPrefix(name, tree);

    const CORE_LAYER = shouldCreateCoreLayer
      ? { [`@${APP_PREFIX}/core`]: [`app/core`] }
      : {};

    const DOMAIN_LAYER = shouldCreateDomainLayer
      ? { [`@${APP_PREFIX}/domain`]: [`app/domain`] }
      : {};

    const SHARED_LAYER = shouldCreateSharedLayer
      ? { [`@${APP_PREFIX}/shared`]: [`app/shared`] }
      : {};

    const WIDGET_LAYER = shouldCreateWidgetLayer
      ? {
          [`@${APP_PREFIX}/widget/components`]: [`app/widget/components`],
          [`@${APP_PREFIX}/widget/directives`]: [`app/widget/directives`],
          [`@${APP_PREFIX}/widget/pipes`]: [`app/widget/pipes`],
        }
      : {};

    tsConfig.compilerOptions.paths = {
      ...tsConfig.compilerOptions.paths,
      ...CORE_LAYER,
      ...DOMAIN_LAYER,
      ...SHARED_LAYER,
      ...WIDGET_LAYER,
    };

    tsConfig.compilerOptions.strictPropertyInitialization = false;
    tsConfig.compilerOptions.baseUrl = "src";

    tree.overwrite(tsConfigPath, JSON.stringify(tsConfig, null, 2));

    return tree;
  };
}

function removeComments(string: string) {
  return string.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "").trim();
}

function getProjectPrefix(projectName: string, tree: Tree): string {
  const angularJsonPath = `${projectName}/angular.json`;
  const angularJsonFile = tree.read(angularJsonPath);

  if (!angularJsonFile)
    throw new SchematicsException(`Could not find ${angularJsonPath}`);

  const angularJson = JSON.parse(angularJsonFile!.toString());
  const appPrefix = angularJson.projects[projectName].prefix;
  return appPrefix;
}
