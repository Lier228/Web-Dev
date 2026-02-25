import {Component} from '@angular/core';

@Component({
    selector: `app-root`,
    template: `
        @if(isServerRunning){
            <p> Yes, server is running </p>
        } @else{
                <p> No, server is not running </p>
            }
    
    `,
})
export class App{
    isServerRunning = true;
}

