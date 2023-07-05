import {Component} from "./base-component";
import {DragTarget} from "../models/drag-drop";
import {Project, ProjectStatus} from "../models/project";
import {AutoBind} from "../decorator/autobind";
import {prjState} from "../state/project-state";
import {ProjectItem} from "./project-item";

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {

        assignedProjects: Project[];

        constructor(private type: 'active' | 'finished') {
            super('project-list', 'app', false, `${type}-projects`);
            this.assignedProjects = [];

            this.configure();
            this.renderContent();
        }

        @AutoBind
        dragOverHandler(event: DragEvent): void {
            if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
                event.preventDefault();
                const listEl = this.element.querySelector('ul')!;
                listEl.classList.add('droppable');
            }

        }

        @AutoBind
        dropHandler(event: DragEvent): void {
            const prjId = event.dataTransfer!.getData('text/plain');
            prjState.moveProject(prjId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
        }

        @AutoBind
        dragLeaveHandler(_: DragEvent): void {
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.remove('droppable');
        }

        private renderProjects() {
            const listEl = <HTMLUListElement>document.getElementById(`${this.type}-projects-list`);
            listEl.innerHTML = '';
            for (const prjItem of this.assignedProjects) {
                new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
            }
        }

        configure() {
            this.element.addEventListener('dragover', this.dragOverHandler)
            this.element.addEventListener('drop', this.dropHandler)
            this.element.addEventListener('dragleave', this.dragLeaveHandler)
            prjState.addListener((projects: Project[]) => {
                const relevantProject = projects.filter(prj => {
                    if (this.type === 'active') {
                        return prj.status === ProjectStatus.Active;
                    }
                    return prj.status === ProjectStatus.Finished;
                })
                this.assignedProjects = relevantProject;
                this.renderProjects();
            });
        }

        renderContent() {
            const listId = `${this.type}-projects-list`;
            this.element.querySelector('ul')!.id = listId;
            this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
        }

    }
