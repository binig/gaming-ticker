
import {Observable} from "rxjs/Observable";

export namespace Tick {
    export interface TickEngine {
        start():void
        stop():void
        pause():void

        ticks():Observable<number>
    }

    export function createTickEngine():TickEngine {
        return new TickEngineImpl();
    }

    class TickEngineImpl implements TickEngine {
        private timer;
        start():void {
            this.timer = setInterval((args)=>true, 10);
        }
        stop():void {
           clearInterval(this.timer);     
        }
        pause():void {
            clearInterval(this.timer);                 
        }

        ticks():Observable<number> {
            return null;
        }

    }
}

