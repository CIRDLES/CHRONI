import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { IonicModule } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { Chroni } from './app.component';
import { ViewFiles, FileName } from '../pages/viewFiles/viewFiles';
 
let comp: Chroni;
let fixture: ComponentFixture<Chroni>;
 
describe('Component: Root Component', () => {
 
    beforeEach(async(() => {
 
        TestBed.configureTestingModule({
 
            declarations: [
                Chroni,
                ViewFiles,
                FileName
            ],
 
            providers: [
                Storage
            ],
 
            imports: [
                IonicModule.forRoot(Chroni)
            ]
 
        }).compileComponents();
 
    }));
 
    beforeEach(() => {
 
        fixture = TestBed.createComponent(Chroni);
        comp    = fixture.componentInstance;
 
    });
 
    afterEach(() => {
        fixture.destroy();
        comp = null;
    });
 
    it('is created', () => {
 
        expect(fixture).toBeTruthy();
        expect(comp).toBeTruthy();
 
    });
 
    it('initialises with a root page of ViewFiles', () => {
        expect(comp['rootPage']).toBe(ViewFiles);
    });
 
});