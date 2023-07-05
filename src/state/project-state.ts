import {Project, ProjectStatus} from "../models/project";

type Listener<T> = (items: T[]) => void;

    class State<T> {
        protected listeners: Listener<T>[] = [];

        addListener(listenerFn: Listener<T>) {
            this.listeners.push(listenerFn);
        }
    }

    export class ProjectState extends State<Project> {
        private project: Project[] = [];


        private static instance: ProjectState;

        private constructor() {
            super();
        }

        static getInstance() {
            if (this.instance) {
                return this.instance;
            }
            this.instance = new ProjectState();
            return this.instance;
        }

        addProject(title: string, description: string, numOfPeople: number) {
            const newProject = new Project(
                Math.random().toString(),
                title,
                description,
                numOfPeople,
                ProjectStatus.Active
            );

            this.project.push(newProject);
            this.updateListener();

        }

        moveProject(projectId: string, newStatus: ProjectStatus) {
            const project = this.project.find(prj => prj.id === projectId);
            if (project && project.status !== newStatus) {
                project.status = newStatus;
                this.updateListener();
            }
        }

        private updateListener() {
            for (const listenerFn of this.listeners) {
                listenerFn(this.project.slice());
            }
        }
    }
    console.log('RUNNING...');
    export const prjState = ProjectState.getInstance();
