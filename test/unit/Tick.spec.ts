import { expect } from 'chai';
import {Tick} from "../../src/tick/Tick";
import createTick = Tick.createTickEngine;


describe("Tick test",()=>{
    it('creates tickEngine', () => {
        expect(createTick()).to.be.any;
    });

});