import { ComponentFixture, async } from '@angular/core/testing';
import { IonicModule } from 'ionic-angular';
import { TestUtils } from '../test';

import { Chroni } from './app.component';
import { ViewFiles, FileName } from '../pages/viewFiles/viewFiles';

import { FileUtility } from '../utilities/FileUtility';
 
let fixture: ComponentFixture<Chroni> = null;
let instance: any = null;
 
describe('Component: Root Component', () => {

    beforeEach(async(() => {
        TestUtils.beforeEachCompiler([Chroni])
            .then(compiled => {
                fixture = compiled.fixture;
                instance = compiled.instance;
            });
    }));

    it('is created', () => {
        expect(fixture).toBeTruthy();
        expect(instance).toBeTruthy();
    });

    it('initialises with a root page of ViewFiles', () => {
        expect(instance['rootPage']).toBe(ViewFiles);
    });

});