export interface Name {
    firstname: string;
    lastname: string;
}

class Greeter {
    private name: string = 'John Doe';

    constructor({ firstname, lastname }: Name) {
        this.name = `${firstname} ${lastname}`;
    }

    sayHello() {
        console.log(`Hello ${this.name}`);
    }
}

export default Greeter;
