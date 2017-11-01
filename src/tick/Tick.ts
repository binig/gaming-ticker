
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";

export namespace Tick {
    export interface TickEngine {
        start():void
        stop():void
        pause():void
        resume():void
        ticks():Observable<TickFrame>
    }

    export interface TickEngineOption {
        frequency?:number
        period?:number
    }

    export interface TickFrame {
        tick:number
        /**
         * number of ms since start of tickEngine
         */
        timestamp:number
    }
    
    export function createTickEngine(options?:TickEngineOption):TickEngine {
        return new TickEngineImpl(options);
    }

    enum TickEngineStatus {
        RUNNING, STOPPED, PAUSED
    }
    const DEFAULT_PERIOD = 50;
    class TickEngineImpl implements TickEngine {
        private timer:any;
        private period:number;
        private currentTick:number;
        private startTime:number;
        private startPauseTime:number;
        private pauseTime:number;
        private subject:Subject<TickFrame>;
        private status:TickEngineStatus;

        constructor(options?:TickEngineOption) {
            if (options) {
                if(options.period) {
                    this.period = options.period;
                } else if (options.frequency) {
                    this.period = 1000 / options.frequency;
                } 
            }
            if (!this.period) {
                this.period = DEFAULT_PERIOD;
            }
            this.currentTick=0;
            this.subject = new Subject();
            this.status = TickEngineStatus.STOPPED;
        }

        start():void {
            if (this.status===TickEngineStatus.STOPPED) {
                this.startTime = Date.now();
                this.currentTick = 0;
                this.pauseTime = 0;
                this.status = TickEngineStatus.RUNNING;
                this.setInterval();
            } else {
                console.error('cannot start timer already running');
            }
        }

        resume():void {
            if (this.status===TickEngineStatus.PAUSED) {
                this.pauseTime += Date.now() - this.startPauseTime;
                this.status = TickEngineStatus.RUNNING;
                this.setInterval();
            } else {
                console.error('cannot resume timer not paused');
            }
        }

        private setInterval() {
            this.timer = setInterval((args)=> this.tryTick(), Math.max(1,this.period / 10));
        }
        private clearInterval() {
            clearInterval(this.timer);          
        }
        
        stop():void {
            this.status = TickEngineStatus.STOPPED;
            this.clearInterval();     
        }

        pause():void {
            this.status = TickEngineStatus.PAUSED;
            this.startPauseTime = Date.now();
            clearInterval(this.timer);                 
        }

        ticks():Observable<TickFrame> {
            return this.subject.asObservable();
        }

        private tryTick() {
            const currentTime:number = Date.now();
            const nextTickTime:number = this.startTime + this.pauseTime 
                + this.period * (this.currentTick+1);
            if(nextTickTime<=currentTime) {
              this.currentTick++;
              this.subject.next({tick: this.currentTick, timestamp:this.currentTick*this.period });  
            }    
        }
    }
}

