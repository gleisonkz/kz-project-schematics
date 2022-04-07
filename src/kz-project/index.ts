import { strings } from '@angular-devkit/core';
import {
    apply, chain, externalSchematic, MergeStrategy, mergeWith, Rule, SchematicContext, template,
    Tree, url
} from '@angular-devkit/schematics';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function kzProject(_options: any): Rule {
  const name = _options.name;

  return (tree: Tree, _context: SchematicContext) => {
    const templateSource = apply(url("./files"), [template({ ..._options, ...strings })]);

    const merged = mergeWith(templateSource, MergeStrategy.Overwrite);

    const rule = chain([createRepo(name), merged]);

    return rule(tree, _context) as Rule;
  };
}
function createRepo(name: any) {
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
