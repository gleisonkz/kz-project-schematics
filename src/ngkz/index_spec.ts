import * as path from 'path';

import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

const collectionPath = path.join(__dirname, "../collection.json");

describe("ng-new", () => {
  describe("[Layers]", () => {
    it("should not create any layer folder", async () => {
      const runner = new SchematicTestRunner("schematics", collectionPath);

      runner
        .runSchematicAsync("ng-new", { name: "any-name" }, Tree.empty())
        .subscribe((tree) => {
          expect(tree.files.length).toEqual(32);
        });
    });

    it("should create the project with domain layer folder", async () => {
      const runner = new SchematicTestRunner("schematics", collectionPath);

      runner
        .runSchematicAsync(
          "ng-new",
          { name: "any-name", shouldCreateDomainLayer: true },
          Tree.empty()
        )
        .subscribe((tree) => {
          const domainFolder = tree.getDir("any-name/src/app/domain");
          expect(domainFolder).toBeDefined();
          expect(domainFolder.subfiles.length).toEqual(1);

          expect(tree.files.length).toEqual(33);
        });
    });

    describe("[Widget]", () => {
      it("should create the project with widget layer folder", async () => {
        const runner = new SchematicTestRunner("schematics", collectionPath);

        runner
          .runSchematicAsync(
            "ng-new",
            { name: "any-name", shouldCreateWidgetLayer: true },
            Tree.empty()
          )
          .subscribe((tree) => {
            const widgetFolder = tree.getDir("any-name/src/app/widget");

            expect(widgetFolder).toBeDefined();
            expect(widgetFolder.subdirs.length).toEqual(3);

            expect(tree.files.length).toEqual(46);
          });
      });

      it("should have a sample pipe inside widget layer folder", async () => {
        const runner = new SchematicTestRunner("schematics", collectionPath);

        runner
          .runSchematicAsync(
            "ng-new",
            { name: "any-name", shouldCreateWidgetLayer: true },
            Tree.empty()
          )
          .subscribe((tree) => {
            const BASE_DIRECTIVE_FOLDER_PATH = "any-name/src/app/widget/directives";
            const sampleDirectiveFolder = tree.getDir(
              `${BASE_DIRECTIVE_FOLDER_PATH}/sample`
            );

            expect(sampleDirectiveFolder).toBeDefined();
            expect(sampleDirectiveFolder.subfiles.length).toEqual(3);

            const sampleDirectiveFile = tree.get(
              `${BASE_DIRECTIVE_FOLDER_PATH}/sample/sample.directive.ts`
            );

            const sampleDirectiveWidgetModule = tree.get(
              `${BASE_DIRECTIVE_FOLDER_PATH}/sample/sample.directive.module.ts`
            );

            expect(sampleDirectiveFile).toBeDefined();
            expect(sampleDirectiveWidgetModule).toBeDefined();
          });
      });
    });

    it("should create the project with shared layer folder", async () => {
      const runner = new SchematicTestRunner("schematics", collectionPath);

      runner
        .runSchematicAsync(
          "ng-new",
          { name: "any-name", shouldCreateSharedLayer: true },
          Tree.empty()
        )
        .subscribe((tree) => {
          const sharedFolder = tree.getDir("any-name/src/app/shared");

          expect(sharedFolder).toBeDefined();
          expect(sharedFolder.subdirs.length).toEqual(4);

          expect(tree.files.length).toEqual(36);
        });
    });

    it("should create the project with core layer folder", async () => {
      const runner = new SchematicTestRunner("schematics", collectionPath);

      runner
        .runSchematicAsync(
          "ng-new",
          { name: "any-name", shouldCreateCoreLayer: true },
          Tree.empty()
        )
        .subscribe((tree) => {
          const coreFolder = tree.getDir("any-name/src/app/core");

          expect(coreFolder).toBeDefined();
          expect(coreFolder.subfiles.length).toEqual(1);

          expect(tree.files.length).toEqual(33);
        });
    });

    it("should create the project with all layers folder", async () => {
      const runner = new SchematicTestRunner("schematics", collectionPath);

      runner
        .runSchematicAsync(
          "ng-new",
          {
            name: "any-name",
            shouldCreateCoreLayer: true,
            shouldCreateDomainLayer: true,
            shouldCreateSharedLayer: true,
            shouldCreateWidgetLayer: true,
          },
          Tree.empty()
        )
        .subscribe((tree) => {
          const coreFolder = tree.getDir("any-name/src/app/core");
          const domainFolder = tree.getDir("any-name/src/app/domain");
          const sharedFolder = tree.getDir("any-name/src/app/shared");
          const widgetFolder = tree.getDir("any-name/src/app/widget");

          expect(coreFolder).toBeDefined();
          expect(coreFolder.subfiles.length).toEqual(1);

          expect(domainFolder).toBeDefined();
          expect(domainFolder.subfiles.length).toEqual(1);

          expect(sharedFolder).toBeDefined();
          expect(sharedFolder.subdirs.length).toEqual(4);

          expect(widgetFolder).toBeDefined();
          expect(widgetFolder.subdirs.length).toEqual(3);

          expect(tree.files.length).toEqual(52);
        });
    });

    it("should create the project with sass folder", async () => {
      const runner = new SchematicTestRunner("schematics", collectionPath);

      runner
        .runSchematicAsync("ng-new", { name: "any-name" }, Tree.empty())
        .subscribe((tree) => {
          const sassFolder = tree.getDir("any-name/src/sass");

          expect(sassFolder).toBeDefined();
          expect(sassFolder.subfiles.length).toEqual(5);
          expect(tree.files.length).toEqual(32);
        });
    });
  });

  describe("[TS Config]", () => {
    it("should set strictPropertyInitialization to false", async () => {
      const runner = new SchematicTestRunner("schematics", collectionPath);

      runner
        .runSchematicAsync("ng-new", { name: "any-name" }, Tree.empty())
        .subscribe((tree) => {
          const tsConfig = tree.read("any-name/tsconfig.json");

          if (!tsConfig) throw new Error("tsconfig.json not found");
          const tsConfigJson = JSON.parse(tsConfig.toString());

          expect(tsConfigJson.compilerOptions.strictPropertyInitialization).toBeFalsy();
        });
    });

    it("should set baseUrl to 'src'", async () => {
      const runner = new SchematicTestRunner("schematics", collectionPath);

      runner
        .runSchematicAsync("ng-new", { name: "any-name" }, Tree.empty())
        .subscribe((tree) => {
          const tsConfig = tree.read("any-name/tsconfig.json");

          if (!tsConfig) throw new Error("tsconfig.json not found");
          const tsConfigJson = JSON.parse(tsConfig.toString());

          expect(tsConfigJson.compilerOptions.baseUrl).toEqual("src");
        });
    });
  });
});
