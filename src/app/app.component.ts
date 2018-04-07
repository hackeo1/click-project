import {Component} from '@angular/core';
import Timer = NodeJS.Timer;
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/buffer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  nuked: boolean;

  // Without Observables
  timeoutClickCounter: number;
  nukeFunctionCallBack: () => void;
  timeoutCleanUp: Timer;

  // With Observables
  observableClickCounter: number;
  observableClicks: Subject<number>;

  constructor() {
    this.nuked = false;

    // Without Observables

    this.timeoutClickCounter = 0;
    this.nukeFunctionCallBack = () => {
      if(!Boolean(this.timeoutCleanUp)) {
        // create timeout if not previously created
        this.timeoutCleanUp = setTimeout(() => {
          // clear counter and timeout if timeout is complete
          this.timeoutClickCounter = 0;
          this.timeoutCleanUp = undefined;
        }, 1000);
        // increase first time counter
        this.timeoutClickCounter++;
      } else {
        // increase counter after the first one
        this.timeoutClickCounter++;
        if (this.timeoutClickCounter === 3) {
          this.nukeIt();
        }
      }
    };
    this.bindNukeItCallback();

    // With Observables

    this.observableClickCounter = 0;
    this.observableClicks = new Subject();
    let sharedObservable : Observable<number> = this.observableClicks.share();

    // Clear counter if no action after 1000 milliseconds after last action
    sharedObservable.buffer(sharedObservable.throttleTime(1000).delay(1000)).subscribe(() => {
      this.observableClickCounter = 0;
    });

    // Increase counter
    sharedObservable.subscribe(currentCounter => {
      this.observableClickCounter = currentCounter + 1;
      if (this.observableClickCounter === 3) {
        this.nukeIt();
      }
    });
  }

  // with callback biding

  bindNukeItCallback() {
    setTimeout(() => {
      window.document.getElementById('callback-button')
        .addEventListener('click', this.nukeFunctionCallBack, false);
    },0);
  }

  unBindNukeItCallback() {
    window.document.getElementById('callback-button')
      .removeEventListener('click', this.nukeFunctionCallBack, false);
  }

  // with angular biding

  nukeItAngularEvent() {
    this.nukeFunctionCallBack();
  };

  nukeItObservable() {
    this.observableClicks.next(this.observableClickCounter);
  };

  nukeIt() {
    this.unBindNukeItCallback();
    this.nuked = true;
  }

  reset() {
    this.nuked = false;
    this.bindNukeItCallback();
  }
}
