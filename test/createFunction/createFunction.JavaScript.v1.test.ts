/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import * as fse from 'fs-extra';
import { ISuiteCallbackContext } from 'mocha';
import * as path from 'path';
import * as vscode from 'vscode';
import { TestInput } from 'vscode-azureextensionui';
import { ProjectLanguage, projectLanguageSetting, ProjectRuntime, projectRuntimeSetting } from '../../extension.bundle';
import { runForAllTemplateSources } from '../global.test';
import { runWithFuncSetting } from '../runWithSetting';
import { FunctionTesterBase } from './FunctionTesterBase';

class JSFunctionTester extends FunctionTesterBase {
    public language: ProjectLanguage = ProjectLanguage.JavaScript;
    public runtime: ProjectRuntime = ProjectRuntime.v1;

    public async validateFunction(testFolder: string, funcName: string): Promise<void> {
        const functionPath: string = path.join(testFolder, funcName);
        assert.equal(await fse.pathExists(path.join(functionPath, 'index.js')), true, 'index.js does not exist');
        assert.equal(await fse.pathExists(path.join(functionPath, 'function.json')), true, 'function.json does not exist');
    }
}

// tslint:disable-next-line:max-func-body-length no-function-expression
suite('Create JavaScript ~1 Function Tests', async function (this: ISuiteCallbackContext): Promise<void> {
    const jsTester: JSFunctionTester = new JSFunctionTester();

    suiteSetup(async () => {
        await jsTester.initAsync();
    });

    const blobTrigger: string = 'Blob trigger';
    test(blobTrigger, async () => {
        await jsTester.testCreateFunction(
            blobTrigger,
            'AzureWebJobsStorage', // Use existing app setting
            TestInput.UseDefaultValue // Use default path
        );
    });

    const cosmosDBTrigger: string = 'Cosmos DB trigger';
    test(cosmosDBTrigger, async () => {
        await jsTester.testCreateFunction(
            cosmosDBTrigger,
            'AzureWebJobsStorage', // Use existing app setting
            'dbName',
            'collectionName',
            TestInput.UseDefaultValue, // Use default for 'create leases if doesn't exist'
            TestInput.UseDefaultValue // Use default lease name
        );
    });

    const eventHubTrigger: string = 'Event Hub trigger';
    test(eventHubTrigger, async () => {
        await jsTester.testCreateFunction(
            eventHubTrigger,
            'AzureWebJobsStorage', // Use existing app setting
            TestInput.UseDefaultValue, // Use default event hub name
            TestInput.UseDefaultValue // Use default event hub consumer group
        );
    });

    const genericWebhook: string = 'Generic webhook';
    test(genericWebhook, async () => {
        await jsTester.testCreateFunction(genericWebhook);
    });

    const gitHubWebhook: string = 'GitHub webhook';
    test(gitHubWebhook, async () => {
        await jsTester.testCreateFunction(gitHubWebhook);
    });

    const httpTrigger: string = 'HTTP trigger';
    test(httpTrigger, async () => {
        await jsTester.testCreateFunction(
            httpTrigger,
            TestInput.UseDefaultValue // Use default Authorization level
        );
    });

    const httpTriggerWithParameters: string = 'HTTP trigger with parameters';
    test(httpTriggerWithParameters, async () => {
        await jsTester.testCreateFunction(
            httpTriggerWithParameters,
            TestInput.UseDefaultValue // Use default Authorization level
        );
    });

    const manualTrigger: string = 'Manual trigger';
    test(manualTrigger, async () => {
        await jsTester.testCreateFunction(manualTrigger);
    });

    const queueTrigger: string = 'Queue trigger';
    test(queueTrigger, async () => {
        await jsTester.testCreateFunction(
            queueTrigger,
            'AzureWebJobsStorage', // Use existing app setting
            TestInput.UseDefaultValue // Use default queue name
        );
    });

    const serviceBusQueueTrigger: string = 'Service Bus Queue trigger';
    test(serviceBusQueueTrigger, async () => {
        await jsTester.testCreateFunction(
            serviceBusQueueTrigger,
            'AzureWebJobsStorage', // Use existing app setting
            TestInput.UseDefaultValue, // Use default access rights
            TestInput.UseDefaultValue // Use default queue name
        );
    });

    const serviceBusTopicTrigger: string = 'Service Bus Topic trigger';
    test(serviceBusTopicTrigger, async () => {
        await jsTester.testCreateFunction(
            serviceBusTopicTrigger,
            'AzureWebJobsStorage', // Use existing app setting
            TestInput.UseDefaultValue, // Use default access rights
            TestInput.UseDefaultValue, // Use default topic name
            TestInput.UseDefaultValue // Use default subscription name
        );
    });

    const timerTrigger: string = 'Timer trigger';
    test(timerTrigger, async () => {
        await jsTester.testCreateFunction(
            timerTrigger,
            TestInput.UseDefaultValue // Use default schedule
        );
    });

    // https://github.com/Microsoft/vscode-azurefunctions/blob/master/docs/api.md#create-local-function
    test('createFunction API', async () => {
        await runForAllTemplateSources(async (source) => {
            const templateId: string = 'HttpTrigger-JavaScript';
            const functionName: string = 'createFunctionApi';
            const authLevel: string = 'Anonymous';
            const projectPath: string = path.join(jsTester.baseTestFolder, source);
            // Intentionally testing weird casing for authLevel
            await runWithFuncSetting(projectLanguageSetting, ProjectLanguage.JavaScript, async () => {
                await runWithFuncSetting(projectRuntimeSetting, ProjectRuntime.v1, async () => {
                    await vscode.commands.executeCommand('azureFunctions.createFunction', projectPath, templateId, functionName, { aUtHLevel: authLevel });
                });
            });
            await jsTester.validateFunction(projectPath, functionName);
        });
    });
});
