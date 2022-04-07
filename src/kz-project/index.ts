import { strings } from '@angular-devkit/core';
import {
    apply, chain, externalSchematic, MergeStrategy, mergeWith, Rule, SchematicContext,
    SchematicsException, template, Tree, url
} from '@angular-devkit/schematics';

interface CLIOptions {
  name: string;
}

export function kzProject(_options: CLIOptions): Rule {
  const name = _options.name;

  return (tree: Tree, _context: SchematicContext) => {
    const templateSource = apply(url("./files"), [template({ ..._options, ...strings })]);
    const merged = mergeWith(templateSource, MergeStrategy.Overwrite);
    const rule = chain([runNgNew(name), merged, updateTsConfig(name)]);

    return rule(tree, _context) as Rule;
  };
}
function runNgNew(name: any) {
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

function updateTsConfig(name: string): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const tsConfigPath = `${name}/tsconfig.json`;
    const tsConfigFile = tree.read(tsConfigPath);

    if (!tsConfigFile) throw new SchematicsException(`Could not find ${tsConfigPath}`);

    const tsConfigWithoutComments = removeComments(tsConfigFile!.toString());
    const tsConfig = JSON.parse(tsConfigWithoutComments);

    const angularJsonPath = `${name}/angular.json`;
    const angularJsonFile = tree.read(angularJsonPath);

    if (!angularJsonFile)
      throw new SchematicsException(`Could not find ${angularJsonPath}`);

    const angularJson = JSON.parse(angularJsonFile!.toString());
    const APP_PREFIX = angularJson.projects[name].prefix;

    tsConfig.compilerOptions.paths = {
      ...tsConfig.compilerOptions.paths,
      [`@${APP_PREFIX}/core`]: [`${name}/src/app/core`],
      [`@${APP_PREFIX}/domain`]: [`${name}/src/app/domain`],
      [`@${APP_PREFIX}/shared`]: [`${name}/src/app/shared`],
      [`@${APP_PREFIX}/widget/components`]: [`${name}/src/app/widget/components`],
      [`@${APP_PREFIX}/widget/directives`]: [`${name}/src/app/widget/directives`],
      [`@${APP_PREFIX}/widget/pipes`]: [`${name}/src/app/widget/pipes`],
    };

    tree.overwrite(tsConfigPath, JSON.stringify(tsConfig, null, 2));
    return tree;
  };
}

function removeComments(string: string) {
  return string.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "").trim();
}
