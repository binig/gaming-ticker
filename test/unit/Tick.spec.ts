import { expect } from 'chai';
import * as sinon from 'sinon';
import {Tick} from "../../src/tick/Tick";
import TickFrame = Tick.TickFrame;
import TickEngine = Tick.TickEngine;
import TickEngineStatus = Tick.TickEngineStatus;
import createTick = Tick.createTickEngine;

describe("Tick test",()=>{
    it('creates tickEngine', () => {
        expect(createTick()).to.be.any;
    });

    it('Test default option start tick stop', () => {
        const clock = sinon.useFakeTimers();
        const engine:TickEngine = createTick();
        const ticks:TickFrame[] = [];
        engine.ticks().subscribe(tick=>ticks.push(tick));
        expect(ticks.length,'no tick at subscription').to.be.eq(0);
        clock.tick(51);
        expect(ticks.length, 'no tick before start of engine').to.be.eq(0);
        engine.start();
        clock.tick(50);
        expect(ticks.length, 'one tick after one period').to.be.eq(1);
        clock.tick(25);
        expect(ticks.length, 'one tick after one and a half period').to.be.eq(1);
        clock.tick(25);
        expect(ticks.length, 'two ticks after two period').to.be.eq(2);
        engine.stop();
        clock.tick(50);
        expect(ticks.length, 'no more ticks after stop').to.be.eq(2);
        expect(ticks[0].tick).to.be.eq(1);
        expect(ticks[0].timestamp).to.be.eq(50);
        expect(ticks[1].tick).to.be.eq(2);
        expect(ticks[1].timestamp).to.be.eq(100);
        engine.start();
        clock.tick(50);
        expect(ticks.length, 'tick again after restart').to.be.eq(3);
        expect(ticks[2].tick).to.be.eq(1);
        expect(ticks[2].timestamp).to.be.eq(50);

        clock.restore();
    });

    it('Test 10ms period start tick stop', () => {
        const clock = sinon.useFakeTimers();
        const engine:TickEngine = createTick({period:10});
        const ticks:TickFrame[] = [];
        engine.ticks().subscribe(tick=>ticks.push(tick));
        expect(ticks.length,'no tick at subscription').to.be.eq(0);
        clock.tick(51);
        expect(ticks.length, 'no tick before start of engine').to.be.eq(0);
        engine.start();
        clock.tick(50);
        expect(ticks.length, '5 tick after 5 period').to.be.eq(5);
        clock.restore();
    });

    it('Test 100hz period start tick stop', () => {
        const clock = sinon.useFakeTimers();
        const engine:TickEngine = createTick({frequency:100});
        const ticks:TickFrame[] = [];
        engine.ticks().subscribe(tick=>ticks.push(tick));
        expect(ticks.length,'no tick at subscription').to.be.eq(0);
        clock.tick(51);
        expect(ticks.length, 'no tick before start of engine').to.be.eq(0);
        engine.start();
        clock.tick(20);
        expect(ticks.length, '2 tick after 20 period').to.be.eq(2);
        clock.restore();
    });

    it('Test default option start tick pause resume', () => {
        const clock = sinon.useFakeTimers();
        const engine:TickEngine = createTick();
        const ticks:TickFrame[] = [];
        engine.ticks().subscribe(tick=>ticks.push(tick));
        expect(ticks.length,'no tick at subscription').to.be.eq(0);
        clock.tick(51);
        expect(ticks.length, 'no tick before start of engine').to.be.eq(0);
        engine.start();
        clock.tick(50);
        expect(ticks.length, 'one tick after one period').to.be.eq(1);
        clock.tick(25);
        expect(ticks.length, 'one tick after one and a half period').to.be.eq(1);
        clock.tick(25);
        expect(ticks.length, 'two ticks after two period').to.be.eq(2);
        engine.pause();
        clock.tick(50);
        expect(ticks.length, 'no more ticks after stop').to.be.eq(2);
        expect(ticks[0].tick).to.be.eq(1);
        expect(ticks[0].timestamp).to.be.eq(50);
        expect(ticks[1].tick).to.be.eq(2);
        expect(ticks[1].timestamp).to.be.eq(100);
        engine.resume();
        clock.tick(50);
        expect(ticks.length, 'tick again after restart').to.be.eq(3);
        expect(ticks[2].tick).to.be.eq(3);
        expect(ticks[2].timestamp).to.be.eq(150);
        clock.restore();
    });


    it('Test state from STOPPED', () => {
        const clock = sinon.useFakeTimers();
        expect(createTick().status()).to.eq(TickEngineStatus.STOPPED);
        expect(createTick().pause().status()).to.eq(TickEngineStatus.STOPPED);
        expect(createTick().resume().status()).to.eq(TickEngineStatus.STOPPED);
        expect(createTick().start().status()).to.eq(TickEngineStatus.RUNNING);
        clock.restore();
    });

    it('Test state from RUNNING', () => {
        const clock = sinon.useFakeTimers();
        expect(createTick().start().status()).to.eq(TickEngineStatus.RUNNING);
        expect(createTick().start().pause().status()).to.eq(TickEngineStatus.PAUSED);
        expect(createTick().start().resume().status()).to.eq(TickEngineStatus.RUNNING);
        expect(createTick().start().stop().status()).to.eq(TickEngineStatus.STOPPED);
        clock.restore();
    });

    it('Test state from PAUSED', () => {
        const clock = sinon.useFakeTimers();
        expect(createTick().start().pause().status()).to.eq(TickEngineStatus.PAUSED);
        expect(createTick().start().pause().start().status()).to.eq(TickEngineStatus.PAUSED);
        expect(createTick().start().pause().resume().status()).to.eq(TickEngineStatus.RUNNING);
        expect(createTick().start().pause().stop().status()).to.eq(TickEngineStatus.STOPPED);
        clock.restore();
    });

});

