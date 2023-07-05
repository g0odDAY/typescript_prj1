import {Component} from "./base-component.js";
import {AutoBind} from "../decorator/autobind.js";
import {prjState} from "../state/project-state.js";
import {Validatable, validate} from "../utils/validation";

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {

        titleInputElement: HTMLInputElement;
        descriptionInputElement: HTMLInputElement;
        peopleInputElement: HTMLInputElement;

        constructor() {
            super('project-input', 'app', true, 'user-input');
            this.titleInputElement = <HTMLInputElement>this.element.querySelector('#title');
            this.descriptionInputElement = <HTMLInputElement>this.element.querySelector('#description');
            this.peopleInputElement = <HTMLInputElement>this.element.querySelector('#people');
            this.configure();
        }

        configure() {
            this.element.addEventListener('submit', this.submitHandler)
        }

        renderContent(): void {
        }

        private gatherUserInput(): [string, string, number] | void {
            const enteredTitle = this.titleInputElement.value;
            const enteredDescription = this.descriptionInputElement.value;
            const enteredPeople = this.peopleInputElement.value;

            const titleValidatable: Validatable = {
                value: enteredTitle,
                required: true
            }
            const descriptionValidatable: Validatable = {
                value: enteredDescription,
                required: true,
                minLength: 5
            }
            const peopleValidatable: Validatable = {
                value: +enteredPeople,
                required: true,
                min: 1,
                max: 5
            }
            if (
                !validate(titleValidatable) ||
                !validate(descriptionValidatable) ||
                !validate(peopleValidatable)
            ) {
                alert('Invalid input! plz try again!!');
                return;
            } else {
                return [enteredTitle, enteredDescription, +enteredPeople];
            }
        }

        private clearInput() {
            this.titleInputElement.value = '';
            this.peopleInputElement.value = '';
            this.descriptionInputElement.value = '';
        }

        @AutoBind
        private submitHandler(event: Event) {
            event.preventDefault();
            const userInput = this.gatherUserInput();
            if (Array.isArray(userInput)) {
                const [title, desc, people] = userInput;
                prjState.addProject(title, desc, people);
                this.clearInput();
            }
        }


    }
