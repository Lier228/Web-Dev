import {Component} from "@angular/core";

@Component({
    selector: `app-root`, 
    template: `
        Do something to reveal message

        <section (mouseover)="showMessage()">
            <p>God DAmn</p>
        </section>
    `,
})

export class App{
    message = ''
    showSecretMessage(){
        this.message = 'Way to go ahhh';

    }
}