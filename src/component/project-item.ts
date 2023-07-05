import {Draggable} from '../models/drag-drop';
import {Component} from "./base-component";
import {Project} from "../models/project";
import {AutoBind} from '../decorator/autobind';

export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
        private project: Project;

        get persons() {
            if (this.project.people === 1) {
                return '1 person';
            } else {
                return `${this.project.people} persons`;
            }
        }

        constructor(hostId: string, project: Project) {
            super('single-project', hostId, true, project.id);
            this.project = project;
            this.configure();
            this.renderContent();
        }

        @AutoBind
        dragStartHandler(event: DragEvent): void {
            event.dataTransfer!.setData('text/plain', this.project.id);
            event.dataTransfer!.effectAllowed = 'move';
        }

        @AutoBind
        dragEndHandler(_: DragEvent): void {
            console.log('DragEnd');
        }

        configure() {
            this.element.addEventListener('dragstart', this.dragStartHandler)
            this.element.addEventListener('dragend', this.dragEndHandler)
        };

        renderContent() {
            this.element.querySelector('h2')!.textContent = this.project.title;
            this.element.querySelector('h3')!.textContent = this.persons + ' 투입됨';
            this.element.querySelector('p')!.textContent = this.project.description;
        }
    }
