
import {Observable} from 'rxjs/index';
import {Subject} from "rxjs/index";

export namespace Tick {
    export interface TickEngine {
        start():TickEngine
        stop():TickEngine
        pause():TickEngine
        resume():TickEngine
        ticks():Observable<TickFrame>
        status():TickEngineStatus
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

    export enum TickEngineStatus {
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
        private currentStatus:TickEngineStatus;

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
            this.currentStatus = TickEngineStatus.STOPPED;
        }

        start():TickEngine {
            if (this.currentStatus===TickEngineStatus.STOPPED) {
                this.startTime = Date.now();
                this.currentTick = 0;
                this.pauseTime = 0;
                this.currentStatus = TickEngineStatus.RUNNING;
                this.setInterval();
            }
            return this;
        }

        resume():TickEngine {
            if (this.currentStatus===TickEngineStatus.PAUSED) {
                this.pauseTime += Date.now() - this.startPauseTime;
                this.currentStatus = TickEngineStatus.RUNNING;
                this.setInterval();
            }
            return this;
        }

        private setInterval() {
            this.timer = setInterval((args)=> this.tryTick(), Math.max(1,this.period / 10));
        }
        private clearInterval() {
            clearInterval(this.timer);          
        }
        
        stop():TickEngine {
            this.currentStatus = TickEngineStatus.STOPPED;
            this.clearInterval();
            return this;
        }

        pause():TickEngine {
            if (this.currentStatus==TickEngineStatus.RUNNING) {
                this.currentStatus = TickEngineStatus.PAUSED;
                this.startPauseTime = Date.now();
                clearInterval(this.timer);
            }
            return this;
        }

        ticks():Observable<TickFrame> {
            return this.subject.asObservable();
        }


        status():TickEngineStatus {
            return this.currentStatus;
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

